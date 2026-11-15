/**
 * フォン・ノイマン型コンピュータの簡易シミュレータ。
 * 小さなプログラムを主記憶に置き、フェッチ → デコード → 実行 を1命令ずつ実際に実行して記録する。
 */

export type Op = 'IN' | 'LOAD' | 'ADD' | 'SUB' | 'STORE' | 'OUT' | 'HALT';
export interface Instr { op: Op; addr?: number }
export type Word = Instr | number;

export type Unit = 'input' | 'output' | 'control' | 'alu' | 'memory';
/** データの流れ（実線）: in-mem 入力→記憶, mem-out 記憶→出力, mem-ctrl 命令の読み出し, mem-alu データ読み出し, alu-mem 書き込み */
export type Flow = 'in-mem' | 'mem-out' | 'mem-ctrl' | 'mem-alu' | 'alu-mem';
export type Register = 'PC' | 'IR' | 'ACC' | 'MAR' | 'MDR';

export interface Regs { PC: number; IR: string; ACC: number; MAR: number | null; MDR: string | null }

export interface CpuStep {
  phase: 'start' | 'fetch' | 'decode' | 'execute' | 'halt';
  regs: Regs;
  mem: Word[];
  output: number[];
  active: Unit[];
  flows: Flow[];
  /** 制御装置から制御信号を送る先（点線） */
  control: Unit[];
  changed: Register[];
  memHighlight: number | null;
  message: string;
}

export const DESCRIBE: Record<Op, (a?: number) => string> = {
  IN: a => `入力装置から値を読み込み、主記憶の ${a} 番地に入れる`,
  LOAD: a => `主記憶の ${a} 番地の値をアキュムレータ（ACC）に読み込む`,
  ADD: a => `ACC に主記憶の ${a} 番地の値を足す`,
  SUB: a => `ACC から主記憶の ${a} 番地の値を引く`,
  STORE: a => `ACC の値を主記憶の ${a} 番地に書き込む`,
  OUT: a => `主記憶の ${a} 番地の値を出力装置に送る`,
  HALT: () => 'プログラムを終了する',
};

export const instrText = (w: Word) => (typeof w === 'number' ? String(w) : `${w.op}${w.addr !== undefined ? ` ${w.addr}` : ''}`);

export interface Program { id: string; label: string; words: Word[]; input: number[] }

export function makeProgram(id: 'io' | 'add' | 'sub', a: number, b: number): Program {
  const mem: Word[] = Array(12).fill(0);
  let code: Instr[];
  let input: number[] = [];
  if (id === 'io') {
    code = [{ op: 'IN', addr: 8 }, { op: 'LOAD', addr: 8 }, { op: 'ADD', addr: 9 }, { op: 'STORE', addr: 10 }, { op: 'OUT', addr: 10 }, { op: 'HALT' }];
    mem[9] = b;
    input = [a];
  } else if (id === 'add') {
    code = [{ op: 'LOAD', addr: 8 }, { op: 'ADD', addr: 9 }, { op: 'STORE', addr: 10 }, { op: 'HALT' }];
    mem[8] = a; mem[9] = b;
  } else {
    code = [{ op: 'LOAD', addr: 8 }, { op: 'SUB', addr: 9 }, { op: 'STORE', addr: 10 }, { op: 'OUT', addr: 10 }, { op: 'HALT' }];
    mem[8] = a; mem[9] = b;
  }
  code.forEach((c, i) => { mem[i] = c; });
  return { id, label: id, words: mem, input };
}

