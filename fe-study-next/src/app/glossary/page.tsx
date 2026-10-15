import type { Metadata } from 'next';
import GlossaryContent from '@/components/GlossaryContent';

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
        <GlossaryContent />
      </div>
    </main>
  );
}
