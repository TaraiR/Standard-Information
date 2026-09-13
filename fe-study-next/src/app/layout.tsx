import type { Metadata } from 'next';
import '../styles/global.css';
import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/react';

const SITE_URL = 'https://standard-information.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '基本情報技術者試験 完全対策 | 図解でわかる無料学習サイト',
    template: '%s | 基本情報技術者試験 学習サイト',
  },
  description: '基本情報技術者試験（FE）を図解でわかりやすく解説。科目A・科目B両対応。2進数・ネットワーク・セキュリティ・アルゴリズムなど全13章・100問以上の練習問題付き。完全無料。',
  keywords: ['基本情報技術者試験', '基本情報', 'FE試験', '科目A', '科目B', 'IT資格', '勉強', '無料', '図解', 'アルゴリズム'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '基本情報',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: '基本情報技術者試験 学習サイト',
  },
  twitter: { card: 'summary' },
  verification: { google: '4qDlChGpmLa1t3TavfRDA-2LIvsEczGg-enqS8oCCJA' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('fe-theme');if(t)document.documentElement.dataset.theme=t;else if(window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.dataset.theme='dark';}catch(e){}` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var b=document.createElement('button');b.className='scroll-top-btn';b.setAttribute('aria-label','ページ上部へ戻る');b.textContent='↑';b.style.display='none';b.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});document.addEventListener('DOMContentLoaded',function(){document.body.appendChild(b);window.addEventListener('scroll',function(){b.style.display=window.scrollY>320?'flex':'none';},{passive:true});});})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`}} />
        <Navbar />
        <div className="page-wrapper">
          {children}
        </div>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <p className="site-footer-name">基本情報技術者試験 学習サイト — 無料で学べる教材</p>
            <p className="site-footer-notice">
              本サイトは非公式の学習支援サイトです。IPA・試験実施機関とは無関係です。内容の正確性は保証しません。
            </p>
            <nav className="site-footer-links">
              <a href="/disclaimer">免責事項</a>
              <span>·</span>
              <a href="https://www.ipa.go.jp/shiken/kubun/fe.html" target="_blank" rel="noopener noreferrer">IPA 公式サイト</a>
              <span>·</span>
              <a href="https://www.fe-siken.com/fekakomon.php" target="_blank" rel="noopener noreferrer">過去問道場</a>
            </nav>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
