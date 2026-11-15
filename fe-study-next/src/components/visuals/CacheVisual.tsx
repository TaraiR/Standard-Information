'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Arrow, Field, Segment, useValidated } from './ui';
import { blockRange, BLOCK, CACHE_PATTERNS, LINES, traceCache, type CachePattern, type CacheStep } from './traces/cache';

const PATTERNS = (Object.keys(CACHE_PATTERNS) as CachePattern[]).map(k => ({ value: k, label: CACHE_PATTERNS[k].label }));
const ns = (s: string): number | null => (/^\d{1,4}(\.\d)?$/.test(s.trim()) && Number(s) > 0 ? Number(s) : null);

const MEM_BLOCKS = 6;
const LINE_W = 130;
const BLK_W = 92;

const LEVELS = [
  { name: 'レジスタ', where: 'CPU の内部', speed: '〜1 ns', size: '数十〜数百 B' },
  { name: 'キャッシュメモリ', where: 'CPU 内〜CPU のすぐ近く（L1/L2/L3）', speed: '1〜10 ns', size: '数 KB〜数十 MB' },
  { name: '主記憶（RAM）', where: 'マザーボード上', speed: '〜100 ns', size: '数 GB〜数十 GB' },
  { name: 'SSD', where: '補助記憶', speed: '〜0.1 ms', size: '数百 GB〜数 TB' },
  { name: 'HDD', where: '補助記憶', speed: '〜10 ms', size: '数 TB' },
];

