import type { Metadata } from 'next';
import Link from 'next/link';
import { curriculum } from '@/data/curriculum';
import ProgressBanner from '@/components/ProgressBanner';
import ChapterGrid from '@/components/ChapterGrid';


const SITE_URL = 'https://standard-information.vercel.app';

export const metadata: Metadata = {
  title: '基本情報技術者試験 完全対策 | 図解でわかる無料学習サイト',
  description: '基本情報技術者試験（FE）を図解・擬似コードでわかりやすく解説。科目A・科目B両対応。全13章・100問以上の練習問題付き。完全無料。',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: '基本情報技術者試験 完全対策 | 図解でわかる無料学習サイト',
    description: '科目A・科目B対応。図解・練習問題付きで基本情報技術者試験を完全攻略。完全無料。',
    url: SITE_URL,
  },
};

export default function Home() {
  const subjectA = curriculum.filter(c => c.subject === 'A');
  const subjectB = curriculum.filter(c => c.subject === 'B');

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '基本情報技術者試験 学習サイト',
    url: SITE_URL,
    description: '基本情報技術者試験を図解でわかりやすく解説する無料学習サイト',
    inLanguage: 'ja',
  };

  const courseListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '基本情報技術者試験 学習章一覧',
    url: SITE_URL,
    numberOfItems: curriculum.length,
    itemListElement: curriculum.map((ch, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: ch.title,
      url: `${SITE_URL}/chapter/${ch.id}`,
    })),
  };

  return (
    <div className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseListLd) }}
      />

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">基本情報技術者試験</h1>
          <p className="hero-subtitle">図解でわかりやすく学べる無料学習サイト</p>
          <div className="hero-badges">
            <span className="badge badge-a">科目A 対応</span>
            <span className="badge badge-b">科目B 対応</span>
            <span className="badge badge-q">章末問題付き</span>
          </div>
          <Link href="/chapter/a1" className="btn-start">学習を始める →</Link>
        </div>
        <div className="hero-illustration">
          <svg viewBox="0 0 200 200" width="200" height="200">
            <circle cx="100" cy="100" r="90" fill="#2da3d9" opacity="0.1"/>
            <rect x="50" y="60" width="100" height="80" rx="8" fill="white" stroke="#2da3d9" strokeWidth="2"/>
            <line x1="65" y1="85" x2="135" y2="85" stroke="#2da3d9" strokeWidth="2"/>
            <line x1="65" y1="100" x2="120" y2="100" stroke="#e2e8f0" strokeWidth="2"/>
            <line x1="65" y1="115" x2="130" y2="115" stroke="#e2e8f0" strokeWidth="2"/>
            <circle cx="140" cy="145" r="20" fill="#48bb78"/>
            <text x="140" y="151" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">✓</text>
          </svg>
        </div>
      </section>

      <ProgressBanner />

      <section className="subject-section">
        <h2 className="section-heading">
          <span className="subject-tag subject-a">科目A</span>
          テクノロジ・マネジメント・ストラテジ
        </h2>
        <p className="section-desc">コンピュータ基礎・ネットワーク・セキュリティ・経営など幅広い知識を問われます。</p>
        <ChapterGrid chapters={subjectA} subject="A" />
      </section>

      <section className="subject-section">
        <h2 className="section-heading">
          <span className="subject-tag subject-b">科目B</span>
          アルゴリズムとプログラミング
        </h2>
        <p className="section-desc">擬似コードを読み解き、アルゴリズムやデータ構造の問題を解く力を養います。</p>
        <ChapterGrid chapters={subjectB} subject="B" />
      </section>

      <section className="mock-quiz-banner">
        <div className="mock-quiz-banner-inner">
          <div className="mock-quiz-banner-text">
            <h2 className="mock-quiz-banner-title">📝 総合模擬テスト</h2>
            <p className="mock-quiz-banner-desc">全章からランダムに出題。10・20・30問から選んで本番形式で実力確認。</p>
          </div>
          <Link href="/quiz" className="mock-quiz-banner-btn">挑戦する →</Link>
        </div>
      </section>

      <section className="features-section">
        <h2>このサイトの特徴</h2>
        <div className="features-grid">
          {[
            { icon: '🎨', title: '図解つき解説', desc: '難しい概念もSVG図解でひと目でわかる' },
            { icon: '✏️', title: '章末問題', desc: '各章の終わりに確認問題で定着チェック' },
            { icon: '💻', title: '擬似コード', desc: '科目Bの擬似コードをステップで解説' },
            { icon: '📱', title: 'スマホ対応', desc: 'どこでも学べるレスポンシブデザイン' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="external-section">
        <h2>📚 あわせて活用したい外部サービス</h2>
        <p className="external-desc">このサイトで基礎を固めたら、実際の過去問で実力を試しましょう。</p>
        <div className="external-grid">
          <a href="https://www.fe-siken.com/fekakomon.php" target="_blank" rel="noopener noreferrer" className="external-card external-card-primary">
            <div className="external-card-header">
              <span className="external-icon">📝</span>
              <span className="external-badge">おすすめ</span>
            </div>
            <h3>基本情報技術者過去問道場</h3>
            <p>過去問を年度・分野別に絞り込んで解ける定番サービス。解説も充実。科目A・科目B両対応。</p>
            <span className="external-link-label">fe-siken.com →</span>
          </a>
          <a href="https://www.fe-siken.com/" target="_blank" rel="noopener noreferrer" className="external-card">
            <div className="external-card-header"><span className="external-icon">📖</span></div>
            <h3>基本情報技術者試験ドットコム</h3>
            <p>用語集・午前問題の解説が充実。辞書代わりに使うと効果的。</p>
            <span className="external-link-label">fe-siken.com →</span>
          </a>
          <a href="https://www.ipa.go.jp/shiken/kubun/fe.html" target="_blank" rel="noopener noreferrer" className="external-card">
            <div className="external-card-header"><span className="external-icon">🏛️</span></div>
            <h3>IPA 公式サイト（試験情報）</h3>
            <p>試験日程・申込み・サンプル問題など公式情報はここで確認。</p>
            <span className="external-link-label">ipa.go.jp →</span>
          </a>
        </div>
      </section>
    </div>
  );
}
