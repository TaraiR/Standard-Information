'use client';

import { useMemo } from 'react';
import StepPlayer from './StepPlayer';
import { Bits, Field, useValidated } from './ui';
import { intInRange } from './bits';
import { computeSubnet, ipText, parseIpv4, toOctets, octetBits, traceSubnet, type Ipv4, type SubnetPhase, type SubnetStep } from './traces/subnet';

const ORDER: SubnetPhase[] = ['ip', 'mask', 'and', 'broadcast', 'range', 'hosts'];
const PRESETS = [
  { ip: '192.168.1.10', prefix: 24 },
  { ip: '192.168.1.100', prefix: 26 },
  { ip: '172.16.5.200', prefix: 20 },
  { ip: '10.1.2.3', prefix: 8 },
];

/** 32ビットを、ネットワーク部（青）とホスト部（オレンジ）に色分けして 8 ビットずつ並べる */
function AddressBits({ value, prefix, highlightHost }: { value: number; prefix: number; highlightHost?: 'zero' | 'one' }) {
  const bits = toOctets(value).map(octetBits).join('').split('');
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {[0, 1, 2, 3].map(o => (
        <Bits key={o}
          bits={bits.slice(o * 8, o * 8 + 8)}
          tones={bits.slice(o * 8, o * 8 + 8).map((_, i) => (o * 8 + i < prefix ? 'range' : highlightHost ? 'done' : 'focus'))} />
      ))}
    </span>
  );
}

export default function SubnetVisual() {
  const ip = useValidated<Ipv4>(parseIpv4('192.168.1.100')!, v => ipText(v.value), parseIpv4);
  const prefix = useValidated(26, String, intInRange(1, 31));
  const r = useMemo(() => computeSubnet(ip.value, prefix.value), [ip.value, prefix.value]);
  const steps = useMemo(() => traceSubnet(ip.value, r), [ip.value, r]);

  const renderVisual = (s: SubnetStep) => {
    const at = ORDER.indexOf(s.phase);
    const row = (phase: SubnetPhase) => (at === ORDER.indexOf(phase) ? 'is-current' : at < ORDER.indexOf(phase) ? 'is-pending' : undefined);
    return (
      <ol className="viz-work">
        <li className={row('ip')}><span>IP アドレス<br />{ipText(ip.value.value)}</span><AddressBits value={ip.value.value} prefix={prefix.value} /></li>
        <li className={row('mask')}><span>マスク /{prefix.value}<br />{ipText(r.mask)}</span>{at >= 1 ? <AddressBits value={r.mask} prefix={prefix.value} /> : '—'}</li>
        <li className={row('and')}><span>AND = ネットワーク<br />{at >= 2 ? ipText(r.network) : ''}</span>{at >= 2 ? <AddressBits value={r.network} prefix={prefix.value} highlightHost="zero" /> : '—'}</li>
        <li className={row('broadcast')}><span>ブロードキャスト<br />{at >= 3 ? ipText(r.broadcast) : ''}</span>{at >= 3 ? <AddressBits value={r.broadcast} prefix={prefix.value} highlightHost="one" /> : '—'}</li>
        <li className={row('range')}><span>使える範囲</span><span className="viz-mono">{at >= 4 ? (r.first !== null ? `${ipText(r.first)} 〜 ${ipText(r.last!)}` : 'なし') : '—'}</span></li>
        <li className={row('hosts')}><span>ホスト数</span><span className="viz-big">{at >= 5 ? `2^${r.hostBits} − 2 = ${r.hosts.toLocaleString()}` : '—'}</span></li>
      </ol>
    );
  };

  return (
    <StepPlayer
      key={`${ip.value.value}|${prefix.value}`}
      title={`サブネット計算: ${ipText(ip.value.value)}/${prefix.value}`}
      steps={steps}
      settings={
        <>
          <Field label="IP アドレス" text={ip.text} invalid={ip.invalid} onChange={ip.onChange} inputMode="decimal" width="9.5em" />
          <Field label="/" text={prefix.text} invalid={prefix.invalid} onChange={prefix.onChange} width="3.2em" hint="プレフィックス長 1〜31" />
          <div className="viz-presets">
            {PRESETS.map(p => (
              <button key={`${p.ip}/${p.prefix}`} type="button" className="viz-mini-btn"
                onClick={() => { ip.set(parseIpv4(p.ip)!); prefix.set(p.prefix); }}>
                {p.ip}/{p.prefix}
              </button>
            ))}
          </div>
        </>
      }
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={() => [
        { label: 'ネットワーク部', value: `${r.prefix} ビット`, tone: 'range' },
        { label: 'ホスト部', value: `${r.hostBits} ビット`, tone: 'focus' },
      ]}
      legend={[
        { tone: 'range', label: 'ネットワーク部' },
        { tone: 'focus', label: 'ホスト部' },
        { tone: 'done', label: 'ホスト部を全部0／全部1にしたもの' },
      ]}
      footnote="使えるホスト数 = 2^(ホスト部のビット数) − 2（ネットワークアドレスとブロードキャストアドレスの2つを除く）"
    />
  );
}
