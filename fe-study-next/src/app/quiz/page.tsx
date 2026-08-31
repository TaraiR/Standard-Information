import type { Metadata } from 'next';
import MockQuiz from '@/components/MockQuiz';

export const metadata: Metadata = {
  title: '総合模擬テスト | 基本情報技術者試験 学習サイト',
  description: '全章からランダムに問題を出題する模擬テストです。本番に近い形式で実力を確認しましょう。',
};

export default function QuizPage() {
  return (
    <div className="mock-quiz-page">
      <div className="mock-quiz-container">
        <MockQuiz />
      </div>
    </div>
  );
}
