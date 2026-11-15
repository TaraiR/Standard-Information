'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment, SequenceDiagram } from './ui';
import { httpMessages, mailMessages, type MailProtocol, type StatusCase } from './traces/network';

const SCHEMES = [{ value: 'https', label: 'HTTPS' }, { value: 'http', label: 'HTTP' }] as const;
const STATUSES = ([200, 301, 404, 500] as const).map(v => ({ value: v, label: String(v) }));

function WebPart() {
  const [scheme, setScheme] = useState<'https' | 'http'>('https');
  const [status, setStatus] = useState<StatusCase>(200);
  const messages = useMemo(() => httpMessages(scheme === 'https', status), [scheme, status]);
  const steps = useMemo(() => [
    { shown: 0, message: `ブラウザに ${scheme}://www.example.com/index.html と入力したときに、裏側で行われるやり取りを順に見ていきます。` },
    ...messages.map((m, i) => ({ shown: i + 1, message: m.message })),
  ], [messages, scheme]);
  return (
    <StepPlayer
      key={`${scheme}|${status}`}
      title={`Web ページが表示されるまで（${scheme.toUpperCase()}・${status}）`}
      steps={steps}
      settings={
        <>
          <Segment label="プロトコル" options={SCHEMES} value={scheme} onChange={setScheme} />
          <Segment label="サーバの応答" options={STATUSES} value={status} onChange={setStatus} />
        </>
      }
      renderVisual={s => (
        <SequenceDiagram shown={s.shown} messages={messages}
          actors={[{ id: 'browser', label: 'ブラウザ' }, { id: 'dns', label: 'DNS サーバ' }, { id: 'server', label: 'Web サーバ' }]} />
      )}
      getMessage={s => s.message}
      footnote="ステータスコード: 2xx 成功、3xx リダイレクト、4xx クライアントエラー、5xx サーバエラー"
    />
  );
}

const MAIL = [{ value: 'pop3', label: 'POP3' }, { value: 'imap', label: 'IMAP' }] as const;

function MailPart() {
  const [proto, setProto] = useState<MailProtocol>('pop3');
  const messages = useMemo(() => mailMessages(proto), [proto]);
  const steps = useMemo(() => [
    { shown: 0, serverHasMail: false, pcHas: false, phoneHas: false, message: 'A さんが B さんにメールを送り、B さんがパソコンとスマートフォンで受信します。' },
    ...messages.map((m, i) => ({ shown: i + 1, serverHasMail: m.serverHasMail, pcHas: m.pcHas, phoneHas: m.phoneHas, message: m.message })),
  ], [messages]);
  const yes = (b: boolean) => (b ? 'あり' : 'なし');
  return (
    <StepPlayer
      key={proto}
      title={`メールの送受信（受信に ${proto === 'pop3' ? 'POP3' : 'IMAP'} を使う場合）`}
      steps={steps}
      settings={<Segment label="受信プロトコル" options={MAIL} value={proto} onChange={setProto} />}
      renderVisual={s => (
        <SequenceDiagram shown={s.shown} messages={messages} width={720}
          actors={[
            { id: 'a', label: 'A さん' },
            { id: 'smtpA', label: 'A のメール', sub: 'サーバ' },
            { id: 'smtpB', label: 'B のメール', sub: 'サーバ' },
            { id: 'b', label: 'B のパソコン' },
            { id: 'phone', label: 'B のスマホ' },
          ]} />
      )}
      getMessage={s => s.message}
      getVars={s => [
        { label: 'サーバに残っている', value: yes(s.serverHasMail), tone: s.serverHasMail ? 'done' : 'plain' },
        { label: 'パソコン', value: yes(s.pcHas), tone: s.pcHas ? 'done' : 'plain' },
        { label: 'スマホ', value: yes(s.phoneHas), tone: s.phoneHas ? 'done' : s.shown === 4 ? 'focus' : 'plain' },
      ]}
      footnote="送信と転送は SMTP（25番）、受信は POP3（110番：端末にダウンロード）か IMAP（143番：サーバで管理）です。"
    />
  );
}

const TABS = [{ value: 'web', label: 'Web ページの表示' }, { value: 'mail', label: 'メールの送受信' }] as const;

export default function HttpVisual() {
  const [tab, setTab] = useState<'web' | 'mail'>('web');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'web' ? <WebPart /> : <MailPart />}
    </div>
  );
}
