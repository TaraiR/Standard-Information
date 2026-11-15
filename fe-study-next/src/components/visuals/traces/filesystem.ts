/** パーミッション・パスの解決・RAID の計算 */

// ---------- パーミッション ----------
export const WHO = ['所有者', 'グループ', 'その他'] as const;

/** "rwxr-xr--" → [7,5,4]。形式が正しくなければ null */
export function parsePermission(text: string): number[] | null {
  const t = text.trim();
  if (!/^([r-][w-][x-]){3}$/.test(t)) return null;
  return [0, 1, 2].map(i => (t[i * 3] === 'r' ? 4 : 0) + (t[i * 3 + 1] === 'w' ? 2 : 0) + (t[i * 3 + 2] === 'x' ? 1 : 0));
}

export function permissionString(digits: number[]): string {
  return digits.map(d => `${d & 4 ? 'r' : '-'}${d & 2 ? 'w' : '-'}${d & 1 ? 'x' : '-'}`).join('');
}

// ---------- パスの解決 ----------
export interface PathStep { stack: string[]; part: string | null; message: string }

/** 現在のディレクトリ cwd（絶対パス）から、path を解決する手順。path が / で始まれば絶対パス */
export function resolvePath(cwd: string, path: string): { steps: PathStep[]; result: string } {
  const start = path.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  const steps: PathStep[] = [{
    stack: [...start], part: null,
    message: path.startsWith('/')
      ? `「${path}」は / で始まるので絶対パスです。ルート（/）から順にたどります。`
      : `「${path}」は相対パスなので、現在のディレクトリ ${cwd} から順にたどります。`,
  }];
  const stack = [...start];
  for (const part of path.split('/').filter(Boolean)) {
    if (part === '.') steps.push({ stack: [...stack], part, message: '「.」は今いるディレクトリそのものなので、移動しません。' });
    else if (part === '..') {
      const left = stack.pop();
      steps.push({ stack: [...stack], part, message: left ? `「..」は1つ上のディレクトリです。${left} から出ます。` : '「..」ですが、すでにルートなのでこれ以上は上がれません。' });
    } else {
      stack.push(part);
      steps.push({ stack: [...stack], part, message: `「${part}」に入ります。` });
    }
  }
  const result = '/' + stack.join('/');
  steps.push({ stack: [...stack], part: null, message: `たどり着いた場所を絶対パスで書くと ${result} です。` });
  return { steps, result };
}

// ---------- RAID ----------
export type RaidLevel = 0 | 1 | 5;

export interface RaidLayout {
  level: RaidLevel;
  disks: number;
  /** cells[disk][row] = 'A1' のようなデータブロック名、または 'P1' のようなパリティ */
  cells: string[][];
  usable: number; // 実データに使える容量（ディスク何台分）
}

/** データブロック数 blocks を、各レベルの方式でディスクに並べる */
export function layout(level: RaidLevel, disks: number, blocks: number): RaidLayout {
  const cells: string[][] = Array.from({ length: disks }, () => []);
  if (level === 0) {
    for (let b = 0; b < blocks; b++) cells[b % disks].push(`D${b + 1}`);
    return { level, disks, cells, usable: disks };
  }
  if (level === 1) {
    for (let b = 0; b < blocks; b++) for (let d = 0; d < disks; d++) cells[d].push(`D${b + 1}`);
    return { level, disks, cells, usable: 1 };
  }
  // RAID 5: 1行に (disks-1) 個のデータと1個のパリティ。パリティの位置を行ごとにずらす
  const perRow = disks - 1;
  const rows = Math.ceil(blocks / perRow);
  let b = 0;
  for (let r = 0; r < rows; r++) {
    const parityDisk = disks - 1 - (r % disks);
    for (let d = 0; d < disks; d++) {
      if (d === parityDisk) cells[d].push(`P${r + 1}`);
      else cells[d].push(b < blocks ? `D${++b}` : '');
    }
  }
  return { level, disks, cells, usable: disks - 1 };
}

/** ディスク failed が壊れたとき、失われたデータを復元できるか */
export function survives(l: RaidLayout, failed: number[]): boolean {
  if (failed.length === 0) return true;
  if (l.level === 0) return false;
  if (l.level === 1) return failed.length < l.disks;
  return failed.length <= 1;
}

/** RAID 5 のパリティ: 同じ行のデータの XOR（ここでは各ブロックに 4 ビットの値を割り当てて計算する） */
export const blockValue = (name: string) => (Number(name.slice(1)) * 7 + 3) % 16;
export function parityOf(values: number[]): number { return values.reduce((a, v) => a ^ v, 0); }
