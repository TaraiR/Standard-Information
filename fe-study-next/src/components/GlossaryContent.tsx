'use client';
import React, { useState, useMemo } from 'react';
import { glossaryGroups, termToId } from '@/data/glossary';
import type { GlossaryTerm } from '@/data/glossary';

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? <mark key={i} className="glossary-highlight">{p}</mark> : p
  );
}

export default function GlossaryContent() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return glossaryGroups;
    return glossaryGroups
      .map(g => ({
        ...g,
        terms: g.terms.filter((t: GlossaryTerm) =>
          t.term.toLowerCase().includes(q) ||
          (t.reading ?? '').toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.terms.length > 0);
  }, [q]);

  const totalTerms = glossaryGroups.reduce((n, g) => n + g.terms.length, 0);
  const matchCount = filtered.reduce((n, g) => n + g.terms.length, 0);

  return (
    <>
      <div className="glossary-filter-wrap">
        <input
          className="glossary-filter-input"
          type="search"
          placeholder="用語・よみ・定義で絞り込み..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />
        {query && (
          <div className="glossary-filter-meta">
            {matchCount > 0
              ? <span className="glossary-filter-count">{matchCount} / {totalTerms} 件</span>
              : <span className="glossary-filter-none">該当なし</span>}
            <button className="glossary-filter-clear" onClick={() => setQuery('')}>×</button>
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="glossary-no-match">「{query}」に一致する用語は見つかりませんでした。</p>
      )}

      <div className="formulas-grid glossary-grid">
        {filtered.map(group => (
          <section key={group.category} className="formula-card glossary-card">
            <h2 className="formula-card-title">
              <span className="formula-card-icon">{group.icon}</span>
              {group.category}
              {q && <span className="glossary-cat-count"> ({group.terms.length})</span>}
            </h2>
            <div className="glossary-term-list">
              {group.terms.map(t => (
                <div key={t.term} id={termToId(t.term)} className="glossary-term-item">
                  <div className="glossary-term-name">
                    {highlight(t.term, query)}
                    {t.reading && (
                      <span className="glossary-term-reading">
                        （{highlight(t.reading, query)}）
                      </span>
                    )}
                  </div>
                  <div className="glossary-term-def">{highlight(t.definition, query)}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
