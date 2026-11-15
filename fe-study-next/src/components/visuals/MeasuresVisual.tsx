'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Arrow, Segment, UnitBox } from './ui';
import {
  backupPlan, CHANGES, DAYS, FW_RULES, matchRule, PACKETS, restoreSet, ZONE_LABEL,
  type BackupKind, type Zone,
} from './traces/security';

const KINDS = [{ value: 'full', label: 'フル' }, { value: 'diff', label: '差分' }, { value: 'incr', label: '増分' }] as const;
const FAIL_DAYS = [1, 2, 3, 4, 5, 6].map(d => ({ value: d, label: `${DAYS[d]}曜` }));
const KIND_NOTE: Record<BackupKind, string> = {
  full: '毎日すべてのデータを丸ごと保存します。',
  diff: '日曜のフルバックアップ以降に変わった分を、毎日すべて保存します（日がたつほど大きくなる）。',
  incr: '前日のバックアップ以降に変わった分だけを保存します（毎日小さい）。',
};

function BackupPart() {
  const [kind, setKind] = useState<BackupKind>('diff');
  const [fail, setFail] = useState(4);
  const plan = useMemo(() => backupPlan(kind, fail), [kind, fail]);
  const need = useMemo(() => restoreSet(kind, fail), [kind, fail]);
  const steps = useMemo(() => [
    { day: -1, restore: false, message: `${KIND_NOTE[kind]} 日曜にフルバックアップ（100GB）を取り、毎日の変更量は表の1行目のとおりとします。` },
    ...plan.map(p => ({
      day: p.day, restore: false,
      message: p.day === 0
        ? '日曜: フルバックアップを取ります（100GB）。'
        : `${DAYS[p.day]}曜: ${p.label}バックアップを取ります（${p.size}GB、${p.covers.map(c => DAYS[c]).join('・')}の変更を含む）。`,
    })),
    {
      day: fail, restore: true,
      message: `${DAYS[fail]}曜の夜に障害が発生！ 復元には ${need.map(d => `${DAYS[d]}曜の${plan[d].label}`).join(' → ')} の ${need.length} 個を、この順に戻す必要があります。` +
        (kind === 'full' ? ' 1個で済むので復元は最も速いですが、毎日の保存に時間と容量がかかります。'
          : kind === 'diff' ? ' フルと最新の差分の2個で済みます。'
            : ' 増分は毎日の保存は速いですが、復元ではフルとそれ以降の増分をすべて順番に戻すので手間がかかります。'),
    },
  ], [plan, need, kind, fail]);
  const storage = plan.reduce((a, p) => a + p.size, 0);

  return (
    <StepPlayer
      key={`${kind}|${fail}`}
      title={`${KINDS.find(k => k.value === kind)!.label}バックアップと復元`}
      steps={steps}
      settings={
        <>
          <Segment label="バックアップ方式" options={KINDS} value={kind} onChange={setKind} />
          <Segment label="障害が起きる日" options={FAIL_DAYS} value={fail} onChange={setFail} />
        </>
      }
      renderVisual={s => (
        <div className="viz-table-wrap">
          <table className="viz-grid">
            <thead><tr><th />{plan.map(p => <th key={p.day} className={p.day === s.day ? 'is-now' : undefined}>{DAYS[p.day]}</th>)}</tr></thead>
            <tbody>
              <tr><th>変更量</th>{plan.map(p => <td key={p.day}>{p.day === 0 ? '—' : `${CHANGES[p.day]}GB`}</td>)}</tr>
              <tr>
                <th>保存</th>
                {plan.map(p => {
                  const taken = p.day <= s.day;
                  const used = s.restore && need.includes(p.day);
                  return (
                    <td key={p.day} className={taken ? (used ? 'tone-focus' : p.day === s.day && !s.restore ? 'tone-done' : 'tone-range') : undefined}>
                      {taken ? `${p.label} ${p.size}GB` : ''}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th>復元</th>
                {plan.map(p => <td key={p.day} className={s.restore && need.includes(p.day) ? 'tone-focus' : undefined}>{s.restore && need.includes(p.day) ? `${need.indexOf(p.day) + 1}番目` : ''}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      getMessage={s => s.message}
      getVars={s => [
        { label: '保存した合計', value: `${plan.filter(p => p.day <= Math.max(0, s.day)).reduce((a, p) => a + p.size, 0)}GB`, tone: 'range' },
        { label: '復元に使う数', value: s.restore ? `${need.length} 個` : '—', tone: s.restore ? 'focus' : 'plain' },
      ]}
      legend={[{ tone: 'done', label: 'この日のバックアップ' }, { tone: 'focus', label: '復元に使うバックアップ' }]}
      footnote={`この例の1週間で保存する量は ${storage}GB です。方式を切り替えて、保存量と復元の手間を比べてみましょう。`}
    />
  );
}

const ZONE_POS: Record<Zone, { x: number; y: number }> = { internet: { x: 10, y: 110 }, dmz: { x: 420, y: 20 }, lan: { x: 420, y: 200 } };
const FW = { x: 230, y: 110, w: 130, h: 70 };
const zoneCenter = (z: Zone) => ({ x: ZONE_POS[z].x + 75, y: ZONE_POS[z].y + 35 });

function FirewallPart() {
  const steps = useMemo(() => [
    { p: -1, message: 'ファイアウォールは、通過するパケットをルールの上から順に調べ、最初に当てはまったルールで許可か拒否かを決めます。外部に公開するサーバは DMZ に置きます。' },
    ...PACKETS.map((pk, i) => {
      const r = matchRule(pk);
      return {
        p: i,
        message: `${pk.desc}（${ZONE_LABEL[pk.from]} → ${ZONE_LABEL[pk.to]}、ポート ${pk.port}）。ルール${r.no}に当てはまるので${r.action === 'allow' ? '許可' : '拒否'}します。` +
          (r.no === 5 ? ' 許可したい通信だけをルールに書き、最後に「それ以外は拒否」を置くのが基本です。' : ''),
      };
    }),
  ], []);
  return (
    <StepPlayer
      title="ファイアウォールと DMZ（パケットフィルタリング）"
      steps={steps}
      renderVisual={s => {
        const pk = s.p >= 0 ? PACKETS[s.p] : null;
        const rule = pk ? matchRule(pk) : null;
        const fwC = { x: FW.x + FW.w / 2, y: FW.y + FW.h / 2 };
        return (
          <>
            <svg className="viz-svg" viewBox="0 0 580 290" role="img" aria-label={pk ? pk.desc : 'ネットワーク構成'}>
              {(['internet', 'dmz', 'lan'] as Zone[]).map(z => (
                <line key={z} className="viz-line" x1={zoneCenter(z).x} y1={zoneCenter(z).y} x2={fwC.x} y2={fwC.y} />
              ))}
              {pk && <Arrow points={[[zoneCenter(pk.from).x, zoneCenter(pk.from).y], [fwC.x - 10, fwC.y]]} tone="range" active />}
              {pk && rule?.action === 'allow' && <Arrow points={[[fwC.x + 10, fwC.y], [zoneCenter(pk.to).x, zoneCenter(pk.to).y]]} tone="done" active />}
              <UnitBox {...FW} title="FW" sub={rule ? (rule.action === 'allow' ? '許可' : '拒否') : 'ファイアウォール'} active={!!rule} tone={rule?.action === 'deny' ? 'focus' : 'done'} />
              {(['internet', 'dmz', 'lan'] as Zone[]).map(z => (
                <UnitBox key={z} x={ZONE_POS[z].x} y={ZONE_POS[z].y} w={150} h={70} title={ZONE_LABEL[z]}
                  sub={z === 'dmz' ? '公開 Web・メール' : z === 'lan' ? '社員 PC・DB' : '外部'}
                  active={!!pk && (pk.from === z || (pk.to === z && rule?.action === 'allow'))} tone={pk?.from === z ? 'range' : 'done'} />
              ))}
            </svg>
            <div className="viz-table-wrap">
              <table className="viz-table">
                <thead><tr><th>No</th><th>送信元</th><th>宛先</th><th>ポート</th><th>動作</th><th className="viz-hide-sm">用途</th></tr></thead>
                <tbody>
                  {FW_RULES.map(r => (
                    <tr key={r.no} className={rule?.no === r.no ? 'is-active' : undefined}>
                      <td>{r.no}</td>
                      <td>{r.from === '*' ? 'すべて' : ZONE_LABEL[r.from]}</td>
                      <td>{r.to === '*' ? 'すべて' : ZONE_LABEL[r.to]}</td>
                      <td>{r.port === '*' ? 'すべて' : r.port}</td>
                      <td>{r.action === 'allow' ? '許可' : '拒否'}</td>
                      <td className="viz-hide-sm is-left">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      }}
      getMessage={s => s.message}
      footnote="外部に公開するサーバを DMZ に置くと、万一乗っ取られても社内 LAN への直接の通信は許可されていないので、被害を抑えられます。"
    />
  );
}

const TABS = [{ value: 'backup', label: 'バックアップ' }, { value: 'fw', label: 'ファイアウォール' }] as const;

export default function MeasuresVisual() {
  const [tab, setTab] = useState<'backup' | 'fw'>('backup');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'backup' ? <BackupPart /> : <FirewallPart />}
    </div>
  );
}
