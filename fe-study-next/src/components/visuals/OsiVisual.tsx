'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment, SequenceDiagram } from './ui';
import { LAYERS, tcpMessages, traceEncapsulation, udpMessages, type EncapStep } from './traces/network';

const ROW_H = 40;
const TOP = 34;

function EncapsulationPart() {
  const steps = useMemo(() => traceEncapsulation(), []);
  const stackX = { down: 12, up: 400 };

  const renderVisual = (s: EncapStep) => {
    const pduY = TOP + LAYERS.length * ROW_H + 30;
    const segs = [...s.headers, 'HTTPデータ', ...(s.headers.includes('MAC') ? ['FCS'] : [])];
    const tone = (h: string) => (h === 'MAC' || h === 'FCS' ? 'done' : h === 'IP' ? 'focus' : h === 'TCP' ? 'range' : 'plain');
    const totalW = 616;
    const wOf = (h: string) => (h === 'HTTPデータ' ? 180 : h === 'FCS' ? 70 : 96);
    let x = (640 - Math.min(totalW, segs.reduce((a, h) => a + wOf(h) + 4, 0))) / 2;
    return (
      <svg className="viz-svg" viewBox={`0 0 640 ${pduY + 70}`} role="img"
        aria-label={`${s.direction === 'down' ? '送信側' : s.direction === 'up' ? '受信側' : '伝送中'} 第${LAYERS[s.layer].osi}層`}>
        <text className="viz-label" x={stackX.down + 114} y={22} textAnchor="middle">送信側（ブラウザ）</text>
        <text className="viz-label" x={stackX.up + 114} y={22} textAnchor="middle">受信側（Web サーバ）</text>
        {(['down', 'up'] as const).map(side => LAYERS.map((l, i) => {
          const active = s.direction === side && s.layer === i;
          const passed = side === 'down' ? (s.direction !== 'down' || i < s.layer) : s.direction === 'up' && i > s.layer;
          return (
            <g key={`${side}-${i}`}>
              <rect className={`viz-box${active ? ' tone-focus' : passed ? ' tone-range' : ''}`}
                x={stackX[side]} y={TOP + i * ROW_H} width={228} height={ROW_H - 6} rx={6} />
              <text className="viz-text" x={stackX[side] + 10} y={TOP + i * ROW_H + 17} dominantBaseline="central" style={{ fontSize: 16 }}>
                {l.osi} {l.name}
              </text>
            </g>
          );
        }))}
        {LAYERS.map((l, i) => (
          <text key={i} className="viz-label" x={320} y={TOP + i * ROW_H + 17} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 13 }}>
            {i === 0 || LAYERS[i - 1].tcpip !== l.tcpip ? l.tcpip.replace('ネットワークインタフェース層', 'NW インタフェース層') : ''}
          </text>
        ))}
        <text className="viz-label" x={320} y={TOP - 12} textAnchor="middle" style={{ fontSize: 13 }}>TCP/IP では</text>
        <text className="viz-label" x={20} y={pduY - 8}>
          流れているデータ（{s.direction === 'wire' ? 'ビット列' : LAYERS[s.layer].pdu}）
        </text>
        {segs.map(h => {
          const w = wOf(h);
          const el = (
            <g key={h}>
              <rect className={`viz-box tone-${tone(h)}`} x={x} y={pduY} width={w} height={44} rx={6} />
              <text className="viz-text is-strong" x={x + w / 2} y={pduY + 22} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 16 }}>
                {h === 'HTTPデータ' ? 'HTTP データ' : `${h}${h === 'FCS' ? '' : ' ヘッダ'}`}
              </text>
            </g>
          );
          x += w + 4;
          return el;
        })}
      </svg>
    );
  };

  return (
    <StepPlayer
      title="カプセル化: 各層がヘッダを付けて送り、受信側で外す"
      steps={steps}
      renderVisual={renderVisual}
      getMessage={s => s.message}
      getVars={s => [
        { label: '層', value: `第${LAYERS[s.layer].osi}層`, tone: 'focus' },
        { label: 'データの単位', value: s.direction === 'wire' ? 'ビット' : LAYERS[s.layer].pdu, tone: 'range' },
      ]}
      legend={[
        { tone: 'range', label: 'TCP（第4層）' },
        { tone: 'focus', label: 'IP（第3層）' },
        { tone: 'done', label: 'MAC・FCS（第2層）' },
      ]}
      footnote="送信側では上の層から順にヘッダを付け（カプセル化）、受信側では下の層から順に外します。"
    />
  );
}

const PROTOCOLS = [{ value: 'tcp', label: 'TCP' }, { value: 'udp', label: 'UDP' }] as const;

function TransportPart() {
  const [proto, setProto] = useState<'tcp' | 'udp'>('tcp');
  const messages = useMemo(() => (proto === 'tcp' ? tcpMessages() : udpMessages()), [proto]);
  const steps = useMemo(() => [
    {
      shown: 0,
      message: proto === 'tcp'
        ? 'TCP は「確実に届ける」プロトコルです。接続の確立、受信確認、再送の流れを見てみましょう。'
        : 'UDP は「速さを優先する」プロトコルです。TCP と比べて手順がどれだけ少ないかを見てみましょう。',
    },
    ...messages.map((m, i) => ({ shown: i + 1, message: m.message })),
  ], [messages, proto]);

  return (
    <StepPlayer
      key={proto}
      title={proto === 'tcp' ? 'TCP: 3ウェイハンドシェイクと再送' : 'UDP: 接続なし・確認なし'}
      steps={steps}
      settings={<Segment label="プロトコル" options={PROTOCOLS} value={proto} onChange={setProto} />}
      renderVisual={s => (
        <SequenceDiagram shown={s.shown} messages={messages}
          actors={[{ id: 'client', label: 'クライアント' }, { id: 'server', label: 'サーバ' }]} width={520} />
      )}
      getMessage={s => s.message}
      footnote="TCP: Web・メール・ファイル転送など確実性が必要な通信。UDP: 動画配信・音声通話・DNS など速さが重要な通信。"
    />
  );
}

const TABS = [{ value: 'encap', label: 'カプセル化（OSI 7層）' }, { value: 'transport', label: 'TCP と UDP' }] as const;

export default function OsiVisual() {
  const [tab, setTab] = useState<'encap' | 'transport'>('encap');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'encap' ? <EncapsulationPart /> : <TransportPart />}
    </div>
  );
}
