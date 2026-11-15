/**
 * 入出力方式（ポーリング・割り込み・DMA）で、入出力装置から主記憶へデータを転送するときの
 * CPU の時間の使い方を、1時間単位ずつシミュレーションする。
 *
 * モデル: 装置はデータを1語ずつ準備し、PREP 単位時間ごとに1語が準備完了になる。
 * 転送は1語につき1単位時間。CPU が「入出力以外の仕事」をした時間を比べる。
 */

export type IoMode = 'polling' | 'interrupt' | 'dma';
export const WORDS = 3;
export const PREP = 3;

export type CpuTask = 'request' | 'poll' | 'copy' | 'isr' | 'setup' | 'done-irq' | 'work';
export type DevState = 'prep' | 'ready' | 'idle';
export type DmaTask = 'copy' | null;

export const CPU_LABEL: Record<CpuTask, string> = {
  request: '要求', poll: '確認', copy: '転送', isr: '割込', setup: '設定', 'done-irq': '割込', work: '仕事',
};

export interface IoSlot { cpu: CpuTask; dev: DevState; dma: DmaTask; word: number | null }

export interface IoStep {
  time: number;
  slots: IoSlot[];
  transferred: number;
  cpuWork: number;
  cpuIo: number;
  message: string;
}

export const TOTAL = PREP * WORDS + 3;

export function traceIo(mode: IoMode): IoStep[] {
  const slots: IoSlot[] = [];
  const steps: IoStep[] = [{
    time: 0, slots: [], transferred: 0, cpuWork: 0, cpuIo: 0,
    message: {
      polling: 'ポーリング方式: CPU が装置の状態を何度も確認し、準備ができたら CPU 自身がデータを主記憶へ転送します。',
      interrupt: '割り込み方式: CPU は別の仕事をし、装置の準備ができると「割り込み」で知らされて、そのときだけ転送します。',
      dma: 'DMA 方式: CPU は最初に DMA コントローラへ転送を任せる設定をするだけで、転送は DMA が CPU を介さずに行います。',
    }[mode] + ` 装置は ${PREP} 単位時間ごとに1語のデータを準備し、全部で ${WORDS} 語を主記憶へ転送します。`,
  }];

  let transferred = 0;
  let pendingIrq = false;       // 割り込み要求が来ている（次の時間に処理）
  let dmaFinished = false;
  let doneIrqHandled = false;
  let readyWords = 0;           // 準備完了した語数
  for (let t = 1; t <= TOTAL; t++) {
    // 装置の状態（この時間の始めに準備完了している語数）
    const readyAtStart = Math.min(WORDS, Math.floor((t - 1) / PREP));
    readyWords = readyAtStart;
    const waiting = readyWords > transferred;
    let cpu: CpuTask = 'work';
    let dma: DmaTask = null;
    let word: number | null = null;
    let note = '';

    if (t === 1) {
      cpu = mode === 'dma' ? 'setup' : 'request';
      note = mode === 'dma' ? 'CPU が DMA コントローラに転送元・転送先・語数を設定します。' : 'CPU が装置にデータの読み込みを要求します。';
    } else if (mode === 'polling') {
      if (transferred >= WORDS) { cpu = 'work'; note = '転送が終わったので、CPU はようやく本来の仕事に戻れます。'; }
      else if (waiting) { cpu = 'copy'; transferred++; word = transferred; note = `準備できた ${transferred} 語目を CPU が主記憶へ転送します。`; }
      else { cpu = 'poll'; note = 'CPU が「準備できた？」と装置の状態を確認します（まだなので、確認を繰り返すだけで仕事は進みません）。'; }
    } else if (mode === 'interrupt') {
      if (pendingIrq && waiting) { cpu = 'isr'; transferred++; word = transferred; pendingIrq = false; note = `割り込みを受けて、CPU が割り込み処理で ${transferred} 語目を主記憶へ転送します。`; }
      else { cpu = 'work'; note = '装置が準備している間、CPU は別の仕事を進めます。'; }
    } else {
      if (waiting && !dmaFinished) { dma = 'copy'; transferred++; word = transferred; note = `DMA コントローラが ${transferred} 語目を主記憶へ直接転送します。CPU はその間も別の仕事をしています。`; if (transferred >= WORDS) dmaFinished = true; }
      if (pendingIrq && !doneIrqHandled) { cpu = 'done-irq'; doneIrqHandled = true; pendingIrq = false; note = 'DMA から「転送完了」の割り込みが1回だけ届き、CPU が完了処理をします。'; }
      else if (!note) note = 'CPU は別の仕事を進めます。';
    }

    // この時間の終わりに準備完了する語があれば、割り込みを要求
    const readyAtEnd = Math.min(WORDS, Math.floor(t / PREP));
    if (mode === 'interrupt' && readyAtEnd > readyAtStart) pendingIrq = true;
    if (mode === 'dma' && dmaFinished && !doneIrqHandled && dma === 'copy') pendingIrq = true;

    const dev: DevState = transferred >= WORDS && readyAtEnd >= WORDS ? 'idle' : readyAtEnd > transferred ? 'ready' : 'prep';
    slots.push({ cpu, dev, dma, word });
    const cpuWork = slots.filter(s => s.cpu === 'work').length;
    steps.push({
      time: t, slots: [...slots], transferred, cpuWork, cpuIo: t - cpuWork,
      message: `時間 ${t}: ${note}`,
    });
  }
  const last = steps[steps.length - 1];
  steps.push({
    ...last,
    message: `${TOTAL} 単位時間のうち、CPU が入出力以外の仕事に使えたのは ${last.cpuWork} 単位時間でした。` +
      {
        polling: 'ポーリングでは、待っている間ずっと確認に縛られるので無駄が多くなります。',
        interrupt: '割り込みでは待ち時間に仕事ができますが、1語ごとに割り込み処理が必要です。',
        dma: 'DMA では転送そのものを CPU が行わないので、CPU の負担が最も小さくなります。大量のデータ転送に向いています。',
      }[mode],
  });
  return steps;
}

// ---------- アドレスバス幅と最大メモリ容量 ----------
const UNITS = ['バイト', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
/** 2^bits バイトを 1KB = 1,024 バイトで表す */
export function addressCapacity(bits: number): { addresses: string; value: string } {
  const unit = Math.min(Math.floor(bits / 10), UNITS.length - 1);
  const rest = bits - unit * 10;
  return { addresses: `2^${bits}`, value: `${(2 ** rest).toLocaleString()} ${UNITS[unit]}` };
}
