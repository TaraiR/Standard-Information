/** セキュリティの基本概念・認証・バックアップ・ファイアウォールの判定ロジックと例題データ */

// ---------- CIA ----------
export type Cia = 'C' | 'I' | 'A';
export const CIA_LABEL: Record<Cia, string> = { C: '機密性', I: '完全性', A: '可用性' };
export const CIA_MEANS: Record<Cia, string> = {
  C: '暗号化・アクセス制御', I: 'ハッシュ・デジタル署名', A: '冗長化・バックアップ',
};

export const CIA_CASES: { text: string; answer: Cia; why: string }[] = [
  { text: '顧客名簿が外部に流出した', answer: 'C', why: '許可されていない人に情報が見られたので、機密性が損なわれました。' },
  { text: 'Web サイトの内容が書き換えられた', answer: 'I', why: '情報が正しくない状態に変えられたので、完全性が損なわれました。' },
  { text: 'DDoS 攻撃でサービスが使えなくなった', answer: 'A', why: '必要なときにシステムを使えないので、可用性が損なわれました。' },
  { text: '退職者のアカウントで社内文書が閲覧された', answer: 'C', why: '本来アクセスできない人が情報を見たので、機密性の問題です。' },
  { text: '振込金額のデータが誤って上書きされた', answer: 'I', why: 'データが正確でなくなったので、完全性の問題です。' },
  { text: 'ディスク故障でファイルサーバが停止した', answer: 'A', why: '必要なときに使えなくなったので、可用性の問題です。冗長化で防げます。' },
];

// ---------- リスク対応 ----------
export type RiskResponse = '回避' | '低減' | '移転' | '受容';
export type Level = 'high' | 'low';

/** 発生確率と影響度から、一般的な対応方針を選ぶ（リスクマトリクス） */
export function riskResponse(probability: Level, impact: Level): RiskResponse {
  if (probability === 'high' && impact === 'high') return '回避';
  if (probability === 'low' && impact === 'high') return '移転';
  if (probability === 'high' && impact === 'low') return '低減';
  return '受容';
}

export const RISK_CASES: { text: string; probability: Level; impact: Level; action: string }[] = [
  { text: '個人情報を大量に扱う新サービス。漏えいの可能性が高く、起きれば会社存続に関わる', probability: 'high', impact: 'high', action: 'サービスの提供自体をやめる' },
  { text: '大地震でデータセンターが被災する（めったに起きないが、起きれば損害は甚大）', probability: 'low', impact: 'high', action: 'サイバー保険・災害保険に加入する、外部に委託する' },
  { text: '社員がパッチを当て忘れた PC がウイルスに感染する（よく起きるが、被害は1台分）', probability: 'high', impact: 'low', action: 'パッチを自動適用する、セキュリティ教育をする' },
  { text: '社内掲示板の表示が一時的に崩れる（まれで、被害も小さい）', probability: 'low', impact: 'low', action: '対策費のほうが高いので、そのまま受け入れる' },
];

export const RESPONSE_NOTE: Record<RiskResponse, string> = {
  回避: 'リスクの原因そのものをなくす（その業務をやめる）',
  低減: '対策で発生確率や影響を小さくする',
  移転: '保険や外部委託で、損失を第三者に移す',
  受容: '対策せずに受け入れる（対策コストが損失より大きい場合）',
};

// ---------- 鍵の数 ----------
/** n 人が互いに共通鍵暗号で通信するときの鍵の数（全ペアに1本ずつ） */
export const symmetricKeys = (n: number) => (n * (n - 1)) / 2;
/** 公開鍵暗号なら各自が公開鍵と秘密鍵を1組ずつ */
export const publicKeys = (n: number) => 2 * n;

// ---------- 多要素認証 ----------
export type Factor = '知識' | '所持' | '生体';
export const AUTH_ITEMS: { label: string; factor: Factor }[] = [
  { label: 'パスワード', factor: '知識' },
  { label: '暗証番号（PIN）', factor: '知識' },
  { label: '秘密の質問の答え', factor: '知識' },
  { label: 'IC カード', factor: '所持' },
  { label: 'スマホに届くワンタイムパスワード', factor: '所持' },
  { label: '指紋', factor: '生体' },
  { label: '顔', factor: '生体' },
];

