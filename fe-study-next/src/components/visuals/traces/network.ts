/**
 * ネットワークのやり取り（カプセル化・TCP/UDP・DNS・HTTP・メール）の手順と、
 * ハブ／スイッチの転送シミュレーション。
 */

// ---------- シーケンス図の共通データ ----------
export interface SeqMessage {
  from: string;
  to: string;
  label: string;
  /** range = 通常, focus = 注意, done = 成功, muted = 補足 */
  tone?: 'range' | 'focus' | 'done' | 'muted';
  message: string;
}

// ---------- カプセル化 ----------
export interface Layer { osi: number; name: string; tcpip: string; pdu: string; header: string | null; detail: string }

export const LAYERS: Layer[] = [
  { osi: 7, name: 'アプリケーション層', tcpip: 'アプリケーション層', pdu: 'データ', header: 'HTTP', detail: 'ブラウザが HTTP のリクエスト「GET /index.html」を作ります。' },
  { osi: 6, name: 'プレゼンテーション層', tcpip: 'アプリケーション層', pdu: 'データ', header: null, detail: '文字コードの変換や暗号化（HTTPS なら TLS）を行う層です。TCP/IP ではアプリケーション層がまとめて担当します。' },
  { osi: 5, name: 'セッション層', tcpip: 'アプリケーション層', pdu: 'データ', header: null, detail: '通信の開始・終了を管理する層です。TCP/IP ではアプリケーション層がまとめて担当します。' },
  { osi: 4, name: 'トランスポート層', tcpip: 'トランスポート層', pdu: 'セグメント', header: 'TCP', detail: 'TCP ヘッダ（送信元ポート 50000・宛先ポート 80、順序番号など）を付けます。ポート番号で相手のアプリを区別します。' },
  { osi: 3, name: 'ネットワーク層', tcpip: 'インターネット層', pdu: 'パケット', header: 'IP', detail: 'IP ヘッダ（送信元 IP 192.168.1.10・宛先 IP 203.0.113.5）を付けます。ルータはこの IP アドレスを見て経路を選びます。' },
  { osi: 2, name: 'データリンク層', tcpip: 'ネットワークインタフェース層', pdu: 'フレーム', header: 'MAC', detail: 'MAC ヘッダ（次に渡す機器の MAC アドレス）と、誤り検出用の FCS を付けます。スイッチはこの MAC アドレスを見ます。' },
  { osi: 1, name: '物理層', tcpip: 'ネットワークインタフェース層', pdu: 'ビット', header: null, detail: 'フレーム全体を 0 と 1 の電気信号・光・電波に変えてケーブルに流します。' },
];

export interface EncapStep { layer: number; direction: 'down' | 'wire' | 'up'; headers: string[]; message: string }

export function traceEncapsulation(): EncapStep[] {
  const steps: EncapStep[] = [];
  const headers: string[] = [];
  LAYERS.forEach((l, i) => {
    if (l.header && l.header !== 'HTTP') headers.unshift(l.header);
    steps.push({
      layer: i, direction: 'down', headers: [...headers],
      message: `【送信側・第${l.osi}層 ${l.name}】${l.detail}` + (l.header && l.header !== 'HTTP' ? `（データの単位は「${l.pdu}」）` : ''),
    });
  });
  steps.push({ layer: 6, direction: 'wire', headers: [...headers], message: '信号がケーブルやルータを通って、相手のコンピュータに届きます。' });
  for (let i = LAYERS.length - 1; i >= 0; i--) {
    const l = LAYERS[i];
    if (l.header && l.header !== 'HTTP') headers.shift();
    steps.push({
      layer: i, direction: 'up', headers: [...headers],
      message: `【受信側・第${l.osi}層 ${l.name}】` + (l.header && l.header !== 'HTTP'
        ? `${l.header} ヘッダを読んで取り外し、上の層に渡します。`
        : l.osi === 7 ? 'Web サーバのアプリケーションが HTTP リクエストを受け取りました。送信側で付けたヘッダが、受信側で逆の順に外されたことが分かります。'
          : l.osi === 1 ? '電気信号を 0 と 1 のビット列に戻します。'
            : 'この層の処理をして上の層に渡します。'),
    });
  }
  return steps;
}

