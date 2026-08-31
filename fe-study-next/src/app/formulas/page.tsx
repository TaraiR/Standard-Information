import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '公式・計算まとめ',
  description: '基本情報技術者試験（FE）で出題される公式・計算式を一覧で確認できるページです。稼働率・MIPS・損益分岐点・サブネット・暗号鍵数など試験直前の確認に最適。',
};

interface Formula {
  name: string;
  formula: string;
  note?: string;
  example?: string;
}

interface FormulaGroup {
  category: string;
  icon: string;
  formulas: Formula[];
}

const groups: FormulaGroup[] = [
  {
    category: '信頼性・稼働率',
    icon: '⚙️',
    formulas: [
      {
        name: '稼働率',
        formula: '稼働率 = MTBF ÷ (MTBF + MTTR)',
        note: 'MTBF=平均故障間隔（長いほど良い）、MTTR=平均修復時間（短いほど良い）',
        example: 'MTBF=90h、MTTR=10h → 90÷(90+10)=0.9',
      },
      {
        name: '直列接続の稼働率',
        formula: 'R = R₁ × R₂ × … × Rₙ',
        note: '全部正常でないと動かないため稼働率は下がる',
        example: 'R₁=0.9、R₂=0.9 → 0.9×0.9=0.81',
      },
      {
        name: '並列接続の稼働率',
        formula: 'R = 1 − (1−R₁) × (1−R₂) × …',
        note: 'どれか1台動けばよいため稼働率は上がる',
        example: 'R₁=R₂=0.9 → 1−(0.1×0.1)=0.99',
      },
    ],
  },
  {
    category: 'CPU・処理性能',
    icon: '🖥️',
    formulas: [
      {
        name: 'クロック周期',
        formula: 'クロック周期 [s] = 1 ÷ クロック周波数 [Hz]',
        example: '2GHz → 1÷(2×10⁹)=0.5ns',
      },
      {
        name: '命令実行時間',
        formula: '実行時間 = 命令数 × CPI × クロック周期',
        note: 'CPI = Cycles Per Instruction（1命令あたりの平均クロック数）',
      },
      {
        name: 'MIPS',
        formula: 'MIPS = クロック周波数 [Hz] ÷ CPI ÷ 10⁶',
        example: '1GHz、CPI=2 → 1,000÷2=500 MIPS',
      },
      {
        name: 'パイプライン総クロック数',
        formula: 'クロック数 = m + (n−1)',
        note: 'm=パイプライン段数、n=命令数。1命令目がm段かかり、残り(n-1)命令は1段ずつ追加',
        example: '4段パイプライン×100命令 → 4+(100−1)=103クロック',
      },
    ],
  },
  {
    category: 'メモリ・キャッシュ',
    icon: '💾',
    formulas: [
      {
        name: '実効アクセス時間（2段階キャッシュ）',
        formula: '実効時間 = h × Tc + (1−h) × Tm',
        note: 'h=ヒット率、Tc=キャッシュアクセス時間、Tm=主記憶アクセス時間',
        example: 'h=0.9、Tc=10ns、Tm=100ns → 0.9×10+0.1×100=19ns',
      },
      {
        name: '単位変換',
        formula: '1KB=2¹⁰B=1,024B　1MB=2²⁰B　1GB=2³⁰B',
      },
      {
        name: '主記憶アドレス空間',
        formula: 'アドレス空間 = 2^（アドレスビット数）バイト',
        example: '32ビットアドレス → 2³²=4GB',
      },
    ],
  },
  {
    category: 'ネットワーク',
    icon: '🌐',
    formulas: [
      {
        name: 'ホスト数（サブネット）',
        formula: 'ホスト数 = 2^（ホストビット数）− 2',
        note: '−2はネットワークアドレスとブロードキャストアドレスを除くため',
        example: '/24（ホストビット8） → 2⁸−2=254台',
      },
      {
        name: 'サブネット数',
        formula: 'サブネット数 = 2^（借用ビット数）',
        example: 'クラスCから3ビット借用 → 2³=8サブネット',
      },
      {
        name: 'データ転送時間',
        formula: '転送時間 [s] = データ量 [bit] ÷ 回線速度 [bps]',
        example: '100MBを100Mbpsで → (100×8Mb)÷100Mbps=8秒',
      },
    ],
  },
  {
    category: '暗号・セキュリティ',
    icon: '🔐',
    formulas: [
      {
        name: '共通鍵の必要数',
        formula: '鍵の数 = n × (n−1) ÷ 2',
        note: 'n台のホストが互いに通信する場合',
        example: '10台 → 10×9÷2=45本',
      },
      {
        name: '公開鍵の必要数',
        formula: '鍵の数 = 2n（公開鍵n本＋秘密鍵n本）',
        example: '10台 → 20本（鍵管理が大幅に少ない）',
      },
    ],
  },
  {
    category: 'データ量・情報量',
    icon: '📊',
    formulas: [
      {
        name: '標本化定理（ナイキスト定理）',
        formula: 'サンプリング周波数 ≥ 最高周波数 × 2',
        example: '20kHzまでの音声 → 40kHz以上でサンプリング（CDは44.1kHz）',
      },
      {
        name: 'PCM音声データ量',
        formula: 'データ量 = サンプリング周波数 × 量子化ビット数 × チャネル数 × 時間',
        example: '44.1kHz×16bit×2ch×60s = 84,672,000bit ≈ 10MB',
      },
      {
        name: '情報量（エントロピー）',
        formula: '情報量 = log₂(1/確率) ビット',
        example: '1/4の確率の事象 → log₂(4)=2ビット',
      },
    ],
  },
  {
    category: 'アルゴリズム計算量',
    icon: '⏱️',
    formulas: [
      {
        name: '二分探索の最大比較回数',
        formula: '最大比較回数 = ⌈log₂(n)⌉ 回',
        example: '1024要素 → log₂(1024)=10回',
      },
      {
        name: '計算量の大小関係',
        formula: 'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)',
      },
      {
        name: '主なソートの計算量',
        formula: 'バブル/選択/挿入: O(n²)　マージ/クイック: O(n log n)',
        note: 'クイックソートの最悪は O(n²)（ピボット選択が悪い場合）',
      },
    ],
  },
  {
    category: 'プロジェクト管理',
    icon: '📅',
    formulas: [
      {
        name: 'クリティカルパス',
        formula: '最長経路の所要日数 = プロジェクトの最短完了日数',
        note: 'クリティカルパス上のタスクに遅延が出るとプロジェクト全体が遅延する',
      },
      {
        name: 'フロート（余裕時間）',
        formula: 'フロート = 最遅開始時刻 − 最早開始時刻',
        note: 'クリティカルパス上の作業はフロート=0',
      },
    ],
  },
  {
    category: '財務・会計',
    icon: '💹',
    formulas: [
      {
        name: 'ROI（投資対効果）',
        formula: 'ROI(%) = 利益 ÷ 投資額 × 100',
        example: '投資1,000万で利益200万 → ROI=20%',
      },
      {
        name: '投資回収期間',
        formula: '回収期間 = 投資額 ÷ 年間利益（削減額）',
        example: '投資1,000万、年200万削減 → 5年で回収',
      },
      {
        name: '損益分岐点売上高',
        formula: '損益分岐点 = 固定費 ÷ (1 − 変動費率)',
        note: '変動費率 = 変動費 ÷ 売上高',
        example: '固定費300万、変動費率60% → 300÷0.4=750万',
      },
      {
        name: 'TCO（総所有コスト）',
        formula: 'TCO = 初期費用 + 運用費用の合計 + 廃棄費用',
        note: '購入費用だけで比較せず、ライフサイクル全体で評価する',
      },
    ],
  },
  {
    category: '正規化・DB',
    icon: '🗄️',
    formulas: [
      {
        name: '1NF（第1正規形）',
        formula: '各セルに値が1つだけ（繰り返しグループを除去）',
      },
      {
        name: '2NF（第2正規形）',
        formula: '1NF ＋ 部分関数従属を除去（複合主キーの一部だけで決まる列を別テーブルに）',
      },
      {
        name: '3NF（第3正規形）',
        formula: '2NF ＋ 推移関数従属を除去（主キー以外の列が別の列を決定する関係を別テーブルに）',
      },
    ],
  },
];

export default function FormulasPage() {
  return (
    <main className="formulas-page">
      <div className="formulas-container">
        <div className="formulas-header">
          <h1 className="formulas-title">公式・計算まとめ</h1>
          <p className="formulas-subtitle">試験頻出の公式・計算式を分野別にまとめました。試験直前の確認にご活用ください。</p>
        </div>

        <div className="formulas-grid">
          {groups.map((group) => (
            <section key={group.category} className="formula-card">
              <h2 className="formula-card-title">
                <span className="formula-card-icon">{group.icon}</span>
                {group.category}
              </h2>
              <div className="formula-list">
                {group.formulas.map((f) => (
                  <div key={f.name} className="formula-item">
                    <div className="formula-name">{f.name}</div>
                    <div className="formula-body">{f.formula}</div>
                    {f.note && <div className="formula-note">{f.note}</div>}
                    {f.example && <div className="formula-example">例: {f.example}</div>}
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