export function isMultiFactor(labels: string[]): boolean {
  const factors = new Set(labels.map(l => AUTH_ITEMS.find(a => a.label === l)!.factor));
  return factors.size >= 2;
}

// ---------- バックアップ ----------
export type BackupKind = 'full' | 'diff' | 'incr';
export const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
/** 各曜日に変更されたデータ量（GB）。日曜にフルバックアップを取る */
export const CHANGES = [0, 2, 3, 1, 4, 2, 3];
export const TOTAL_GB = 100;

export interface BackupDay { day: number; label: string; size: number; covers: number[] }

/** 日曜（0）から day 曜日までの毎日のバックアップと、それぞれが含む変更日を求める */
export function backupPlan(kind: BackupKind, upTo: number): BackupDay[] {
  const out: BackupDay[] = [{ day: 0, label: 'フル', size: TOTAL_GB, covers: [0] }];
  for (let d = 1; d <= upTo; d++) {
    if (kind === 'full') out.push({ day: d, label: 'フル', size: TOTAL_GB, covers: Array.from({ length: d + 1 }, (_, i) => i) });
    else if (kind === 'diff') {
      const covers = Array.from({ length: d }, (_, i) => i + 1);
      out.push({ day: d, label: '差分', size: covers.reduce((a, i) => a + CHANGES[i], 0), covers });
    } else out.push({ day: d, label: '増分', size: CHANGES[d], covers: [d] });
  }
  return out;
}

/** day 曜日の夜に障害が起きたとき、復元に必要なバックアップ（適用順） */
export function restoreSet(kind: BackupKind, failDay: number): number[] {
  if (kind === 'full' || failDay === 0) return [failDay];
  if (kind === 'diff') return [0, failDay];
  return Array.from({ length: failDay + 1 }, (_, i) => i);
}

// ---------- ファイアウォール（パケットフィルタリング） ----------
export type Zone = 'internet' | 'dmz' | 'lan';
export const ZONE_LABEL: Record<Zone, string> = { internet: 'インターネット', dmz: 'DMZ', lan: '社内LAN' };

export interface FwRule { no: number; from: Zone | '*'; to: Zone | '*'; port: number | '*'; action: 'allow' | 'deny'; note: string }
export const FW_RULES: FwRule[] = [
  { no: 1, from: 'internet', to: 'dmz', port: 443, action: 'allow', note: '公開 Web サーバ（HTTPS）' },
  { no: 2, from: 'internet', to: 'dmz', port: 25, action: 'allow', note: '公開メールサーバ（SMTP）' },
  { no: 3, from: 'lan', to: 'internet', port: 443, action: 'allow', note: '社員の Web 閲覧' },
  { no: 4, from: 'dmz', to: 'lan', port: 3306, action: 'allow', note: 'Web サーバ → 社内 DB' },
  { no: 5, from: '*', to: '*', port: '*', action: 'deny', note: 'それ以外はすべて拒否' },
];

export interface Packet { from: Zone; to: Zone; port: number; desc: string }
export const PACKETS: Packet[] = [
  { from: 'internet', to: 'dmz', port: 443, desc: '外部の人が公開 Web サイトを見る' },
  { from: 'internet', to: 'lan', port: 3306, desc: '外部から社内 DB に直接アクセスしようとする' },
  { from: 'dmz', to: 'lan', port: 3306, desc: 'Web サーバが社内 DB を参照する' },
  { from: 'lan', to: 'internet', port: 443, desc: '社員が外部の Web サイトを見る' },
  { from: 'internet', to: 'dmz', port: 22, desc: '外部から DMZ のサーバに SSH で入ろうとする' },
];

/** ルールを上から順に調べ、最初に一致したルールを適用する */
export function matchRule(p: Packet): FwRule {
  return FW_RULES.find(r => (r.from === '*' || r.from === p.from) && (r.to === '*' || r.to === p.to) && (r.port === '*' || r.port === p.port))!;
}
