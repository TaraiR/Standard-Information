import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '免責事項・ご利用にあたって',
  description: '本サイトの免責事項、コンテンツの正確性に関する注意事項、および著作権についての説明です。',
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <div className="disclaimer-page">
      <div className="disclaimer-inner">
        <h1 className="disclaimer-h1">免責事項・ご利用にあたって</h1>
        <p className="disclaimer-updated">最終更新: 2025年8月</p>

        <section className="disclaimer-section">
          <h2>1. 本サイトについて</h2>
          <p>
            本サイト（以下「当サイト」）は、基本情報技術者試験（FE）の学習を支援することを目的とした、個人が運営する<strong>非公式の学習教材サイト</strong>です。
            独立行政法人情報処理推進機構（IPA）、基本情報技術者試験の実施機関、およびその関連団体とは一切関係がありません。
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>2. コンテンツの正確性について</h2>
          <p>
            当サイトに掲載している解説・問題・解答・図解・その他すべてのコンテンツ（以下「本コンテンツ」）については、正確な情報を提供するよう努めていますが、<strong>内容の完全性・正確性・最新性を保証するものではありません</strong>。
          </p>
          <ul>
            <li>解説内容に誤りや不正確な記述が含まれている可能性があります。</li>
            <li>試験制度・出題範囲・傾向は変更されることがあり、当サイトの内容が最新の試験に対応していない場合があります。</li>
            <li>問題の解答・解説は当サイト独自の解釈に基づいており、公式の解答・解説とは異なる場合があります。</li>
          </ul>
          <p>
            学習内容の最終確認は、必ず<a href="https://www.ipa.go.jp/shiken/kubun/fe.html" target="_blank" rel="noopener noreferrer">IPA 公式サイト</a>および公式教材でお願いします。
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>3. 免責事項</h2>
          <p>
            当サイトの利用により生じたいかなる損害（試験の不合格、学習上の誤解、その他直接・間接を問わない損害）についても、当サイト運営者は一切の責任を負いません。
            本コンテンツは「現状のまま（as-is）」で提供されており、特定の目的への適合性・有用性を保証するものではありません。
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>4. 試験制度の変更について</h2>
          <p>
            基本情報技術者試験は IPA により定期的に改訂が行われます。当サイトのコンテンツが最新の試験範囲・形式を反映していない場合があります。
            受験前には必ず IPA 公式サイトで最新のシラバス・試験範囲をご確認ください。
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>5. 外部リンクについて</h2>
          <p>
            当サイトには IPA 公式サイト・外部学習サービス等へのリンクが含まれています。リンク先のコンテンツ・サービスについて当サイトは責任を負いません。
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>6. 著作権</h2>
          <p>
            当サイトのコンテンツ（文章・図・問題等）の著作権は当サイト運営者に帰属します。ただし、試験の問題形式や技術的な事実は著作権の対象外です。
            個人の学習目的での利用は自由ですが、当サイトのコンテンツを無断で転載・商業利用することはご遠慮ください。
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>7. お気づきの点について</h2>
          <p>
            解説の誤りや不正確な情報にお気づきの際は、改善に役立てたいと考えています。内容の改善にご協力いただける場合は、ページ下部の情報をご参照ください。
            皆様のフィードバックにより、より正確で充実した学習教材を目指しています。
          </p>
        </section>

        <div className="disclaimer-footer-nav">
          <Link href="/" className="btn-back-home">← トップへ戻る</Link>
        </div>
      </div>
    </div>
  );
}
