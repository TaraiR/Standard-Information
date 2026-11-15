'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { BOUNDARY, coverage, EQUIVALENCE, isValidBuggy, isValidSpec, type CovInput } from './traces/devmgmt';

const CASES = [...EQUIVALENCE, ...BOUNDARY];

function BoundaryPart() {
  const cases = CASES;
  const steps = useMemo(() => [
    { n: 0, message: '仕様は「年齢 0〜120 を有効とする」です。ところが実装には、0 を無効と判定してしまうバグ（age > 0 と書いてしまった）が隠れています。テストで見つけられるでしょうか。' },
    ...cases.map((c, i) => {
      const exp = isValidSpec(c.value);
      const act = isValidBuggy(c.value);
      return {
        n: i + 1,
        message: `【${c.technique}】${c.kind}の代表として ${c.value} を入力。期待は「${exp ? '有効' : '無効'}」、実際は「${act ? '有効' : '無効'}」` +
          (exp === act ? 'で一致しました。' : 'で食い違いました。バグを発見！'),
      };
    }),
    { n: cases.length, message: '同値分割の代表値（−5・30・200）ではバグを見つけられませんでしたが、境界値分析で下限の 0 を試したことで見つかりました。バグは境界に潜みやすいので、境界とその前後の値を重点的にテストします。' },
  ], [cases]);
  return (
    <StepPlayer
      title="同値分割と境界値分析（ブラックボックステスト）"
      steps={steps}
      renderVisual={s => (
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead><tr><th>技法</th><th>入力</th><th>意味</th><th>期待</th><th>実際</th><th>判定</th></tr></thead>
            <tbody>
              {cases.slice(0, s.n).map((c, i) => {
                const exp = isValidSpec(c.value);
                const act = isValidBuggy(c.value);
                return (
                  <tr key={i} className={i === s.n - 1 ? 'is-active' : undefined}>
                    <td>{c.technique}</td><td>{c.value}</td><td className="is-left">{c.kind}</td>
                    <td>{exp ? '有効' : '無効'}</td><td>{act ? '有効' : '無効'}</td>
                    <td style={{ color: exp === act ? 'var(--viz-done)' : 'var(--viz-focus)', fontWeight: 700 }}>{exp === act ? '合格' : '不合格'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      getMessage={s => s.message}
      footnote="同値分割: 同じ結果になる入力のグループから代表値を1つ選ぶ。境界値分析: グループの境目（最小・最大とその前後）を選ぶ。"
    />
  );
}

const CODE = ['if (x > 0) {', '  y = y + 1', '}', 'if (z > 0) {', '  y = y * 2', '}', 'return y'];
const LINE_OF: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 4, 5: 6 }; // 命令番号 → 表示行
const SETS = [{ value: 'one', label: 'テスト1件' }, { value: 'two', label: 'テスト2件' }] as const;

function CoveragePart() {
  const [set, setSet] = useState<'one' | 'two'>('one');
  const cases: CovInput[] = useMemo(() => (set === 'one' ? [{ x: 1, z: 1 }] : [{ x: 1, z: 1 }, { x: 0, z: 0 }]), [set]);
  const steps = useMemo(() => {
    const out = [{ n: 0, message: '7行のコードに、命令が5つ（if 文2つ・代入2つ・return）、分岐が4つ（各 if の真・偽）あります。' }];
    cases.forEach((c, i) => {
      const r = coverage(cases.slice(0, i + 1));
      out.push({ n: i + 1, message: `テスト${i + 1}（x = ${c.x}, z = ${c.z}）を実行。ここまでで命令 ${r.statements.size}/5、分岐 ${r.branches.size}/4 を通りました。` });
    });
    const r = coverage(cases);
    out.push({
      n: cases.length,
      message: r.branches.size === 4
        ? '2件のテストで、すべての分岐の真と偽を通りました。分岐網羅（C1）100% です。C1 を満たせば C0 も満たします。'
        : '1件だけで全命令を実行できたので命令網羅（C0）は 100% ですが、if が偽になる道を一度も通っていないので分岐網羅（C1）は 50% です。x ≤ 0 のときのバグは見逃してしまいます。',
    });
    return out;
  }, [cases]);
  return (
    <StepPlayer
      key={set}
      title="命令網羅（C0）と分岐網羅（C1）（ホワイトボックステスト）"
      steps={steps}
      settings={<Segment label="テストケース" options={SETS} value={set} onChange={setSet} />}
      renderVisual={s => {
        const r = coverage(cases.slice(0, s.n));
        const lines = new Set([...r.statements].map(n => LINE_OF[n]));
        return (
          <div className="viz-panels">
            <pre className="viz-code" style={{ margin: 0 }}>
              {CODE.map((l, i) => <span key={i} className={lines.has(i) ? 'is-active' : undefined}>{l}{'\n'}</span>)}
            </pre>
            <div className="viz-panel">
              <h5>通った分岐</h5>
              <dl className="viz-kv">
                {(['1T', '1F', '3T', '3F'] as const).map(b => (
                  <div key={b} style={{ display: 'contents' }}>
                    <dt>{b.startsWith('1') ? 'x > 0' : 'z > 0'} が{b.endsWith('T') ? '真' : '偽'}</dt>
                    <dd className={r.branches.has(b) ? 'is-hl' : undefined}>{r.branches.has(b) ? '✓ 通った' : '— 未'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );
      }}
      getMessage={s => s.message}
      getVars={s => {
        const r = coverage(cases.slice(0, s.n));
        return [
          { label: 'C0（命令網羅）', value: `${Math.round((r.statements.size / 5) * 100)}%`, tone: 'range' },
          { label: 'C1（分岐網羅）', value: `${Math.round((r.branches.size / 4) * 100)}%`, tone: r.branches.size === 4 ? 'done' : 'focus' },
        ];
      }}
      footnote="網羅の厳しさは C0（命令網羅）< C1（分岐網羅）< 条件網羅 の順です。"
    />
  );
}

const TABS = [{ value: 'bb', label: '境界値分析' }, { value: 'wb', label: '命令・分岐網羅' }] as const;

export default function TestingVisual() {
  const [tab, setTab] = useState<'bb' | 'wb'>('bb');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'bb' ? <BoundaryPart /> : <CoveragePart />}
    </div>
  );
}
