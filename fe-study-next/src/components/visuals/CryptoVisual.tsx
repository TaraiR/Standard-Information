'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, SequenceDiagram, type SeqItem } from './ui';
import { publicKeys, symmetricKeys } from './traces/security';
import { differingBits, useSha256 } from './useSha256';

type Scheme = 'common' | 'public' | 'hybrid';
const SCHEMES = [
  { value: 'common', label: '共通鍵暗号' },
  { value: 'public', label: '公開鍵暗号' },
  { value: 'hybrid', label: 'ハイブリッド' },
] as const;

const FLOWS: Record<Scheme, (SeqItem & { message: string })[]> = {
  common: [
    { from: 'a', to: 'b', label: '共通鍵を渡す', tone: 'focus', message: '送信者と受信者は同じ鍵（共通鍵）を持つ必要があります。この鍵をどうやって安全に渡すか、が「鍵配送問題」です。途中で盗まれると、暗号は意味がなくなります。' },
    { from: 'a', to: 'a', label: '共通鍵で暗号化', message: '送信者 A が、共通鍵で平文を暗号化します。' },
    { from: 'a', to: 'b', label: '暗号文', message: '暗号文を送ります。盗聴されても、鍵がなければ読めません。' },
    { from: 'b', to: 'b', label: '同じ共通鍵で復号', tone: 'done', message: '受信者 B が、同じ共通鍵で復号します。処理が速いので、大量のデータの暗号化に向いています（例: AES）。' },
  ],
  public: [
    { from: 'b', to: 'b', label: '公開鍵・秘密鍵を作る', message: '受信者 B が、公開鍵と秘密鍵のペアを作ります。秘密鍵は B だけが持ちます。' },
    { from: 'b', to: 'a', label: 'B の公開鍵', message: 'B は公開鍵を公開します。公開鍵は誰に知られても問題ないので、鍵配送問題が起きません。' },
    { from: 'a', to: 'a', label: 'B の公開鍵で暗号化', message: '送信者 A は、受信者 B の公開鍵で暗号化します。' },
    { from: 'a', to: 'b', label: '暗号文', message: '暗号文を送ります。B の公開鍵で暗号化したものは、B の秘密鍵でしか復号できません。' },
    { from: 'b', to: 'b', label: 'B の秘密鍵で復号', tone: 'done', message: 'B が自分の秘密鍵で復号します。ただし処理が遅いので、大量のデータには向きません（例: RSA）。' },
  ],
  hybrid: [
    { from: 'b', to: 'a', label: 'B の公開鍵', message: 'HTTPS（TLS）などで使われる方式です。まず受信者 B の公開鍵を受け取ります。' },
    { from: 'a', to: 'a', label: '共通鍵を作り、公開鍵で暗号化', message: '送信者 A は、この通信で使う共通鍵を作り、それを B の公開鍵で暗号化します。' },
    { from: 'a', to: 'b', label: '暗号化した共通鍵', tone: 'focus', message: '暗号化した共通鍵を送ります。遅い公開鍵暗号を使うのは、この短い鍵を送る1回だけです。' },
    { from: 'b', to: 'b', label: '秘密鍵で共通鍵を取り出す', message: 'B は自分の秘密鍵で復号し、共通鍵を手に入れます。これで鍵配送問題を解決できました。' },
    { from: 'a', to: 'b', label: '共通鍵で暗号化したデータ', tone: 'done', message: '以降の大量のデータは、速い共通鍵暗号で暗号化して送ります。両方の長所を組み合わせています。' },
  ],
};

function SchemePart() {
  const [scheme, setScheme] = useState<Scheme>('common');
  const flow = FLOWS[scheme];
  const steps = useMemo(() => [
    { shown: 0, message: '送信者 A が受信者 B に、盗聴されても読まれないようにデータを送ります。' },
    ...flow.map((m, i) => ({ shown: i + 1, message: m.message })),
  ], [flow]);
  return (
    <StepPlayer
      key={scheme}
      title={`${SCHEMES.find(s => s.value === scheme)!.label}の流れ`}
      steps={steps}
      settings={<Segment label="暗号方式" options={SCHEMES} value={scheme} onChange={setScheme} />}
      renderVisual={s => (
        <SequenceDiagram shown={s.shown} messages={flow} width={560}
          actors={[{ id: 'a', label: '送信者 A' }, { id: 'b', label: '受信者 B' }]} />
      )}
      getMessage={s => s.message}
      footnote="暗号化通信は「受信者の公開鍵で暗号化 → 受信者の秘密鍵で復号」。デジタル署名（送信者の秘密鍵で署名）とは使う鍵が逆です。"
    />
  );
}

const COUNTS = [2, 3, 4, 5, 6, 8, 10].map(v => ({ value: v, label: `${v}人` }));

