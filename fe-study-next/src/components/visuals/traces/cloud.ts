/** クラウドのサービスモデル（管理範囲）と REST API の操作 */

export const LAYERS = ['アプリケーション', 'データ', 'ミドルウェア', 'OS', '仮想化', 'サーバ（ハードウェア）', 'ネットワーク・設備'] as const;
export type Model = 'onprem' | 'iaas' | 'paas' | 'saas';
export const MODEL_LABEL: Record<Model, string> = { onprem: 'オンプレミス', iaas: 'IaaS', paas: 'PaaS', saas: 'SaaS' };

/** 利用者が管理する層の数（上から）。残りは事業者が提供・管理する */
export const USER_MANAGES: Record<Model, number> = { onprem: 7, iaas: 4, paas: 2, saas: 1 };
// SaaS で利用者が管理するのは「データ（と設定・アクセス権）」。ここではデータ層だけを利用者側とする
export const userLayers = (m: Model): string[] =>
  m === 'saas' ? ['データ'] : LAYERS.slice(0, USER_MANAGES[m]) as unknown as string[];

export const MODEL_NOTE: Record<Model, string> = {
  onprem: '自社でサーバを買って設置し、ネットワーク・設備からアプリまですべて自分で管理します。',
  iaas: '仮想サーバ・ストレージ・ネットワークを借ります。OS から上（OS・ミドルウェア・データ・アプリ）は自分で管理します。例: AWS EC2',
  paas: 'OS やミドルウェアまで用意された開発・実行環境を借ります。自分で作るのはアプリとデータだけです。例: Google App Engine',
  saas: '完成したアプリをそのまま使います。利用者が管理するのはデータ（と設定・アクセス権）だけです。例: Gmail',
};

// ---------- REST API ----------
export interface Book { id: number; title: string }
export interface RestCall { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; body?: string }
export interface RestStep { call: RestCall | null; status: string; response: string; books: Book[]; changed: number | null; message: string }

export const CALLS: RestCall[] = [
  { method: 'GET', path: '/books' },
  { method: 'POST', path: '/books', body: 'アルゴリズム図鑑' },
  { method: 'GET', path: '/books/3' },
  { method: 'PUT', path: '/books/3', body: 'アルゴリズム図鑑 第2版' },
  { method: 'DELETE', path: '/books/1' },
  { method: 'GET', path: '/books/1' },
];

export function runRest(calls: RestCall[] = CALLS): RestStep[] {
  let books: Book[] = [{ id: 1, title: '基本情報の教科書' }, { id: 2, title: 'ネットワーク入門' }];
  let nextId = 3;
  const steps: RestStep[] = [{
    call: null, status: '', response: '', books: [...books], changed: null,
    message: 'REST API では、URL でリソース（ここでは本）を指定し、HTTP メソッドで操作の種類を表します。サーバには最初に2冊の本が登録されています。',
  }];
  for (const c of calls) {
    const m = /^\/books(?:\/(\d+))?$/.exec(c.path);
    const id = m?.[1] ? Number(m[1]) : null;
    const found = id !== null ? books.find(b => b.id === id) : undefined;
    let status = '';
    let response = '';
    let changed: number | null = null;
    let message = '';
    if (c.method === 'GET' && id === null) {
      status = '200 OK'; response = JSON.stringify(books.map(b => b.title));
      message = 'GET /books は一覧の取得です。データは変わりません。';
    } else if (c.method === 'GET') {
      if (found) { status = '200 OK'; response = found.title; message = `GET /books/${id} は ${id} 番の本の取得です。`; changed = id; }
      else { status = '404 Not Found'; response = '—'; message = `${id} 番の本はもう存在しないので 404 Not Found が返ります。`; }
    } else if (c.method === 'POST') {
      const b = { id: nextId++, title: c.body ?? '' };
      books = [...books, b];
      status = '201 Created'; response = `/books/${b.id}`; changed = b.id;
      message = `POST /books は新しい本の作成です。サーバが番号 ${b.id} を割り当て、201 Created を返します。`;
    } else if (c.method === 'PUT') {
      if (found) {
        books = books.map(b => (b.id === id ? { ...b, title: c.body ?? '' } : b));
        status = '200 OK'; response = c.body ?? ''; changed = id;
        message = `PUT /books/${id} は ${id} 番の本の更新（置き換え）です。`;
      } else { status = '404 Not Found'; response = '—'; message = '更新する本がありません。'; }
    } else {
      if (found) {
        books = books.filter(b => b.id !== id);
        status = '204 No Content'; response = '—';
        message = `DELETE /books/${id} は ${id} 番の本の削除です。成功すると 204 No Content（本文なし）が返ります。`;
      } else { status = '404 Not Found'; response = '—'; message = '削除する本がありません。'; }
    }
    steps.push({ call: c, status, response, books: [...books], changed, message });
  }
  return steps;
}
