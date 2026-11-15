'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Field, Segment, useValidated } from './ui';
import { intInRange } from './bits';
import { CHARSETS, crackTime, patterns, runConcatenated, runPrepared, USERS, type Charset } from './traces/sqli';

const MODES = [{ value: 'concat', label: '文字列連結（脆弱）' }, { value: 'prepared', label: 'プレースホルダ（対策）' }] as const;
const PRESETS = [
  { label: '正しいログイン', id: 'tanaka', pw: 'sakura2024' },
  { label: "' OR '1'='1", id: 'tanaka', pw: "' OR '1'='1" },
  { label: "admin'--", id: "admin'--", pw: 'なんでも' },
];

function SqlPart() {
  const [mode, setMode] = useState<'concat' | 'prepared'>('concat');
  const [id, setId] = useState('tanaka');
  const [pw, setPw] = useState("' OR '1'='1");
  const result = useMemo(() => (mode === 'concat' ? runConcatenated(id, pw) : runPrepared(id, pw)), [mode, id, pw]);
  const exact = USERS.filter(u => u.id === id && u.pw === pw);
  const injected = mode === 'concat' && (result.error !== null || result.rows.length !== exact.length);

  const steps = useMemo(() => [
    { message: `ログイン画面に ID「${id}」、パスワード「${pw}」が入力されました。` },
    {
      message: mode === 'concat'
        ? '入力をそのまま SQL 文の中に文字列としてつなげて、問い合わせを組み立てます（黄色が入力した部分）。'
        : 'SQL 文の形は「?」で先に決めておき、入力は「値」として別に渡します（プレースホルダ）。',
    },
    {
      message: mode === 'prepared'
        ? '入力に記号が含まれていても、ただの文字列として比較されるだけです。SQL の命令として解釈されることはありません。'
        : result.error
          ? `入力の中の「'」で文字列の範囲が崩れ、${result.error}になりました。攻撃者はこのエラーから、入力が SQL に直接入っていると知ることができます。`
          : injected
            ? '入力の中の「\'」が文字列を途中で閉じてしまい、その後ろの OR や -- が SQL の命令として解釈されました。条件が攻撃者の思いどおりに書き換わっています。'
            : '入力に特殊な記号がないので、意図どおりの条件で問い合わせます。',
    },
    {
      message: result.rows.length
        ? `${result.rows.length} 件のユーザーが見つかったので、ログイン成功と判定されます（${result.rows.map(r => r.name).join('・')}）。` +
          (injected ? ' パスワードを知らないのにログインできてしまいました。これが SQL インジェクションです。' : '')
        : 'ユーザーが見つからないので、ログイン失敗です。' + (mode === 'prepared' && pw.includes("'") ? ' プレースホルダなら攻撃は成立しません。' : ''),
    },
  ], [id, pw, mode, result, injected]);

  const sqlView = mode === 'concat'
    ? <>SELECT * FROM users WHERE id = &apos;<mark>{id}</mark>&apos; AND pw = &apos;<mark>{pw}</mark>&apos;</>
    : <>SELECT * FROM users WHERE id = <mark>?</mark> AND pw = <mark>?</mark>　← 値: [<b>{id}</b>], [<b>{pw}</b>]</>;

  return (
    <StepPlayer
      key={`${mode}|${id}|${pw}`}
      title="SQL インジェクション"
      steps={steps}
      settings={
        <>
          <Segment label="SQL の組み立て方" options={MODES} value={mode} onChange={setMode} />
          <Field label="ID" text={id} invalid={false} onChange={setId} inputMode="text" width="8em" />
          <Field label="パスワード" text={pw} invalid={false} onChange={setPw} inputMode="text" width="9em" />
          <div className="viz-presets">
            {PRESETS.map(p => (
              <button key={p.label} type="button" className="viz-mini-btn" onClick={() => { setId(p.id); setPw(p.pw); }}>{p.label}</button>
            ))}
          </div>
        </>
      }
      renderVisual={(_, i) => (
        <ol className="viz-work">
          <li className={i === 1 ? 'is-current' : i < 1 ? 'is-pending' : undefined}>
            <span>組み立てた SQL</span><code className="viz-sql">{i >= 1 ? sqlView : '—'}</code>
          </li>
          <li className={i === 2 ? 'is-current' : i < 2 ? 'is-pending' : undefined}>
            <span>解釈された条件</span>
            <code className="viz-mono">{i >= 2 ? (result.error ?? (mode === 'concat' ? result.where.replace(/--.*$/, '（-- 以降はコメントとして無視）') : `id が「${id}」と等しい かつ pw が「${pw}」と等しい`)) : '—'}</code>
          </li>
          <li className={i === 3 ? 'is-current' : 'is-pending'}>
            <span>結果</span>
            <span className="viz-big" style={{ fontSize: '1.2rem' }}>
              {i >= 3 ? (result.rows.length ? `ログイン成功（${result.rows.length}件）` : 'ログイン失敗') : '—'}
            </span>
          </li>
        </ol>
      )}
      getMessage={s => s.message}
      getVars={() => [
        { label: '本来の正しい件数', value: exact.length, tone: 'done' },
        { label: '実際の件数', value: result.error ? 'エラー' : result.rows.length, tone: injected ? 'focus' : 'done' },
      ]}
      footnote="対策: プレースホルダ（バインド機構）を使う、入力をエスケープする、WAF を置く。ユーザー表: tanaka / suzuki / admin。"
    />
  );
}

