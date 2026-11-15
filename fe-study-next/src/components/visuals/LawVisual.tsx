'use client';

import StepPlayer from './StepPlayer';
import { IP_CASES, IP_RIGHTS } from './traces/strategy';

const NAMES = Object.keys(IP_RIGHTS) as (keyof typeof IP_RIGHTS)[];

export default function LawVisual() {
  const steps = [
    { n: 0, message: '知的財産権には、創作した時点で自動的に発生する著作権と、特許庁への出願・登録が必要な産業財産権（特許権・実用新案権・意匠権・商標権）があります。事例ごとに、どの権利で守られるかを見ていきます。' },
    ...IP_CASES.map((c, i) => ({ n: i + 1, message: `「${c.text}」→ ${c.right}。${c.note}（保護期間: ${IP_RIGHTS[c.right].term}）` })),
  ];
  return (
    <StepPlayer
      title="知的財産権（どの権利で守られるか）"
      steps={steps}
      renderVisual={s => {
        const current = s.n > 0 ? IP_CASES[s.n - 1] : null;
        return (
          <>
            <p className="viz-big" style={{ fontSize: '1.05rem', minHeight: '2.6em', margin: '0 0 8px' }}>
              {current ? `事例: ${current.text}` : '事例を順に見ていきます'}
            </p>
            <div className="viz-table-wrap">
              <table className="viz-table">
                <thead><tr><th>権利</th><th>守るもの</th><th>登録</th><th>保護期間</th></tr></thead>
                <tbody>
                  {NAMES.map(n => (
                    <tr key={n} className={current?.right === n ? 'is-active' : undefined}>
                      <td><b>{n}</b></td>
                      <td className="is-left">{IP_RIGHTS[n].target}</td>
                      <td className="is-left">{IP_RIGHTS[n].register}</td>
                      <td className="is-left">{IP_RIGHTS[n].term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      }}
      getMessage={s => s.message}
      footnote="著作権は「表現」を守り、「アイデア」は守りません。特許は先に作った人ではなく、先に出願した人が取れます（先願主義）。"
    />
  );
}