// ---------- TCP / UDP ----------
export function tcpMessages(): SeqMessage[] {
  return [
    { from: 'client', to: 'server', label: 'SYN', message: '【1】クライアントが「接続したい」という SYN を送ります（3ウェイハンドシェイクの1回目）。' },
    { from: 'server', to: 'client', label: 'SYN + ACK', message: '【2】サーバが「了解、こちらも接続したい」という SYN+ACK を返します（2回目）。' },
    { from: 'client', to: 'server', label: 'ACK', message: '【3】クライアントが ACK を返して、接続が確立します（3回目）。ここまでが3ウェイハンドシェイクです。' },
    { from: 'client', to: 'server', label: 'データ 1', message: '接続が確立したので、データを送ります。' },
    { from: 'server', to: 'client', label: 'ACK（受信確認）', tone: 'done', message: 'サーバは受け取ったことを ACK で知らせます。ACK が返ってこなければ、TCP は自動で再送します。' },
    { from: 'client', to: 'server', label: 'データ 2', tone: 'focus', message: '途中でデータが失われることもあります。' },
    { from: 'client', to: 'server', label: 'データ 2（再送）', tone: 'focus', message: '一定時間たっても ACK が来ないので、TCP は同じデータを再送します。これが「信頼性」の仕組みです。' },
    { from: 'server', to: 'client', label: 'ACK（受信確認）', tone: 'done', message: '再送したデータが届き、ACK が返りました。TCP は順序の並べ替えと再送で、データを確実に届けます。' },
  ];
}

export function udpMessages(): SeqMessage[] {
  return [
    { from: 'client', to: 'server', label: 'データ 1', message: 'UDP は接続の確立（ハンドシェイク）をせず、いきなりデータを送ります。' },
    { from: 'client', to: 'server', label: 'データ 2', tone: 'focus', message: 'データ 2 は途中で失われましたが、UDP には受信確認も再送もないので、送信側は気づきません。' },
    { from: 'client', to: 'server', label: 'データ 3', message: '次のデータをそのまま送り続けます。手順が少ないぶん速く、遅延が小さいのが特長です。' },
    { from: 'server', to: 'server', label: '1 と 3 だけ受信', tone: 'muted', message: '受信側には 1 と 3 だけが届きました。動画や音声通話のように「多少欠けても遅れない方が大事」な用途に向いています。' },
  ];
}

// ---------- DNS ----------
export function dnsMessages(cached: boolean): SeqMessage[] {
  if (cached) {
    return [
      { from: 'pc', to: 'pc', label: 'キャッシュを確認', tone: 'muted', message: 'PC はまず自分の DNS キャッシュを見ますが、www.example.com はありません。' },
      { from: 'pc', to: 'resolver', label: 'www.example.com の IP は？', message: 'PC が、プロバイダなどのキャッシュ DNS サーバ（フルサービスリゾルバ）に問い合わせます。' },
      { from: 'resolver', to: 'pc', label: '203.0.113.5（キャッシュから）', tone: 'done', message: 'キャッシュ DNS サーバは、少し前に同じ名前を調べた結果をキャッシュしていたので、ルートなどに問い合わせずにすぐ答えます。' },
      { from: 'pc', to: 'pc', label: '203.0.113.5 に接続', tone: 'done', message: '問い合わせは1往復だけで済みました。キャッシュのおかげで名前解決が速くなります。' },
    ];
  }
  return [
    { from: 'pc', to: 'pc', label: 'キャッシュを確認', tone: 'muted', message: 'PC はまず自分の DNS キャッシュを見ますが、www.example.com はありません。' },
    { from: 'pc', to: 'resolver', label: 'www.example.com の IP は？', message: 'PC が、キャッシュ DNS サーバ（フルサービスリゾルバ）に問い合わせます。' },
    { from: 'resolver', to: 'root', label: 'www.example.com は？', message: 'キャッシュ DNS サーバも知らないので、最上位のルート DNS サーバに問い合わせます。' },
    { from: 'root', to: 'resolver', label: '.com のサーバを紹介', tone: 'muted', message: 'ルート DNS サーバは答えそのものではなく、「.com を管理する TLD サーバに聞いて」と紹介します。' },
    { from: 'resolver', to: 'tld', label: 'www.example.com は？', message: '紹介された .com の TLD サーバに問い合わせます。' },
    { from: 'tld', to: 'resolver', label: 'example.com のサーバを紹介', tone: 'muted', message: 'TLD サーバは「example.com を管理する権威 DNS サーバに聞いて」と紹介します。' },
    { from: 'resolver', to: 'auth', label: 'www.example.com は？', message: 'example.com の権威 DNS サーバに問い合わせます。' },
    { from: 'auth', to: 'resolver', label: '203.0.113.5（A レコード）', tone: 'done', message: '権威 DNS サーバが A レコード（ドメイン名 → IPv4 アドレス）を答えます。' },
    { from: 'resolver', to: 'pc', label: '203.0.113.5', tone: 'done', message: 'キャッシュ DNS サーバは結果をキャッシュしてから PC に返します。次に誰かが同じ名前を聞いたときは、すぐ答えられます。' },
    { from: 'pc', to: 'pc', label: '203.0.113.5 に接続', tone: 'done', message: '名前解決が終わり、PC は 203.0.113.5 に接続できます。' },
  ];
}

