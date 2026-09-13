export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface ChapterMeta {
  difficulty: Difficulty;
  difficultyLabel: string;
}

// 難易度: 1=易しい 2=やや易 3=普通 4=やや難 5=難しい
export const chapterMeta: Record<string, ChapterMeta> = {
  a1:  { difficulty: 3, difficultyLabel: '普通' },    // 基礎理論 (2進数・補数など計算あり)
  a2:  { difficulty: 2, difficultyLabel: 'やや易' },  // コンピュータシステム
  a3:  { difficulty: 3, difficultyLabel: '普通' },    // ネットワーク (プロトコル・計算問題あり)
  a4:  { difficulty: 3, difficultyLabel: '普通' },    // セキュリティ
  a5:  { difficulty: 2, difficultyLabel: 'やや易' },  // ソフトウェア・OS
  a6:  { difficulty: 3, difficultyLabel: '普通' },    // データベース (SQL・正規化)
  a7:  { difficulty: 2, difficultyLabel: 'やや易' },  // システム開発
  a8:  { difficulty: 2, difficultyLabel: 'やや易' },  // マネジメント (PERT計算あり)
  a9:  { difficulty: 2, difficultyLabel: 'やや易' },  // ストラテジ (暗記中心)
  a10: { difficulty: 3, difficultyLabel: '普通' },    // AI・機械学習
  b1:  { difficulty: 2, difficultyLabel: 'やや易' },  // アルゴリズム基礎
  b2:  { difficulty: 3, difficultyLabel: '普通' },    // データ構造
  b3:  { difficulty: 4, difficultyLabel: 'やや難' },  // 探索・整列
  b4:  { difficulty: 3, difficultyLabel: '普通' },    // オブジェクト指向
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  1: '#48bb78',
  2: '#68d391',
  3: '#ecc94b',
  4: '#ed8936',
  5: '#fc5c65',
};