export function runCpu(program: Program, maxInstr = 20): CpuStep[] {
  const mem = [...program.words];
  const input = [...program.input];
  const output: number[] = [];
  const regs: Regs = { PC: 0, IR: '—', ACC: 0, MAR: null, MDR: null };
  const steps: CpuStep[] = [];
  const snap = (s: Omit<CpuStep, 'regs' | 'mem' | 'output'>): CpuStep =>
    ({ ...s, regs: { ...regs }, mem: [...mem], output: [...output] });

  steps.push(snap({
    phase: 'start', active: [], flows: [], control: [], changed: [], memHighlight: null,
    message: 'プログラム（命令）とデータが、同じ主記憶に入っています（プログラム内蔵方式）。' +
      'プログラムカウンタ（PC）は 0 番地を指しています。',
  }));

  for (let count = 0; count < maxInstr; count++) {
    // ---- フェッチ
    const addr = regs.PC;
    const word = mem[addr];
    regs.MAR = addr;
    regs.MDR = instrText(word);
    regs.IR = instrText(word);
    regs.PC = addr + 1;
    steps.push(snap({
      phase: 'fetch', active: ['control', 'memory'], flows: ['mem-ctrl'], control: ['memory'],
      changed: ['MAR', 'MDR', 'IR', 'PC'], memHighlight: addr,
      message: `【フェッチ】PC が指す ${addr} 番地を MAR に入れ、主記憶から命令「${instrText(word)}」を読み出して MDR → 命令レジスタ（IR）に入れます。PC は次の命令の ${regs.PC} 番地に進みます。`,
    }));
    if (typeof word === 'number') {
      steps.push(snap({
        phase: 'halt', active: ['control'], flows: [], control: [], changed: [], memHighlight: addr,
        message: `${addr} 番地には命令ではなくデータが入っていました。プログラムを停止します。`,
      }));
      return steps;
    }
    // ---- デコード
    steps.push(snap({
      phase: 'decode', active: ['control'], flows: [], control: [], changed: [], memHighlight: null,
      message: `【デコード】制御装置が IR の命令「${instrText(word)}」を解読します。意味は「${DESCRIBE[word.op](word.addr)}」です。`,
    }));
    // ---- 実行
    const a = word.addr ?? 0;
    const value = (i: number) => (typeof mem[i] === 'number' ? (mem[i] as number) : 0);
    switch (word.op) {
      case 'IN': {
        const v = input.shift() ?? 0;
        mem[a] = v;
        steps.push(snap({
          phase: 'execute', active: ['control', 'input', 'memory'], flows: ['in-mem'], control: ['input', 'memory'],
          changed: [], memHighlight: a,
          message: `【実行】制御装置の指示で、入力装置から値 ${v} を読み込み、主記憶の ${a} 番地に記憶します。`,
        }));
        break;
      }
      case 'LOAD': {
        regs.MAR = a; regs.MDR = String(value(a)); regs.ACC = value(a);
        steps.push(snap({
          phase: 'execute', active: ['control', 'memory', 'alu'], flows: ['mem-alu'], control: ['memory', 'alu'],
          changed: ['MAR', 'MDR', 'ACC'], memHighlight: a,
          message: `【実行】MAR に ${a} を入れて主記憶から ${value(a)} を読み出し（MDR）、演算装置のアキュムレータ（ACC）に入れます。ACC = ${regs.ACC}`,
        }));
        break;
      }
      case 'ADD':
      case 'SUB': {
        const before = regs.ACC;
        regs.MAR = a; regs.MDR = String(value(a));
        regs.ACC = word.op === 'ADD' ? before + value(a) : before - value(a);
        steps.push(snap({
          phase: 'execute', active: ['control', 'memory', 'alu'], flows: ['mem-alu'], control: ['memory', 'alu'],
          changed: ['MAR', 'MDR', 'ACC'], memHighlight: a,
          message: `【実行】主記憶の ${a} 番地から ${value(a)} を読み出し、演算装置（ALU）で ${before} ${word.op === 'ADD' ? '+' : '−'} ${value(a)} = ${regs.ACC} を計算して ACC に入れます。`,
        }));
        break;
      }
      case 'STORE': {
        regs.MAR = a; regs.MDR = String(regs.ACC); mem[a] = regs.ACC;
        steps.push(snap({
          phase: 'execute', active: ['control', 'alu', 'memory'], flows: ['alu-mem'], control: ['alu', 'memory'],
          changed: ['MAR', 'MDR'], memHighlight: a,
          message: `【実行】ACC の値 ${regs.ACC} を MDR に移し、MAR が指す主記憶の ${a} 番地に書き込みます。`,
        }));
        break;
      }
      case 'OUT': {
        output.push(value(a));
        steps.push(snap({
          phase: 'execute', active: ['control', 'memory', 'output'], flows: ['mem-out'], control: ['memory', 'output'],
          changed: [], memHighlight: a,
          message: `【実行】主記憶の ${a} 番地の値 ${value(a)} を出力装置に送ります。画面に ${value(a)} が表示されます。`,
        }));
        break;
      }
      case 'HALT':
        steps.push(snap({
          phase: 'halt', active: ['control'], flows: [], control: [], changed: [], memHighlight: null,
          message: '【実行】HALT 命令なので、プログラムを終了します。命令を「取り出す → 解読する → 実行する」の繰り返しで、すべての処理が進んだことが分かります。',
        }));
        return steps;
    }
  }
  return steps;
}
