import type { Metadata } from 'next';
import { glossaryGroups, termToId } from '@/data/glossary';

export const metadata: Metadata = {
  title: '用語集',
  description: '基本情報技術者試験（FE）の重要用語を分野別にまとめた用語集。ハードウェア・ソフトウェア・ネットワーク・セキュリティ・データベース・AI・マネジメント分野の頻出用語を網羅。',
};

export default function GlossaryPage() {
  return (
    <main className="formulas-page">
      <div className="formulas-container">
        <div className="formulas-header">
          <h1 className="formulas-title">用語集</h1>
          <p className="formulas-subtitle">基本情報技術者試験の頻出用語を分野別にまとめました。試験直前の確認や学習の補助にご活用ください。</p>
        </div>

        <div className="glossary-search-hint">
          <span>💡</span>
          <span>ブラウザの検索機能（Ctrl+F / ⌘+F）やナビバーの検索ボックスで用語を素早く探せます</span>
        </div>

        <div className="formulas-grid glossary-grid">
          {glossaryGroups.map((group) => (
            <section key={group.category} className="formula-card glossary-card">
              <h2 className="formula-card-title">
                <span className="formula-card-icon">{group.icon}</span>
                {group.category}
              </h2>
              <div className="glossary-term-list">
                {group.terms.map((t) => (
                  <div key={t.term} id={termToId(t.term)} className="glossary-term-item">
                    <div className="glossary-term-name">
                      {t.term}
                      {t.reading && <span className="glossary-term-reading">（{t.reading}）</span>}
                    </div>
                    <div className="glossary-term-def">{t.definition}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
