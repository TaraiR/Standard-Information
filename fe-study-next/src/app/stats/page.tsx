import type { Metadata } from 'next';
import StatsContent from '@/components/StatsContent';

export const metadata: Metadata = {
  title: '学習統計',
  description: '章別のクイズスコアと学習進捗を確認できるダッシュボードです。',
};

export default function StatsPage() {
  return (
    <div className="stats-page-wrapper">
      <StatsContent />
    </div>
  );
}
