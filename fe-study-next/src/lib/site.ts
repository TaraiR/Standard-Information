/**
 * サイトの公開 URL。canonical・OGP・sitemap・構造化データはすべてここを参照する。
 * ドメインを変えるときは、ビルド時の環境変数 NEXT_PUBLIC_SITE_URL を設定するか、既定値を書き換える。
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://standard-information.ryuma520123.workers.dev').replace(/\/+$/, '');

export const SITE_HOST = new URL(SITE_URL).host;
