'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Arrow, Segment, UnitBox } from './ui';
import { HOSTS, MAC, PORT, traceL2, type Host, type L2Device, type L2Step } from './traces/network';

const DEVICES = [{ value: 'switch', label: 'スイッチ（第2層）' }, { value: 'hub', label: 'ハブ（第1層）' }] as const;

const CENTER = { x: 260, y: 150 };
const POS: Record<Host, { x: number; y: number }> = {
  A: { x: 40, y: 20 }, B: { x: 400, y: 20 }, C: { x: 40, y: 230 }, D: { x: 400, y: 230 },
};
const HOST_W = 120;
const HOST_H = 56;
const anchor = (h: Host) => ({ x: POS[h].x + HOST_W / 2, y: POS[h].y + (POS[h].y < CENTER.y ? HOST_H : 0) });

export default function SwitchVisual() {
  const [device, setDevice] = useState<L2Device>('switch');
  const steps = useMemo(() => traceL2(device), [device]);

  const renderVisual = (s: L2Step) => (
    <>
      <svg className="viz-svg" viewBox="0 0 560 300" role="img"
        aria-label={s.from ? `${s.from} から ${s.to} へ。届いた先: ${s.delivered.join('、')}` : 'ネットワークの構成'}>
        {HOSTS.map(h => {
          const a = anchor(h);
          return <line key={h} className="viz-line" x1={a.x} y1={a.y} x2={CENTER.x + 20} y2={CENTER.y} />;
        })}
        {s.from && (
          <Arrow points={[[anchor(s.from).x, anchor(s.from).y], [CENTER.x + 20, CENTER.y]]} tone="focus" active />
        )}
        {s.from && s.delivered.map(h => (
          <Arrow key={h} points={[[CENTER.x + 20, CENTER.y], [anchor(h).x, anchor(h).y]]} tone={h === s.to ? 'done' : 'muted'} active />
        ))}
        <UnitBox x={CENTER.x - 70} y={CENTER.y - 30} w={180} h={60} title={device === 'switch' ? 'スイッチ' : 'ハブ'} sub="ポート1〜4" active tone="range" />
        {HOSTS.map(h => {
          const role = h === s.from ? 'focus' : h === s.to && s.delivered.includes(h) ? 'done' : s.delivered.includes(h) ? 'muted' : null;
          return (
            <g key={h}>
              <UnitBox x={POS[h].x} y={POS[h].y} w={HOST_W} h={HOST_H} title={`PC ${h}`} sub={`MAC ${MAC[h]}・ポート${PORT[h]}`}
                active={role !== null} tone={role === 'muted' ? 'plain' : role ?? 'range'} />
              {role === 'muted' && (
                <text className="viz-label" x={POS[h].x + HOST_W / 2} y={POS[h].y < CENTER.y ? POS[h].y - 6 : POS[h].y + HOST_H + 18}
                  textAnchor="middle" style={{ fontSize: 15 }}>自分宛てでないので破棄</text>
              )}
            </g>
          );
        })}
      </svg>
      {device === 'switch' && (
        <div className="viz-panel" style={{ marginTop: 8 }}>
          <h5>MAC アドレステーブル</h5>
          {s.table.length === 0 ? <span className="viz-hint">（まだ何も学習していません）</span> : (
            <dl className="viz-kv">
              {s.table.map(e => (
                <div key={e.mac} style={{ display: 'contents' }}>
                  <dt>{e.mac}</dt>
                  <dd className={e.mac === s.learned ? 'is-changed' : undefined}>ポート{e.port}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </>
  );

  return (
    <StepPlayer
      key={device}
      title={device === 'switch' ? 'スイッチの転送と MAC アドレスの学習' : 'ハブの転送（全ポートへ送る）'}
      steps={steps}
      settings={<Segment label="ネットワーク機器" options={DEVICES} value={device} onChange={setDevice} />}
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: '送信', value: s.from ? `${s.from} → ${s.to}` : '—', tone: 'focus' },
        { label: '届いた台数', value: s.from ? s.delivered.length : '—', tone: s.flooded ? 'focus' : 'done' },
      ]}
      legend={[
        { tone: 'focus', label: '送信元' },
        { tone: 'done', label: '宛先' },
        { tone: 'muted', label: '宛先以外に届いた（破棄される）' },
      ]}
      footnote="ハブ = 第1層（信号をそのまま全ポートへ）、スイッチ = 第2層（MAC アドレスで転送先を判断）、ルータ = 第3層（IP アドレスで別のネットワークへ中継）"
    />
  );
}