const SETS = (Object.keys(CHARSETS) as Charset[]).map(k => ({ value: k, label: CHARSETS[k].label }));
const RATE = 1e10; // 1秒に100億回試せる攻撃者を想定

function BrutePart() {
  const [cs, setCs] = useState<Charset>('alnum');
  const len = useValidated(8, String, intInRange(1, 16));
  const size = CHARSETS[cs].size;
  const steps = useMemo(() => [
    { k: 0, message: `${CHARSETS[cs].label}で、長さ ${len.value} 文字のパスワードを総当たりで試すと、何通り試せば必ず当たるかを考えます。` },
    ...Array.from({ length: len.value }, (_, i) => ({
      k: i + 1,
      message: `${i + 1} 文字目も ${size} 通りあるので、パターン数は ${size}^${i + 1} = ${patterns(size, i + 1).toLocaleString()} 通りになります。`,
    })),
    { k: len.value, message: `1秒に ${RATE.toExponential(0).replace('e+', '×10^')} 回試せる攻撃者でも、全パターンを試すには ${crackTime(patterns(size, len.value), RATE)} かかります。文字の種類を増やし、長くするほど総当たりに強くなります。` },
  ], [cs, len.value, size]);
  return (
    <StepPlayer
      key={`${cs}|${len.value}`}
      title="総当たり（ブルートフォース）攻撃に必要な回数"
      steps={steps}
      settings={
        <>
          <Segment label="使う文字の種類" options={SETS} value={cs} onChange={setCs} />
          <Field label="長さ" text={len.text} invalid={len.invalid} onChange={len.onChange} width="3.5em" hint="1〜16文字" />
        </>
      }
      renderVisual={s => (
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead><tr><th>文字数</th><th>パターン数</th><th>全部試す時間</th></tr></thead>
            <tbody>
              {Array.from({ length: s.k }, (_, i) => (
                <tr key={i} className={i === s.k - 1 ? 'is-active' : undefined}>
                  <td>{i + 1}</td>
                  <td className="viz-mono">{size}^{i + 1} = {patterns(size, i + 1) < 1e15 ? patterns(size, i + 1).toLocaleString() : patterns(size, i + 1).toExponential(2)}</td>
                  <td>{crackTime(patterns(size, i + 1), RATE)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      getMessage={s => s.message}
      footnote="辞書攻撃（よく使われる単語を試す）やパスワードリスト攻撃（流出したパスワードの使い回しを狙う）には、長さだけでは対抗できません。使い回さないことが大切です。"
    />
  );
}

const TABS = [{ value: 'sql', label: 'SQL インジェクション' }, { value: 'brute', label: '総当たり攻撃' }] as const;

export default function AttackVisual() {
  const [tab, setTab] = useState<'sql' | 'brute'>('sql');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'sql' ? <SqlPart /> : <BrutePart />}
    </div>
  );
}
