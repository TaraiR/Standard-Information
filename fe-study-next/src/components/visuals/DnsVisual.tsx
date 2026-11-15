'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Bits, Field, Segment, SequenceDiagram, useValidated } from './ui';
import { intInRange } from './bits';
import { dnsMessages } from './traces/network';
import { and32, decideRoute, ipText, maskOf, octetBits, parseIpv4, toOctets, type Ipv4 } from './traces/subnet';

const CACHE = [{ value: 'none', label: 'キャッシュなし（初回）' }, { value: 'cached', label: 'キャッシュあり' }] as const;
const ACTORS = [
  { id: 'pc', label: 'PC' },
  { id: 'resolver', label: 'キャッシュDNS', sub: 'リゾルバ' },
  { id: 'root', label: 'ルート', sub: 'DNSサーバ' },
  { id: 'tld', label: '.com', sub: 'TLDサーバ' },
  { id: 'auth', label: 'example.com', sub: '権威DNS' },
];

function DnsPart() {
  const [cache, setCache] = useState<'none' | 'cached'>('none');
  const messages = useMemo(() => dnsMessages(cache === 'cached'), [cache]);
  const steps = useMemo(() => [
    { shown: 0, message: 'ブラウザで www.example.com を開くには、まずドメイン名を IP アドレスに変換（名前解決）する必要があります。' },
    ...messages.map((m, i) => ({ shown: i + 1, message: m.message })),
  ], [messages]);
  return (
    <StepPlayer
      key={cache}
      title="DNS による名前解決（www.example.com）"
      steps={steps}
      settings={<Segment label="キャッシュの状態" options={CACHE} value={cache} onChange={setCache} />}
      renderVisual={s => <SequenceDiagram actors={cache === 'cached' ? ACTORS.slice(0, 2) : ACTORS} messages={messages} shown={s.shown} width={cache === 'cached' ? 480 : 700} />}
      getMessage={s => s.message}
      getVars={s => [
        {
          // 問い合わせ = PC からリゾルバへ、またはリゾルバから各 DNS サーバへ送ったもの
          label: '問い合わせの回数',
          value: messages.slice(0, s.shown).filter(m => m.from !== m.to && m.to !== 'pc' && (m.from === 'pc' || m.from === 'resolver')).length,
          tone: 'range',
        },
      ]}
      footnote="DNS は第7層（アプリケーション層）のプロトコルで、通信には主に UDP の 53 番ポートを使います。"
    />
  );
}

const bitRow = (v: number, prefix: number) => {
  const bits = toOctets(v).map(octetBits).join('').split('');
  return <Bits bits={bits} tones={bits.map((_, i) => (i < prefix ? 'range' : 'muted'))} />;
};

function RoutePart() {
  const src = useValidated<Ipv4>(parseIpv4('192.168.1.10')!, v => ipText(v.value), parseIpv4);
  const prefix = useValidated(24, String, intInRange(1, 31));
  const dst = useValidated<Ipv4>(parseIpv4('8.8.8.8')!, v => ipText(v.value), parseIpv4);
  const d = useMemo(() => decideRoute(src.value, prefix.value, dst.value), [src.value, prefix.value, dst.value]);
  const mask = maskOf(prefix.value);
  const steps = useMemo(() => [
    { message: `自分（${ipText(src.value.value)}/${prefix.value}）から ${ipText(dst.value.value)} にパケットを送ります。宛先が同じネットワークにいるかどうかで、送り先が変わります。` },
    { message: `自分の IP アドレスとサブネットマスク（${ipText(mask)}）の AND で、自分のネットワークアドレス ${ipText(d.mine)} を求めます。` },
    { message: `宛先の IP アドレスにも同じマスクで AND をとると、${ipText(d.dest)} になります。` },
    {
      message: d.same
        ? `ネットワーク部が一致する（${ipText(d.mine)}）ので、宛先は同じネットワーク（同じ LAN）にいます。ARP で相手の MAC アドレスを調べて、直接送ります。`
        : `ネットワーク部が一致しない（${ipText(d.mine)} ≠ ${ipText(d.dest)}）ので、宛先は別のネットワークにいます。デフォルトゲートウェイ（通常はルータ）に送り、ルータが宛先に向けて中継します。`,
    },
  ], [src.value, prefix.value, dst.value, d, mask]);

  return (
    <StepPlayer
      key={`${src.value.value}|${prefix.value}|${dst.value.value}`}
      title="宛先は同じネットワーク？（デフォルトゲートウェイの判断）"
      steps={steps}
      settings={
        <>
          <Field label="自分の IP" text={src.text} invalid={src.invalid} onChange={src.onChange} inputMode="decimal" width="9.5em" />
          <Field label="/" text={prefix.text} invalid={prefix.invalid} onChange={prefix.onChange} width="3.2em" />
          <Field label="宛先 IP" text={dst.text} invalid={dst.invalid} onChange={dst.onChange} inputMode="decimal" width="9.5em" />
          <div className="viz-presets">
            {['192.168.1.20', '192.168.2.20', '8.8.8.8'].map(v => (
              <button key={v} type="button" className="viz-mini-btn" onClick={() => dst.set(parseIpv4(v)!)}>宛先 {v}</button>
            ))}
          </div>
        </>
      }
      renderVisual={(_, i) => (
        <ol className="viz-work">
          <li className={i === 1 ? 'is-current' : i < 1 ? 'is-pending' : undefined}>
            <span>自分 AND マスク<br />{i >= 1 ? ipText(and32(src.value.value, mask)) : ''}</span>{i >= 1 ? bitRow(d.mine, prefix.value) : '—'}
          </li>
          <li className={i === 2 ? 'is-current' : i < 2 ? 'is-pending' : undefined}>
            <span>宛先 AND マスク<br />{i >= 2 ? ipText(d.dest) : ''}</span>{i >= 2 ? bitRow(d.dest, prefix.value) : '—'}
          </li>
          <li className={i === 3 ? 'is-current' : 'is-pending'}>
            <span>送り先</span>
            <span className="viz-big">{i >= 3 ? (d.same ? '相手に直接（同じ LAN）' : 'デフォルトゲートウェイ（ルータ）へ') : '—'}</span>
          </li>
        </ol>
      )}
      getMessage={s => s.message}
      getVars={() => [{ label: '判定', value: d.same ? '同じネットワーク' : '別のネットワーク', tone: d.same ? 'done' : 'focus' }]}
      legend={[{ tone: 'range', label: 'ネットワーク部（比べる部分）' }]}
    />
  );
}

const TABS = [{ value: 'dns', label: 'DNS の名前解決' }, { value: 'route', label: '宛先の判断' }] as const;

export default function DnsVisual() {
  const [tab, setTab] = useState<'dns' | 'route'>('dns');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'dns' ? <DnsPart /> : <RoutePart />}
    </div>
  );
}
