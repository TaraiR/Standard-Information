'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Bits, Field, Segment, useValidated } from './ui';
import {
  blockValue, layout, parityOf, parsePermission, permissionString, resolvePath, survives, WHO, type RaidLevel,
} from './traces/filesystem';

function PermissionPart() {
  const perm = useValidated('rwxr-xr--', s => s, s => (parsePermission(s) ? s.trim() : null));
  const digits = parsePermission(perm.value)!;
  const steps = useMemo(() => [
    { message: `パーミッション ${perm.value} を、3文字ずつ「所有者・グループ・その他」に分けます。` },
    ...WHO.map((w, i) => {
      const part = perm.value.slice(i * 3, i * 3 + 3);
      const terms = [part[0] === 'r' ? 'r=4' : null, part[1] === 'w' ? 'w=2' : null, part[2] === 'x' ? 'x=1' : null].filter(Boolean);
      return { message: `${w}は「${part}」なので ${terms.length ? terms.join(' + ') : '何もなし'} = ${digits[i]} です。` };
    }),
    { message: `並べると ${digits.join('')} です。例えば chmod ${digits.join('')} ファイル名 で、この権限を設定できます。` },
  ], [perm.value, digits]);
  return (
    <StepPlayer
      key={perm.value}
      title="Linux のパーミッション（rwx と数字）"
      steps={steps}
      settings={
        <>
          <Field label="パーミッション" text={perm.text} invalid={perm.invalid} onChange={perm.onChange} inputMode="text" width="7em" hint="例: rwxr-xr--" />
          <div className="viz-presets">
            {['rwxr-xr--', 'rw-r--r--', 'rwx------', 'rwxrwxrwx'].map(p => (
              <button key={p} type="button" className="viz-mini-btn" onClick={() => perm.set(p)}>{p}（{parsePermission(p)!.join('')}）</button>
            ))}
          </div>
        </>
      }
      renderVisual={(_, i) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {WHO.map((w, k) => (
            <div key={w} className={`viz-var tone-${i === k + 1 ? 'focus' : i > k + 1 ? 'done' : 'plain'}`}>
              <dt>{w}</dt>
              <dd><Bits bits={perm.value.slice(k * 3, k * 3 + 3).split('')} tones={perm.value.slice(k * 3, k * 3 + 3).split('').map(c => (c === '-' ? 'muted' : 'range'))} /></dd>
              <dt style={{ marginTop: 4 }}>4・2・1 → <b style={{ fontSize: '1.2rem' }}>{i > k ? digits[k] : '?'}</b></dt>
            </div>
          ))}
        </div>
      )}
      getMessage={s => s.message}
      footnote={`r（読み）= 4、w（書き）= 2、x（実行）= 1 の合計で表します。逆に数字から書くと ${digits.join('')} → ${permissionString(digits)}。`}
    />
  );
}

function PathPart() {
  const [cwd, setCwd] = useState('/home/user/docs');
  const [path, setPath] = useState('../images/photo.png');
  const valid = cwd.startsWith('/') && !/\s/.test(cwd) && path.trim() !== '' && !/\s/.test(path);
  const { steps } = useMemo(() => resolvePath(valid ? cwd : '/', valid ? path : '.'), [cwd, path, valid]);
  return (
    <StepPlayer
      key={`${cwd}|${path}`}
      title="絶対パスと相対パス"
      steps={steps}
      settings={
        <>
          <Field label="現在のディレクトリ" text={cwd} invalid={!cwd.startsWith('/')} onChange={setCwd} inputMode="text" width="10em" />
          <Field label="パス" text={path} invalid={path.trim() === ''} onChange={setPath} inputMode="text" width="11em" />
          <div className="viz-presets">
            {['../images/photo.png', './notes/../a.txt', '../../etc/hosts', '/var/log/syslog'].map(p => (
              <button key={p} type="button" className="viz-mini-btn" onClick={() => setPath(p)}>{p}</button>
            ))}
          </div>
        </>
      }
      renderVisual={s => (
        <div className="viz-bits" style={{ alignItems: 'center', gap: 6, fontSize: '1rem' }}>
          <span className="viz-bit tone-muted">/</span>
          {s.stack.map((d, i) => (
            <span key={`${i}-${d}`} className={`viz-bit ${i === s.stack.length - 1 && s.part && s.part !== '..' && s.part !== '.' ? 'tone-focus' : 'tone-range'}`} style={{ padding: '0 8px' }}>{d}</span>
          ))}
          {s.part && <span className="viz-hint">　← 「{s.part}」</span>}
        </div>
      )}
      getMessage={s => s.message}
      getVars={s => [{ label: 'いまいる場所', value: '/' + s.stack.join('/'), tone: 'range' }]}
      footnote="「.」は今いるディレクトリ、「..」は1つ上のディレクトリを表します。"
    />
  );
}

