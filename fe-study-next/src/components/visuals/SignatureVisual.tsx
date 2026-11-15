'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { AUTH_ITEMS, isMultiFactor } from './traces/security';
import { useSha256 } from './useSha256';

const ORIGINAL = '振込先: 口座123 / 金額: 10,000円';
const TAMPERED = '振込先: 口座123 / 金額: 90,000円';
const CASES = [{ value: 'ok', label: '改ざんなし' }, { value: 'tampered', label: '途中で改ざん' }] as const;
const short = (h: string | null) => (h ? `${h.slice(0, 16)}…` : '計算中…');

function SignPart() {
  const [mode, setMode] = useState<'ok' | 'tampered'>('ok');
  const received = mode === 'ok' ? ORIGINAL : TAMPERED;
  const sentHash = useSha256(ORIGINAL);
  const recvHash = useSha256(received);
  const match = sentHash !== null && recvHash !== null && sentHash === recvHash;
  const steps = useMemo(() => [
    { message: '送信者 A が、本文「' + ORIGINAL + '」にデジタル署名を付けて送ります。' },
    { message: `【送信者】本文のハッシュ値を計算します: ${short(sentHash)}` },
    { message: '【送信者】そのハッシュ値を、A の秘密鍵で暗号化します。これが「デジタル署名」です。秘密鍵は A しか持っていないので、A にしか作れません。' },
    {
      message: mode === 'ok'
        ? '本文と署名をいっしょに送ります。'
        : `本文と署名をいっしょに送りますが、途中で攻撃者が本文を「${TAMPERED}」に書き換えました（署名は作り直せないのでそのまま）。`,
    },
    { message: `【受信者】受け取った本文のハッシュ値を自分で計算します: ${short(recvHash)}` },
    { message: `【受信者】署名を A の公開鍵で復号すると、A が送ったときのハッシュ値が取り出せます: ${short(sentHash)}` },
    {
      message: match
        ? '2つのハッシュ値が一致しました。本文は改ざんされておらず（完全性）、A の秘密鍵で作られた署名なので A が送ったもの（真正性）だと確認できます。A は後から「送っていない」と言えません（否認防止）。'
        : '2つのハッシュ値が一致しません。本文が途中で改ざんされたことを検知できました。この本文は信用できません。',
    },
  ], [mode, sentHash, recvHash, match]);

  const box = (title: string, value: string, at: number, i: number, tone?: string) => (
    <li key={title} className={i === at ? 'is-current' : i < at ? 'is-pending' : undefined}>
      <span>{title}</span>
      <span className="viz-mono" style={tone ? { color: `var(--viz-${tone})`, fontWeight: 700 } : undefined}>{i >= at ? value : '—'}</span>
    </li>
  );

  return (
    <StepPlayer
      key={mode}
      title="デジタル署名の作成と検証"
      steps={steps}
      settings={<Segment label="通信の途中" options={CASES} value={mode} onChange={setMode} />}
      renderVisual={(_, i) => (
        <div className="viz-panels">
          <div className="viz-panel">
            <h5>送信者 A（A の秘密鍵を使う）</h5>
            <ol className="viz-work">
              {box('本文', ORIGINAL, 0, i)}
              {box('ハッシュ値', short(sentHash), 1, i)}
              {box('署名', 'A の秘密鍵で暗号化したハッシュ値', 2, i)}
            </ol>
          </div>
          <div className="viz-panel">
            <h5>受信者 B（A の公開鍵を使う）</h5>
            <ol className="viz-work">
              {box('届いた本文', received, 3, i, mode === 'tampered' ? 'focus' : undefined)}
              {box('本文のハッシュ', short(recvHash), 4, i)}
              {box('署名を復号', short(sentHash), 5, i)}
              {box('判定', match ? '一致 → 正しい' : '不一致 → 改ざんあり', 6, i, match ? 'done' : 'focus')}
            </ol>
          </div>
        </div>
      )}
      getMessage={s => s.message}
      footnote="署名は送信者の秘密鍵で作り、送信者の公開鍵で検証します。ハッシュ値はブラウザで実際に SHA-256 を計算しています。"
    />
  );
}

function MfaPart() {
  const [first, setFirst] = useState('パスワード');
  const [second, setSecond] = useState('暗証番号（PIN）');
  const f1 = AUTH_ITEMS.find(a => a.label === first)!;
  const f2 = AUTH_ITEMS.find(a => a.label === second)!;
  const multi = isMultiFactor([first, second]);
  const steps = [
    { message: '認証の要素は「知識（知っているもの）」「所持（持っているもの）」「生体（本人の特徴）」の3種類です。選んだ2つの組み合わせが多要素認証になるかを判定します。' },
    { message: `1つ目の「${first}」は ${f1.factor}要素です。` },
    { message: `2つ目の「${second}」は ${f2.factor}要素です。` },
    {
      message: multi
        ? `${f1.factor}と${f2.factor}という異なる要素を組み合わせているので、多要素認証です。片方が漏れても、もう片方がなければ突破できません。`
        : first === second
          ? '同じものを2回使っても、認証の強さは変わりません。'
          : `どちらも${f1.factor}要素なので、2つ使っても「二段階」ではあっても多要素認証ではありません。同じ種類の要素は、まとめて盗まれやすいからです。`,
    },
  ];
  const select = (value: string, onChange: (v: string) => void, label: string) => (
    <label className="viz-field">
      {label}
      <select className="viz-input" style={{ width: 'auto' }} value={value} onChange={e => onChange(e.target.value)}>
        {AUTH_ITEMS.map(a => <option key={a.label} value={a.label}>{a.label}（{a.factor}）</option>)}
      </select>
    </label>
  );
  return (
    <StepPlayer
      key={`${first}|${second}`}
      title="多要素認証になる組み合わせか？"
      steps={steps}
      settings={<>{select(first, setFirst, '1つ目')}{select(second, setSecond, '2つ目')}</>}
      renderVisual={(_, i) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {(['知識', '所持', '生体'] as const).map(k => {
            const picked = (i >= 1 && f1.factor === k) || (i >= 2 && f2.factor === k);
            return (
              <div key={k} className={`viz-var tone-${picked ? (multi || i < 3 ? 'range' : 'focus') : 'plain'}`}>
                <dt>{k}要素</dt>
                <dd style={{ fontSize: '0.9rem' }}>
                  {[i >= 1 && f1.factor === k ? first : null, i >= 2 && f2.factor === k ? second : null].filter(Boolean).join(' ＋ ') || '—'}
                </dd>
              </div>
            );
          })}
        </div>
      )}
      getMessage={s => s.message}
      getVars={() => [{ label: '判定', value: multi ? '多要素認証' : '多要素ではない', tone: multi ? 'done' : 'focus' }]}
      footnote="例: パスワード（知識）＋スマホのワンタイムパスワード（所持）は多要素認証。パスワード＋秘密の質問は、どちらも知識なので多要素ではありません。"
    />
  );
}

const TABS = [{ value: 'sign', label: 'デジタル署名' }, { value: 'mfa', label: '多要素認証' }] as const;

export default function SignatureVisual() {
  const [tab, setTab] = useState<'sign' | 'mfa'>('sign');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'sign' ? <SignPart /> : <MfaPart />}
    </div>
  );
}
