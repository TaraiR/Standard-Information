import Link from 'next/link';

export default function MockQuizBanner() {
  return (
    <section className="mock-quiz-banner">
      <div className="mock-quiz-banner-inner">
        <div className="mock-quiz-banner-text">
          <h2 className="mock-quiz-banner-title">📝 総合模擬テスト</h2>
          <p className="mock-quiz-banner-desc">
            全章からランダムに出題。10・20・30問から選んで本番形式で実力確認。
          </p>
        </div>
        <Link href="/quiz" className="mock-quiz-banner-btn">挑戦する →</Link>
      </div>
    </section>
  );
}