// ---------- HTTP ----------
export type StatusCase = 200 | 301 | 404 | 500;
const STATUS_TEXT: Record<StatusCase, string> = { 200: '200 OK', 301: '301 Moved Permanently', 404: '404 Not Found', 500: '500 Internal Server Error' };
const STATUS_NOTE: Record<StatusCase, string> = {
  200: '2xx は成功です。ブラウザは受け取った HTML を表示します。',
  301: '3xx はリダイレクトです。ブラウザは Location ヘッダに書かれた新しい URL に自動で移動します。',
  404: '4xx はクライアント側のエラーです。404 は「その URL のページがない」ことを表します。',
  500: '5xx はサーバ側のエラーです。500 はサーバの内部で処理に失敗したことを表します。',
};

export function httpMessages(https: boolean, status: StatusCase): SeqMessage[] {
  const port = https ? 443 : 80;
  const list: SeqMessage[] = [
    { from: 'browser', to: 'dns', label: 'www.example.com の IP は？', tone: 'muted', message: 'まず DNS で、ドメイン名から Web サーバの IP アドレスを調べます。' },
    { from: 'dns', to: 'browser', label: '203.0.113.5', tone: 'muted', message: `IP アドレスが分かりました。${https ? 'HTTPS の標準ポートは 443' : 'HTTP の標準ポートは 80'} 番です。` },
    { from: 'browser', to: 'server', label: `TCP 接続（${port}番）`, message: `Web サーバの ${port} 番ポートに TCP で接続します（3ウェイハンドシェイク）。` },
  ];
  if (https) {
    list.push(
      { from: 'server', to: 'browser', label: 'サーバ証明書', tone: 'focus', message: 'TLS のハンドシェイクで、サーバがサーバ証明書を送ります。ブラウザは認証局の署名を確かめ、本物のサーバか確認します。' },
      { from: 'browser', to: 'server', label: '共通鍵を安全に共有', tone: 'focus', message: '公開鍵暗号を使って、これからの通信を暗号化する共通鍵を安全に共有します。以降の通信はすべて暗号化され、盗聴や改ざんを防げます。' },
    );
  }
  list.push(
    { from: 'browser', to: 'server', label: 'GET /index.html', message: `HTTP リクエストを送ります。GET はデータを取得するメソッドです。${https ? '（暗号化されている）' : '（暗号化されていないので、途中で読まれる可能性がある）'}` },
    { from: 'server', to: 'browser', label: STATUS_TEXT[status], tone: status === 200 ? 'done' : status === 301 ? 'range' : 'focus', message: `サーバがステータスコード ${STATUS_TEXT[status]} を返します。${STATUS_NOTE[status]}` },
  );
  if (status === 301) {
    list.push(
      { from: 'browser', to: 'server', label: 'GET /new/index.html', message: 'ブラウザは新しい URL に、もう一度リクエストを送ります。' },
      { from: 'server', to: 'browser', label: '200 OK', tone: 'done', message: '新しい URL のページが返り、表示されます。' },
    );
  }
  return list;
}

// ---------- メール ----------
export type MailProtocol = 'pop3' | 'imap';

export interface MailStep extends SeqMessage { serverHasMail: boolean; pcHas: boolean; phoneHas: boolean }

