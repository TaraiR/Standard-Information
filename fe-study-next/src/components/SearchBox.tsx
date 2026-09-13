'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { curriculum } from '@/data/curriculum';
import type { Chapter, Section } from '@/data/curriculum';
import { glossaryGroups, termToId } from '@/data/glossary';
import type { GlossaryTerm } from '@/data/glossary';

interface ChapterResult {
  type: 'chapter';
  chapter: Chapter;
  section?: Section;
}

interface GlossaryResult {
  type: 'glossary';
  term: GlossaryTerm;
  category: string;
}

type SearchResult = ChapterResult | GlossaryResult;

function htmlToText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText || div.textContent || '';
}

function searchAll(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  // Search chapters & sections
  for (const chapter of curriculum) {
    const chapKey = chapter.id;
    const chapMatch = chapter.title.toLowerCase().includes(q) || chapter.description.toLowerCase().includes(q);
    let addedChap = false;
    if (chapMatch && !seen.has(chapKey)) {
      results.push({ type: 'chapter', chapter });
      seen.add(chapKey);
      addedChap = true;
    }
    for (const section of chapter.sections) {
      const secKey = `${chapter.id}:${section.id}`;
      if (seen.has(secKey)) continue;
      const titleMatch = section.title.toLowerCase().includes(q);
      const contentMatch = !titleMatch && htmlToText(section.content).toLowerCase().includes(q);
      if (titleMatch || contentMatch) {
        results.push({ type: 'chapter', chapter, section });
        seen.add(secKey);
        if (!addedChap) seen.add(chapKey);
      }
    }
  }

  // Search glossary terms (cap at 4 so chapters still dominate)
  let glossaryCount = 0;
  for (const group of glossaryGroups) {
    for (const term of group.terms) {
      if (glossaryCount >= 4) break;
      const key = 'g:' + term.term;
      if (seen.has(key)) continue;
      if (
        term.term.toLowerCase().includes(q) ||
        (term.reading && term.reading.toLowerCase().includes(q)) ||
        term.definition.toLowerCase().includes(q)
      ) {
        results.push({ type: 'glossary', term, category: group.category });
        seen.add(key);
        glossaryCount++;
      }
    }
  }

  return results.slice(0, 10);
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const results = searchAll(query);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (r: SearchResult) => {
    if (r.type === 'glossary') {
      router.push(`/glossary#${termToId(r.term.term)}`);
    } else {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (r.section) {
        const idx = r.chapter.sections.findIndex(s => s.id === r.section!.id);
        if (idx >= 0) params.set('s', String(idx));
      }
      const qs = params.toString();
      router.push(`/chapter/${r.chapter.id}${qs ? `?${qs}` : ''}`);
    }
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="search-box" ref={ref}>
      <input
        className="search-input"
        type="search"
        placeholder="キーワード検索..."
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Escape') { setOpen(false); setQuery(''); }
          if (e.key === 'Enter' && results.length > 0) navigate(results[0]);
        }}
      />
      {open && hasQuery && (
        <div className="search-dropdown">
          {results.length > 0 ? results.map((r, i) => (
            <button key={i} className="search-result" onClick={() => navigate(r)}>
              {r.type === 'glossary' ? (
                <>
                  <span className="search-result-tag search-result-tag-glossary">用語</span>
                  <div className="search-result-text">
                    <span className="search-result-chapter">{r.term.term}</span>
                    <span className="search-result-section">› {r.category}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className={`search-result-tag subject-tag subject-${r.chapter.subject.toLowerCase()}`}>
                    科目{r.chapter.subject}
                  </span>
                  <div className="search-result-text">
                    <span className="search-result-chapter">{r.chapter.title}</span>
                    {r.section && (
                      <span className="search-result-section">› {r.section.title}</span>
                    )}
                  </div>
                </>
              )}
            </button>
          )) : (
            <div className="search-no-results">「{query}」に一致する内容は見つかりませんでした</div>
          )}
        </div>
      )}
    </div>
  );
}
