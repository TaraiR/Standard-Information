export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface ChapterMeta {
  difficulty: Difficulty;
  difficultyLabel: string;
}

export const chapterMeta: Record<string, ChapterMeta> = {
  a1:  { difficulty: 3, difficultyLabel: '普通' },
  a2:  { difficulty: 2, difficultyLabel: 'やや易' },
  a3:  { difficulty: 2, difficultyLabel: 'やや易' },
  a4:  { difficulty: 3, difficultyLabel: '普通' },
  a5:  { difficulty: 3, difficultyLabel: '普通' },
  a6:  { difficulty: 2, difficultyLabel: 'やや易' },
  a7:  { difficulty: 1, difficultyLabel: '易しい' },
  a8:  { difficulty: 1, difficultyLabel: '易しい' },
  a9:  { difficulty: 1, difficultyLabel: '易しい' },
  a10: { difficulty: 4, difficultyLabel: 'やや難' },
  b1:  { difficulty: 2, difficultyLabel: 'やや易' },
  b2:  { difficulty: 3, difficultyLabel: '普通' },
  b3:  { difficulty: 4, difficultyLabel: 'やや難' },
  b4:  { difficulty: 3, difficultyLabel: '普通' },
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  1: '#48bb78',
  2: '#68d391',
  3: '#ecc94b',
  4: '#ed8936',
  5: '#fc5c65',
};