function KeysPart() {
  const [n, setN] = useState(5);
  const steps = useMemo(() => [
    { k: 1, message: '共通鍵暗号では、通信する2人の組ごとに別々の鍵が必要です。1人ずつ参加者を増やしていきます。' },
    ...Array.from({ length: n - 1 }, (_, i) => {
      const k = i + 2;
      return { k, message: `${k}人目が加わると、すでにいる ${k - 1} 人それぞれとの鍵が ${k - 1} 本増えます。合計 ${symmetricKeys(k)} 本です。` };
    }),
    {
      k: n,
      message: `${n} 人なら共通鍵は ${n} × (${n} − 1) ÷ 2 = ${symmetricKeys(n)} 本必要です。公開鍵暗号なら各自が1組ずつ持つだけなので ${publicKeys(n)} 本です。` +
        (symmetricKeys(n) > publicKeys(n) ? '人数が増えるほど、共通鍵の本数は急激に増えます（100人なら 4,950 本 対 200 本）。'
          : symmetricKeys(n) === publicKeys(n) ? 'この人数ではちょうど同じですが、これより増えると共通鍵のほうが多くなります（100人なら 4,950 本 対 200 本）。'
            : '少人数では共通鍵のほうが少ないですが、人数が増えると逆転します（100人なら 4,950 本 対 200 本）。'),
    },
  ], [n]);
  const pos = (i: number) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return [300 + 120 * Math.cos(a), 150 + 120 * Math.sin(a)] as const;
  };
  return (
    <StepPlayer
      key={n}
      title="必要な鍵の数: 共通鍵 n(n−1)/2 本 と 公開鍵 2n 本"
      steps={steps}
      settings={<Segment label="人数" options={COUNTS} value={n} onChange={setN} />}
      renderVisual={(s, idx) => (
        <svg className="viz-svg" viewBox="0 0 600 300" role="img" aria-label={`${s.k}人で共通鍵${symmetricKeys(s.k)}本`}>
          {Array.from({ length: s.k }, (_, i) => Array.from({ length: i }, (_, j) => {
            const [x1, y1] = pos(i);
            const [x2, y2] = pos(j);
            const fresh = i === s.k - 1 && idx < steps.length - 1 && s.k > 1;
            return <line key={`${i}-${j}`} className={`viz-line tone-${fresh ? 'focus' : 'range'}`} strokeWidth={fresh ? 4 : 2} x1={x1} y1={y1} x2={x2} y2={y2} />;
          }))}
          {Array.from({ length: n }, (_, i) => {
            const [x, y] = pos(i);
            return (
              <g key={i} className="viz-fade" style={{ opacity: i < s.k ? 1 : 0.2 }}>
                <circle cx={x} cy={y} r={22} className={`viz-box${i === s.k - 1 ? ' tone-focus' : i < s.k ? ' tone-range' : ''}`} />
                <text className="viz-text is-strong" x={x} y={y} textAnchor="middle" dominantBaseline="central">{i + 1}</text>
              </g>
            );
          })}
        </svg>
      )}
      getMessage={s => s.message}
      getVars={s => [
        { label: '人数', value: s.k, tone: 'range' },
        { label: '共通鍵', value: `${symmetricKeys(s.k)} 本`, tone: 'focus' },
        { label: '公開鍵方式', value: `${publicKeys(s.k)} 本`, tone: 'done' },
      ]}
      legend={[{ tone: 'focus', label: '新しく必要になった鍵' }, { tone: 'range', label: 'それまでの鍵' }]}
    />
  );
}

function HashPart() {
  const [a, setA] = useState('こんにちは');
  const [b, setB] = useState('こんにちわ');
  const ha = useSha256(a);
  const hb = useSha256(b);
  const diff = ha && hb ? differingBits(ha, hb) : null;
  const steps = [
    { message: `入力 A「${a}」の SHA-256 ハッシュ値を計算します。入力の長さに関係なく、結果は必ず 256 ビット（16進数 64 桁）です。` },
    { message: `入力 B「${b}」のハッシュ値も計算します。` },
    {
      message: diff === null ? '計算中です…'
        : a === b ? '同じ入力からは、必ず同じハッシュ値が得られます。'
          : `入力の違いはわずかでも、256 ビット中 ${diff} ビット（約 ${Math.round((diff / 256) * 100)}%）が変わりました（雪崩効果）。ハッシュ値から元の入力を推測したり、同じハッシュ値になる別の入力を作ったりすることは困難です。`,
    },
  ];
  const hex = (h: string | null, other: string | null, show: boolean) => (!show ? '—' : !h ? '計算中…' : (
    <span className="viz-mono" style={{ wordBreak: 'break-all' }}>
      {h.split('').map((c, i) => <span key={i} style={other && other[i] !== c ? { color: 'var(--viz-focus)', fontWeight: 700 } : undefined}>{c}</span>)}
    </span>
  ));
  return (
    <StepPlayer
      key={`${a}|${b}`}
      title="ハッシュ関数（SHA-256）の性質"
      steps={steps}
      settings={
        <>
          <Field label="入力 A" text={a} invalid={false} onChange={setA} inputMode="text" width="9em" />
          <Field label="入力 B" text={b} invalid={false} onChange={setB} inputMode="text" width="9em" />
        </>
      }
      renderVisual={(_, i) => (
        <ol className="viz-work">
          <li className={i === 0 ? 'is-current' : undefined}><span>A のハッシュ</span>{hex(ha, i >= 2 ? hb : null, true)}</li>
          <li className={i === 1 ? 'is-current' : i < 1 ? 'is-pending' : undefined}><span>B のハッシュ</span>{hex(hb, i >= 2 ? ha : null, i >= 1)}</li>
          <li className={i === 2 ? 'is-current' : 'is-pending'}><span>違うビット数</span><span className="viz-big">{i >= 2 && diff !== null ? `${diff} / 256` : '—'}</span></li>
        </ol>
      )}
      getMessage={s => s.message}
      legend={[{ tone: 'focus', label: 'A と B で違う桁' }]}
      footnote="ハッシュは暗号化ではなく、元に戻せない一方向の変換です。パスワードの保存や改ざんの検知に使います。値はブラウザで実際に計算しています。"
    />
  );
}

const TABS = [{ value: 'scheme', label: '暗号方式' }, { value: 'keys', label: '鍵の数' }, { value: 'hash', label: 'ハッシュ' }] as const;

export default function CryptoVisual() {
  const [tab, setTab] = useState<'scheme' | 'keys' | 'hash'>('scheme');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'scheme' ? <SchemePart /> : tab === 'keys' ? <KeysPart /> : <HashPart />}
    </div>
  );
}
