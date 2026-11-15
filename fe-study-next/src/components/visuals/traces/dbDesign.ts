/** 正規化・トランザクション・CAP 定理の教材データとシミュレーション */

// ---------- 正規化 ----------
export interface Table { name: string; key: string[]; columns: string[]; rows: (string | number)[][]; note?: string }
export interface NormStage { label: string; tables: Table[]; message: string; highlight?: string[] }

export const UNNORMALIZED: Table = {
  name: '注文（非正規形）', key: ['注文ID'], columns: ['注文ID', '顧客名', '商品', '担当者', '担当部署'],
  rows: [[1001, '田中', '商品A, 商品B', '山田', '営業部'], [1002, '鈴木', '商品B', '山田', '営業部'], [1003, '田中', '商品C', '佐々木', '開発部']],
};
export const NF1: Table = {
  name: '注文（1NF）', key: ['注文ID', '商品ID'], columns: ['注文ID', '商品ID', '顧客名', '担当者', '担当部署'],
  rows: [[1001, 'A', '田中', '山田', '営業部'], [1001, 'B', '田中', '山田', '営業部'], [1002, 'B', '鈴木', '山田', '営業部'], [1003, 'C', '田中', '佐々木', '開発部']],
};
export const NF2: Table[] = [
  { name: '注文明細', key: ['注文ID', '商品ID'], columns: ['注文ID', '商品ID'], rows: [[1001, 'A'], [1001, 'B'], [1002, 'B'], [1003, 'C']] },
  { name: '注文', key: ['注文ID'], columns: ['注文ID', '顧客名', '担当者', '担当部署'], rows: [[1001, '田中', '山田', '営業部'], [1002, '鈴木', '山田', '営業部'], [1003, '田中', '佐々木', '開発部']] },
];
export const NF3: Table[] = [
  NF2[0],
  { name: '注文', key: ['注文ID'], columns: ['注文ID', '顧客名', '担当者'], rows: [[1001, '田中', '山田'], [1002, '鈴木', '山田'], [1003, '田中', '佐々木']] },
  { name: '担当者', key: ['担当者'], columns: ['担当者', '担当部署'], rows: [['山田', '営業部'], ['佐々木', '開発部']] },
];

export const NORM_STAGES: NormStage[] = [
  { label: '非正規形', tables: [UNNORMALIZED], highlight: ['商品'], message: '1つのセルに「商品A, 商品B」と複数の値が入っています（繰り返しグループ）。このままでは商品ごとに検索・集計できません。' },
  { label: '第1正規形', tables: [NF1], highlight: ['顧客名', '担当者', '担当部署'], message: '1セルに1つの値になるよう、商品ごとに行を分けました（1NF）。主キーは（注文ID, 商品ID）です。ただし顧客名・担当者・担当部署は注文IDだけで決まるので、同じ値が何行も繰り返されています（部分関数従属）。' },
  { label: '第2正規形', tables: NF2, highlight: ['担当部署'], message: '主キーの一部（注文ID）だけで決まる列を「注文」表に分けました（2NF）。しかし「担当者 → 担当部署」という、キーでない列どうしの依存（推移関数従属）が残っています。' },
  { label: '第3正規形', tables: NF3, message: '担当者で決まる担当部署を「担当者」表に分けました（3NF）。どの列も主キーだけに依存し、同じ事実は1か所にしか書かれていません。' },
];

/** 3NF の表を結合し直すと 1NF の表が復元できる（情報が失われていない）ことを確かめる */
export function rejoin3nf(): (string | number)[][] {
  const [detail, order, staff] = NF3;
  return detail.rows.map(([oid, pid]) => {
    const o = order.rows.find(r => r[0] === oid)!;
    const s = staff.rows.find(r => r[0] === o[2])!;
    return [oid, pid, o[1], o[2], s[1]];
  });
}

/** 担当者「山田」の部署を変えるとき、書き換えが必要な行数 */
export function rowsToUpdate(stage: number): number {
  if (stage <= 1) return (stage === 0 ? UNNORMALIZED : NF1).rows.filter(r => r[3] === '山田').length;
  if (stage === 2) return NF2[1].rows.filter(r => r[2] === '山田').length;
  return NF3[2].rows.filter(r => r[0] === '山田').length;
}

// ---------- トランザクション ----------
export interface TxnStep { t1: string; t2: string; db: number; t1Local: number | null; t2Local: number | null; lock: 'T1' | 'T2' | null; tone?: 'focus' | 'done'; message: string }