function HierarchyPart() {
  const steps = useMemo(() => [
    { level: -1, message: 'メモリは「速いほど高価で小容量」なので、速さと容量の違う記憶装置を階層的に組み合わせて使います。CPU に近い上の段から順に見ていきます。' },
    ...LEVELS.map((l, i) => ({
      level: i,
      message: `${l.name}（${l.where}）: アクセス時間はおよそ ${l.speed}、容量は ${l.size} 程度です。` +
        (i === 0 ? '最も速く、最も小さい記憶装置です。'
          : i === 1 ? 'よく使うデータを主記憶から写しておき、主記憶へのアクセスを減らします。'
            : i === 2 ? 'CPU が直接読み書きできる作業場所です。電源を切ると内容が消えます（揮発性）。'
              : '電源を切っても内容が残ります（不揮発性）。主記憶より桁違いに遅いですが、大容量で安価です。'),
    })),
    { level: 5, message: '上の段ほど速く・小さく・高価、下の段ほど遅く・大きく・安価です。キャッシュは、この速度差を埋めるために置かれています。' },
  ], []);
  return (
    <StepPlayer
      title="メモリ階層（速度と容量のトレードオフ）"
      steps={steps}
      renderVisual={s => (
        <svg className="viz-svg" viewBox="0 0 620 300" role="img" aria-label="メモリ階層のピラミッド">
          {LEVELS.map((l, i) => {
            const w = 150 + i * 105;
            const tone = s.level === i ? 'focus' : s.level > i || s.level === 5 ? 'range' : '';
            return (
              <g key={l.name}>
                <rect className={`viz-box${tone ? ` tone-${tone}` : ''}`} x={310 - w / 2} y={14 + i * 56} width={w} height={48} rx={8} />
                <text className="viz-text is-strong" x={310} y={38 + i * 56} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 19 }}>
                  {l.name}　{s.level >= i ? l.speed : ''}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      getMessage={s => s.message}
      footnote="アクセス時間・容量はおおよその目安です。"
    />
  );
}

const TABS = [{ value: 'cache', label: 'キャッシュの動き' }, { value: 'tier', label: 'メモリ階層' }] as const;

export default function CacheVisual() {
  const [tab, setTab] = useState<'cache' | 'tier'>('cache');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'cache' ? <CachePart /> : <HierarchyPart />}
    </div>
  );
}

function CachePart() {
  const [pattern, setPattern] = useState<CachePattern>('sequential');
  const cacheNs = useValidated(10, String, ns);
  const memNs = useValidated(100, String, ns);
  const addresses = CACHE_PATTERNS[pattern].addresses;
  const steps = useMemo(() => traceCache([...addresses], cacheNs.value, memNs.value), [addresses, cacheNs.value, memNs.value]);

  const lineX = (i: number) => 40 + i * (LINE_W + 14);
  const blkX = (b: number) => 20 + b * (BLK_W + 10);

  const renderVisual = (s: CacheStep) => (
    <>
      <div className="viz-bits" style={{ marginBottom: 8 }} aria-label="アクセスするアドレスの列">
        {addresses.map((a, i) => {
          const done = i < s.index;
          const now = i === s.index - 1 && s.address !== null;
          const r = s.results[i];
          return (
            <span key={i} className={`viz-bit${now ? (r === 'H' ? ' tone-done' : ' tone-focus') : done ? (r === 'H' ? ' tone-done' : ' tone-muted') : ''}`}
              title={done ? (r === 'H' ? 'ヒット' : 'ミス') : '未アクセス'}>
              {a}{done ? (r === 'H' ? '✓' : '×') : ''}
            </span>
          );
        })}
      </div>
      <svg className="viz-svg" viewBox="0 0 640 300" role="img"
        aria-label={`キャッシュの中身: ${s.lines.map(l => (l ? `ブロック${l.block}` : '空')).join('、')}`}>
        <text className="viz-label" x={40} y={22}>キャッシュメモリ（{LINES} ブロック・高速）</text>
        {s.lines.map((l, i) => {
          const tone = s.touched === i ? (s.hit ? 'done' : 'focus') : l ? 'range' : '';
          return (
            <g key={i}>
              <rect className={`viz-box${tone ? ` tone-${tone}` : ''}`} x={lineX(i)} y={32} width={LINE_W} height={70} rx={10} />
              <text className="viz-text is-strong" x={lineX(i) + LINE_W / 2} y={58} textAnchor="middle">
                {l ? `ブロック${l.block}` : '（空き）'}
              </text>
              <text className="viz-label" x={lineX(i) + LINE_W / 2} y={86} textAnchor="middle">
                {l ? `アドレス ${blockRange(l.block)}` : ''}
              </text>
            </g>
          );
        })}
        {s.block !== null && s.touched !== null && !s.hit && (
          <Arrow points={[[blkX(s.block) + BLK_W / 2, 196], [lineX(s.touched) + LINE_W / 2, 106]]} tone="focus" active />
        )}
        <text className="viz-label" x={20} y={186}>主記憶（低速）</text>
        {Array.from({ length: MEM_BLOCKS }, (_, b) => {
          const inCache = s.lines.some(l => l?.block === b);
          const tone = s.block === b ? (s.hit ? 'done' : 'focus') : inCache ? 'range' : '';
          return (
            <g key={b}>
              <rect className={`viz-box${tone ? ` tone-${tone}` : ''}`} x={blkX(b)} y={198} width={BLK_W} height={64} rx={8} />
              <text className="viz-text" x={blkX(b) + BLK_W / 2} y={222} textAnchor="middle" style={{ fontSize: 17 }}>ブロック{b}</text>
              <text className="viz-label" x={blkX(b) + BLK_W / 2} y={248} textAnchor="middle" style={{ fontSize: 15 }}>{blockRange(b)}</text>
            </g>
          );
        })}
        <text className="viz-label" x={20} y={290} style={{ fontSize: 15 }}>
          {s.evicted !== null ? `ブロック${s.evicted} を追い出しました（LRU）` : `1ブロック = ${BLOCK} アドレス`}
        </text>
      </svg>
    </>
  );

  return (
    <StepPlayer
      key={`${pattern}|${cacheNs.value}|${memNs.value}`}
      title={`キャッシュメモリのヒットとミス（${CACHE_PATTERNS[pattern].label}）`}
      steps={steps}
      settings={
        <>
          <Segment label="アクセスのしかた" options={PATTERNS} value={pattern} onChange={setPattern} />
          <Field label="キャッシュ(ns)" text={cacheNs.text} invalid={cacheNs.invalid} onChange={cacheNs.onChange} inputMode="decimal" width="4em" />
          <Field label="主記憶(ns)" text={memNs.text} invalid={memNs.invalid} onChange={memNs.onChange} inputMode="decimal" width="4.5em" />
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: 'ヒット', value: s.hits, tone: 'done' },
        { label: 'ミス', value: s.misses, tone: 'focus' },
        { label: 'ヒット率', value: s.hits + s.misses ? `${Math.round((s.hits / (s.hits + s.misses)) * 100)}%` : '—', tone: 'range' },
        { label: '実効アクセス時間', value: s.final ? `${Number(s.final.effective.toFixed(2))} ns` : '—', tone: s.final ? 'done' : 'plain' },
      ]}
      legend={[
        { tone: 'done', label: 'ヒット' },
        { tone: 'focus', label: 'ミス（主記憶から読み込み）' },
        { tone: 'range', label: 'キャッシュにあるブロック' },
      ]}
      footnote={`「${CACHE_PATTERNS[pattern].label}」は${CACHE_PATTERNS[pattern].note}の例です。キャッシュはブロック単位で読み込むので、近くのアドレスを続けて使うとヒットしやすくなります。`}
    />
  );
}
