'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';

type Kind = 'host' | 'hypervisor' | 'container';
const KINDS = [
  { value: 'host', label: 'ホスト型' },
  { value: 'hypervisor', label: 'ハイパーバイザー型' },
  { value: 'container', label: 'コンテナ' },
] as const;

/** 下から積み上げる層。apps はアプリごとの列（列ごとに積む層） */
interface Stack { base: string[]; columns: string[][]; notes: string[]; os: number; summary: string }

const STACKS: Record<Kind, Stack> = {
  host: {
    base: ['ハードウェア', 'ホストOS（Windows など）', '仮想化ソフト（VirtualBox など）'],
    columns: [['ゲストOS', 'アプリA'], ['ゲストOS', 'アプリB'], ['ゲストOS', 'アプリC']],
    notes: [
      'いつも使っている PC（ハードウェア）があります。',
      'その上でホストOS が動いています。',
      'ホストOS 上に、アプリとして仮想化ソフトをインストールします。',
      '仮想化ソフトの上で、仮想マシンごとにゲストOS とアプリが動きます。',
    ],
    os: 4,
    summary: 'ホストOS を経由するぶん処理が重くなりますが、手元の PC で手軽に試せます。',
  },
  hypervisor: {
    base: ['ハードウェア', 'ハイパーバイザー（ESXi・Hyper-V など）'],
    columns: [['ゲストOS', 'アプリA'], ['ゲストOS', 'アプリB'], ['ゲストOS', 'アプリC']],
    notes: [
      'サーバ（ハードウェア）があります。',
      'ハードウェアの上に直接ハイパーバイザーを入れます（ホストOS は不要）。',
      'ハイパーバイザーの上で、仮想マシンごとにゲストOS とアプリが動きます。',
    ],
    os: 3,
    summary: 'ホストOS を挟まないので性能の低下が小さく、データセンターのサーバで使われます。',
  },
  container: {
    base: ['ハードウェア', 'ホストOS（Linux）', 'コンテナエンジン（Docker）'],
    columns: [['ライブラリ', 'アプリA'], ['ライブラリ', 'アプリB'], ['ライブラリ', 'アプリC']],
    notes: [
      'サーバ（ハードウェア）があります。',
      'その上でホストOS が動いています。',
      'コンテナエンジン（Docker など）を入れます。',
      '各コンテナにはアプリと必要なライブラリだけが入り、OS のカーネルはホストOS のものを共有します。',
    ],
    os: 1,
    summary: 'ゲストOS を持たないので軽く（MB 単位）、数秒で起動できます。ただし OS を共有するぶん、仮想マシンより分離は弱くなります。',
  },
};

export default function VirtualizationVisual() {
  const [kind, setKind] = useState<Kind>('hypervisor');
  const st = STACKS[kind];
  const steps = useMemo(() => [
    ...st.notes.map((n, i) => ({ level: i, message: n })),
    { level: st.notes.length, message: `この構成では OS が ${st.os} つ動いています。${st.summary}` },
  ], [st]);
  const H = 46;
  const baseH = st.base.length * H;
  const height = baseH + 2 * H + 20;

  return (
    <StepPlayer
      key={kind}
      title={`仮想化の構成: ${KINDS.find(k => k.value === kind)!.label}`}
      steps={steps}
      settings={<Segment label="方式" options={KINDS} value={kind} onChange={setKind} />}
      renderVisual={s => (
        <svg className="viz-svg" viewBox={`0 0 600 ${height}`} role="img" aria-label={`${KINDS.find(k => k.value === kind)!.label}の層構成`}>
          {st.base.map((b, i) => {
            const y = height - 10 - (i + 1) * H;
            const shown = s.level >= i;
            return (
              <g key={b} className="viz-fade" style={{ opacity: shown ? 1 : 0.15 }}>
                <rect className={`viz-box${s.level === i ? ' tone-focus' : shown ? ' tone-range' : ''}`} x={20} y={y} width={560} height={H - 6} rx={8} />
                <text className="viz-text is-strong" x={300} y={y + (H - 6) / 2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 18 }}>{b}</text>
              </g>
            );
          })}
          {st.columns.map((col, c) => col.map((layer, k) => {
            const y = height - 10 - baseH - (k + 1) * H;
            const shown = s.level >= st.base.length;
            const isOs = layer === 'ゲストOS';
            return (
              <g key={`${c}-${k}`} className="viz-fade" style={{ opacity: shown ? 1 : 0.15 }}>
                <rect className={`viz-box${shown ? (isOs ? ' tone-focus' : ' tone-done') : ''}`} x={20 + c * 190} y={y} width={180} height={H - 6} rx={8} />
                <text className="viz-text" x={110 + c * 190} y={y + (H - 6) / 2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 17 }}>{layer}</text>
              </g>
            );
          }))}
        </svg>
      )}
      getMessage={s => s.message}
      getVars={() => [{ label: '動いている OS の数', value: st.os, tone: 'focus' }]}
      legend={[{ tone: 'focus', label: 'OS' }, { tone: 'done', label: 'アプリ・ライブラリ' }]}
      footnote="コンテナを大量に動かすときは、Kubernetes が起動・停止・増減を自動で管理します（オーケストレーション）。"
    />
  );
}
