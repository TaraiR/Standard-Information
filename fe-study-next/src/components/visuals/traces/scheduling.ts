/** CPU スケジューリング（FCFS・SJF・ラウンドロビン・優先度）のシミュレーション。1単位時間ずつ進める */

export type Algo = 'fcfs' | 'sjf' | 'rr' | 'prio';
export interface Proc { name: string; arrival: number; burst: number; priority: number }

export const PROCS: Proc[] = [
  { name: 'P1', arrival: 0, burst: 5, priority: 3 },
  { name: 'P2', arrival: 1, burst: 3, priority: 1 },
  { name: 'P3', arrival: 2, burst: 1, priority: 4 },
  { name: 'P4', arrival: 3, burst: 2, priority: 2 },
];
export const QUANTUM = 2;

export const ALGO_LABEL: Record<Algo, string> = {
  fcfs: 'FCFS（到着順）', sjf: 'SJF（短い順）', rr: `ラウンドロビン（${QUANTUM}単位ずつ）`, prio: '優先度順（数字が小さいほど優先）',
};

export interface SchedStep {
  time: number;
  /** timeline[t] = その時間に実行したプロセス名（空きは null） */
  timeline: (string | null)[];
  running: string | null;
  ready: string[];
  remaining: Record<string, number>;
  finish: Record<string, number>;
  message: string;
}

export interface SchedResult { steps: SchedStep[]; finish: Record<string, number>; waiting: Record<string, number>; turnaround: Record<string, number> }

export function simulate(algo: Algo, procs: Proc[] = PROCS): SchedResult {
  const remaining: Record<string, number> = Object.fromEntries(procs.map(p => [p.name, p.burst]));
  const finish: Record<string, number> = {};
  const timeline: (string | null)[] = [];
  const queue: string[] = []; // 到着済みで未完了（RR では実行待ちの順番）
  const total = procs.reduce((a, p) => a + p.burst, 0);
  const byName = Object.fromEntries(procs.map(p => [p.name, p]));
  let current: string | null = null;
  let slice = 0;
  const steps: SchedStep[] = [{
    time: 0, timeline: [], running: null, ready: [], remaining: { ...remaining }, finish: {},
    message: `${ALGO_LABEL[algo]}で、4つのプロセスに CPU を割り当てます。表の「到着」の時刻に実行待ちになり、「実行時間」だけ CPU を使うと終わります。` +
      (algo === 'fcfs' || algo === 'sjf' || algo === 'prio' ? '（この方式では、実行を始めたプロセスは終わるまで横取りされません）' : ''),
  }];

  for (let t = 0; finishedCount() < procs.length && t < total + 50; t++) {
    // この時刻に到着したプロセスを待ち行列へ（RR では、切り替えられたプロセスより先に並ぶ）
    const arrived = procs.filter(p => p.arrival === t).map(p => p.name);
    let note = arrived.length ? `${arrived.join('・')} が到着。` : '';
    if (algo === 'rr' && current && slice >= QUANTUM && remaining[current] > 0) {
      queue.push(...arrived);
      queue.push(current);
      note += `${current} は ${QUANTUM} 単位使ったので列の最後に回ります。`;
      current = null;
    } else queue.push(...arrived);

    if (current === null || remaining[current] === 0) {
      current = pick();
      slice = 0;
      if (current) note += `${current} を実行${choiceReason(current)}。`;
    }
    if (!current) {
      timeline.push(null);
      steps.push(snap(t + 1, 'CPU は空いています。'));
      continue;
    }
    remaining[current]--;
    slice++;
    timeline.push(current);
    if (remaining[current] === 0) {
      finish[current] = t + 1;
      note += `${current} が時刻 ${t + 1} に終了。`;
    }
    steps.push(snap(t + 1, note || `${current} の実行を続けます。`));
  }

  const waiting: Record<string, number> = {};
  const turnaround: Record<string, number> = {};
  for (const p of procs) {
    turnaround[p.name] = finish[p.name] - p.arrival;
    waiting[p.name] = turnaround[p.name] - p.burst;
  }
  const avg = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0) / procs.length;
  steps.push({
    ...steps[steps.length - 1],
    running: null,
    message: `すべて終了しました。待ち時間（終了時刻 − 到着時刻 − 実行時間）は ${procs.map(p => `${p.name}=${waiting[p.name]}`).join('、')}、平均 ${avg(waiting)} です。` +
      ({
        fcfs: '長い P1 が先に CPU を使い続けるため、後から来た短いプロセスが待たされます（コンボイ効果）。',
        sjf: '短いものから実行するので、平均待ち時間が最も小さくなります。ただし実行時間を事前に知る必要があります。',
        rr: '一定時間ずつ順番に交代するので公平で、どのプロセスもすぐに一度は実行されます。',
        prio: '重要なプロセスを先に実行できますが、優先度の低いプロセスが長く待たされることがあります。',
      } as Record<Algo, string>)[algo],
  });
  return { steps, finish, waiting, turnaround };

  function finishedCount() { return Object.keys(finish).length; }
  function pick(): string | null {
    const ready = queue.filter(n => remaining[n] > 0);
    if (!ready.length) return null;
    let chosen: string;
    if (algo === 'sjf') chosen = [...ready].sort((a, b) => byName[a].burst - byName[b].burst || byName[a].arrival - byName[b].arrival)[0];
    else if (algo === 'prio') chosen = [...ready].sort((a, b) => byName[a].priority - byName[b].priority || byName[a].arrival - byName[b].arrival)[0];
    else chosen = ready[0];
    queue.splice(queue.indexOf(chosen), 1);
    return chosen;
  }
  function choiceReason(name: string) {
    if (algo === 'sjf') return `（待っている中で実行時間が最も短い: ${byName[name].burst}）`;
    if (algo === 'prio') return `（待っている中で優先度が最も高い: ${byName[name].priority}）`;
    return '（列の先頭）';
  }
  function snap(time: number, message: string): SchedStep {
    return {
      time, timeline: [...timeline], running: current, ready: queue.filter(n => remaining[n] > 0),
      remaining: { ...remaining }, finish: { ...finish }, message: `時刻 ${time - 1}〜${time}: ${message}`,
    };
  }
}