export function mailMessages(protocol: MailProtocol): MailStep[] {
  const pop = protocol === 'pop3';
  return [
    { from: 'a', to: 'smtpA', label: 'SMTP（25番）で送信', serverHasMail: false, pcHas: false, phoneHas: false, message: 'A さんのメールソフトが、自分のメールサーバに SMTP でメールを送ります。' },
    { from: 'smtpA', to: 'smtpB', label: 'SMTP でサーバ間転送', serverHasMail: true, pcHas: false, phoneHas: false, message: 'A さんのメールサーバが、宛先（B さん）のメールサーバへ SMTP で転送します。メールは B さんのメールボックスに保存されます。送信と転送はどちらも SMTP です。' },
    {
      from: 'smtpB', to: 'b', label: pop ? 'POP3（110番）でダウンロード' : 'IMAP（143番）で閲覧',
      serverHasMail: !pop, pcHas: true, phoneHas: false,
      message: pop
        ? 'B さんのパソコンが POP3 でメールを受信します。POP3 はメールを端末にダウンロードし、通常はサーバから削除します。'
        : 'B さんのパソコンが IMAP でメールを見ます。IMAP はメールをサーバに置いたまま閲覧・管理します。',
    },
    {
      from: 'smtpB', to: 'phone', label: pop ? '新着なし' : '同じメールを閲覧', tone: pop ? 'focus' : 'done',
      serverHasMail: !pop, pcHas: true, phoneHas: !pop,
      message: pop
        ? 'B さんがスマートフォンでも受信しようとしますが、メールはパソコンにダウンロードされてサーバから消えているので、スマートフォンでは見られません。'
        : 'B さんがスマートフォンからも IMAP で接続すると、サーバに残っている同じメールを見られます。複数の端末で使うなら IMAP が便利です。',
    },
  ];
}

// ---------- ハブとスイッチ ----------
export type L2Device = 'hub' | 'switch';
export const HOSTS = ['A', 'B', 'C', 'D'] as const;
export type Host = (typeof HOSTS)[number];
export const MAC: Record<Host, string> = { A: 'AA', B: 'BB', C: 'CC', D: 'DD' };
export const PORT: Record<Host, number> = { A: 1, B: 2, C: 3, D: 4 };

export const TRANSMISSIONS: [Host, Host][] = [['A', 'C'], ['C', 'A'], ['A', 'C'], ['B', 'D'], ['D', 'B']];

export interface L2Step {
  index: number;
  from: Host | null;
  to: Host | null;
  /** フレームが届いたホスト */
  delivered: Host[];
  flooded: boolean;
  table: { mac: string; port: number }[];
  learned: string | null;
  message: string;
}

export function traceL2(device: L2Device): L2Step[] {
  const table = new Map<string, number>();
  const steps: L2Step[] = [{
    index: 0, from: null, to: null, delivered: [], flooded: false, table: [], learned: null,
    message: device === 'hub'
      ? 'ハブ（リピータハブ）は第1層の機器です。届いた信号を、宛先に関係なく他のすべてのポートへそのまま送ります。'
      : 'スイッチ（L2スイッチ）は第2層の機器です。MAC アドレステーブルを使って、宛先のポートにだけフレームを送ります。最初はテーブルが空です。',
  }];
  TRANSMISSIONS.forEach(([from, to], k) => {
    const others = HOSTS.filter(h => h !== from);
    let delivered: Host[];
    let flooded: boolean;
    let learned: string | null = null;
    let message: string;
    if (device === 'hub') {
      delivered = [...others];
      flooded = true;
      message = `${from} から ${to} 宛て（宛先 MAC ${MAC[to]}）のフレーム。ハブは ${others.join('・')} のすべてに送ります。` +
        `${others.filter(h => h !== to).join('・')} は自分宛てではないので捨てます。無駄な通信が増え、盗み見の危険もあります。`;
    } else {
      if (!table.has(MAC[from])) { table.set(MAC[from], PORT[from]); learned = MAC[from]; }
      const known = table.get(MAC[to]);
      if (known === undefined) {
        delivered = [...others];
        flooded = true;
        message = `${from} から ${to} 宛てのフレーム。` +
          (learned ? `スイッチは送信元 MAC ${MAC[from]} がポート${PORT[from]}にあることを学習しました。` : '') +
          `宛先 MAC ${MAC[to]} はまだテーブルにないので、送信元以外のすべてのポートへ送ります（フラッディング）。`;
      } else {
        delivered = [to];
        flooded = false;
        message = `${from} から ${to} 宛てのフレーム。` +
          (learned ? `送信元 MAC ${MAC[from]} がポート${PORT[from]}にあることを学習しました。` : '') +
          `宛先 MAC ${MAC[to]} はテーブルにポート${known}と登録済みなので、ポート${known}にだけ送ります。`;
      }
    }
    steps.push({
      index: k + 1, from, to, delivered, flooded, learned,
      table: [...table.entries()].map(([mac, port]) => ({ mac, port })), message,
    });
  });
  steps.push({
    ...steps[steps.length - 1], index: TRANSMISSIONS.length + 1,
    message: device === 'hub'
      ? 'ハブでは毎回すべてのポートにフレームが流れました。'
      : 'スイッチは通信するたびに送信元の MAC アドレスを学習し、学習後は宛先のポートにだけ送るようになりました。',
  });
  return steps;
}