/** 在庫 10 個に対して、T1 と T2 がそれぞれ 3 個ずつ出庫する */
export function lostUpdate(withLock: boolean): TxnStep[] {
  if (!withLock) {
    return [
      { t1: '', t2: '', db: 10, t1Local: null, t2Local: null, lock: null, message: '在庫は 10 個。T1 と T2 が同時に、それぞれ 3 個ずつ出庫します。正しい結果は 10 − 3 − 3 = 4 個です。' },
      { t1: '在庫を読む → 10', t2: '', db: 10, t1Local: 10, t2Local: null, lock: null, message: 'T1 が在庫 10 を読みます。' },
      { t1: '', t2: '在庫を読む → 10', db: 10, t1Local: 10, t2Local: 10, lock: null, message: 'T1 が書き込む前に、T2 も在庫 10 を読みます。' },
      { t1: '10 − 3 = 7 を書く', t2: '', db: 7, t1Local: 7, t2Local: 10, lock: null, message: 'T1 が 10 − 3 = 7 を書き込みます。' },
      { t1: '', t2: '10 − 3 = 7 を書く', db: 7, t1Local: 7, t2Local: 7, lock: null, tone: 'focus', message: 'T2 も、自分が読んだ 10 から計算した 7 を書き込みます。T1 の更新が上書きされて消えました（ロストアップデート）。在庫は 4 のはずが 7 になっています。' },
    ];
  }
  return [
    { t1: '', t2: '', db: 10, t1Local: null, t2Local: null, lock: null, message: '同じ処理を、排他ロック（X ロック）を使って行います。' },
    { t1: 'X ロックを取得', t2: '', db: 10, t1Local: null, t2Local: null, lock: 'T1', message: 'T1 が在庫に排他ロックをかけます。ロックが外れるまで、他のトランザクションは読み書きできません。' },
    { t1: '在庫を読む → 10', t2: 'ロック待ち…', db: 10, t1Local: 10, t2Local: null, lock: 'T1', message: 'T1 が在庫 10 を読みます。T2 も読もうとしますが、ロックされているので待たされます。' },
    { t1: '7 を書いて COMMIT', t2: 'ロック待ち…', db: 7, t1Local: 7, t2Local: null, lock: null, message: 'T1 が 7 を書き込んでコミットし、ロックを外します。' },
    { t1: '', t2: 'X ロック → 在庫を読む → 7', db: 7, t1Local: null, t2Local: 7, lock: 'T2', message: 'T2 がロックを取得して、更新後の在庫 7 を読みます。' },
    { t1: '', t2: '7 − 3 = 4 を書いて COMMIT', db: 4, t1Local: null, t2Local: 4, lock: null, tone: 'done', message: 'T2 が 7 − 3 = 4 を書き込みます。正しく 4 個になりました。ロックで同時実行を順番にしたことで、更新が失われませんでした。' },
  ];
}

export interface TransferStep { action: string; a: number; b: number; committed: boolean | null; tone?: 'focus' | 'done'; message: string }

/** A から B へ 3 万円を振り込む。failAfterDebit なら引き落としの後に障害が起きる */
export function transfer(failAfterDebit: boolean): TransferStep[] {
  const steps: TransferStep[] = [
    { action: 'BEGIN', a: 10, b: 5, committed: null, message: 'A の口座（10万円）から B の口座（5万円）へ 3万円を振り込みます。「引き落とし」と「入金」を1つのトランザクションにまとめます。' },
    { action: 'A から 3万円を引き落とす', a: 7, b: 5, committed: null, message: 'A の残高を 7万円に更新します（まだコミットしていない）。' },
  ];
  if (failAfterDebit) {
    steps.push(
      { action: '障害発生！', a: 7, b: 5, committed: null, tone: 'focus', message: 'B に入金する前に障害が起きました。このままだと 3万円がどこにも存在しない、矛盾した状態です。' },
      { action: 'ROLLBACK', a: 10, b: 5, committed: false, tone: 'done', message: 'トランザクションを ROLLBACK（取り消し）し、開始前の状態に戻します。「全部成功」か「全部なかったこと」のどちらかにする性質が原子性（A）です。' },
    );
  } else {
    steps.push(
      { action: 'B に 3万円を入金する', a: 7, b: 8, committed: null, message: 'B の残高を 8万円に更新します。' },
      { action: 'COMMIT', a: 7, b: 8, committed: true, tone: 'done', message: 'COMMIT で確定します。確定した結果は、その後に障害が起きても失われません（耐久性 D）。合計 15万円は振込の前後で変わりません（一貫性 C）。' },
    );
  }
  return steps;
}

// ---------- CAP 定理 ----------
export type CapChoice = 'cp' | 'ap';
export interface CapStep { n1: number; n2: number; partition: boolean; write: string; read: string; tone?: 'focus' | 'done'; message: string }

export function capScenario(choice: CapChoice): CapStep[] {
  const steps: CapStep[] = [
    { n1: 100, n2: 100, partition: false, write: '', read: '', message: 'データを2台のサーバ（ノード1・ノード2）に複製して持っています。どちらも在庫 100 です。' },
    { n1: 100, n2: 100, partition: true, write: '', read: '', tone: 'focus', message: 'ネットワークが分断され、2台の間で通信できなくなりました（分断耐性 P が必要な状況）。' },
  ];
  if (choice === 'cp') {
    steps.push(
      { n1: 90, n2: 100, partition: true, write: 'ノード1 に 90 を書き込み', read: '', message: 'ノード1 への書き込みは受け付けます。' },
      { n1: 90, n2: 100, partition: true, write: '', read: 'ノード2 で読み取り → エラー', tone: 'focus', message: '一貫性（C）を優先する方式では、最新かどうか確かめられないノード2 は応答を拒否します。古い値は返しませんが、使えない時間ができます（可用性 A を犠牲にする）。' },
      { n1: 90, n2: 90, partition: false, write: '', read: '', tone: 'done', message: '分断が直ると、ノード2 も最新の 90 に同期され、再び応答できるようになります。' },
    );
  } else {
    steps.push(
      { n1: 90, n2: 100, partition: true, write: 'ノード1 に 90 を書き込み', read: '', message: 'ノード1 への書き込みは受け付けます。' },
      { n1: 90, n2: 100, partition: true, write: '', read: 'ノード2 で読み取り → 100', tone: 'focus', message: '可用性（A）を優先する方式では、ノード2 も応答を続けますが、古い値 100 を返します（一貫性 C を犠牲にする）。' },
      { n1: 90, n2: 90, partition: false, write: '', read: '', tone: 'done', message: '分断が直ると同期され、最終的には一致します（結果整合性。NoSQL の BASE の考え方）。' },
    );
  }
  return steps;
}
