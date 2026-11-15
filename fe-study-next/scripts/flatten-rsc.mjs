// 静的書き出し（out/）の後処理: Next の先読み用 RSC ファイルを、ブラウザが要求するファイル名でも置く。
//
// Next 16 は `quiz/__next.quiz/__PAGE__.txt` のようにフォルダ分けして書き出すが、
// ブラウザは `quiz/__next.quiz.__PAGE__.txt` を取りに来るため 404 になり、リンク先の先読みが効かない。
// フォルダ内のファイルを「.」でつないだ名前で親フォルダにコピーする（既存ファイルは上書きしない）。
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../out/', import.meta.url));

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? filesUnder(join(dir, e.name)) : [join(dir, e.name)]
  );
}

let copied = 0;
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const sub = join(dir, e.name);
    if (e.name.startsWith('__next.')) {
      for (const file of filesUnder(sub)) {
        const flat = join(dir, `${e.name}.${relative(sub, file).split(sep).join('.')}`);
        if (!existsSync(flat)) {
          copyFileSync(file, flat);
          copied++;
        }
      }
    } else {
      walk(sub);
    }
  }
}

if (!existsSync(OUT)) {
  console.error(`flatten-rsc: ${OUT} がありません。先に next build を実行してください。`);
  process.exit(1);
}
walk(OUT);
console.log(`flatten-rsc: 先読み用ファイルを ${copied} 件追加しました`);