const LEVELS = [0, 1, 5].map(v => ({ value: v as RaidLevel, label: `RAID ${v}` }));
const RAID_NOTE: Record<RaidLevel, string> = {
  0: 'RAID 0（ストライピング）は、データを分けて全ディスクに並べて書きます。読み書きは速く容量も全台分使えますが、冗長性はありません。',
  1: 'RAID 1（ミラーリング）は、同じデータを全ディスクに書きます。容量は1台分しか使えませんが、1台残れば読み出せます。',
  5: 'RAID 5 は、データとパリティ（誤り訂正用の値。同じ行のデータの XOR）を全ディスクに分散して書きます。容量は (台数 − 1) 台分で、1台の故障まで復元できます。',
};

function RaidPart() {
  const [level, setLevel] = useState<RaidLevel>(5);
  const [failed, setFailed] = useState<number | null>(1);
  const disks = level === 1 ? 2 : 4;
  const l = useMemo(() => layout(level, disks, 6), [level, disks]);
  const fail = failed !== null && failed < disks ? failed : null;
  const ok = survives(l, fail === null ? [] : [fail]);
  const steps = useMemo(() => {
    // 1行目で、失われたブロックを残りの XOR で計算し直す例（パリティ = その行のデータの XOR）
    let rebuild = '';
    if (fail !== null) {
      const row = l.cells.map(c => c[0]);
      const others = row.filter((_, i) => i !== fail);
      const parity = parityOf(row.filter(x => x.startsWith('D')).map(blockValue));
      const value = parityOf(others.map(c => (c.startsWith('P') ? parity : blockValue(c))));
      rebuild = `${row[fail]} = ${others.join(' XOR ')} = ${value.toString(2).padStart(4, '0')}`;
    }
    return [
      { stage: 0, message: RAID_NOTE[level] },
      { stage: 1, message: fail === null ? 'どのディスクも故障していません。' : `ディスク${fail + 1} が故障しました。` },
      {
        stage: 2,
        message: fail === null ? '全データを読み出せます。'
          : !ok ? 'RAID 0 にはデータの複製もパリティもないので、故障したディスクにあったデータは失われました。'
            : level === 1 ? '残ったディスクに同じデータがあるので、すべて読み出せます。'
              : `失われたブロックは、同じ行の残りのデータとパリティの XOR で計算し直せます（例: ${rebuild}）。`,
      },
    ];
  }, [level, fail, ok, l]);

  return (
    <StepPlayer
      key={`${level}|${fail}`}
      title={`RAID ${level}（ディスク ${disks} 台・実効容量 ${l.usable} 台分）`}
      steps={steps}
      settings={
        <>
          <Segment label="RAID レベル" options={LEVELS} value={level} onChange={setLevel} />
          <Segment label="故障させるディスク" options={[{ value: -1, label: 'なし' }, ...Array.from({ length: disks }, (_, i) => ({ value: i, label: `ディスク${i + 1}` }))]}
            value={fail ?? -1} onChange={v => setFailed(v < 0 ? null : v)} />
        </>
      }
      renderVisual={s => (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${disks}, 1fr)`, gap: 8 }}>
          {l.cells.map((col, d) => {
            const broken = s.stage >= 1 && d === fail;
            return (
              <div key={d} className={`viz-panel`} style={{ opacity: broken ? 0.45 : 1, borderColor: broken ? 'var(--viz-focus)' : undefined }}>
                <h5>ディスク{d + 1}{broken ? ' ✕故障' : ''}</h5>
                <div style={{ display: 'grid', gap: 4 }}>
                  {col.map((c, r) => (
                    <span key={r} className={`viz-bit ${!c ? '' : broken ? (s.stage >= 2 && ok ? 'tone-done' : 'tone-muted') : c.startsWith('P') ? 'tone-focus' : 'tone-range'}`}>
                      {c || '　'}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      getMessage={s => s.message}
      getVars={s => [{ label: '結果', value: s.stage < 2 ? '—' : ok ? 'データは無事' : 'データ消失', tone: s.stage < 2 ? 'plain' : ok ? 'done' : 'focus' }]}
      legend={[{ tone: 'range', label: 'データ' }, { tone: 'focus', label: 'パリティ' }, { tone: 'done', label: '復元できたブロック' }]}
    />
  );
}

const TABS = [{ value: 'perm', label: 'パーミッション' }, { value: 'path', label: 'パス' }, { value: 'raid', label: 'RAID' }] as const;

export default function FilesystemVisual() {
  const [tab, setTab] = useState<'perm' | 'path' | 'raid'>('perm');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'perm' ? <PermissionPart /> : tab === 'path' ? <PathPart /> : <RaidPart />}
    </div>
  );
}
