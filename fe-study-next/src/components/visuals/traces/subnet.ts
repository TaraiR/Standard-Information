/** IPv4 アドレスとサブネットの計算（すべて32ビット整数で厳密に計算する） */

export interface Ipv4 { octets: number[]; value: number }

export function parseIpv4(text: string): Ipv4 | null {
  const m = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*$/.exec(text);
  if (!m) return null;
  const octets = m.slice(1).map(Number);
  if (octets.some(o => o > 255)) return null;
  return { octets, value: octets.reduce((a, o) => a * 256 + o, 0) };
}

export const toOctets = (v: number) => [24, 16, 8, 0].map(s => Math.floor(v / 2 ** s) % 256);
export const ipText = (v: number) => toOctets(v).join('.');
export const octetBits = (o: number) => o.toString(2).padStart(8, '0');
export const maskOf = (prefix: number) => (prefix === 0 ? 0 : (2 ** 32 - 2 ** (32 - prefix)));

/** 32ビットどうしの AND（JavaScript のビット演算は符号付き32ビットなので >>> 0 で符号なしに戻す） */
export const and32 = (a: number, b: number) => (a & b) >>> 0;

export interface SubnetResult {
  prefix: number;
  mask: number;
  network: number;
  broadcast: number;
  hostBits: number;
  hosts: number;
  first: number | null;
  last: number | null;
  kind: string;
}

export function classify(v: number): string {
  const [a, b] = toOctets(v);
  if (a === 127) return 'ループバックアドレス（自分自身）';
  if (a === 10) return 'プライベートアドレス（10.0.0.0/8）';
  if (a === 172 && b >= 16 && b <= 31) return 'プライベートアドレス（172.16.0.0/12）';
  if (a === 192 && b === 168) return 'プライベートアドレス（192.168.0.0/16）';
  return 'グローバルアドレス';
}

export function computeSubnet(ip: Ipv4, prefix: number): SubnetResult {
  const mask = maskOf(prefix);
  const network = and32(ip.value, mask);
  const hostBits = 32 - prefix;
  const broadcast = network + 2 ** hostBits - 1;
  const hosts = hostBits >= 2 ? 2 ** hostBits - 2 : 0;
  return {
    prefix, mask, network, broadcast, hostBits, hosts,
    first: hosts ? network + 1 : null,
    last: hosts ? broadcast - 1 : null,
    kind: classify(ip.value),
  };
}

export type SubnetPhase = 'ip' | 'mask' | 'and' | 'broadcast' | 'range' | 'hosts';
export interface SubnetStep { phase: SubnetPhase; message: string }

export function traceSubnet(ip: Ipv4, r: SubnetResult): SubnetStep[] {
  const isNetwork = ip.value === r.network;
  const isBroadcast = ip.value === r.broadcast;
  return [
    { phase: 'ip', message: `IPアドレス ${ipText(ip.value)} を、8ビットずつ2進数にします（全部で32ビット）。これは${r.kind}です。` },
    {
      phase: 'mask',
      message: `/${r.prefix} は「上位 ${r.prefix} ビットがネットワーク部」という意味です。サブネットマスクは 1 が ${r.prefix} 個、0 が ${r.hostBits} 個並んだ ${ipText(r.mask)} です。`,
    },
    {
      phase: 'and',
      message: `IPアドレスとサブネットマスクをビットごとに AND すると、ホスト部が 0 になり、ネットワークアドレス ${ipText(r.network)} が求まります。`,
    },
    {
      phase: 'broadcast',
      message: `ホスト部（下位 ${r.hostBits} ビット）をすべて 1 にしたものがブロードキャストアドレス ${ipText(r.broadcast)} です（同じネットワーク全体への送信に使います）。`,
    },
    {
      phase: 'range',
      message: r.hosts
        ? `ホスト部が全部 0 のネットワークアドレスと、全部 1 のブロードキャストアドレスは機器に割り当てられないので、使えるのは ${ipText(r.first!)} 〜 ${ipText(r.last!)} です。` +
          (isNetwork ? ` 入力した ${ipText(ip.value)} はネットワークアドレスなので、機器には割り当てられません。` : '') +
          (isBroadcast ? ` 入力した ${ipText(ip.value)} はブロードキャストアドレスなので、機器には割り当てられません。` : '')
        : `ホスト部が ${r.hostBits} ビットしかないので、機器に割り当てられるアドレスはありません。`,
    },
    {
      phase: 'hosts',
      message: `使えるホスト数 = 2^${r.hostBits} − 2 = ${r.hosts.toLocaleString()} 台です。`,
    },
  ];
}

// ---------- 宛先が同じネットワークか（デフォルトゲートウェイを使うか） ----------
export interface RouteDecision { mine: number; dest: number; same: boolean }
export function decideRoute(src: Ipv4, prefix: number, dest: Ipv4): RouteDecision {
  const mask = maskOf(prefix);
  const mine = and32(src.value, mask);
  const other = and32(dest.value, mask);
  return { mine, dest: other, same: mine === other };
}
