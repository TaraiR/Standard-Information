export interface Question {
  id: number;
  question: string;
  choices: string[];
  answer: number; // 0-indexed
  explanation: string;
}

export interface Section {
  id: string;
  title: string;
  content: string; // markdown-like HTML string
  diagram?: string; // SVG or description key
  questions: Question[];
}

export interface Chapter {
  id: string;
  title: string;
  subject: 'A' | 'B';
  description: string;
  sections: Section[];
}

const baseChapters: Chapter[] = [
  {
    id: 'a1',
    title: '基礎理論',
    subject: 'A',
    description: '2進数・16進数・補数・論理演算・シフト演算・情報量など、ITの土台となる数学的基礎を徹底解説します。',
    sections: [
      {
        id: 'a1-1',
        title: '2進数・8進数・16進数の基本',
        content: `
<h3>なぜコンピュータは2進数を使うのか？</h3>
<p>私たちは普段10種類の数字（0〜9）を使う<strong>10進数</strong>で生活しています。では、なぜコンピュータは2進数を使うのでしょうか？</p>
<p>コンピュータの内部は数十億個の<strong>トランジスタ（電子スイッチ）</strong>でできています。このスイッチは「電流が流れる（ON）」か「流れない（OFF）」の2状態しか持てません。この2状態を <code>1</code> と <code>0</code> に対応させたものが<strong>2進数</strong>です。</p>
<p>3進数や10進数にしないのは、スイッチの状態が「少し流れる」という中間状態を正確に区別するのが難しく、エラーが起きやすいからです。2状態なら「流れる・流れない」だけで確実に判定できます。</p>

<h3>ビットとバイト</h3>
<p>2進数の1桁（0か1）を <strong>ビット（bit: binary digit の略）</strong> と呼びます。</p>
<p>8ビットをまとめたものを <strong>バイト（byte）</strong> と呼び、コンピュータが扱うデータの基本単位です。</p>
<p>なぜ8ビット？→ 英字・数字・記号を表すASCIIコードが7ビットで表現でき、余裕を持たせた8ビットが普及しました。</p>

<h3>基数変換の考え方</h3>
<p>「基数」とは「何種類の数字を使うか」という数のことです。</p>
<ul>
  <li><strong>10進数</strong>: 基数10。0〜9の10種類。日常生活で使う。</li>
  <li><strong>2進数</strong>: 基数2。0と1の2種類。コンピュータ内部。</li>
  <li><strong>8進数</strong>: 基数8。0〜7の8種類。Unixのファイルパーミッション等で使う。</li>
  <li><strong>16進数</strong>: 基数16。0〜9とA〜Fの16種類。2進数を短く書くため。</li>
</ul>

<h3>10進数 → 2進数への変換（割り算法）</h3>
<p>変換の手順：数を2で<strong>割り続けて、余りを下から読む</strong>だけです。</p>
<p><strong>例: 10進数の 45 を2進数に変換</strong></p>
<ul>
  <li>45 ÷ 2 = 22 … 余り <strong>1</strong> ← 最下位ビット（LSB）</li>
  <li>22 ÷ 2 = 11 … 余り <strong>0</strong></li>
  <li>11 ÷ 2 = 5  … 余り <strong>1</strong></li>
  <li>5 ÷ 2  = 2  … 余り <strong>1</strong></li>
  <li>2 ÷ 2  = 1  … 余り <strong>0</strong></li>
  <li>1 ÷ 2  = 0  … 余り <strong>1</strong> ← 最上位ビット（MSB）</li>
</ul>
<p>余りを<strong>下から上に</strong>読む → <code>101101</code>(2)</p>
<p>検算: 32+0+8+4+0+1 = <strong>45</strong> ✓</p>

<h3>2進数 → 10進数への変換（重み法）</h3>
<p>各桁の「重み（2の累乗）」を掛けて合計します。右端が2<sup>0</sup>=1、左に1桁ずれるごとに2倍になります。</p>
<pre>
  ビット列:   1    0    1    1
  桁の重み:  2³   2²   2¹   2⁰
             = 8  = 4  = 2  = 1

  計算: 1×8 + 0×4 + 1×2 + 1×1 = 8+0+2+1 = 11
</pre>
<p>コツ: <strong>1があるところだけ重みを足す</strong>（0のところは0なので無視できる）</p>

<h3>8進数とは（Unix・組み込みで登場）</h3>
<p>8進数は0〜7の8種類の数字を使います。8 = 2<sup>3</sup> なので、<strong>2進数3桁 = 8進数1桁</strong>が対応します。</p>
<p>Unixのファイルパーミッション（<code>chmod 755</code>の755など）がよく知られた例です。</p>
<p><strong>2進数 ↔ 8進数の変換</strong>：右から3ビットずつグループ化して対応する8進数の桁に変換します。</p>
<pre>
  2進数: 101 111 010
  8進数:  5   7   2  →  572(8)

  確認（10進数で）: 5×64 + 7×8 + 2×1 = 320+56+2 = 378
</pre>
<p><strong>8進数 → 10進数</strong>：各桁に8の累乗の重みを掛けて合計します。</p>
<pre>
  17(8) = 1×8¹ + 7×8⁰ = 8 + 7 = 15(10)
</pre>

<h3>2進数 ↔ 16進数の変換（最重要！）</h3>
<p>2進数4桁 = 16進数1桁という対応を使います。これが最もよく使う変換です。</p>
<p>理由：16 = 2<sup>4</sup> なので、4ビットがちょうど16進数1桁に対応します。</p>
<p><strong>変換表（必ず覚える）</strong></p>
<ul>
  <li>0000=0, 0001=1, 0010=2, 0011=3, 0100=4, 0101=5, 0110=6, 0111=7</li>
  <li>1000=8, 1001=9, 1010=A, 1011=B, 1100=C, 1101=D, 1110=E, 1111=F</li>
</ul>
<p><strong>例1: 2進数 → 16進数</strong></p>
<p><code>1010 1111</code>(2) → <code>1010</code>=A, <code>1111</code>=F → <code>AF</code>(16)</p>
<p><strong>例2: 16進数 → 2進数</strong></p>
<p><code>3C</code>(16) → 3=<code>0011</code>, C=<code>1100</code> → <code>0011 1100</code>(2)</p>
<p><strong>例3: 16進数 → 10進数</strong></p>
<p><code>2A</code>(16) = 2×16<sup>1</sup> + 10×16<sup>0</sup> = 32 + 10 = <strong>42</strong>(10)</p>

<h3>各進数の特徴まとめ</h3>
<table style="border-collapse:collapse;width:100%;font-size:13px">
  <thead>
    <tr style="background:var(--surface)">
      <th style="border:1px solid var(--border);padding:6px 10px">進数</th>
      <th style="border:1px solid var(--border);padding:6px 10px">使う数字</th>
      <th style="border:1px solid var(--border);padding:6px 10px">2進数との対応</th>
      <th style="border:1px solid var(--border);padding:6px 10px">主な用途</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid var(--border);padding:6px 10px">2進数</td><td style="border:1px solid var(--border);padding:6px 10px">0, 1</td><td style="border:1px solid var(--border);padding:6px 10px">—</td><td style="border:1px solid var(--border);padding:6px 10px">コンピュータ内部</td></tr>
    <tr><td style="border:1px solid var(--border);padding:6px 10px">8進数</td><td style="border:1px solid var(--border);padding:6px 10px">0〜7</td><td style="border:1px solid var(--border);padding:6px 10px">3桁 = 1桁</td><td style="border:1px solid var(--border);padding:6px 10px">Unixパーミッション</td></tr>
    <tr><td style="border:1px solid var(--border);padding:6px 10px">16進数</td><td style="border:1px solid var(--border);padding:6px 10px">0〜9, A〜F</td><td style="border:1px solid var(--border);padding:6px 10px">4桁 = 1桁</td><td style="border:1px solid var(--border);padding:6px 10px">メモリアドレス・色コード</td></tr>
  </tbody>
</table>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
16進数はプログラムやメモリアドレスの表記でよく出ます。<code>0x</code>で始まる表記（<code>0xFF</code>など）が16進数のサインです。A=10, B=11, C=12, D=13, E=14, F=15 は必ず覚えましょう。8進数はUnixパーミッションで登場します（<code>chmod 755</code> など）。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「余りを上から読む」ミスが多いです。必ず<strong>下から</strong>読みましょう。また、2進数→10進数の変換で「桁数を1から始める」人がいますが、右端は2<sup>0</sup>=1（2の0乗）です。8進数と16進数でグループ化するビット数（3桁 vs 4桁）を混同しないよう注意。
</div>
        `,
        diagram: 'binary',
        questions: [
          {
            id: 1,
            question: '10進数の 26 を2進数に変換したものはどれか。',
            choices: ['10110', '11010', '11001', '10011'],
            answer: 1,
            explanation: '26 ÷ 2 を繰り返すと余りが 0,1,0,1,1 → 下から読んで 11010 です。確認: 16+8+2=26 ✓',
          },
          {
            id: 2,
            question: '16進数の FF を10進数に変換したものはどれか。',
            choices: ['240', '255', '256', '128'],
            answer: 1,
            explanation: 'F=15 なので 15×16 + 15×1 = 240 + 15 = 255 です。',
          },
          {
            id: 101,
            question: '2進数の 1101 を10進数に変換したものはどれか。',
            choices: ['11', '12', '13', '14'],
            answer: 2,
            explanation: '1×8 + 1×4 + 0×2 + 1×1 = 8+4+0+1 = 13 です。',
          },
          {
            id: 102,
            question: '2進数 4桁で表せる最大の10進数はいくつか。',
            choices: ['8', '15', '16', '32'],
            answer: 1,
            explanation: '2進数4桁の最大値は 1111(2) = 8+4+2+1 = 15 です。n桁で表せる最大値は 2ⁿ-1 です。',
          },
          {
            id: 112,
            question: '2進数 101 111(2) を8進数に変換したものはどれか。',
            choices: ['47', '57', '67', '75'],
            answer: 1,
            explanation: '右から3ビットずつ区切ると 101 | 111。101(2)=5、111(2)=7 なので 57(8) です。',
          },
          {
            id: 113,
            question: '16進数の 2A を10進数に変換したものはどれか。',
            choices: ['32', '40', '42', '52'],
            answer: 2,
            explanation: '2×16¹ + A(=10)×16⁰ = 32 + 10 = 42 です。',
          },
        ],
      },
      {
        id: 'a1-2',
        title: '補数表現と負の数',
        content: `
<h3>コンピュータに「引き算」は存在しない！？</h3>
<p>実は、コンピュータのCPU（ALU）は<strong>引き算の回路を持っていません</strong>。すべての引き算を「足し算」に変換して処理します。</p>
<p>例えば <code>8 - 5</code> を計算したいとき、コンピュータは <code>8 + (-5)</code> として処理します。そのために「-5をどう表現するか」という問題が生じます。その解答が<strong>2の補数</strong>です。</p>

<h3>補数（ほすう）とは</h3>
<p>ある数に足すと「桁が1つ上がる数」のことです。</p>
<p>10進数で考えると：7の10の補数は 10-7=<strong>3</strong>（7+3=10で桁が上がる）</p>
<p>2進数の場合は<strong>2の補数</strong>を使います。</p>

<h3>2の補数の求め方（手順）</h3>
<p>例として <code>+5</code>（4ビット: 0101）の2の補数（= -5の表現）を求めます。</p>
<ol>
  <li><strong>全ビットを反転</strong>（0→1, 1→0）<br/><code>0101</code> → <code>1010</code>（これを「1の補数」と呼ぶ）</li>
  <li><strong>1を加える</strong><br/><code>1010</code> + <code>0001</code> = <code>1011</code></li>
</ol>
<p>答え: <code>1011</code>(2) が -5 を表します。</p>

<h3>確認：2の補数が正しいことを検証する</h3>
<p><code>0101</code>(+5) + <code>1011</code>(-5) = <code>10000</code> → 4ビットに収めると <code>0000</code>（= 0）</p>
<p>5 + (-5) = 0 になりました。正しい！</p>

<h3>2の補数で負の数を読む方法</h3>
<p><strong>MSB（最上位ビット）</strong>が 1 のとき負の数です。</p>
<p>2の補数表現 <code>1011</code> の値を求める：</p>
<ol>
  <li>ビット反転: <code>1011</code> → <code>0100</code></li>
  <li>1を加える: <code>0100</code> + 1 = <code>0101</code> = 5</li>
  <li>MSBが1だったので → <strong>-5</strong></li>
</ol>

<h3>符号付き整数の表現範囲</h3>
<p>nビットで表せる範囲は <code>-2<sup>n</sup>⁻¹ 〜 2<sup>n</sup>⁻¹ - 1</code> です。正と負が非対称なのは、0を正の側に含むためです。</p>
<ul>
  <li><strong>8ビット</strong>: -128 〜 127（最小値は 10000000、最大値は 01111111）</li>
  <li><strong>16ビット</strong>: -32,768 〜 32,767</li>
  <li><strong>32ビット</strong>: 約 -21億 〜 +21億</li>
</ul>

<h3>オーバーフロー</h3>
<p>計算結果が表現可能な範囲を超えることを<strong>オーバーフロー</strong>といいます。</p>
<p><strong>例（8ビット符号付き）</strong>: 127 + 1 = ?</p>
<p><code>01111111</code> + <code>00000001</code> = <code>10000000</code> → これは -128！</p>
<p>127の次が-128になってしまう。これがオーバーフローです。プログラムのバグの原因になります。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
「8ビット符号付きで表せる最小値は？」→ <strong>-128</strong>（= -2<sup>7</sup>）<br/>
「最大値は？」→ <strong>127</strong>（= 2<sup>7</sup>-1）<br/>
負の最大絶対値が正の最大値より1大きいことに注意。
</div>

<h3>2の補数を使った引き算の例</h3>
<p>コンピュータが <code>9 - 5</code> を計算する手順を実際に見てみましょう（4ビット）。</p>
<ol>
  <li>+5 = <code>0101</code> の2の補数（= -5）を求める: ビット反転 → <code>1010</code>、+1 → <code>1011</code></li>
  <li>9(<code>1001</code>) + (-5)(<code>1011</code>) = <code>10100</code></li>
  <li>4ビットに収めると <code>0100</code> = 4 ✓（5ビット目の繰り上がりは無視）</li>
</ol>
<p>このように、引き算を「負数の足し算」に置き換えることで、CPUは加算回路だけで引き算を実現しています。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
「8ビット符号付きで表せる最小値は？」→ <strong>-128</strong>（= -2<sup>7</sup>）<br/>
「最大値は？」→ <strong>127</strong>（= 2<sup>7</sup>-1）<br/>
負の最大絶対値が正の最大値より1大きいことに注意。MSB（最上位ビット）が1なら負の数。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「-128の2の補数は何か？」という問題。-128は8ビットで <code>10000000</code>。これをビット反転+1すると <code>10000000</code> に戻ります（オーバーフロー）。-128の絶対値は8ビット符号付きでは表現できません。
</div>
        `,
        diagram: 'complement',
        questions: [
          {
            id: 103,
            question: '8ビットの符号付き2進数で表せる最小値はどれか。',
            choices: ['-255', '-128', '-127', '0'],
            answer: 1,
            explanation: 'nビット符号付きの最小値は -2^(n-1) です。8ビットなら -2^7 = -128 です。',
          },
          {
            id: 104,
            question: '2進数 0101(+5) の2の補数はどれか。',
            choices: ['1010', '1011', '0110', '1001'],
            answer: 1,
            explanation: 'ビット反転(0101→1010)して1を加える(1010+1=1011)。よって1011が-5を表します。',
          },
          {
            id: 114,
            question: '8ビット符号付き2進数 10000001 が表す10進数の値はどれか。',
            choices: ['-1', '-127', '129', '-129'],
            answer: 1,
            explanation: 'MSBが1なので負の数。2の補数を求める: ビット反転(01111110)+1 = 01111111 = 127。よって -127 です。',
          },
          {
            id: 115,
            question: '16ビット符号付き整数で表せる正の最大値はどれか。',
            choices: ['32767', '32768', '65535', '65536'],
            answer: 0,
            explanation: '16ビット符号付きの最大値は 2^15 - 1 = 32768 - 1 = 32767 です。',
          },
          {
            id: 116,
            question: '符号付き8ビット整数で 127 + 1 を計算したとき、結果はどうなるか。',
            choices: ['128', '-128', '0', '-1'],
            answer: 1,
            explanation: '127(01111111) + 1(00000001) = 10000000(2) = -128 となります。これが整数オーバーフローです。',
          },
        ],
      },
      {
        id: 'a1-3',
        title: '論理演算とシフト演算',
        content: `
<h3>論理演算とは</h3>
<p>論理演算は「真（1）・偽（0）」の値に対して行う演算です。コンピュータのすべての処理は、最終的にこの論理演算の組み合わせで実現されています。プログラムの条件分岐・ビット操作・ハードウェア設計に欠かせません。</p>

<h3>AND（論理積）— 「かつ」</h3>
<p><strong>両方が1のときだけ1</strong>になります。「条件Aかつ条件Bを満たす」という絞り込みに相当します。</p>
<p>実用例：特定ビットだけを抽出する「<strong>マスク演算</strong>」</p>
<pre>
  値:     1010 1111
  マスク: 0000 1111  （下位4ビットだけ取り出したい）
  AND:    0000 1111  ← 下位4ビットだけ残る
</pre>

<h3>OR（論理和）— 「または」</h3>
<p><strong>どちらか一方でも1なら1</strong>になります。特定ビットを1にセットする操作に使います。</p>
<pre>
  値:     1010 0000
  マスク: 0000 1111  （下位4ビットを全て1にしたい）
  OR:     1010 1111  ← 下位4ビットが全て1になった
</pre>

<h3>NOT（否定）— 「でない」</h3>
<p>0と1を<strong>反転</strong>します。全ビット反転（ビット反転）に使います。</p>
<p>NOT 1010 = 0101</p>

<h3>XOR（排他的論理和）— 「どちらか一方だけ」</h3>
<p><strong>2つの値が異なるとき1、同じとき0</strong>になります。</p>
<p>重要な性質：<code>A XOR A = 0</code>（同じ値でXORすると必ず0）</p>
<p>実用例：暗号化・チェックサム・差分検出</p>
<pre>
  A XOR B XOR B = A  ← 同じ鍵で2回XORすると元に戻る（簡易暗号）
</pre>

<h3>ド・モルガンの法則</h3>
<p>論理式を変形する重要な法則です。試験に頻出。</p>
<ul>
  <li><code>NOT(A AND B) = NOT(A) OR NOT(B)</code></li>
  <li><code>NOT(A OR B) = NOT(A) AND NOT(B)</code></li>
</ul>
<p>覚え方：NOTを中に入れると AND⇔OR が入れ替わる。</p>
<p>例：「AかつBでない」= 「Aでない、またはBでない」</p>

<h3>シフト演算</h3>
<p>ビット列を左右にずらす演算です。<strong>掛け算・割り算を高速に行う</strong>ためにCPUが活用します。</p>
<ul>
  <li><strong>左シフト（&lt;&lt;）n ビット</strong>: 元の値 × 2<sup>n</sup></li>
  <li><strong>右シフト（&gt;&gt;）n ビット</strong>: 元の値 ÷ 2<sup>n</sup>（整数部分）</li>
</ul>
<pre>
  例: 3（= 0011）を2ビット左シフト
  0011 → 1100（= 12 = 3 × 4 = 3 × 2<sup>2</sup>）

  例: 20（= 10100）を2ビット右シフト
  10100 → 00101（= 5 = 20 ÷ 4 = 20 ÷ 2<sup>2</sup>）
</pre>

<h3>NAND と NOR（論理ゲートの基本）</h3>
<p>ANDやORを反転させた演算で、ハードウェア設計の基本要素です。</p>
<p><strong>NAND（NOT AND）</strong>: ANDの結果を反転。「両方1のときだけ0、それ以外は1」</p>
<p>重要な性質: NANDだけですべての論理演算を実現できる（<strong>汎用ゲート</strong>）。実際のIC設計ではNANDゲートが最も多用されます。</p>
<p><strong>NOR（NOT OR）</strong>: ORの結果を反転。「どちらかが1なら0、両方0のときだけ1」</p>
<p>NORも同様に汎用ゲートです。</p>

<table style="border-collapse:collapse;font-size:13px;margin:12px 0">
  <thead>
    <tr style="background:var(--surface)">
      <th style="border:1px solid var(--border);padding:6px 12px">A</th>
      <th style="border:1px solid var(--border);padding:6px 12px">B</th>
      <th style="border:1px solid var(--border);padding:6px 12px">AND</th>
      <th style="border:1px solid var(--border);padding:6px 12px">OR</th>
      <th style="border:1px solid var(--border);padding:6px 12px">XOR</th>
      <th style="border:1px solid var(--border);padding:6px 12px">NAND</th>
      <th style="border:1px solid var(--border);padding:6px 12px">NOR</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>1</strong></td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>1</strong></td></tr>
    <tr><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>1</strong></td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>0</strong></td></tr>
    <tr><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>1</strong></td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>0</strong></td></tr>
    <tr><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">1</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center">0</td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>0</strong></td><td style="border:1px solid var(--border);padding:6px 12px;text-align:center"><strong>0</strong></td></tr>
  </tbody>
</table>

<h3>算術シフトと論理シフト</h3>
<p><strong>論理シフト</strong>: 符号を考慮せず、ずれた部分に0を補う。符号なし整数向け。</p>
<p><strong>算術シフト</strong>: 右シフト時に符号ビット（MSB）を保持したまま補う。符号付き整数向け。</p>
<pre>
  -4（= 11111100）を1ビット算術右シフト
  11111100 → 11111110（= -2）← 符号ビット(1)を保持
  -4 ÷ 2 = -2 ✓
</pre>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
ド・モルガンの法則は毎回必ず出ます。「NOT(A AND B)」を見たら即座に「NOT(A) OR NOT(B)」と変換できるようにしましょう。シフト演算は「左nビット = ×2<sup>n</sup>」「右nビット = ÷2<sup>n</sup>」を丸暗記。NANDは「両方1のときだけ0」が特徴です。
</div>
        `,
        diagram: 'logic',
        questions: [
          {
            id: 3,
            question: 'A=1, B=0 のとき、A AND B の結果はどれか。',
            choices: ['0', '1', '2', '-1'],
            answer: 0,
            explanation: 'ANDは両方が1のときだけ1です。Bが0なので結果は0です。',
          },
          {
            id: 4,
            question: 'A=1, B=0 のとき、A XOR B の結果はどれか。',
            choices: ['0', '1', '-1', '2'],
            answer: 1,
            explanation: 'XORは2値が異なるとき1です。A=1, B=0 は異なるので結果は1です。',
          },
          {
            id: 105,
            question: '10進数の 3 を2ビット左シフトした結果はどれか。',
            choices: ['6', '9', '12', '24'],
            answer: 2,
            explanation: '左シフト2ビットは ×2² = ×4 です。3 × 4 = 12 です。',
          },
          {
            id: 106,
            question: 'NOT(A AND B) と同じ論理式はどれか（ド・モルガンの法則）。',
            choices: ['NOT(A) AND NOT(B)', 'NOT(A) OR NOT(B)', 'A OR B', 'A AND B'],
            answer: 1,
            explanation: 'ド・モルガンの法則: NOT(A AND B) = NOT(A) OR NOT(B) です。',
          },
          {
            id: 117,
            question: 'A=1, B=1 のとき、A NAND B の結果はどれか。',
            choices: ['0', '1', '2', '-1'],
            answer: 0,
            explanation: 'NANDはANDの反転です。A AND B = 1 なので NAND = NOT(1) = 0 です。両方が1のときだけ0になります。',
          },
          {
            id: 118,
            question: '符号付き8ビット整数 11110000 を1ビット算術右シフトした結果はどれか。',
            choices: ['01111000', '11111000', '00111100', '10111000'],
            answer: 1,
            explanation: '算術右シフトは符号ビット（MSB=1）を保持します。11110000 → 11111000 です。これは -16 → -8 に相当します。',
          },
        ],
      },
      {
        id: 'a1-4',
        title: '浮動小数点数と誤差',
        content: `
<h3>コンピュータで小数を表すのはなぜ難しいのか</h3>
<p>整数は2進数で正確に表現できます。しかし小数は難しいです。例えば <code>0.1</code> を2進数で表すと <code>0.0001100110011...</code> と<strong>循環小数</strong>になってしまい、有限のビット数では正確に表現できません。</p>
<p>これがプログラムで <code>0.1 + 0.2</code> を計算すると <code>0.30000000000000004</code> になる理由です。</p>

<h3>浮動小数点数の仕組み</h3>
<p>非常に大きな数や小さな数を表現するため、科学的記数法（例: 3.14 × 10²）に相当する方式を使います。</p>
<p>表現形式: <code>± 1.仮数部 × 2^指数部</code></p>
<p>例: 10進数の 6.5 = 1.101 × 2<sup>2</sup>（2進数で表すと1.101で指数部は2）</p>

<h3>IEEE 754 単精度（32ビット）の構造</h3>
<ul>
  <li><strong>符号部（1ビット）</strong>: 0=正、1=負</li>
  <li><strong>指数部（8ビット）</strong>: 実際の指数 + 127（バイアス表現）</li>
  <li><strong>仮数部（23ビット）</strong>: 1.xxxの小数点以下のビット列</li>
</ul>
<p>倍精度（double）は64ビットで、符号1+指数11+仮数52の構成です。より精度が高い。</p>

<h3>浮動小数点数の誤差の種類</h3>
<p>誤差には複数の種類があります。試験では名前と意味の対応が問われます。</p>

<p><strong>① 丸め誤差（最も一般的）</strong></p>
<p>有限ビット数で表現するため、小数点以下を切り捨て・切り上げ・四捨五入した際に生じる誤差。</p>
<p>例: 1/3 = 0.333... → 0.33 に丸める → 誤差が発生</p>

<p><strong>② 桁落ち（ひきざんに注意）</strong></p>
<p>値が<strong>近い2数の差</strong>を計算すると、上位桁が打ち消し合って<strong>有効桁数が大幅に減少</strong>する誤差。</p>
<p>例: 1.2345678 - 1.2345671 = 0.0000007（有効桁数が7→1桁に激減）</p>

<p><strong>③ 情報落ち</strong></p>
<p>絶対値が<strong>大きく異なる</strong>2数を足すと、小さい数の情報が失われる誤差。</p>
<p>例: 1,000,000 + 0.000001 → 浮動小数点では 1,000,000 のまま（0.000001が消える）</p>

<p><strong>④ オーバーフロー・アンダーフロー</strong></p>
<p><strong>オーバーフロー</strong>: 表現できる最大値を超える（∞になる）</p>
<p><strong>アンダーフロー</strong>: 表現できる最小値より小さくなる（0になる）</p>

<h3>特殊な値（IEEE 754）</h3>
<p>IEEE 754では通常の数値以外に特殊な値が定義されています。</p>
<ul>
  <li><strong>+∞ / -∞（無限大）</strong>: ゼロ除算（1.0 ÷ 0.0）の結果など</li>
  <li><strong>NaN（Not a Number）</strong>: 0 ÷ 0 や √-1 など、数値として意味をなさない計算結果</li>
  <li><strong>+0 と -0</strong>: 符号ビットが異なる2種類のゼロが存在する（計算結果は同じ）</li>
</ul>

<h3>誤差を減らす工夫</h3>
<p>桁落ちを回避するには、<strong>引き算の前に式を変形</strong>することが有効です。</p>
<p>例: √(x+1) - √x は x が大きいと桁落ちが起きます。</p>
<p>変形: √(x+1) - √x = 1 / (√(x+1) + √x) として計算すると桁落ちを回避できます。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
誤差の種類は名前と説明の対応を確実に覚えましょう。<br/>
・<strong>丸め誤差</strong>: 有限桁で表現する際の切り捨て/切り上げ<br/>
・<strong>桁落ち</strong>: 近い値の差 → 有効桁数が激減<br/>
・<strong>情報落ち</strong>: 大きさが極端に違う数の加算 → 小さい値が消える<br/>
・<strong>打ち切り誤差</strong>: 無限級数を有限項で打ち切ることで生じる誤差
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「桁落ち」と「情報落ち」を混同しやすいです。桁落ちは<strong>差（引き算）</strong>、情報落ちは<strong>和（足し算）</strong>で起きると覚えると区別しやすいです。また 0.1 + 0.2 ≠ 0.3 になる原因は「丸め誤差」です。
</div>
        `,
        diagram: 'floatingpoint',
        questions: [
          {
            id: 107,
            question: '浮動小数点数で、値が近い2数の差を求めたとき有効桁数が減る誤差を何というか。',
            choices: ['丸め誤差', '桁落ち', '情報落ち', 'オーバーフロー'],
            answer: 1,
            explanation: '桁落ちは値が近い数同士の差を取ったとき、上位桁が打ち消し合って有効桁数が減少する現象です。',
          },
          {
            id: 108,
            question: 'IEEE 754の単精度浮動小数点数は何ビットか。',
            choices: ['16', '32', '64', '128'],
            answer: 1,
            explanation: 'IEEE 754の単精度（float）は32ビット（符号1+指数8+仮数23）、倍精度（double）は64ビットです。',
          },
          {
            id: 119,
            question: '浮動小数点演算で 1,000,000 + 0.000001 を計算したとき、0.000001 の情報が失われてしまう誤差を何というか。',
            choices: ['桁落ち', '丸め誤差', '情報落ち', '打ち切り誤差'],
            answer: 2,
            explanation: '情報落ちは、絶対値が大きく異なる数同士を加算したとき、小さい方の数の情報が失われる誤差です。',
          },
          {
            id: 120,
            question: 'IEEE 754 倍精度浮動小数点数（double）の構成として正しいものはどれか。',
            choices: [
              '符号1ビット + 指数部8ビット + 仮数部23ビット',
              '符号1ビット + 指数部11ビット + 仮数部52ビット',
              '符号1ビット + 指数部8ビット + 仮数部55ビット',
              '符号2ビット + 指数部11ビット + 仮数部51ビット',
            ],
            answer: 1,
            explanation: 'IEEE 754 倍精度（64ビット）は 符号1 + 指数11 + 仮数52 の構成です。単精度は 符号1 + 指数8 + 仮数23（32ビット）。',
          },
          {
            id: 121,
            question: '浮動小数点演算で 0 ÷ 0 を計算した結果として IEEE 754 で定義されている値はどれか。',
            choices: ['0', '∞（無限大）', 'NaN', 'エラーで計算不能'],
            answer: 2,
            explanation: 'IEEE 754 では 0÷0 のような不定形の計算結果は NaN（Not a Number）として定義されています。1÷0 は ±∞ です。',
          },
        ],
      },
      {
        id: 'a1-5',
        title: '情報量とエンコーディング',
        content: `
<h3>データの単位</h3>
<p>コンピュータが扱うデータの大きさを表す単位です。1KB = 1000バイト（SI単位）と混同しやすいですが、<strong>コンピュータの世界では1KB = 1,024バイト</strong>（2<sup>10</sup>）です。</p>
<ul>
  <li><strong>1 bit</strong>: 0か1の1桁。情報の最小単位。</li>
  <li><strong>1 byte = 8 bit</strong>: 英字1文字を表せる。</li>
  <li><strong>1 KB = 1,024 B = 2<sup>10</sup> B</strong>: 短いテキストファイル程度。</li>
  <li><strong>1 MB = 1,024 KB = 2<sup>20</sup> B</strong>: 写真1枚・音楽1曲程度。</li>
  <li><strong>1 GB = 1,024 MB = 2<sup>30</sup> B</strong>: 動画10〜20分程度。</li>
  <li><strong>1 TB = 1,024 GB = 2<sup>40</sup> B</strong>: HDD/SSDの容量単位。</li>
</ul>

<h3>データ容量の計算（頻出！）</h3>
<p>試験でよく出る計算パターンを練習しましょう。</p>

<p><strong>パターン1: テキストデータ</strong></p>
<p>「1文字3バイトのUTF-8で500文字のテキスト」→ 500 × 3 = <strong>1,500バイト</strong></p>

<p><strong>パターン2: 画像データ</strong></p>
<p>「解像度1920×1080、1ピクセル24ビット（RGB各8ビット）の非圧縮画像」</p>
<p>1920 × 1080 × 24 ÷ 8 = 1920 × 1080 × 3 = <strong>約6.2MB</strong></p>

<p><strong>パターン3: 音声データ</strong></p>
<p>「サンプリング周波数44,100Hz、16ビット、ステレオで60秒」</p>
<p>44,100 × 16 ÷ 8 × 2（ステレオ）× 60 = <strong>約10.1MB</strong></p>

<h3>文字コードとは</h3>
<p>コンピュータは文字を直接扱えません。「A = 65」のように<strong>文字に番号を割り当てた対応表</strong>が文字コードです。</p>

<p><strong>ASCII（アスキー）</strong></p>
<p>最も基本的な文字コード。英数字・記号を<strong>7ビット（128文字）</strong>で表現。A=65, a=97, 0=48。日本語は含まない。</p>

<p><strong>Unicode（ユニコード）とUTF-8</strong></p>
<p>世界中のすべての文字を1つの体系で扱う規格が<strong>Unicode</strong>。その符号化方式が<strong>UTF-8</strong>です。</p>
<ul>
  <li>英字（ASCII互換）: <strong>1バイト</strong></li>
  <li>ひらがな・カタカナ・漢字: <strong>3バイト</strong></li>
  <li>絵文字: <strong>4バイト</strong></li>
</ul>
<p>現在のWebの事実上の標準。HTMLやJSONはUTF-8が推奨。</p>

<p><strong>Shift_JIS</strong></p>
<p>日本語対応の文字コード。主にWindowsのレガシーシステムで使用。ASCII文字は1バイト、日本語は2バイト。文字化けの原因になりやすい。</p>

<h3>データ圧縮の基本</h3>
<p>データを小さくすることを<strong>圧縮</strong>といいます。大きく2種類に分かれます。</p>

<p><strong>可逆圧縮（ロスレス圧縮）</strong></p>
<p>圧縮前のデータを完全に復元できる方式です。テキスト・プログラム・表計算データなど、<strong>情報を一切失えないデータ</strong>に使います。</p>
<ul>
  <li>ZIP・PNG・GIF・FLAC などが可逆圧縮</li>
  <li>ハフマン符号化・ランレングス符号化などのアルゴリズムを使用</li>
</ul>

<p><strong>非可逆圧縮（ロッシー圧縮）</strong></p>
<p>人間が気づきにくい情報を削除することで高い圧縮率を実現します。<strong>完全な復元はできません</strong>が、画像・音声・動画など知覚データに向いています。</p>
<ul>
  <li>JPEG・MP3・AAC・H.264/H.265 などが非可逆圧縮</li>
</ul>

<p><strong>ランレングス符号化（RLE）の例</strong></p>
<p>同じ値の連続を「値×回数」で表す最もシンプルな可逆圧縮です。</p>
<pre>
  元データ: AAABBBBBCCDDDDDD
  圧縮後:   A3 B5 C2 D6  （大幅に短縮）
</pre>
<p>白黒2値画像やFAXデータに特に有効です。</p>

<h3>主な画像ファイル形式（頻出！）</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">形式</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">圧縮</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">色数</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">特徴・用途</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>JPEG</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">非可逆</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">約1,677万色</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">写真・グラデーションに最適。保存のたびに画質劣化。</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>PNG</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">可逆</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">フルカラー</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">透過（アルファチャンネル）対応。Web画像・イラストに適す。何度保存しても劣化なし。</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>GIF</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">可逆</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">最大256色</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">アニメーション対応。色数制限あり。単純な図・アイコン向き。</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>BMP</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">無圧縮</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">フルカラー</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">Windowsの標準形式。圧縮しないためファイルサイズが大きい。</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>SVG</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">ベクター</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">制限なし</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">拡大縮小しても劣化しないXMLベースの形式。ロゴ・アイコン向き。</td>
  </tr>
</table>

<h3>動画・音声の主なファイル形式</h3>
<ul>
  <li><strong>MP4 / H.264（H.265）</strong>: 現在の動画の主流。非可逆圧縮で高圧縮・高品質。</li>
  <li><strong>MPEG-2</strong>: DVDや地デジ放送で使用される動画規格。</li>
  <li><strong>MP3</strong>: 音声の非可逆圧縮形式。人間が聞き取りにくい音域を削除して圧縮。</li>
  <li><strong>AAC</strong>: MP3より高品質な音声圧縮。スマートフォンや配信サービスで主流。</li>
  <li><strong>WAV / FLAC</strong>: 非圧縮・可逆圧縮の音声形式。音楽制作・マスタリング用。</li>
</ul>

<h3>サンプリングと標本化定理</h3>
<p>アナログ音声をデジタル化する際、一定時間ごとに値を取り出す操作を<strong>標本化（サンプリング）</strong>といいます。</p>
<p><strong>標本化定理（ナイキスト定理）</strong>: 元の信号の最高周波数の<strong>2倍以上</strong>のサンプリング周波数が必要です。</p>
<p>CDの音楽は最高20,000Hzの音を収録するため、44,100Hz（44.1kHz）でサンプリングしています（20,000×2 = 40,000Hz 以上を満たす）。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
データ容量計算は「ピクセル数 × ビット深度 ÷ 8」の公式を覚えましょう。1KB=1000Bではなく<strong>1KB=1024B</strong>（2の10乗）です。圧縮は「可逆（ZIP/PNG）」と「非可逆（JPEG/MP3）」を区別。テキスト・プログラムには可逆圧縮、画像・音声には非可逆も使えます。<br/>
画像形式: JPEG=非可逆・写真向き、PNG=可逆・透過対応、GIF=可逆・256色・アニメーション対応、BMP=無圧縮・大容量。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「UTF-8で日本語1文字=2バイト」は誤りです。UTF-8での日本語（ひらがな・漢字）は<strong>3バイト</strong>です。Shift_JISが2バイトなので混同しないよう注意。また JPEG は非可逆圧縮なので、保存を繰り返すたびに画質が劣化します。
</div>
        `,
        diagram: 'datasize',
        questions: [
          {
            id: 109,
            question: '1 MBは何バイトか。',
            choices: ['1,000バイト', '1,024バイト', '1,048,576バイト', '1,000,000バイト'],
            answer: 2,
            explanation: '1 MB = 2²⁰ byte = 1,024 × 1,024 = 1,048,576バイトです。SI単位（10⁶）と混同しないよう注意。',
          },
          {
            id: 110,
            question: 'Webページの文字エンコーディングとして現在最も広く使われているものはどれか。',
            choices: ['ASCII', 'Shift_JIS', 'UTF-8', 'EUC-JP'],
            answer: 2,
            explanation: 'UTF-8はUnicodeの符号化方式で、世界中の文字を表現でき、現在のWebの標準文字コードです。',
          },
          {
            id: 111,
            question: '1文字を3バイトで表す文字コードを使用したとき、500文字のデータは何バイトか。',
            choices: ['500', '1,000', '1,500', '2,000'],
            answer: 2,
            explanation: '500文字 × 3バイト/文字 = 1,500バイトです。',
          },
          {
            id: 122,
            question: '圧縮後のデータを元の状態に完全に復元できる圧縮方式はどれか。',
            choices: ['JPEG', 'MP3', 'H.264', 'PNG'],
            answer: 3,
            explanation: 'PNGは可逆圧縮（ロスレス）形式です。JPEG・MP3・H.264はいずれも非可逆圧縮（ロッシー）で、元のデータを完全には復元できません。',
          },
          {
            id: 123,
            question: 'CD音質の音声データ（サンプリング周波数44,100Hz、16ビット、ステレオ）の1秒あたりのデータ量は何バイトか。',
            choices: ['44,100バイト', '88,200バイト', '176,400バイト', '352,800バイト'],
            answer: 2,
            explanation: '44,100サンプル/秒 × 16ビット/サンプル ÷ 8ビット/バイト × 2チャネル（ステレオ）= 44,100 × 2 × 2 = 176,400バイトです。',
          },
        ],
      },
    ],
  },
  {
    id: 'a2',
    title: 'コンピュータの構成',
    subject: 'A',
    description: 'CPU・メモリ階層・命令実行サイクル・入出力など、コンピュータの仕組みを深く学びます。',
    sections: [
      {
        id: 'a2-1',
        title: 'コンピュータの5大装置',
        content: `
<h3>コンピュータの設計思想：フォン・ノイマン型</h3>
<p>現代のコンピュータは1940年代に数学者ジョン・フォン・ノイマンが提唱した「<strong>プログラム内蔵方式（ストアードプログラム方式）</strong>」に基づいています。データとプログラム（命令）を<strong>同じメモリ</strong>に格納し、CPUが順番に命令を読み出して実行するという考え方です。スマートフォンからスーパーコンピュータまで、この基本設計は変わっていません。</p>

<p>これ以前の計算機はプログラムをハードウェアの配線で表現していたため、別の計算をするには物理的な配線を変更する必要がありました。フォン・ノイマン型ではプログラムをデータとして書き換えるだけで別の処理ができ、<strong>汎用コンピュータ</strong>が実現しました。</p>

<h3>5大装置の役割と関係</h3>
<p>どんな複雑なコンピュータも、本質的に5つの装置で構成されています。</p>
<ul>
  <li><strong>制御装置</strong>: プログラムの命令を1つずつ読み解き、他の4つの装置に「何をすべきか」を指示する「司令塔」。楽団の指揮者に例えられます。</li>
  <li><strong>演算装置（ALU）</strong>: 四則演算・論理演算・比較演算を実行する。制御装置の指示を受けて実際に計算します。</li>
  <li><strong>記憶装置</strong>: データとプログラムを保存する。主記憶（RAM）と補助記憶（HDD/SSD）に分類。</li>
  <li><strong>入力装置</strong>: 人間や外部からデータを取り込む（キーボード・マウス・カメラ・マイク等）。</li>
  <li><strong>出力装置</strong>: 処理結果を外部に出力する（ディスプレイ・プリンタ・スピーカ等）。</li>
</ul>
<p>制御装置 + 演算装置 = <strong>CPU（Central Processing Unit：中央処理装置）</strong></p>

<h3>CPUの内部レジスタ</h3>
<p>CPUはメインメモリより遥かに高速な「レジスタ」という記憶素子を内部に持ちます。アクセス時間は1ナノ秒以下で、メインメモリの100倍以上高速です。</p>
<ul>
  <li><strong>プログラムカウンタ（PC）</strong>: 次に実行する命令のアドレスを格納。命令を実行するたびに自動的にインクリメント（増加）される。</li>
  <li><strong>命令レジスタ（IR）</strong>: 現在実行中の命令（フェッチした命令）を一時保持。</li>
  <li><strong>アキュムレータ（ACC）</strong>: 演算の入力・出力を保持するレジスタ。「累算器」とも呼ぶ。</li>
  <li><strong>汎用レジスタ</strong>: プログラムが自由に使える複数のレジスタ。中間結果の保存などに使用。</li>
  <li><strong>フラグレジスタ（状態レジスタ）</strong>: 演算結果の状態ビットを格納。ゼロフラグ・キャリーフラグ・オーバーフローフラグなど。条件分岐の判断に使う。</li>
  <li><strong>MAR（メモリアドレスレジスタ）</strong>: CPUがメモリにアクセスする際、読み書きするアドレスを一時保持。</li>
  <li><strong>MDR（メモリデータレジスタ）</strong>: メモリから読み出したデータ、またはメモリへ書き込むデータを一時保持。</li>
</ul>

<h3>主記憶（RAM）・ROM・補助記憶の違い</h3>
<p><strong>主記憶（RAM: Random Access Memory）</strong></p>
<p>CPUが直接アクセスできる「作業台」です。プログラム実行中はRAM上にデータが展開されます。電源を切るとデータが消える<strong>揮発性</strong>メモリ。現在のPCは8〜64GB程度。</p>

<p><strong>ROM（Read Only Memory）</strong></p>
<p>読み出し専用の<strong>不揮発性</strong>メモリ。電源を切ってもデータが保持される。PCのBIOS/UEFI（コンピュータ起動時の初期化プログラム）やスマートフォンのファームウェアに使用。フラッシュROMは書き換え可能な不揮発性メモリで、USBメモリ・SSD・SDカードに使われている。</p>

<p><strong>補助記憶（HDD/SSD）</strong></p>
<p>大容量・不揮発性のストレージ。主記憶より1000〜100000倍遅いが、電源オフでも保持。OSやアプリの「保存」先。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
「CPUに含まれる装置は？」→ 制御装置と演算装置（ALU）の2つ。記憶装置はCPUの外。<br/>
「電源オフでデータが消える」→ RAM（揮発性）。「電源オフでも残る」→ ROM・HDD・SSD（不揮発性）。<br/>
「フォン・ノイマン型の特徴」→ プログラム内蔵方式（データと命令を同じメモリに格納）。
</div>
        `,
        diagram: 'cpu',
        questions: [
          {
            id: 5,
            question: 'CPUに含まれる装置の組み合わせとして正しいものはどれか。',
            choices: ['制御装置と演算装置', '制御装置と記憶装置', '演算装置と入力装置', '記憶装置と出力装置'],
            answer: 0,
            explanation: 'CPUは制御装置（命令解読）と演算装置（ALU）を合わせたものです。',
          },
          {
            id: 6,
            question: '電源を切るとデータが消える記憶装置はどれか。',
            choices: ['HDD', 'SSD', 'RAM', 'ROM'],
            answer: 2,
            explanation: 'RAM（主記憶）は揮発性メモリで、電源オフでデータが消えます。HDD・SSD・ROMは不揮発性です。',
          },
          {
            id: 201,
            question: '次に実行する命令のアドレスを保持するCPU内のレジスタはどれか。',
            choices: ['アキュムレータ', 'フラグレジスタ', 'プログラムカウンタ', '命令レジスタ'],
            answer: 2,
            explanation: 'プログラムカウンタ（PC）は次に実行する命令のメモリアドレスを保持します。命令実行のたびに自動的に更新されます。',
          },
          {
            id: 209,
            question: 'フォン・ノイマン型コンピュータの特徴として正しいものはどれか。',
            choices: [
              'プログラムはハードウェアの配線で表現される',
              'データとプログラムを同じ主記憶に格納して実行する',
              'データのみを主記憶に格納し、プログラムは専用メモリに格納する',
              '演算装置と制御装置が別筐体に分離されている',
            ],
            answer: 1,
            explanation: 'フォン・ノイマン型（プログラム内蔵方式）は、データとプログラム（命令）を同じ主記憶装置に格納し、CPUが順に読み出して実行する方式です。現代の汎用コンピュータのほぼ全てがこの方式を採用しています。',
          },
          {
            id: 210,
            question: 'PCのBIOSやUEFIを格納するのに適した記憶装置はどれか。',
            choices: ['DRAM（主記憶）', 'フラッシュROM', 'HDD', 'レジスタ'],
            answer: 1,
            explanation: 'BIOS/UEFIは電源投入直後に実行される起動プログラムで、電源オフでも内容を保持する不揮発性のフラッシュROMに格納されています。DRAMは揮発性、HDDは起動前にアクセス不可、レジスタは容量不足です。',
          },
        ],
      },
      {
        id: 'a2-2',
        title: '命令実行サイクルとパイプライン',
        content: `
<h3>CPUはどうやって命令を実行するのか</h3>
<p>プログラムはメモリ上の命令の列です。CPUは「命令を1つ取り出す→解読する→実行する→結果を書く」というサイクルを<strong>1秒に数十億回</strong>繰り返します。このサイクルを<strong>命令実行サイクル（インストラクションサイクル）</strong>と呼びます。</p>

<h3>命令実行の4ステップ（詳細）</h3>
<ol>
  <li>
    <strong>フェッチ（Fetch）— 命令の読み込み</strong><br/>
    プログラムカウンタ（PC）が指すメモリアドレスから命令を読み込み、命令レジスタ（IR）に格納。PCを次の命令アドレスに更新。
  </li>
  <li>
    <strong>デコード（Decode）— 命令の解読</strong><br/>
    IRに格納された命令を制御装置が解読。「これは加算命令だ」「オペランド（対象データ）はどこか」を判断する。
  </li>
  <li>
    <strong>実行（Execute）— 演算の実行</strong><br/>
    ALU（演算装置）が実際の計算を行う。必要ならメモリからデータを読み込む（ロード）操作も発生する。
  </li>
  <li>
    <strong>ライトバック（Write Back）— 結果の書き戻し</strong><br/>
    演算結果をレジスタまたはメモリに書き戻す。フラグレジスタも更新される。
  </li>
</ol>
<p>このサイクルが1クロックごとに繰り返されます。3GHzのCPUなら毎秒30億サイクル。</p>

<h3>パイプライン処理—工場のベルトコンベア方式</h3>
<p>逐次処理では命令1が全4ステップを終えてから命令2が始まります。これは非効率です。</p>
<p>パイプラインは工場のベルトコンベアのように、<strong>各ステージが異なる命令を同時に処理</strong>します。</p>
<pre>
逐次処理:      命令1[F→D→E→W]  命令2[F→D→E→W]  …
パイプライン:  命令1[F] 命令2[F]
                    命令1[D] 命令2[D]
                         命令1[E] 命令2[E]
                              命令1[W] 命令2[W]
</pre>
<p>4命令を4段パイプラインで処理する場合：逐次なら16クロック → パイプラインなら7クロック（約2.3倍高速）</p>
<p>十分な命令数があれば理論的に<strong>段数倍のスループット</strong>が得られます。</p>

<h3>パイプラインハザード（障害）</h3>
<p>パイプラインが途切れる（ストール）原因を<strong>ハザード</strong>といいます。</p>
<ul>
  <li><strong>データハザード</strong>: 前の命令の計算結果をすぐ次の命令が必要とする場合。例：「A=B+C」の次に「D=A+1」を処理しようとするが、Aがまだ確定していない。</li>
  <li><strong>制御ハザード</strong>: 条件分岐命令で、次にどの命令を実行するかが分からない場合。if文が典型例。「分岐予測」で対処。</li>
  <li><strong>構造ハザード</strong>: 複数命令が同じハードウェア（メモリやALU）を同時に使おうとする場合。</li>
</ul>

<h3>パイプライン効率の計算</h3>
<p>m段パイプラインでn命令を処理するとき、総クロック数は次の式で求められます。</p>
<pre>
総クロック数 = m + (n - 1)

例：4段パイプライン（F/D/E/W）で8命令を処理
= 4 + (8 - 1) = 11クロック

逐次処理なら 4 × 8 = 32クロック
→ パイプラインで約3倍高速化
</pre>
<p>最初の命令が全4段を通り抜けるのに4クロック、以後は1命令/1クロックで完了します。</p>

<h3>さらなる高速化技術</h3>
<p><strong>スーパースカラ</strong>: 複数のパイプラインを並列に持ち、1クロックで複数命令を同時実行。現代のCPUに搭載。</p>
<p><strong>アウトオブオーダー実行（OoO）</strong>: データハザードで詰まった命令を後回しにし、依存関係のない命令を先に実行する技術。CPUが命令の順序を入れ替えて効率化する。</p>
<p><strong>分岐予測（Branch Prediction）</strong>: 条件分岐命令でどちらへ分岐するかを事前に予測し、予測した方向の命令をあらかじめパイプラインに流しておく技術。予測が外れるとパイプラインをフラッシュ（破棄）してやり直すコストが生じる。</p>
<p><strong>マルチコア</strong>: 1チップに複数のCPUコアを搭載。コア数=真の並列処理数。4コアなら4つのスレッドを同時実行可能。</p>
<p><strong>ハイパースレッディング</strong>: 1物理コアを論理的に2コアとして見せる技術（Intel）。レジスタを2セット持つことで、一方がメモリ待ちのとき他方の命令を実行できる。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
命令実行サイクルの順序「フェッチ→デコード→実行→ライトバック」は頻出。<br/>
m段パイプライン・n命令の総クロック数 = m + (n - 1)。<br/>
パイプラインのメリットは「スループット向上」、デメリットは「ハザードによるストール」です。
</div>
        `,
        diagram: 'pipeline',
        questions: [
          {
            id: 202,
            question: 'CPUの命令実行サイクルの正しい順序はどれか。',
            choices: [
              'デコード → フェッチ → 実行 → ライトバック',
              'フェッチ → デコード → 実行 → ライトバック',
              'フェッチ → 実行 → デコード → ライトバック',
              '実行 → フェッチ → デコード → ライトバック',
            ],
            answer: 1,
            explanation: '命令実行サイクルはフェッチ（読み込み）→デコード（解読）→実行（演算）→ライトバック（書き戻し）の順です。',
          },
          {
            id: 203,
            question: 'パイプライン処理の説明として正しいものはどれか。',
            choices: [
              '1つの命令を複数のCPUで分担して実行する',
              '複数の命令を各ステージで並行して処理する',
              'キャッシュメモリを使って命令を高速に読み込む',
              '命令をまとめてバッチ処理する',
            ],
            answer: 1,
            explanation: 'パイプラインは命令のフェッチ・デコード・実行・ライトバックを並行して行うことでスループットを向上させます。',
          },
          {
            id: 211,
            question: '4段パイプラインで10命令を処理するのに必要な最小クロック数はいくつか。',
            choices: ['10', '13', '14', '40'],
            answer: 1,
            explanation: 'パイプラインの総クロック数 = 段数 + (命令数 - 1) = 4 + (10 - 1) = 13クロックです。逐次処理では4×10=40クロック必要なところを大幅に短縮できます。',
          },
          {
            id: 212,
            question: 'パイプラインのデータハザードの説明として正しいものはどれか。',
            choices: [
              '複数の命令が同じメモリユニットを同時に使用しようとする',
              '条件分岐命令で次に実行する命令アドレスが確定しない',
              '直前の命令の計算結果を次の命令がすぐに必要とするためストールが生じる',
              'CPUとメモリのクロック差によって転送が遅延する',
            ],
            answer: 2,
            explanation: 'データハザードは前の命令の演算結果がまだ確定していないのに後続命令がその値を必要とするため、パイプラインが一時停止（ストール）する現象です。アウトオブオーダー実行や転送（フォワーディング）で緩和できます。',
          },
          {
            id: 213,
            question: '分岐予測（Branch Prediction）を行う目的として正しいものはどれか。',
            choices: [
              '演算結果をレジスタではなくメモリに直接書き込んで高速化する',
              '条件分岐命令での制御ハザードによるパイプラインの停止を減らす',
              'データハザードを検出して命令の実行順序を並べ替える',
              'キャッシュのヒット率を向上させるために命令を事前にロードする',
            ],
            answer: 1,
            explanation: '分岐予測は条件分岐のどちらへ進むかを予測して先取り実行することで、制御ハザードによるパイプラインのフラッシュ（廃棄）コストを減らすための技術です。',
          },
        ],
      },
      {
        id: 'a2-3',
        title: 'CPUの性能指標と計算',
        content: `
<h3>CPUの速さを何で測るか</h3>
<p>「このCPUは速い」と言っても、速さには複数の側面があります。基本情報技術者試験では3つの指標（クロック周波数・CPI・MIPS）とその計算が頻出です。</p>

<h3>クロック周波数（Hz）</h3>
<p>CPUの「心拍数」に相当します。1秒間に何サイクル動作するかを表します。</p>
<ul>
  <li>1GHz = 10億サイクル/秒</li>
  <li>3GHz = 30億サイクル/秒</li>
</ul>
<p>クロック周波数が高いほど速い傾向がありますが、<strong>単純比較はできません</strong>。同じクロックでも1命令に必要なサイクル数（CPI）が異なるからです。</p>
<p>また、周波数を上げると消費電力・発熱も増加します。近年は周波数向上よりマルチコア化が主流。</p>

<h3>CPI（Cycles Per Instruction）</h3>
<p>1命令を実行するのに必要な<strong>平均クロック数</strong>です。</p>
<p>命令の種類によって異なります（加算は1サイクル、メモリアクセスは数十サイクルなど）。プログラム全体の平均をとったものがCPIです。</p>
<p>CPIが小さいほど効率的なCPU設計です（RISC vs CISCの設計思想の差でもある）。</p>

<h3>MIPS（Million Instructions Per Second）</h3>
<p>1秒間に実行できる命令数を百万単位で表した性能指標です。</p>
<pre>
MIPS = クロック周波数(MHz) ÷ CPI

例: クロック周波数 2GHz（= 2,000MHz）、CPI = 4
MIPS = 2,000 ÷ 4 = 500MIPS
→ 1秒間に5億命令を実行
</pre>

<h3>実行時間の計算（最重要！）</h3>
<p>試験で最もよく出る計算式です。3つの値から残り1つを求める問題が多いです。</p>
<pre>
実行時間(秒) = 命令数 × CPI ÷ クロック周波数(Hz)

例題: 命令数500万、CPI=2、クロック周波数=1GHz
実行時間 = 5,000,000 × 2 ÷ 1,000,000,000
         = 10,000,000 ÷ 1,000,000,000
         = 0.01秒 = 10ミリ秒
</pre>
<p>単位の変換に注意: 1GHz = 10⁹Hz, 1MHz = 10<sup>6</sup>Hz</p>

<h3>アムダールの法則</h3>
<p>「プログラムの一部を速くしても全体の高速化には上限がある」という法則です。</p>
<pre>
全体の速度向上率 = 1 ÷ （(1 - 改善割合) + 改善割合 ÷ 速度向上倍率）

例1: プログラムの60%を4倍速にした場合
= 1 ÷ (0.4 + 0.6 ÷ 4)
= 1 ÷ (0.4 + 0.15)
= 1 ÷ 0.55 ≒ 1.82倍

例2: プログラムの80%を無限に高速化した場合
= 1 ÷ (0.2 + 0) = 1 ÷ 0.2 = 5倍が上限
</pre>
<p>「コアを増やせばどこまでも速くなるわけではない」ことを示す法則で、並列化の限界を教えてくれます。</p>

<h3>FLOPS（浮動小数点演算性能）</h3>
<p>科学技術計算やAI/機械学習では整数演算より浮動小数点演算の性能が重要です。<strong>FLOPS（Floating-point Operations Per Second）</strong>は1秒あたりの浮動小数点演算回数を表します。</p>
<ul>
  <li>1TFLOPS（テラフロップス）= 10<sup>12</sup>回/秒</li>
  <li>現代のゲーミングGPUは10〜100TFLOPS級の性能を持つ</li>
  <li>スーパーコンピュータは数百〜数千PFLOPS（ペタフロップス）</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
計算問題の公式は3つを関連づけて覚えましょう。<br/>
・MIPS = MHz ÷ CPI<br/>
・実行時間 = 命令数 × CPI ÷ Hz<br/>
・アムダールの法則: 全体向上 = 1 ÷ ((1-改善割合) + 改善割合÷向上倍率)<br/>
単位変換（GHz→MHz→Hz）ミスが最大の落とし穴です。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
クロック周波数を GHz のまま計算すると桁が合いません。実行時間の計算では<strong>Hz（= 10⁹の場合は末尾に9個の0）</strong>に統一して計算しましょう。
</div>
        `,
        diagram: 'clock',
        questions: [
          {
            id: 7,
            question: 'クロック周波数が 2GHz、CPI が 4 のとき、MIPSはいくつか。',
            choices: ['500', '250', '8000', '2000'],
            answer: 0,
            explanation: 'MIPS = クロック周波数(MHz) ÷ CPI = 2000MHz ÷ 4 = 500MIPS です。',
          },
          {
            id: 204,
            question: 'クロック周波数3GHz、CPI=3、命令数9億のプログラムの実行時間はいくつか。',
            choices: ['0.3秒', '0.9秒', '1秒', '3秒'],
            answer: 1,
            explanation: '実行時間 = 9億 × 3 ÷ 3,000,000,000 = 27億 ÷ 30億 = 0.9秒です。',
          },
          {
            id: 214,
            question: 'あるプログラムの60%を無限に高速化（実行時間ゼロ）した場合、アムダールの法則による全体の速度向上率はいくつか。',
            choices: ['1.6倍', '2.5倍', '4.0倍', '6.0倍'],
            answer: 1,
            explanation: '速度向上 = 1 ÷ ((1-0.6) + 0.6÷∞) = 1 ÷ (0.4 + 0) = 1 ÷ 0.4 = 2.5倍です。改善できない40%がボトルネックとなり最大2.5倍が上限となります。',
          },
          {
            id: 215,
            question: 'クロック周波数1GHz、MIPS値が500のCPUのCPIはいくつか。',
            choices: ['0.5', '1', '2', '500'],
            answer: 2,
            explanation: 'MIPS = MHz ÷ CPI より、CPI = MHz ÷ MIPS = 1000 ÷ 500 = 2です。1GHz = 1000MHzに変換してから計算します。',
          },
          {
            id: 222,
            question: 'あるプログラムの80%を3倍速に改善したとき、アムダールの法則による全体の速度向上率として最も近いものはどれか。',
            choices: ['1.4倍', '1.9倍', '2.1倍', '3.0倍'],
            answer: 1,
            explanation: '全体向上 = 1 ÷ ((1-0.8) + 0.8÷3) = 1 ÷ (0.2 + 0.267) = 1 ÷ 0.467 ≒ 2.14倍。選択肢の中で最も近いのは2.1倍です。残り20%が制約となり3倍未満に留まります。',
          },
        ],
      },
      {
        id: 'a2-4',
        title: 'メモリ階層とキャッシュ',
        content: `
<h3>メモリ階層</h3>
<p>コンピュータのメモリは<strong>速度・容量・コスト</strong>のトレードオフによって階層構造になっています。CPUに近いほど速く、高価で、小容量です。</p>

<h3>各メモリの特徴</h3>
<ul>
  <li><strong>レジスタ</strong>: CPU内部。最高速。数十〜数百バイト程度。</li>
  <li><strong>キャッシュメモリ（L1/L2/L3）</strong>: CPU内〜CPU近傍。数KB〜数十MB。主記憶より100倍以上高速。</li>
  <li><strong>主記憶（RAM）</strong>: 数GB〜数十GB。CPUから直接アクセス可能。</li>
  <li><strong>補助記憶（SSD/HDD）</strong>: 数百GB〜数TB。主記憶より1000倍以上遅い。</li>
</ul>

<h3>キャッシュメモリの仕組み</h3>
<p>よく使うデータをCPUの近くに置いておき、主記憶へのアクセスを減らす技術です。</p>
<p><strong>ヒット率</strong>: キャッシュにデータがあった割合。ヒット率が高いほど高速になります。</p>
<p><strong>実効アクセス時間</strong> = ヒット率 × キャッシュアクセス時間 + (1-ヒット率) × 主記憶アクセス時間</p>
<p>例: ヒット率90%、キャッシュ10ns、主記憶100ns の場合</p>
<p><code>= 0.9 × 10 + 0.1 × 100 = 9 + 10 = 19ns</code></p>

<h3>局所性の原理</h3>
<p>キャッシュが効果的な理由はプログラムの<strong>局所性</strong>にあります。</p>
<ul>
  <li><strong>時間的局所性</strong>: 最近使ったデータはすぐにまた使われる（ループ変数など）</li>
  <li><strong>空間的局所性</strong>: あるアドレスのデータを使ったら、近くのアドレスも使われやすい（配列など）</li>
</ul>

<h3>キャッシュの書き込み方式</h3>
<p>CPUがデータを書き込む（更新する）とき、キャッシュと主記憶の同期をどう行うかに2種類の方式があります。</p>
<ul>
  <li>
    <strong>ライトスルー（Write Through）</strong>: キャッシュへの書き込みと<strong>同時に主記憶にも書き込む</strong>。常にキャッシュと主記憶が一致するため一貫性が保ちやすいが、毎回主記憶にアクセスするため低速。
  </li>
  <li>
    <strong>ライトバック（Write Back）</strong>: キャッシュにのみ書き込み、<strong>キャッシュから追い出されるときに初めて主記憶に書き戻す</strong>。高速だがキャッシュと主記憶の内容が一時的に異なる（ダーティビットで管理）。
  </li>
</ul>

<h3>仮想記憶とページング</h3>
<p>物理的なRAMは有限ですが、OSが「仮想記憶」の仕組みを使うことで、実際のRAMより大きなアドレス空間をプログラムに提供できます。</p>
<ul>
  <li><strong>ページング</strong>: メモリを固定サイズ（ページ、通常4KB）に分割。使用頻度の低いページを補助記憶（スワップ領域）に退避させ、必要なときにRAMに呼び戻す。</li>
  <li><strong>ページフォルト</strong>: アクセスしたページがRAMにない場合に発生する例外。OSがディスクからページをRAMに読み込む。ページフォルトが多発するとシステムが極端に遅くなる（スラッシング）。</li>
  <li><strong>TLB（Translation Lookaside Buffer）</strong>: 仮想アドレスから物理アドレスへの変換を高速化するキャッシュ。ページテーブルの頻繁な参照を避ける。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
実効アクセス時間 = ヒット率 × キャッシュ時間 + (1-ヒット率) × 主記憶時間<br/>
ライトスルー = 毎回主記憶に書く（一貫性重視）、ライトバック = 追い出し時に書く（速度重視）<br/>
ページフォルト = アクセスしたページがRAMに存在しない例外
</div>
        `,
        diagram: 'memoryhierarchy',
        questions: [
          {
            id: 205,
            question: 'ヒット率80%、キャッシュアクセス時間5ns、主記憶アクセス時間100nsのとき、実効アクセス時間はいくつか。',
            choices: ['24ns', '20ns', '80ns', '100ns'],
            answer: 0,
            explanation: '実効アクセス時間 = 0.8×5 + 0.2×100 = 4 + 20 = 24ns です。',
          },
          {
            id: 206,
            question: 'キャッシュメモリに関する説明として正しいものはどれか。',
            choices: [
              '主記憶よりも容量が大きい',
              'CPUと主記憶の速度差を緩和するための高速メモリ',
              '電源を切ってもデータが消えない不揮発性メモリ',
              '補助記憶装置の一種である',
            ],
            answer: 1,
            explanation: 'キャッシュメモリはCPUと低速な主記憶の間の速度差を埋めるための高速バッファです。',
          },
          {
            id: 216,
            question: 'ライトスルー（Write Through）方式の説明として正しいものはどれか。',
            choices: [
              'キャッシュにのみ書き込み、追い出し時に主記憶へ反映する',
              'キャッシュと主記憶に同時に書き込む',
              '主記憶にのみ書き込み、キャッシュは読み込み専用とする',
              'キャッシュが満杯のときだけ主記憶に書き込む',
            ],
            answer: 1,
            explanation: 'ライトスルーはキャッシュへの書き込みと同時に主記憶にも書き込む方式です。常にキャッシュと主記憶の内容が一致しますが、毎回主記憶アクセスが発生するため速度面では不利です。',
          },
          {
            id: 217,
            question: 'ページフォルトの説明として正しいものはどれか。',
            choices: [
              'キャッシュにデータが存在しないためアクセスできない状態',
              'CPUが要求したページが主記憶（RAM）に存在しない場合に発生する例外',
              'ページのアクセス権限違反によって発生するセキュリティエラー',
              'ページサイズが大きすぎてメモリに格納できない状態',
            ],
            answer: 1,
            explanation: 'ページフォルトはアクセスしようとした仮想メモリのページが物理RAM上に存在しない場合に発生する例外処理です。OSがディスク（スワップ領域）から該当ページをRAMに読み込んで処理を再開します。頻発するとスラッシングが起きパフォーマンスが低下します。',
          },
          {
            id: 218,
            question: 'ヒット率95%、キャッシュアクセス時間2ns、主記憶アクセス時間80nsのとき、実効アクセス時間はいくつか。',
            choices: ['5.9ns', '6.9ns', '8.0ns', '41ns'],
            answer: 0,
            explanation: '実効アクセス時間 = ヒット率×キャッシュ時間 + (1-ヒット率)×主記憶時間 = 0.95×2 + 0.05×80 = 1.9 + 4.0 = 5.9ns です。',
          },
        ],
      },
      {
        id: 'a2-5',
        title: '入出力とバス',
        content: `
<h3>バスとは何か</h3>
<p>CPU・主記憶・入出力装置はすべて<strong>バス（Bus）</strong>という共有の信号線でつながっています。バスは「複数の機器が共有するデータ転送の通路」で、バス幅（ビット数）が広いほど一度に多くのデータを転送できます。</p>

<h3>3種類のバス</h3>
<ul>
  <li><strong>データバス</strong>（双方向）: 実際のデータを転送する。64ビット幅なら1クロックで8バイト転送。</li>
  <li><strong>アドレスバス</strong>（単方向）: CPUがアクセスするメモリのアドレスを指定する。<br/>32ビット → 2<sup>32</sup> = 約43億アドレス = <strong>最大4GBのメモリを管理</strong>できる</li>
  <li><strong>制御バス</strong>（双方向）: 読み書き・割り込みなどの制御信号を伝える。</li>
</ul>

<h3>入出力（I/O）方式の3種類</h3>
<p>CPUとキーボード・ディスクなどの入出力装置はどうやってデータをやり取りするのでしょうか。3つの方式があります。</p>

<p><strong>① プログラムI/O（ポーリング方式）</strong></p>
<p>CPUが入出力装置の状態を<strong>定期的に確認し続ける</strong>方式。「できたかな？まだかな？」と何度も確認する係員のようなイメージ。CPUがずっと確認作業に縛られるためムダが多い。</p>

<p><strong>② 割り込みI/O（インタラプト）</strong></p>
<p>入出力装置が処理完了したとき、<strong>自分からCPUに通知（割り込み）</strong>する方式。CPUは通知が来るまで別の処理ができる。現代のOSで標準的な方式。</p>

<p><strong>③ DMA（Direct Memory Access）</strong></p>
<p>DMAコントローラがCPUを介さず、<strong>直接、主記憶と入出力装置間でデータ転送</strong>する方式。大量データ転送（ディスク・ネットワーク）に使用。CPUは転送完了の割り込みを受けるまで他の処理ができる。最も効率的。</p>

<h3>割り込みの種類</h3>
<p>割り込み（インタラプト）は、CPUが実行中の処理を一時中断させて別の処理を行わせる仕組みです。現代のOSの根幹をなす技術です。</p>
<ul>
  <li>
    <strong>外部割り込み（ハードウェア割り込み）</strong>: 入出力装置などハードウェアから発生する。<br/>
    例：キーを押す、マウスクリック、ネットワークパケット到着、タイマー割り込み（OSのスケジューリングに使用）
  </li>
  <li>
    <strong>内部割り込み（ソフトウェア割り込み・例外）</strong>: CPUが命令を実行中に検出するエラーや特殊状態。<br/>
    例：ゼロ除算、不正なメモリアクセス（セグメンテーション違反）、ページフォルト、オーバーフロー
  </li>
  <li>
    <strong>ソフトウェア割り込み（システムコール）</strong>: プログラムが意図的にOSの機能を呼び出すために発生させる割り込み。ファイル読み書き・ネットワーク通信などOSのカーネル機能を利用するために使う。
  </li>
</ul>

<h3>主なインタフェース規格</h3>
<ul>
  <li><strong>USB（Universal Serial Bus）</strong>: 最も普及した汎用外部インタフェース。ホットプラグ（電源を切らずに抜き差し可能）対応。USB3.2で最大20Gbps。</li>
  <li><strong>HDMI</strong>: 映像・音声を1本のケーブルで伝送。AV機器・ディスプレイ接続の標準。</li>
  <li><strong>PCIe（PCI Express）</strong>: マザーボード上の内部バス。グラフィックカード・SSD（NVMe）に使用。高速。</li>
  <li><strong>SATA</strong>: HDD・SSDの接続規格。最大600MB/s。NVMeより低速だが普及。</li>
</ul>

<h3>RAID（ストレージの冗長化・高速化）</h3>
<p>複数台のHDD/SSDを組み合わせてデータの可用性や性能を向上させる技術です。</p>
<ul>
  <li><strong>RAID 0（ストライピング）</strong>: データを複数ドライブに分散して書き込む。読み書き速度が向上するが、1台でも故障するとデータ全滅。冗長性なし。</li>
  <li><strong>RAID 1（ミラーリング）</strong>: 2台のドライブに同じデータを書き込む。1台が故障しても継続稼動。容量は1台分しか使えない。</li>
  <li><strong>RAID 5</strong>: 3台以上のドライブにデータとパリティ（誤り訂正情報）を分散。1台故障まで復旧可能。容量効率が良い。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
「DMAの説明は？」→ CPUを介さずに主記憶と入出力装置間でデータ転送する方式。<br/>
「アドレスバス32ビットで管理できる最大メモリは？」→ 2<sup>32</sup> byte = 4GB。<br/>
「RAID1の特徴は？」→ ミラーリング（同じデータを2台に書く）で1台故障に耐えられる。
</div>
        `,
        diagram: 'bus',
        questions: [
          {
            id: 207,
            question: 'DMA（Direct Memory Access）の説明として正しいものはどれか。',
            choices: [
              'CPUが主導して入出力装置とデータを転送する方式',
              'CPUを介さずに入出力装置と主記憶間でデータ転送する方式',
              '入出力装置がCPUに割り込みをかけてデータを通知する方式',
              'CPUが一定時間ごとに入出力装置を確認する方式',
            ],
            answer: 1,
            explanation: 'DMAはDMAコントローラがCPUを介さずに主記憶と入出力装置間のデータ転送を行うため、CPUを他の処理に使えます。',
          },
          {
            id: 208,
            question: 'アドレスバスが32ビットのとき、アドレス指定できる主記憶の最大容量はいくつか。',
            choices: ['2GB', '4GB', '8GB', '16GB'],
            answer: 1,
            explanation: '32ビットで表せるアドレス数は2<sup>32</sup> = 約43億。1アドレス=1バイトなら 2<sup>32</sup> byte = 4GB です。',
          },
          {
            id: 219,
            question: 'ポーリング（プログラムI/O）方式のデメリットとして最も適切なものはどれか。',
            choices: [
              '割り込みが多発するとCPUの処理が遅延する',
              'CPUが入出力装置の状態確認に占有され、他の処理ができない',
              'DMAコントローラが必要なためハードウェアコストが高い',
              'データの転送順序が保証されない',
            ],
            answer: 1,
            explanation: 'ポーリング方式はCPUが入出力装置の完了を繰り返し確認し続けるため、CPUが入出力待ちに拘束されてしまいます。これはCPU利用効率が低く、割り込みI/OやDMAで解決されます。',
          },
          {
            id: 220,
            question: '外部割り込みの例として最も適切なものはどれか。',
            choices: [
              'プログラムがゼロ除算を実行した',
              'プログラムが存在しないメモリアドレスにアクセスした',
              'キーボードからキー入力があった',
              'プログラムが明示的にシステムコールを呼び出した',
            ],
            answer: 2,
            explanation: 'キーボード入力はハードウェアデバイス（外部）からCPUへ通知される外部割り込み（ハードウェア割り込み）の典型例です。ゼロ除算・不正アクセスは内部割り込み（例外）、システムコールはソフトウェア割り込みです。',
          },
          {
            id: 221,
            question: 'RAID 1（ミラーリング）の説明として正しいものはどれか。',
            choices: [
              '複数のドライブにデータを分散して書き込むことで読み書き速度を向上させる',
              '同じデータを2台のドライブに書き込み、1台が故障しても継続できる',
              'パリティ情報を分散して保存し、1台の故障からデータを復元できる',
              '全ドライブのデータを1台のバックアップドライブに集約する',
            ],
            answer: 1,
            explanation: 'RAID 1はミラーリングとも呼ばれ、2台のドライブにまったく同じデータを書き込みます。1台が故障しても残りの1台でシステムを継続でき、高い可用性が得られます。ただし使える実効容量は1台分のみです。',
          },
        ],
      },
    ],
  },
  {
    id: 'a3',
    title: 'ネットワーク',
    subject: 'A',
    description: 'OSI参照モデル・TCP/IP・IPアドレス・DNS・ルーティングなど、ネットワークの仕組みを体系的に学びます。',
    sections: [
      {
        id: 'a3-1',
        title: 'OSI参照モデルとTCP/IP',
        content: `
<h3>なぜ「層」に分けるのか</h3>
<p>異なるメーカー・異なるOS・異なる国のコンピュータが通信できるのは、ネットワークの機能を<strong>標準化された層（レイヤー）</strong>に分けたからです。例えばHTTPを話せるWebブラウザは、その下の「どうやって電気信号に変換するか」を知らなくても動きます。各層が独立しているため、上の層に影響を与えずに下の層だけを変更できます。</p>

<h3>OSI参照モデルの7層</h3>
<p>ISO（国際標準化機構）が定めた理想的なモデルです。「どんな機能がどの層に属するか」を理解することが試験のポイントです。</p>
<ol>
  <li><strong>物理層</strong>: ビットを電気信号・光信号・電波に変換。ケーブル・コネクタ・ハブが該当。</li>
  <li><strong>データリンク層</strong>: 同一ネットワーク（同じLAN）内の通信を管理。<strong>MACアドレス</strong>で機器を識別。スイッチが該当。フレームという単位でデータを転送。</li>
  <li><strong>ネットワーク層</strong>: 異なるネットワーク間の<strong>経路選択（ルーティング）</strong>。<strong>IPアドレス</strong>を使用。ルータが該当。パケットという単位。</li>
  <li><strong>トランスポート層</strong>: 送信元から宛先までのエンドツーエンドの信頼性を確保。<strong>TCP・UDP</strong>が該当。ポート番号でアプリを区別。</li>
  <li><strong>セッション層</strong>: 通信の開始・維持・終了（セッション管理）を担当。</li>
  <li><strong>プレゼンテーション層</strong>: データの形式変換・文字コード変換・暗号化・圧縮を担当。</li>
  <li><strong>アプリケーション層</strong>: ユーザーが直接使うアプリのプロトコル。HTTP・FTP・DNS・SMTPなど。</li>
</ol>

<h3>TCP/IP 4層モデル（実際のインターネット）</h3>
<p>理論的なOSIモデルに対して、実際に使われているのがTCP/IPモデルです。</p>
<ul>
  <li><strong>ネットワークインタフェース層</strong>（OSI第1〜2層）: イーサネット・Wi-Fi</li>
  <li><strong>インターネット層</strong>（OSI第3層）: IP・ICMP（ping）・ARP（IPアドレス→MACアドレス変換）</li>
  <li><strong>トランスポート層</strong>（OSI第4層）: TCP・UDP</li>
  <li><strong>アプリケーション層</strong>（OSI第5〜7層）: HTTP・HTTPS・DNS・SMTP・FTP</li>
</ul>

<h3>TCPとUDPの徹底比較</h3>
<p>この2つの違いは試験の超頻出ポイントです。</p>
<p><strong>TCP：信頼性重視の「確実配達」</strong></p>
<ul>
  <li>接続前に3ウェイハンドシェイク（SYN→SYN-ACK→ACK）で接続を確立する</li>
  <li>受信確認（ACK）がある。届かなければ<strong>自動的に再送</strong></li>
  <li>データの<strong>順序</strong>を保証する（バラバラに届いても正しい順序に並び替え）</li>
  <li>速度は遅いが<strong>確実に届く</strong>。Webページ閲覧・メール・ファイル転送に使用</li>
</ul>
<p><strong>UDP：速度重視の「お急ぎ便」</strong></p>
<ul>
  <li>接続確立なし（コネクションレス）。受信確認なし。再送なし。</li>
  <li>オーバーヘッドが小さく<strong>低遅延</strong></li>
  <li>多少のパケットロスより<strong>リアルタイム性</strong>が重要な用途向け</li>
  <li>動画配信・音声通話（VoIP）・DNS・オンラインゲームに使用</li>
</ul>

<h3>ポート番号：アプリケーションの「部屋番号」</h3>
<p>同じPCで複数のアプリが同時にネットワーク通信できるのは、<strong>ポート番号</strong>のおかげです。IPアドレスがPCの住所なら、ポート番号は部屋番号です。</p>
<ul>
  <li>0〜1023: <strong>ウェルノウンポート</strong>（HTTP=80、HTTPS=443など、OSが予約）</li>
  <li>1024〜49151: 登録済みポート（アプリが使う）</li>
  <li>49152〜65535: 動的ポート（クライアント側が一時的に使う）</li>
</ul>
<p>「IPアドレス:ポート番号」の組み合わせが<strong>ソケット</strong>と呼ばれ、TCP/IP通信の接続の単位です。</p>

<h3>ARP（Address Resolution Protocol）</h3>
<p>同じLAN内でパケットを届けるには、IPアドレスだけでなく相手の<strong>MACアドレス</strong>も必要です。ARPはIPアドレスからMACアドレスを調べるプロトコルです。</p>
<ol>
  <li>「192.168.1.5 のMACアドレスを教えて」とブロードキャスト（全員に問い合わせ）</li>
  <li>192.168.1.5 の機器だけが「私のMACアドレスは XX:XX:XX:XX:XX:XX です」と返答</li>
  <li>結果をARPキャッシュに保存して次回以降の通信に使う</li>
</ol>
<p>ARPはOSI第3層（ネットワーク層）と第2層（データリンク層）の橋渡しをするプロトコルです。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
OSIの層番号と役割の対応は最頻出。特に「IPアドレス=第3層（ネットワーク層）」「MACアドレス=第2層（データリンク層）」「TCP/UDP=第4層（トランスポート層）」を確実に覚えましょう。<br/>
ARP = IPアドレス → MACアドレスに変換するプロトコル（同一LAN内）
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「HTTPSは第7層」「IPは第3層」と層を混同する問題が多いです。OSIモデルは「実際のプロトコルを対応させる問題」で使います。DNSは第7層（アプリケーション層）ですが通信にはUDP（第4層）を使います。層を混同しないよう注意。
</div>
        `,
        diagram: 'osi',
        questions: [
          {
            id: 8,
            question: 'IPアドレスを扱う層はOSI参照モデルの第何層か。',
            choices: ['第2層（データリンク層）', '第3層（ネットワーク層）', '第4層（トランスポート層）', '第7層（アプリケーション層）'],
            answer: 1,
            explanation: 'IPアドレスはネットワーク層（第3層）で扱われます。MACアドレスはデータリンク層（第2層）です。',
          },
          {
            id: 9,
            question: '動画ストリーミングに適したプロトコルはどれか。',
            choices: ['TCP', 'UDP', 'HTTP', 'FTP'],
            answer: 1,
            explanation: 'UDPは受信確認がなく高速なため、多少のパケットロスを許容できる動画配信に適しています。',
          },
          {
            id: 301,
            question: 'TCPの3ウェイハンドシェイクの手順として正しいものはどれか。',
            choices: [
              'ACK → SYN → SYN-ACK',
              'SYN → SYN-ACK → ACK',
              'SYN-ACK → SYN → ACK',
              'SYN → ACK → SYN-ACK',
            ],
            answer: 1,
            explanation: 'TCPの接続確立はSYN（接続要求）→SYN-ACK（確認応答）→ACK（確認）の3ステップです。',
          },
          {
            id: 310,
            question: 'ARP（Address Resolution Protocol）の説明として正しいものはどれか。',
            choices: [
              'ドメイン名をIPアドレスに変換するプロトコル',
              'IPアドレスからMACアドレスを取得するプロトコル',
              'プライベートIPアドレスをグローバルIPアドレスに変換するプロトコル',
              'パケットの経路を自動的に選択するプロトコル',
            ],
            answer: 1,
            explanation: 'ARPは同一LAN内で相手のIPアドレスからMACアドレスを調べるプロトコルです。ブロードキャストで問い合わせ、該当機器がMACアドレスを返します。',
          },
          {
            id: 311,
            question: 'TCPがUDPと比べて「信頼性が高い」理由として正しいものはどれか。',
            choices: [
              '転送速度が速いのでパケットロスが起きにくい',
              '受信確認（ACK）があり、未達のパケットを自動再送する',
              'UDP より小さいヘッダを使うので効率的に転送できる',
              '接続確立が不要なのでオーバーヘッドが少ない',
            ],
            answer: 1,
            explanation: 'TCPは各パケットに受信確認（ACK）が必要で、一定時間内にACKが返らない場合は自動的に再送します。順序番号でパケットの順序も保証されます。これがTCPの信頼性の根拠です。',
          },
        ],
      },
      {
        id: 'a3-2',
        title: 'IPアドレスとサブネット',
        content: `
<h3>IPアドレスとは：インターネット上の「住所」</h3>
<p>手紙を送るには相手の住所が必要なように、インターネット上での通信には宛先を示す番号が必要です。それが<strong>IPアドレス</strong>です。</p>
<p>現在主流の<strong>IPv4</strong>は32ビットの番号で、約43億個のアドレスがあります。しかしスマートフォン・IoT機器の急増でIPv4は枯渇しており、128ビットの<strong>IPv6</strong>への移行が進んでいます。</p>

<h3>IPv4アドレスの構造</h3>
<p>32ビットを8ビットずつ4グループに分け、10進数でドット区切りで表します。</p>
<pre>
192  .  168  .   1   .  10
↑       ↑         ↑      ↑
8bit    8bit     8bit   8bit  合計32bit
</pre>
<p>IPアドレスは2つの部分に分かれます：</p>
<ul>
  <li><strong>ネットワーク部</strong>: 「どの建物（ネットワーク）か」を示す上位ビット</li>
  <li><strong>ホスト部</strong>: 「建物内のどの部屋（機器）か」を示す下位ビット</li>
</ul>
<p>この境界を決めるのが<strong>サブネットマスク</strong>です。</p>

<h3>サブネットマスクの読み方</h3>
<p>サブネットマスクはIPアドレスと同じ32ビットで、「1」の連続がネットワーク部、「0」の連続がホスト部を示します。</p>
<pre>
IPアドレス:     192.168.1.10
サブネットマスク: 255.255.255.0（=/24）
                = 11111111.11111111.11111111.00000000

ネットワーク部: 192.168.1（上位24ビット）
ホスト部:       10（下位8ビット）
</pre>
<p>ホスト部が8ビットなら表現できるのは2<sup>8</sup>=256通り。しかし：</p>
<ul>
  <li>ホスト部が<strong>全て0</strong>（192.168.1.0）→ <strong>ネットワークアドレス</strong>（機器には割り当て不可）</li>
  <li>ホスト部が<strong>全て1</strong>（192.168.1.255）→ <strong>ブロードキャストアドレス</strong>（同一NW全体へ送信）</li>
</ul>
<p>よって使えるホスト数 = 2<sup>8</sup> - 2 = <strong>254台</strong></p>

<h3>CIDR表記</h3>
<p>255.255.255.0を毎回書くのは面倒なので、ネットワーク部のビット数だけで表す方法が<strong>CIDR（サイダー）表記</strong>です。</p>
<p><code>192.168.1.0/24</code> → 上位24ビットがネットワーク部</p>
<p><code>192.168.0.0/16</code> → 上位16ビットがネットワーク部（65,534台のホストが使える）</p>

<h3>特殊なIPアドレス（覚必須）</h3>
<ul>
  <li><strong>127.0.0.1（ループバック）</strong>: 自分自身を指す。「localhost」とも呼ぶ。ネットワーク不要でテスト可能。</li>
  <li><strong>プライベートアドレス</strong>: インターネットでは使えないLAN専用アドレス。
    <ul>
      <li>10.0.0.0 〜 10.255.255.255（/8）</li>
      <li>172.16.0.0 〜 172.31.255.255（/12）</li>
      <li>192.168.0.0 〜 192.168.255.255（/16）← 家庭・会社のルータで最もよく見る</li>
    </ul>
  </li>
</ul>

<h3>なぜプライベートアドレスが存在するのか</h3>
<p>IPv4は43億個しかアドレスがありません。世界中のすべての機器にグローバルIPを割り当てると不足します。そこで家庭・会社内部はプライベートアドレス（同じアドレスを世界中で再利用可能）を使い、インターネット接続時だけ<strong>NAT（ネットワークアドレス変換）</strong>で1つのグローバルIPを共有する仕組みが普及しています。</p>

<h3>サブネット計算の練習</h3>
<p>ホスト部のビット数から使えるホスト数を計算できることが重要です。</p>
<pre>
サブネット /24 → ホスト部 8ビット → 2⁸ - 2 = 254台
サブネット /25 → ホスト部 7ビット → 2⁷ - 2 = 126台
サブネット /26 → ホスト部 6ビット → 2⁶ - 2 =  62台
サブネット /27 → ホスト部 5ビット → 2⁵ - 2 =  30台
サブネット /28 → ホスト部 4ビット → 2⁴ - 2 =  14台

例: 192.168.1.0/26 のネットワーク
  ネットワークアドレス: 192.168.1.0
  使えるホスト:         192.168.1.1 〜 192.168.1.62
  ブロードキャスト:     192.168.1.63
  → 62台が使える
</pre>

<h3>IPv6</h3>
<p>IPv4の枯渇問題を根本的に解決する次世代IPプロトコルです。</p>
<ul>
  <li><strong>128ビット</strong>アドレス空間 → 2<sup>128</sup>≒340澗個（事実上無限）</li>
  <li>16進数・コロン区切りで表現: <code>2001:0db8:85a3:0000:0000:8a2e:0370:7334</code></li>
  <li>連続するゼロは <code>::</code> で省略可能: <code>2001:db8::1</code></li>
  <li>プライベートアドレスが不要 → NATなしで直接通信可能</li>
  <li>IPsecによるセキュリティが標準装備</li>
  <li>ブロードキャストを廃止し、<strong>マルチキャスト・エニーキャスト</strong>を使用</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
サブネット計算の公式：使えるホスト数 = 2^(ホスト部ビット数) - 2<br/>
/24 → 254台、/25 → 126台、/26 → 62台、/27 → 30台<br/>
IPv6は128ビット、16進コロン区切り、アドレス枯渇問題の解決策です。
</div>
        `,
        diagram: 'ipaddress',
        questions: [
          {
            id: 302,
            question: 'サブネットマスク 255.255.255.0 (/24) のネットワークで使用できるホストアドレスの数はいくつか。',
            choices: ['253', '254', '255', '256'],
            answer: 1,
            explanation: 'ホスト部8ビットで2<sup>8</sup>=256通りありますが、ネットワークアドレス(0)とブロードキャスト(255)を除くと254台です。',
          },
          {
            id: 303,
            question: 'プライベートIPアドレスの範囲として正しいものはどれか。',
            choices: ['8.8.8.0/24', '192.168.0.0/16', '127.0.0.0/8', '224.0.0.0/4'],
            answer: 1,
            explanation: '192.168.0.0〜192.168.255.255はプライベートアドレス範囲です。8.8.8.xはGoogleのDNS（グローバル）、127.x.x.xはループバック、224.x.x.xはマルチキャストです。',
          },
          {
            id: 312,
            question: 'サブネット /26 のネットワークで使用できるホスト数はいくつか。',
            choices: ['30台', '62台', '126台', '254台'],
            answer: 1,
            explanation: '/26はホスト部が6ビット（32-26=6）。2⁶=64 から ネットワークアドレスとブロードキャストの2つを引いて 64-2=62台です。',
          },
          {
            id: 313,
            question: 'IPv6に関する説明として正しいものはどれか。',
            choices: [
              '32ビットのアドレス空間を持ち、約43億個のアドレスが使える',
              '128ビットのアドレス空間を持ち、アドレスは16進数とコロンで表現する',
              'NATが必須で、複数の機器が1つのIPアドレスを共有する',
              'IPv4との後方互換性のためにブロードキャストを強化した',
            ],
            answer: 1,
            explanation: 'IPv6は128ビットのアドレス空間を持ち、16進数をコロンで区切った形式で表現します（例: 2001:db8::1）。アドレス数は事実上無限で、NATは不要になります。',
          },
          {
            id: 320,
            question: 'IPアドレス 192.168.10.50 に対してサブネットマスク 255.255.255.192（/26）を適用したとき、このホストが属するネットワークアドレスはどれか。',
            choices: ['192.168.10.0', '192.168.10.50', '192.168.10.64', '192.168.10.48'],
            answer: 0,
            explanation: '/26 はホスト部6ビット。ブロックサイズ64。192.168.10.50 は 0〜63 のブロック（.0〜.63）に属するため、ネットワークアドレスは 192.168.10.0 です。',
          },
        ],
      },
      {
        id: 'a3-3',
        title: 'DNSとルーティング',
        content: `
<h3>DNS（Domain Name System）</h3>
<p>ドメイン名（例: <code>www.example.com</code>）をIPアドレスに変換するシステムです。電話帳のような役割を果たします。</p>

<h3>名前解決の流れ</h3>
<ol>
  <li>ブラウザが <code>www.example.com</code> にアクセスしようとする</li>
  <li>PCがDNSキャッシュを確認（なければDNSサーバに問い合わせ）</li>
  <li>ルートDNSサーバ → TLDサーバ（.com担当）→ 権威DNSサーバの順に再帰的に問い合わせ</li>
  <li>IPアドレスをキャッシュして返す</li>
</ol>

<h3>主要なプロトコルとポート番号</h3>
<p>ポート番号はアプリケーションを識別する番号（0〜65535）です。ウェルノウンポートは0〜1023。</p>
<ul>
  <li><strong>HTTP</strong>: 80番 / <strong>HTTPS</strong>: 443番（Webページ）</li>
  <li><strong>FTP</strong>: 21番（ファイル転送）</li>
  <li><strong>SSH</strong>: 22番（安全なリモート接続）</li>
  <li><strong>SMTP</strong>: 25番（メール送信）</li>
  <li><strong>POP3</strong>: 110番 / <strong>IMAP</strong>: 143番（メール受信）</li>
  <li><strong>DNS</strong>: 53番</li>
  <li><strong>DHCP</strong>: 67/68番（IPアドレスの自動割り当て）</li>
</ul>

<h3>ルーティング</h3>
<p>パケットを宛先IPアドレスに向けて転送する経路選択のことです。</p>
<ul>
  <li><strong>スタティックルーティング</strong>: 管理者が手動で経路を設定。小規模ネットワーク向け。</li>
  <li><strong>ダイナミックルーティング</strong>: ルーティングプロトコル（OSPF・BGP等）で自動的に経路を学習・更新。大規模ネットワーク向け。</li>
</ul>

<h3>DNSレコードの種類</h3>
<p>DNSにはドメインに関する様々な情報を登録できます。</p>
<ul>
  <li><strong>Aレコード</strong>: ドメイン名 → IPv4アドレスの対応</li>
  <li><strong>AAAAレコード</strong>: ドメイン名 → IPv6アドレスの対応</li>
  <li><strong>MXレコード</strong>: そのドメイン宛てのメールを受け取るメールサーバを指定</li>
  <li><strong>CNAMEレコード</strong>: ドメイン名の別名（エイリアス）を定義。<code>www.example.com</code> → <code>example.com</code> など</li>
  <li><strong>NSレコード</strong>: そのドメインを管理するDNSサーバを指定</li>
</ul>

<h3>デフォルトゲートウェイ</h3>
<p>自分のLAN外（異なるネットワーク）への通信を行う際に、パケットを最初に送る機器です。通常はルータがデフォルトゲートウェイとなります。</p>
<p>例: PC（192.168.1.10）が <code>8.8.8.8</code>（Google DNS）に通信するとき<br/>→ 宛先が同一LAN外なのでデフォルトゲートウェイ（192.168.1.1 = ルータ）に転送<br/>→ ルータがインターネットへ中継</p>

<h3>NAT（Network Address Translation）</h3>
<p>プライベートIPアドレスをグローバルIPアドレスに変換する技術です。1つのグローバルIPを複数の端末で共有でき、IPv4アドレス枯渇を緩和します。</p>
<p><strong>NAPT（IPマスカレード）</strong>はポート番号も変換して多対一の変換を行います。家庭用ルータのほぼすべてがこの方式を採用しています。</p>
<pre>
LAN内PC(192.168.1.10:5000) ─→ ルータ ─→ インターネット(203.0.113.1:1024)
     ↑プライベートIP                           ↑グローバルIPに変換
</pre>
        `,
        diagram: 'dns',
        questions: [
          {
            id: 304,
            question: 'HTTPSが使用するウェルノウンポート番号はどれか。',
            choices: ['80', '443', '22', '53'],
            answer: 1,
            explanation: 'HTTPSは443番ポートを使用します。HTTPは80番、SSHは22番、DNSは53番です。',
          },
          {
            id: 305,
            question: 'DNSの役割として正しいものはどれか。',
            choices: [
              'IPアドレスをMACアドレスに変換する',
              'ドメイン名をIPアドレスに変換する',
              'プライベートIPをグローバルIPに変換する',
              'パケットを宛先に転送する経路を決める',
            ],
            answer: 1,
            explanation: 'DNSはドメイン名（www.example.comなど）をIPアドレスに変換する名前解決サービスです。',
          },
          {
            id: 314,
            question: 'デフォルトゲートウェイの説明として正しいものはどれか。',
            choices: [
              '同一LAN内の機器にIPアドレスを自動割り当てする機器',
              '別のネットワークへパケットを転送する際に最初に送る機器',
              'ドメイン名をIPアドレスに変換するサーバ',
              'LAN内の機器のMACアドレスを管理する機器',
            ],
            answer: 1,
            explanation: 'デフォルトゲートウェイは自分のネットワーク外への通信で最初にパケットを送る機器です。通常はルータが担当し、PCのネットワーク設定で指定します。',
          },
          {
            id: 315,
            question: 'メールサーバのアドレスを指定するDNSレコードの種類はどれか。',
            choices: ['Aレコード', 'CNAMEレコード', 'MXレコード', 'NSレコード'],
            answer: 2,
            explanation: 'MXレコード（Mail eXchanger）はそのドメイン宛てのメールを受け取るメールサーバを指定するDNSレコードです。',
          },
          {
            id: 321,
            question: 'DNSの再帰的問い合わせ（フルサービスリゾルバ）の説明として正しいものはどれか。',
            choices: [
              'クライアントが複数のDNSサーバに並行して問い合わせを行う',
              'DNSサーバがクライアントに代わって根本まで遡って名前解決し最終回答を返す',
              'クライアントがルートDNSサーバから順に自分で問い合わせを繰り返す',
              'IPアドレスからドメイン名を逆引きする問い合わせ方式',
            ],
            answer: 1,
            explanation: '再帰的問い合わせはDNSリゾルバがクライアントに代わりルートDNS→TLDサーバ→権威DNSと順に問い合わせて最終的なIPアドレスを取得しクライアントに返す方式です。クライアントは1回の問い合わせで結果を得られます。',
          },
        ],
      },
      {
        id: 'a3-4',
        title: 'LAN・WAN・無線ネットワーク',
        content: `
<h3>LAN と WAN</h3>
<p><strong>LAN（Local Area Network）</strong>: 建物内や構内など限られた範囲のネットワーク。高速・低コスト。</p>
<p><strong>WAN（Wide Area Network）</strong>: 地理的に離れた場所を結ぶネットワーク。インターネットもWANの一種。</p>

<h3>イーサネット（有線LAN）</h3>
<p>有線LANの標準規格です。CSMA/CD方式で衝突を検知します。</p>
<ul>
  <li><strong>100BASE-TX</strong>: 最大100Mbps。ツイストペアケーブル（CAT5）。</li>
  <li><strong>1000BASE-T（ギガビットイーサネット）</strong>: 最大1Gbps。CAT5e以上。</li>
  <li><strong>10GBASE-T</strong>: 最大10Gbps。サーバー間接続などに使用。</li>
</ul>

<h3>無線LAN（Wi-Fi）</h3>
<p>IEEE 802.11シリーズの規格です。</p>
<ul>
  <li><strong>802.11n（Wi-Fi 4）</strong>: 最大600Mbps。2.4GHz/5GHz両対応。</li>
  <li><strong>802.11ac（Wi-Fi 5）</strong>: 最大6.9Gbps。5GHz帯。</li>
  <li><strong>802.11ax（Wi-Fi 6）</strong>: 最大9.6Gbps。混雑環境での効率が向上。</li>
</ul>

<h3>ネットワーク機器</h3>
<ul>
  <li><strong>ハブ（リピータハブ）</strong>: 全ポートに同じデータを送信。第1層。</li>
  <li><strong>スイッチ（L2スイッチ）</strong>: MACアドレスで宛先を判断して転送。第2層。</li>
  <li><strong>ルータ</strong>: IPアドレスで経路を判断して転送。第3層。異なるネットワーク間を接続。</li>
  <li><strong>ファイアウォール</strong>: パケットを監視してアクセス制御。不正通信を遮断。</li>
</ul>

<h3>CSMA/CD（イーサネットの衝突制御）</h3>
<p>有線LANで複数の機器が同時に送信しようとすると「衝突（コリジョン）」が起きます。CSMA/CD（Carrier Sense Multiple Access with Collision Detection）はこれを検知・回復する方式です。</p>
<ol>
  <li><strong>CS（キャリアセンス）</strong>: 送信前に回線が空いているか確認する</li>
  <li><strong>MA（多重アクセス）</strong>: 空いていれば複数の機器が送信できる</li>
  <li><strong>CD（衝突検出）</strong>: 送信中に衝突を検知したらジャム信号を送り、ランダムな時間待ってから再送する</li>
</ol>
<p>現代のスイッチ環境（全二重通信）では衝突が原理的に発生しないため、CSMA/CDは実質的に使われなくなっています。</p>

<h3>プロキシサーバ</h3>
<p>クライアントに代わってインターネットへのアクセスを行う中継サーバです。</p>
<ul>
  <li><strong>セキュリティ向上</strong>: 内部ネットワークのIPアドレスを隠蔽</li>
  <li><strong>キャッシュ機能</strong>: 頻繁にアクセスするWebページをキャッシュして応答を高速化</li>
  <li><strong>アクセス制御</strong>: 特定サイトへのアクセスをフィルタリング（企業での利用制限など）</li>
  <li><strong>ログ管理</strong>: アクセスログを記録して不審な通信を監視</li>
</ul>

<h3>VPN（Virtual Private Network）</h3>
<p>インターネット上に仮想的な専用線を構築し、安全に通信する技術です。テレワークで社内ネットワークに接続する際に使用します。データは暗号化されて転送されます。主なプロトコルはIPsec・SSL/TLS・L2TPなどです。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
「ハブ＝第1層、スイッチ（L2）＝第2層（MACアドレス）、ルータ＝第3層（IPアドレス）」の対応は必須。<br/>
プロキシサーバ = クライアントの代わりにアクセスする中継サーバ（キャッシュ・フィルタリング）。
</div>
        `,
        diagram: 'network-devices',
        questions: [
          {
            id: 306,
            question: 'MACアドレスをもとにパケットを転送するネットワーク機器はどれか。',
            choices: ['ルータ', 'L2スイッチ', 'リピータハブ', 'ファイアウォール'],
            answer: 1,
            explanation: 'L2スイッチ（レイヤ2スイッチ）はMACアドレステーブルを参照して宛先ポートにのみ転送します。ルータはIPアドレスを使用します。',
          },
          {
            id: 307,
            question: 'テレワークで社内ネットワークに安全に接続するために使われる技術はどれか。',
            choices: ['DNS', 'DHCP', 'VPN', 'NAT'],
            answer: 2,
            explanation: 'VPN（仮想プライベートネットワーク）はインターネット上に暗号化された仮想専用線を構築し、安全なリモートアクセスを実現します。',
          },
          {
            id: 316,
            question: 'CSMA/CD方式の説明として正しいものはどれか。',
            choices: [
              '無線LANで電波の衝突を防ぐために使う送信制御方式',
              '送信前に回線の空きを確認し、衝突を検出したらランダム時間後に再送する方式',
              'トークンを使って送信権を順番に回す方式',
              'データをパケットに分割して複数経路で転送する方式',
            ],
            answer: 1,
            explanation: 'CSMA/CDはイーサネット（有線LAN）の衝突制御方式で、送信前にキャリアセンス（CS）し、衝突検出（CD）した場合はランダム時間待ってから再送します。スイッチ環境では衝突自体が発生しないため現在は実質不使用です。',
          },
          {
            id: 317,
            question: 'プロキシサーバを導入する目的として適切でないものはどれか。',
            choices: [
              'Webアクセスをキャッシュして応答を高速化する',
              '特定のWebサイトへのアクセスをフィルタリングする',
              '内部ネットワークのIPアドレスを外部から隠蔽する',
              'ネットワーク機器にIPアドレスを自動割り当てする',
            ],
            answer: 3,
            explanation: 'IPアドレスの自動割り当てはDHCPサーバの役割です。プロキシサーバの主な目的はキャッシュ・フィルタリング・アクセスログ記録・IPアドレス隠蔽などです。',
          },
          {
            id: 322,
            question: '無線LANのセキュリティプロトコルとして現在最も安全とされるものはどれか。',
            choices: ['WEP', 'WPA', 'WPA2（AES）', 'WPA3'],
            answer: 3,
            explanation: 'WPA3は2018年に策定された最新の無線LANセキュリティ規格です。SAE（Simultaneous Authentication of Equals）ハンドシェイクによりパスワード推測攻撃への耐性が向上しています。WEPは解読済みで危険、WPA/WPA2-AESは現役ですがWPA3が最も強固です。',
          },
        ],
      },
      {
        id: 'a3-5',
        title: 'HTTP・メール・その他のプロトコル',
        content: `
<h3>HTTP / HTTPS</h3>
<p>Webページの転送に使うプロトコルです。</p>
<p><strong>HTTP</strong>: テキストで通信する。盗聴・改ざんのリスクあり。</p>
<p><strong>HTTPS</strong>: <strong>TLS（Transport Layer Security）</strong>で暗号化。証明書で相手を認証。現在のWebの標準。</p>

<h3>HTTPの主なメソッド</h3>
<ul>
  <li><strong>GET</strong>: データを取得する（URLにパラメータ付加）</li>
  <li><strong>POST</strong>: データを送信する（フォーム送信など）</li>
  <li><strong>PUT</strong>: データを更新・作成する</li>
  <li><strong>DELETE</strong>: データを削除する</li>
</ul>

<h3>メールプロトコル</h3>
<ul>
  <li><strong>SMTP（25番）</strong>: メールの<strong>送信</strong>に使用</li>
  <li><strong>POP3（110番）</strong>: メールをサーバからダウンロードして受信。ダウンロード後はサーバから削除。</li>
  <li><strong>IMAP（143番）</strong>: メールをサーバ上で管理。複数デバイスから同じメールを参照できる。</li>
</ul>

<h3>DHCP（Dynamic Host Configuration Protocol）</h3>
<p>ネットワークに接続した端末に自動的にIPアドレス・サブネットマスク・デフォルトゲートウェイ・DNSサーバのアドレスを割り当てるプロトコルです。</p>

<h3>HTTPステータスコード</h3>
<p>サーバがクライアントのリクエストに返す3桁の番号で、処理結果を示します。</p>
<ul>
  <li><strong>1xx（情報）</strong>: 処理中・継続を示す</li>
  <li><strong>2xx（成功）</strong>: 200 OK（成功）、201 Created（作成成功）</li>
  <li><strong>3xx（リダイレクト）</strong>: 301 Moved Permanently（恒久的移動）、302 Found（一時移動）</li>
  <li><strong>4xx（クライアントエラー）</strong>: 400 Bad Request（リクエスト不正）、401 Unauthorized（認証必要）、403 Forbidden（禁止）、<strong>404 Not Found（リソースなし）</strong></li>
  <li><strong>5xx（サーバエラー）</strong>: <strong>500 Internal Server Error（サーバ内部エラー）</strong>、503 Service Unavailable（過負荷・メンテナンス）</li>
</ul>

<h3>Cookie とセッション</h3>
<p>HTTPはステートレスなプロトコルのため、ブラウザの状態（ログイン状態など）を保持する仕組みが必要です。</p>
<ul>
  <li><strong>Cookie</strong>: サーバがブラウザに保存させる小さなデータ。次回アクセス時に自動的にサーバへ送信される。有効期限・ドメイン・Secureフラグ（HTTPS必須）・HttpOnly（JSからのアクセス禁止）などを設定できる。</li>
  <li><strong>セッション</strong>: ログイン状態などの情報をサーバ側で管理する仕組み。クライアントにはセッションIDをCookieで渡し、サーバ側でIDと対応するデータを管理する。</li>
</ul>

<h3>SNMP・NTP</h3>
<p><strong>SNMP</strong>: ネットワーク機器（ルータ・スイッチ等）の状態監視・管理に使うプロトコル。MIB（Management Information Base）という形式で機器情報を管理する。</p>
<p><strong>NTP（Network Time Protocol）</strong>: ネットワーク上の機器の時刻を同期させるプロトコル。ログの時刻一致・証明書の有効期限管理など、時刻同期はセキュリティ上も重要。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
メールプロトコル: 送信=SMTP(25)、受信ダウンロード=POP3(110)、サーバ管理=IMAP(143)。<br/>
HTTPステータスコード: 200=OK、301=移動、404=見つからない、500=サーバエラー。<br/>
Cookie=クライアント保存、セッション=サーバ側保存でIDのみクライアントに渡す。
</div>
        `,
        diagram: 'http',
        questions: [
          {
            id: 308,
            question: 'メールをサーバ上で管理し、複数デバイスから参照できるプロトコルはどれか。',
            choices: ['SMTP', 'POP3', 'IMAP', 'FTP'],
            answer: 2,
            explanation: 'IMAPはメールをサーバ上に保存したまま管理するため、スマートフォン・PCなど複数端末で同じ受信ボックスを参照できます。',
          },
          {
            id: 309,
            question: 'ネットワークに接続した端末に自動的にIPアドレスを割り当てるプロトコルはどれか。',
            choices: ['DNS', 'DHCP', 'NAT', 'SNMP'],
            answer: 1,
            explanation: 'DHCPサーバが接続端末にIPアドレス・サブネットマスク・デフォルトゲートウェイなどを自動的に割り当てます。',
          },
          {
            id: 318,
            question: 'HTTPステータスコード 404 の意味として正しいものはどれか。',
            choices: [
              'リクエストは成功し、要求されたリソースを返した',
              'リソースが恒久的に別のURLへ移動した',
              '要求されたリソースがサーバ上に存在しない',
              'サーバ内部でエラーが発生しリクエストを処理できなかった',
            ],
            answer: 2,
            explanation: '404 Not Found は要求されたURL・リソースがサーバに存在しないことを示すクライアントエラーです。200=成功、301=恒久移動、500=サーバ内部エラーです。',
          },
          {
            id: 319,
            question: 'Cookieに関する説明として正しいものはどれか。',
            choices: [
              'サーバがログイン状態などを管理するためサーバ側に保存する仕組み',
              'サーバがブラウザに保存させ、次回アクセス時に自動送信される小さなデータ',
              'ネットワーク上の盗聴を防ぐためパケットを暗号化する技術',
              'Webサーバへのアクセスを記録するログファイルの形式',
            ],
            answer: 1,
            explanation: 'CookieはHTTPサーバがブラウザに保存させる小さなデータで、次のアクセス時に自動的にサーバへ送信されます。ログイン状態の維持や設定の保存に使います。サーバ側で状態を管理する仕組みはセッションです。',
          },
          {
            id: 323,
            question: 'HTTPSで使用されるTLSハンドシェイクの目的として正しいものはどれか。',
            choices: [
              'ドメイン名をIPアドレスに変換する',
              'サーバの身元確認と通信を暗号化するための共通鍵を安全に交換する',
              'パケットを宛先ルータに転送するための経路を決定する',
              'ブラウザのキャッシュを最新の状態に更新する',
            ],
            answer: 1,
            explanation: 'TLSハンドシェイクはサーバ証明書でサーバを認証し、その後公開鍵暗号を使って共通鍵を安全に交換します。以降の通信データはこの共通鍵（AESなど）で高速に暗号化されます（ハイブリッド暗号方式）。',
          },
        ],
      },
    ],
  },
  {
    id: 'a4',
    title: 'セキュリティ',
    subject: 'A',
    description: 'CIA・脅威と攻撃手法・暗号技術・認証・セキュリティ対策まで、情報セキュリティを体系的に学びます。',
    sections: [
      {
        id: 'a4-1',
        title: '情報セキュリティの基本概念',
        content: `
<h3>CIA（情報セキュリティの三大要素）</h3>
<p>情報セキュリティは次の3つの要素を守ることを目標にしています。</p>
<ul>
  <li><strong>機密性（Confidentiality）</strong>: 許可された人だけが情報にアクセスできる状態を保つ。暗号化・アクセス制御が手段。</li>
  <li><strong>完全性（Integrity）</strong>: 情報が正確・完全で、改ざんされていない状態を保つ。ハッシュ・デジタル署名が手段。</li>
  <li><strong>可用性（Availability）</strong>: 必要なときに情報やシステムを利用できる状態を保つ。冗長化・バックアップが手段。</li>
</ul>

<h3>さらに3要素を追加した6要素</h3>
<ul>
  <li><strong>真正性（Authenticity）</strong>: 利用者や情報が本物であることを確認できる</li>
  <li><strong>責任追跡性（Accountability）</strong>: 誰がいつ何をしたか追跡できる（ログ管理）</li>
  <li><strong>否認防止（Non-repudiation）</strong>: 行為を後から否定できないようにする</li>
</ul>

<h3>リスク管理の基本</h3>
<p>情報セキュリティのリスクは <code>リスク = 脅威 × 脆弱性 × 資産価値</code> で評価します。</p>
<ul>
  <li><strong>脅威</strong>: 攻撃・災害・人的ミスなど、損害を与える可能性のある事象</li>
  <li><strong>脆弱性</strong>: セキュリティ上の弱点（バグ・設定ミス・古いソフトウェアなど）</li>
</ul>

<h3>リスク対応の4種類</h3>
<p>リスクへの対処方法は4種類あります。状況によって使い分けが重要です。</p>
<ul>
  <li><strong>リスク回避</strong>: リスクの原因そのものをなくす（当該業務を廃止するなど）<br/>例: 個人情報を保有するサービスを廃止してリスク自体を消す</li>
  <li><strong>リスク低減（軽減）</strong>: セキュリティ対策を講じてリスクの発生確率や影響を小さくする<br/>例: パッチ適用・ファイアウォール導入・セキュリティ教育の実施</li>
  <li><strong>リスク移転（転嫁）</strong>: リスクの結果を第三者に転嫁する<br/>例: サイバー保険への加入・外部委託（SLA付き）</li>
  <li><strong>リスク受容</strong>: リスクを認識した上でそのまま受け入れる（対策コスト > 損失額の場合）<br/>例: 影響が軽微で発生確率も低いリスクをそのままにする</li>
</ul>

<h3>ISMS（情報セキュリティマネジメントシステム）</h3>
<p>組織的・継続的に情報セキュリティを管理する仕組みです。<strong>ISO/IEC 27001</strong>として国際規格化されています。</p>
<p>PDCAサイクルで継続的に改善します：</p>
<ul>
  <li><strong>Plan（計画）</strong>: リスクを評価してセキュリティ方針・対策を計画する</li>
  <li><strong>Do（実施）</strong>: 計画した対策を実施する（技術的対策・教育など）</li>
  <li><strong>Check（評価）</strong>: 内部監査・マネジメントレビューで有効性を確認する</li>
  <li><strong>Act（改善）</strong>: 問題点を改善して次のPlanに反映する</li>
</ul>

<h3>情報セキュリティポリシーの3文書</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">文書</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">内容</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">対象</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>基本方針</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">組織のセキュリティに対する基本的な考え方・目的</td><td style="padding:5px 8px;border:1px solid var(--color-border)">全員向け（経営層が策定）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>対策基準</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">基本方針を実現するための具体的なルール・基準</td><td style="padding:5px 8px;border:1px solid var(--color-border)">管理者・担当者向け</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>実施手順</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">対策基準を実践するための詳細な手順書・マニュアル</td><td style="padding:5px 8px;border:1px solid var(--color-border)">現場担当者向け</td></tr>
</table>

<h3>セキュリティインシデント対応組織</h3>
<ul>
  <li><strong>CSIRT（Computer Security Incident Response Team）</strong>: セキュリティインシデント（不正アクセス・情報漏洩等）が発生したときに対応する専門チーム</li>
  <li><strong>SOC（Security Operation Center）</strong>: 24時間365日でシステムを監視してインシデントを早期検出する組織</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
CIA: 機密性（暗号化）・完全性（ハッシュ・署名）・可用性（冗長化）の各手段を対応させて覚える。<br/>
リスク対応4種: 回避=原因除去、低減=対策実施、移転=保険・外注、受容=そのまま。「保険加入」=移転、「パッチ適用」=低減。<br/>
ISMS=ISO/IEC 27001に基づく情報セキュリティ管理の仕組み。PDCAで継続改善。CSIRT=インシデント対応チーム。
</div>
        `,
        diagram: 'security',
        questions: [
          {
            id: 10,
            question: '情報セキュリティのCIAのうち「可用性」の説明として正しいものはどれか。',
            choices: [
              '許可された人だけが情報にアクセスできる',
              '情報が改ざんされていない状態を保つ',
              '必要なときに情報を利用できる状態を保つ',
              '情報を暗号化して保護する',
            ],
            answer: 2,
            explanation: '可用性（Availability）とは、必要なときに情報やシステムを利用できることです。',
          },
          {
            id: 401,
            question: 'デジタル署名が主に保護するCIAの要素はどれか。',
            choices: ['機密性', '完全性', '可用性', '可用性と機密性'],
            answer: 1,
            explanation: 'デジタル署名はデータが改ざんされていないことを証明するため、主に完全性（Integrity）を保護します。',
          },
          {
            id: 411,
            question: 'リスク対応のうち「リスク移転」の例として正しいものはどれか。',
            choices: [
              'セキュリティパッチを適用して脆弱性を修正する',
              'リスクが小さいため対策せずそのままにする',
              'サイバー保険に加入してインシデント時の損害を補填できるようにする',
              '個人情報を保有するサービス自体を廃止する',
            ],
            answer: 2,
            explanation: 'リスク移転はリスクによる損害を保険・外部委託などで第三者に転嫁することです。パッチ適用=低減、そのまま許容=受容、サービス廃止=回避 です。',
          },
          {
            id: 412,
            question: 'ISMSに関する説明として正しいものはどれか。',
            choices: [
              '脆弱性の深刻度を0〜10で数値化する評価システム',
              '情報セキュリティを組織的に管理するためのフレームワークでISO/IEC 27001で規格化されている',
              '不正アクセスを検知して管理者に通知する技術的システム',
              'マルウェアを検知・除去するためのソフトウェア',
            ],
            answer: 1,
            explanation: 'ISMS（情報セキュリティマネジメントシステム）はPDCAサイクルで情報セキュリティを継続的に改善する組織的フレームワークで、ISO/IEC 27001として国際標準化されています。',
          },
          {
            id: 421,
            question: '情報セキュリティのCIA「完全性（Integrity）」を脅かす行為はどれか。',
            choices: [
              '許可なく秘密のファイルを閲覧する',
              'データベースの内容を無断で書き換える',
              'サービスを大量リクエストで停止させる',
              'パスワードを盗聴する',
            ],
            answer: 1,
            explanation: '完全性はデータが正確かつ完全であることを保証する性質です。データの無断書き換え（改ざん）はこれを脅かします。閲覧のみは機密性、サービス停止は可用性、盗聴は機密性の侵害です。',
          },
        ],
      },
      {
        id: 'a4-2',
        title: '主な攻撃手法',
        content: `
<h3>マルウェアの種類</h3>
<ul>
  <li><strong>ウイルス</strong>: 他のプログラムに寄生して増殖する。宿主ファイルが必要。</li>
  <li><strong>ワーム</strong>: 単独で自己複製しネットワークを通じて拡散する。宿主不要。</li>
  <li><strong>トロイの木馬</strong>: 正常なソフトに見せかけて侵入し、バックドアを作成。</li>
  <li><strong>ランサムウェア</strong>: ファイルを暗号化して身代金を要求する。近年急増。</li>
  <li><strong>スパイウェア</strong>: ユーザーの行動・情報を密かに収集・送信する。</li>
  <li><strong>ボット</strong>: 遠隔操作されて攻撃に加担するマルウェア。DDoS攻撃などに利用。</li>
</ul>

<h3>ソーシャルエンジニアリング</h3>
<p>技術的手段ではなく<strong>人の心理や行動</strong>を利用して情報を盗む手法です。</p>
<ul>
  <li><strong>フィッシング</strong>: 偽メール・偽サイトでパスワードや個人情報を詐取</li>
  <li><strong>スピアフィッシング</strong>: 特定の個人・組織を狙った標的型フィッシング</li>
  <li><strong>ビッシング</strong>: 電話を使ったフィッシング詐欺</li>
  <li><strong>ショルダーハッキング</strong>: 背後から画面や入力を覗き見る</li>
</ul>

<h3>Web・ネットワーク系の攻撃</h3>
<ul>
  <li><strong>SQLインジェクション</strong>: 入力フォームに不正なSQL文を注入してDBを操作する</li>
  <li><strong>XSS（クロスサイトスクリプティング）</strong>: 悪意あるスクリプトをWebページに埋め込みユーザーを攻撃</li>
  <li><strong>CSRF（クロスサイトリクエストフォージェリ）</strong>: ユーザーが意図しないリクエストを送らせる</li>
  <li><strong>DoS攻撃</strong>: 大量のリクエストでサーバをダウンさせる</li>
  <li><strong>DDoS攻撃</strong>: 多数の端末（ボットネット）から一斉にDoS攻撃を行う</li>
  <li><strong>中間者攻撃（MITM）</strong>: 通信経路に割り込んでデータを盗聴・改ざんする</li>
  <li><strong>ブルートフォース攻撃</strong>: パスワードを全通り試す総当たり攻撃</li>
  <li><strong>辞書攻撃</strong>: よく使われるパスワード辞書を使って効率よく試す</li>
</ul>

<h3>その他の重要な攻撃手法</h3>
<ul>
  <li>
    <strong>ゼロデイ攻撃</strong>: ソフトウェアの脆弱性が公開・修正される前（ゼロ日目）に行われる攻撃。パッチが存在しないため防御が非常に難しい。発見から修正まで「ゼロ日」しかないことが名前の由来。
  </li>
  <li>
    <strong>バッファオーバーフロー</strong>: プログラムの入力バッファ（一時記憶領域）の容量を超えるデータを送り込み、隣接するメモリ領域を上書きして任意コードを実行させる攻撃。境界値チェックの不備が原因。
  </li>
  <li>
    <strong>標的型攻撃（APT）</strong>: 特定の組織・個人を長期間にわたって執拗に狙う高度な攻撃。スピアフィッシングでの侵入→内部潜伏→横展開→情報窃取という段階を踏む。
  </li>
  <li>
    <strong>パスワードリスト攻撃</strong>: 他のサービスから流出したパスワードリストを使い、使い回しているアカウントへの不正ログインを試みる。パスワード使い回しが最大の原因。
  </li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
「ゼロデイ攻撃」= パッチ未公開の脆弱性を狙う。「ランサムウェア」= 暗号化して身代金要求。<br/>
XSS = スクリプト埋め込み、CSRF = ユーザーに意図しない操作をさせる（混同に注意）。
</div>
        `,
        diagram: 'attack',
        questions: [
          {
            id: 402,
            question: '宿主となるプログラムを必要とせず、単独でネットワークを通じて自己複製・拡散するマルウェアはどれか。',
            choices: ['ウイルス', 'ワーム', 'トロイの木馬', 'スパイウェア'],
            answer: 1,
            explanation: 'ワームは他のプログラムに寄生せず単独で動作し、ネットワークを通じて自動的に増殖・拡散します。',
          },
          {
            id: 403,
            question: 'SQLインジェクション攻撃の説明として正しいものはどれか。',
            choices: [
              '偽サイトに誘導してパスワードを詐取する攻撃',
              '入力フォームに不正なSQL文を注入してデータベースを操作する攻撃',
              'Webページに悪意あるスクリプトを埋め込む攻撃',
              '大量のリクエストを送りサーバをダウンさせる攻撃',
            ],
            answer: 1,
            explanation: 'SQLインジェクションはユーザー入力を適切にサニタイズしないシステムに対し、不正なSQL文を注入してDBを不正操作する攻撃です。',
          },
          {
            id: 404,
            question: '技術的手段ではなく人の心理を利用して情報を盗む手法を何というか。',
            choices: ['マルウェア', 'ブルートフォース攻撃', 'ソーシャルエンジニアリング', 'ゼロデイ攻撃'],
            answer: 2,
            explanation: 'ソーシャルエンジニアリングはなりすまし・電話・覗き見など人間の心理・行動を悪用した非技術的な情報窃取手法です。',
          },
          {
            id: 413,
            question: 'ランサムウェアの説明として正しいものはどれか。',
            choices: [
              '感染したPCの情報を秘密裏に収集して外部に送信するマルウェア',
              'ファイルやシステムを暗号化し、復号の対価として金銭を要求するマルウェア',
              '正規ソフトに偽装してシステムに侵入し、バックドアを作成するマルウェア',
              'ネットワーク上で自己複製しながら拡散するマルウェア',
            ],
            answer: 1,
            explanation: 'ランサムウェアはファイル・ディスクを暗号化して使用不能にし、復号鍵と引き換えに身代金（Ransom）を要求するマルウェアです。バックアップの定期取得が主な対策です。',
          },
          {
            id: 414,
            question: 'ゼロデイ攻撃の説明として正しいものはどれか。',
            choices: [
              'パスワードを0から9の数字のみで構成し総当たりする攻撃',
              'ソフトウェアの脆弱性が公表・修正される前に行われる攻撃',
              'サーバへ0バイトのパケットを大量送信してダウンさせる攻撃',
              '初日にアクセスしたユーザーの認証情報を窃取する攻撃',
            ],
            answer: 1,
            explanation: 'ゼロデイ攻撃は脆弱性が発見されてからパッチが提供されるまでの「ゼロ日」の期間に行われる攻撃です。パッチが存在しないため防御が困難で、WAFや振る舞い検知での対策が主になります。',
          },
        ],
      },
      {
        id: 'a4-3',
        title: '暗号技術',
        content: `
<h3>暗号化とは：データを「読めない形」に変換する技術</h3>
<p>インターネット上の通信は多くの中継点を経由します。暗号化がなければ、途中でデータを傍受されたら丸見えです。暗号化はデータを第三者が読めない形に変換して<strong>機密性</strong>を守る技術です。</p>

<h3>共通鍵暗号方式（対称鍵暗号）</h3>
<p>送信者と受信者が<strong>同じ鍵</strong>を使って暗号化・復号する方式です。</p>
<p>日常のたとえ：南京錠と鍵を1つずつ持ち合う。同じ鍵で開け閉めする。</p>
<ul>
  <li>✓ <strong>高速</strong>：大量データの暗号化に向く（動画・ファイル転送）</li>
  <li>✓ <strong>回路実装が容易</strong>：ハードウェアで高速処理できる</li>
  <li>✗ <strong>鍵配送問題</strong>：「同じ鍵」をどうやって相手に安全に送るか？初めて通信する相手には暗号化前に鍵を送る必要があるが、そこで盗まれると意味がない。</li>
</ul>
<p>代表例: <strong>AES（Advanced Encryption Standard）</strong>が現在の標準。128/192/256ビット鍵長。DESは56ビットで脆弱なため非推奨。</p>

<h3>公開鍵暗号方式（非対称鍵暗号）</h3>
<p>「公開鍵」と「秘密鍵」という<strong>2つの異なる鍵</strong>を使う方式です。数学的に関連した鍵ペアで、一方で暗号化した内容はもう一方でしか復号できません。</p>
<p>日常のたとえ：誰でも物を入れられる「投入口のある箱（公開鍵）」を公開し、自分だけが持つ「鍵（秘密鍵）」で開ける。</p>
<ul>
  <li>✓ 鍵配送問題を解決（公開鍵はインターネット上に公開してよい）</li>
  <li>✗ 共通鍵方式より<strong>100〜1000倍遅い</strong>。大量データには不向き。</li>
</ul>
<p><strong>暗号化の流れ</strong>: 「受信者の公開鍵」で暗号化 → 「受信者の秘密鍵」でのみ復号可能</p>
<p>代表例: <strong>RSA</strong>（大きな数の素因数分解の困難さが安全の根拠）、楕円曲線暗号（ECC）</p>

<h3>ハイブリッド暗号方式（実際のHTTPS）</h3>
<p>共通鍵の「速さ」と公開鍵の「鍵配送問題の解決」を組み合わせた方式です。TLS（HTTPS）はこの方式を使っています。</p>
<ol>
  <li>公開鍵暗号で<strong>共通鍵を安全に共有</strong>する（遅いが一度だけ）</li>
  <li>共有した共通鍵で<strong>実際の通信データを暗号化</strong>する（高速）</li>
</ol>
<p>→ 「鍵の交換だけ公開鍵で行い、実際の通信は共通鍵で行う」これがHTTPSの仕組みです。</p>

<h3>ハッシュ関数</h3>
<p>任意の長さのデータから<strong>固定長のハッシュ値（ダイジェスト）</strong>を生成する一方向関数です。</p>
<p>重要な性質：</p>
<ul>
  <li><strong>一方向性</strong>: ハッシュ値から元データを復元できない</li>
  <li><strong>衝突耐性</strong>: 異なるデータが同じハッシュ値になりにくい</li>
  <li><strong>雪崩効果</strong>: 入力が1ビット変わるだけでハッシュ値が大幅に変わる</li>
</ul>
<p>主な用途：パスワードの保存（平文でなくハッシュで保存）・ファイル整合性確認・デジタル署名</p>
<p>代表例: <strong>SHA-256</strong>（256ビット、現在の標準）。MD5は脆弱性があり非推奨。</p>

<h3>共通鍵の鍵管理数</h3>
<p>n台のコンピュータが互いに共通鍵暗号で通信する場合、すべての組み合わせで異なる鍵が必要です。</p>
<pre>
必要な共通鍵の数 = n × (n-1) ÷ 2

例: 5台のPC が互いに通信する場合
= 5 × 4 ÷ 2 = 10本の鍵が必要

例: 10台なら
= 10 × 9 ÷ 2 = 45本の鍵が必要
</pre>
<p>一方、公開鍵暗号では各自が公開鍵と秘密鍵を1ペアずつ持つだけでよいので、n台で <strong>2n本</strong>（公開鍵n本+秘密鍵n本）で済みます。管理する鍵の数が劇的に少なくなるため、大規模ネットワークでは公開鍵方式が有利です。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
「公開鍵で暗号化→秘密鍵で復号」（暗号化通信）と「秘密鍵で署名→公開鍵で検証」（デジタル署名）を混同しないこと。用途の違いで使う鍵が逆になります。<br/>
n台の共通鍵の数 = n(n-1)/2 本。10台なら45本、100台なら4,950本。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「ハッシュ関数は復号できる」は誤りです。ハッシュは暗号化ではなく一方向の変換です。復号（元に戻す）はできません。パスワード照合はハッシュ同士を比較します。
</div>
        `,
        diagram: 'crypto',
        questions: [
          {
            id: 405,
            question: '公開鍵暗号方式でデータを暗号化するときに使う鍵はどれか。',
            choices: ['送信者の秘密鍵', '送信者の公開鍵', '受信者の秘密鍵', '受信者の公開鍵'],
            answer: 3,
            explanation: '公開鍵暗号方式では受信者の公開鍵で暗号化し、受信者だけが持つ秘密鍵で復号します。',
          },
          {
            id: 406,
            question: 'ハッシュ関数の性質として正しいものはどれか。',
            choices: [
              'ハッシュ値から元のデータを復元できる',
              '同じデータからは常に同じハッシュ値が生成される',
              'ハッシュ値の長さは入力データの長さに比例する',
              '暗号化と復号に異なる鍵を使う',
            ],
            answer: 1,
            explanation: 'ハッシュ関数は同じ入力から常に同じ固定長のハッシュ値を生成します。一方向性があり復元は不可能です。',
          },
          {
            id: 415,
            question: '6台のコンピュータが共通鍵暗号を使って互いに通信するとき、必要な鍵の総数はいくつか。',
            choices: ['6本', '12本', '15本', '30本'],
            answer: 2,
            explanation: 'n台の共通鍵の数 = n×(n-1)÷2 = 6×5÷2 = 15本です。全ペアに異なる鍵が必要なため、台数が増えると鍵の管理が膨大になります。公開鍵方式なら6台で公開鍵6本+秘密鍵6本の合計12本で済みます。',
          },
          {
            id: 416,
            question: 'AESとRSAの組み合わせとして正しいものはどれか。',
            choices: [
              'AES=公開鍵暗号、RSA=共通鍵暗号',
              'AES=共通鍵暗号で高速、RSA=公開鍵暗号で鍵配送問題を解決',
              'AESもRSAも共通鍵暗号でハードウェア実装向け',
              'AES=ハッシュ関数、RSA=デジタル署名専用',
            ],
            answer: 1,
            explanation: 'AES（Advanced Encryption Standard）は共通鍵暗号で大量データの高速暗号化に使用します。RSAは公開鍵暗号で、鍵配送問題を解決できますが処理が遅いです。HTTPSではRSAで共通鍵を交換し、AESでデータを暗号化するハイブリッド方式を使います。',
          },
          {
            id: 422,
            question: 'ファイルの改ざん検知にハッシュ関数を使う理由として正しいものはどれか。',
            choices: [
              'ハッシュ値を復号すると元ファイルが得られるから',
              'ファイルが1ビットでも変わるとハッシュ値が大きく変わる性質があるから',
              'ハッシュ関数はファイルを暗号化して盗聴を防ぐから',
              'ハッシュ値が同じなら必ず同じファイルであることが保証されるから',
            ],
            answer: 1,
            explanation: 'ハッシュ関数の「雪崩効果」により、入力が1ビットでも変わるとハッシュ値が大きく変わります。これにより改ざんを高確率で検知できます。なお、異なるファイルでも同じハッシュ値になる「衝突」は原理的に起こりうるため、強力なハッシュ関数（SHA-256など）の使用が重要です。',
          },
        ],
      },
      {
        id: 'a4-4',
        title: '認証とデジタル署名',
        content: `
<h3>認証の種類</h3>
<p>「あなたは本当に本人ですか？」を確認することを<strong>認証（Authentication）</strong>といいます。</p>
<ul>
  <li><strong>知識認証</strong>: パスワード・PINなど「知っているもの」</li>
  <li><strong>所持認証</strong>: ICカード・スマートフォンなど「持っているもの」</li>
  <li><strong>生体認証（バイオメトリクス）</strong>: 指紋・顔・虹彩など「本人の特徴」</li>
</ul>

<h3>多要素認証（MFA）</h3>
<p>上記の認証方式を<strong>2つ以上</strong>組み合わせることで安全性を高めます。</p>
<p>例: パスワード（知識）＋スマートフォンへのワンタイムパスワード（所持）</p>

<h3>デジタル署名</h3>
<p>送信者が<strong>秘密鍵でハッシュ値を暗号化</strong>したものが署名です。受信者は送信者の<strong>公開鍵で復号</strong>して検証します。</p>
<p>デジタル署名で確認できること：</p>
<ul>
  <li><strong>完全性</strong>: データが改ざんされていないか</li>
  <li><strong>真正性</strong>: 送信者が本人かどうか</li>
  <li><strong>否認防止</strong>: 送信した事実を後から否定できない</li>
</ul>

<h3>PKI（公開鍵基盤）と電子証明書</h3>
<p>公開鍵が本物かどうかを証明するために<strong>認証局（CA）</strong>が電子証明書を発行します。</p>
<p>HTTPSのSSL/TLS証明書がその代表例です。ブラウザのアドレスバーの鍵マークで確認できます。</p>

<h3>シングルサインオン（SSO）</h3>
<p>一度のログインで複数のシステム・サービスを利用できる仕組みです。利便性向上とパスワード管理の一元化が目的です。</p>
<p>実装技術例：SAML（XML形式のトークン交換）、OAuth 2.0（アクセス権の委譲）、OpenID Connect（認証情報の共有）</p>

<h3>PKI（公開鍵基盤）の仕組み</h3>
<p>公開鍵暗号の最大の課題は「その公開鍵が本当に本人のものか」の確認です。PKI（Public Key Infrastructure）は<strong>認証局（CA: Certificate Authority）</strong>が電子証明書を発行して公開鍵の正当性を保証します。</p>
<ol>
  <li>サーバが秘密鍵と公開鍵のペアを生成し、認証局に<strong>証明書署名要求（CSR）</strong>を送る</li>
  <li>認証局がサーバの身元を確認し、<strong>電子証明書（サーバ証明書）</strong>を発行する</li>
  <li>ブラウザはルート認証局を信頼しており、証明書チェーンをたどって検証する</li>
  <li>証明書が有効であれば、公開鍵が本物であると信頼できる</li>
</ol>
<p>HTTPSのアドレスバーの鍵マーク・「この接続は保護されています」はこの仕組みが機能していることを示します。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
デジタル署名: 署名=送信者の秘密鍵で作成、検証=送信者の公開鍵で確認。<br/>
MFA: 知識・所持・生体のうち異なる要素を2つ以上組み合わせること（同じ種類2回はNG）。<br/>
PKI: 認証局（CA）が電子証明書を発行して公開鍵の正当性を保証する仕組み。
</div>
        `,
        diagram: 'digital-signature',
        questions: [
          {
            id: 407,
            question: 'デジタル署名の作成に使う鍵はどれか。',
            choices: ['受信者の公開鍵', '受信者の秘密鍵', '送信者の秘密鍵', '送信者の公開鍵'],
            answer: 2,
            explanation: 'デジタル署名は送信者が自分の秘密鍵でハッシュ値を暗号化して作成します。受信者は送信者の公開鍵で検証します。',
          },
          {
            id: 408,
            question: '多要素認証（MFA）の例として正しいものはどれか。',
            choices: [
              'パスワードを2回入力する',
              'パスワードとスマートフォンへのワンタイムパスワードを組み合わせる',
              '長いパスワードを設定する',
              '異なるサービスで同じパスワードを使う',
            ],
            answer: 1,
            explanation: '多要素認証は知識（パスワード）・所持（スマートフォン）・生体など異なる要素を2つ以上組み合わせます。同じ種類の認証を2回行うのは多要素認証ではありません。',
          },
          {
            id: 417,
            question: 'PKIにおける認証局（CA）の役割として正しいものはどれか。',
            choices: [
              'ユーザーのパスワードを暗号化して保管する機関',
              '公開鍵の正当性を保証する電子証明書を発行する機関',
              '不正アクセスを検知してブロックするセキュリティ機器',
              'ネットワーク上の機器にIPアドレスを割り当てる機関',
            ],
            answer: 1,
            explanation: '認証局（CA）はデジタル証明書を発行し、公開鍵がその所有者のものであることを保証します。ブラウザはルートCAを信頼することでHTTPS通信の正当性を検証できます。',
          },
          {
            id: 418,
            question: 'シングルサインオン（SSO）の主な目的として正しいものはどれか。',
            choices: [
              'パスワードを複数のサービスで共有して記憶の負担を減らす',
              '一度のログインで複数のシステムにアクセスできるようにして利便性と管理を向上させる',
              '複数のパスワードを1つの強力なパスワードに変換して安全性を高める',
              '生体認証を全システムに統一適用してセキュリティを強化する',
            ],
            answer: 1,
            explanation: 'SSOは一度の認証で複数のシステム・サービスを利用できる仕組みで、ユーザーの利便性向上とパスワード管理の一元化（IT管理コスト削減）を目的とします。パスワードの共有とは異なります。',
          },
          {
            id: 423,
            question: 'TOTP（時刻同期型ワンタイムパスワード）の説明として正しいものはどれか。',
            choices: [
              '一度使うと無効になるパスワードで、現在時刻をもとに30秒ごとに変化する',
              'パスワードをハッシュ化してネットワーク送信するプロトコル',
              '公開鍵証明書を使ってサーバを認証する仕組み',
              '複数のサービスで同じパスワードを安全に使い回すための技術',
            ],
            answer: 0,
            explanation: 'TOTPは現在時刻とシークレットキーをもとに一定時間（30秒）ごとに変化するワンタイムパスワードを生成します。Google AuthenticatorなどのMFAアプリで使われ、盗まれても短時間で無効になります。',
          },
        ],
      },
      {
        id: 'a4-5',
        title: 'セキュリティ対策と管理',
        content: `
<h3>技術的セキュリティ対策</h3>
<ul>
  <li><strong>ファイアウォール</strong>: 不正なパケットを遮断。ポート番号やIPアドレスでフィルタリング。</li>
  <li><strong>IDS（侵入検知システム）</strong>: 不正アクセスを検知して管理者に通知。</li>
  <li><strong>IPS（侵入防止システム）</strong>: 不正アクセスを検知して自動的にブロック。</li>
  <li><strong>WAF（Webアプリケーションファイアウォール）</strong>: SQLインジェクション・XSSなどWebアプリ固有の攻撃を防ぐ。</li>
  <li><strong>ウイルス対策ソフト</strong>: マルウェアを検知・除去する。定義ファイルの更新が重要。</li>
  <li><strong>DMZ（非武装地帯）</strong>: 外部公開サーバを内部ネットワークから隔離したネットワーク領域。</li>
</ul>

<h3>セキュリティ評価基準</h3>
<ul>
  <li><strong>ISMS（情報セキュリティマネジメントシステム）</strong>: 組織的にセキュリティを管理するフレームワーク。ISO/IEC 27001で規格化。</li>
  <li><strong>CVSS（共通脆弱性評価システム）</strong>: 脆弱性の深刻度を0〜10で評価する共通指標。</li>
  <li><strong>ペネトレーションテスト</strong>: 実際に攻撃を試みて脆弱性を発見する検査。</li>
</ul>

<h3>インシデント対応</h3>
<p>セキュリティ事故が発生した際の対応手順（PDCA）:</p>
<ol>
  <li><strong>検知・報告</strong>: インシデントの発生を確認し報告</li>
  <li><strong>封じ込め</strong>: 被害の拡大を防ぐ（ネットワーク遮断など）</li>
  <li><strong>根絶</strong>: 原因を特定して除去</li>
  <li><strong>復旧</strong>: システムを通常状態に戻す</li>
  <li><strong>事後対応</strong>: 再発防止策の策定・教育</li>
</ol>

<h3>バックアップ戦略</h3>
<ul>
  <li><strong>フルバックアップ</strong>: 全データを毎回バックアップ。復元が最も簡単（フルのみで復元）だが時間・容量がかかる。</li>
  <li><strong>差分バックアップ</strong>: 前回フルバックアップ以降の変更分を保存。復元は「フル＋最新の差分」の2回。</li>
  <li><strong>増分バックアップ</strong>: 前回バックアップ（フルまたは増分）以降の変更分のみ保存。最も容量効率が良いが、復元は「フル＋全増分」と手間がかかる。</li>
</ul>
<pre>
バックアップ方式の比較:
                バックアップ時間  バックアップ容量  復元時間
フル             長い             大きい           短い（1回）
差分             中程度           中程度           短い（2回）
増分             短い             小さい           長い（複数回）
</pre>

<h3>CSIRT（コンピュータセキュリティインシデント対応チーム）</h3>
<p>セキュリティインシデント（事故・事件）が発生したときに対応する専門チームです。インシデントの検知・分析・封じ込め・復旧・再発防止を担当します。</p>
<ul>
  <li><strong>社内CSIRT</strong>: 自組織のインシデントに対応する内部チーム</li>
  <li><strong>JPCERT/CC</strong>: 日本のコンピュータ緊急対応チーム。インシデント情報の収集・分析・対応支援を行う国内調整機関</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
DMZ = 外部公開サーバを内部NWから隔離した中間ネットワーク領域。<br/>
IDS=検知のみ、IPS=検知＋自動ブロック、WAF=Webアプリ特化。<br/>
差分バックアップ復元: フル+最新差分の2回。増分: フル+全増分の複数回。
</div>
        `,
        diagram: 'security-measures',
        questions: [
          {
            id: 409,
            question: 'WAF（Webアプリケーションファイアウォール）が防ぐ攻撃として適切なものはどれか。',
            choices: [
              'DDos攻撃による帯域幅の枯渇',
              'SQLインジェクションやXSSなどのWebアプリケーション攻撃',
              'フィッシングメールによるパスワード詐取',
              '物理的な不正アクセス',
            ],
            answer: 1,
            explanation: 'WAFはHTTPトラフィックを監視し、SQLインジェクション・XSS・CSRFなどWebアプリケーション固有の攻撃パターンを検知・遮断します。',
          },
          {
            id: 410,
            question: '毎回全データをバックアップする方式はどれか。',
            choices: ['増分バックアップ', '差分バックアップ', 'フルバックアップ', 'スナップショット'],
            answer: 2,
            explanation: 'フルバックアップは毎回全データを保存します。復元が簡単な反面、時間と容量を多く消費します。',
          },
          {
            id: 419,
            question: '差分バックアップからシステムを復元するとき、必要なバックアップはどれか。',
            choices: [
              'フルバックアップのみ',
              '最新の差分バックアップのみ',
              'フルバックアップと最新の差分バックアップ',
              'フルバックアップと全ての差分バックアップ',
            ],
            answer: 2,
            explanation: '差分バックアップはフルバックアップ以降の全変更を保存するため、復元にはフルバックアップと最新の差分バックアップの2つが必要です。増分バックアップの場合はフルバックアップと全ての増分バックアップが必要になります。',
          },
          {
            id: 420,
            question: 'DMZ（非武装地帯）の説明として正しいものはどれか。',
            choices: [
              '社内ネットワーク全体を暗号化通信で保護する領域',
              'インターネットと内部ネットワークの間に設けた公開サーバ用の隔離ネットワーク領域',
              '不正パケットを自動的に遮断するファイアウォールの機能名称',
              'マルウェアを実行して動作を解析するサンドボックス環境',
            ],
            answer: 1,
            explanation: 'DMZはWebサーバ・メールサーバなど外部公開が必要なサーバを内部ネットワークから切り離した中間ネットワーク領域です。外部からDMZへのアクセスは許可しつつ、DMZから内部ネットワークへのアクセスをファイアウォールで制限することでセキュリティを確保します。',
          },
          {
            id: 424,
            question: '増分バックアップの特徴として正しいものはどれか。',
            choices: [
              'バックアップのたびに全データを保存するため復元が最も簡単',
              '前回フルバックアップからの全変更を保存するため復元に2回のバックアップが必要',
              '前回バックアップ以降の変更分のみ保存するため容量効率は最良だが復元に複数回必要',
              'リアルタイムにデータを別ディスクに複製する方式',
            ],
            answer: 2,
            explanation: '増分バックアップは前回のバックアップ（フルまたは増分）以降に変更されたデータのみを保存します。バックアップ時間・容量は最小ですが、復元時はフル＋その後の全増分バックアップが必要で手間がかかります。',
          },
        ],
      },
      {
        id: 'a4-6',
        title: '量子暗号・ゼロトラスト・インシデント対応',
        content: `
<h3>量子暗号と耐量子暗号</h3>
<p>量子コンピュータは現在の公開鍵暗号（RSA・楕円曲線）を短期間で解読できる可能性があり、暗号技術の転換点を迎えています。</p>

<h4>量子コンピュータの脅威</h4>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">暗号方式</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">現在の安全性</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">量子コンピュータへの耐性</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">RSA（公開鍵暗号）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">素因数分解の困難さに依存</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ショアのアルゴリズムで解読可能 ⚠️</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">楕円曲線暗号（ECC）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">離散対数問題の困難さに依存</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ショアのアルゴリズムで解読可能 ⚠️</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">AES-256（共通鍵暗号）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">鍵長256ビット</td><td style="padding:5px 8px;border:1px solid var(--color-border)">グローバーのアルゴリズムで実効鍵長が半減→128ビット相当。引き続き安全とされる ✅</td></tr>
</table>

<h4>量子鍵配送（QKD: Quantum Key Distribution）</h4>
<p>量子力学の原理を使って<strong>盗聴が物理的に不可能</strong>な鍵配送を実現する技術です。盗聴しようとすると量子状態が変化し、盗聴の事実を検出できます。BB84プロトコルが代表例です。</p>

<h4>耐量子暗号（PQC: Post-Quantum Cryptography）</h4>
<p>量子コンピュータでも解読困難な新しい暗号方式。米国NISTが2022〜2024年に標準化を推進しています。</p>
<ul>
  <li><strong>格子暗号（Lattice-based）</strong>: CRYSTALS-Kyber / CRYSTALS-Dilithium — NISTが標準化した代表格</li>
  <li><strong>ハッシュ署名（Hash-based）</strong>: SPHINCS+ — ハッシュ関数の安全性のみに依存</li>
  <li><strong>特徴</strong>: 既存のインターネットインフラ上で動作可能（量子通信路不要）</li>
</ul>

<h3>ゼロトラストセキュリティ</h3>
<p>「<strong>何も信頼しない（Never Trust, Always Verify）</strong>」を原則とするセキュリティモデルです。従来の「境界防御（社内ネットワーク内は安全）」の考え方を根本から変えます。</p>

<h4>従来モデル vs ゼロトラストモデル</h4>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">項目</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">境界防御（従来）</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">ゼロトラスト</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">信頼の基準</td><td style="padding:5px 8px;border:1px solid var(--color-border)">社内ネットワーク内=信頼</td><td style="padding:5px 8px;border:1px solid var(--color-border)">場所に関わらず毎回検証</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">認証タイミング</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ログイン時のみ</td><td style="padding:5px 8px;border:1px solid var(--color-border)">アクセスごとに継続的に検証</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">テレワーク対応</td><td style="padding:5px 8px;border:1px solid var(--color-border)">VPNで社内に接続</td><td style="padding:5px 8px;border:1px solid var(--color-border)">場所・デバイスを問わず最小権限で接続</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">侵害後の被害</td><td style="padding:5px 8px;border:1px solid var(--color-border)">内部に侵入されると横展開されやすい</td><td style="padding:5px 8px;border:1px solid var(--color-border)">マイクロセグメンテーションで被害を局所化</td></tr>
</table>

<h4>ゼロトラストの主要技術要素</h4>
<ul>
  <li><strong>MFA（多要素認証）</strong>: 認証強化。知識・所持・生体の複数要素を組み合わせる。</li>
  <li><strong>マイクロセグメンテーション</strong>: ネットワークを細かく分割し、セグメント間の通信を制限。</li>
  <li><strong>最小権限の原則</strong>: 業務に必要な最小限の権限のみ付与。不要な権限は持たせない。</li>
  <li><strong>継続的な監視・検証</strong>: SIEM（セキュリティ情報・イベント管理）で異常を常時検知。</li>
  <li><strong>デバイス健全性の確認</strong>: OSパッチ適用状況・EDR（エンドポイント検出・対応）の導入確認。</li>
</ul>

<h3>インシデント対応の詳細プロセス</h3>
<p>NIST SP 800-61 や SANS の定義に基づく標準的な対応フロー：</p>

<h4>① 準備（Preparation）</h4>
<ul>
  <li>インシデント対応計画・手順書の整備</li>
  <li>CSIRTの組織化と役割分担</li>
  <li>ログ収集基盤（SIEM）の整備</li>
  <li>連絡体制・エスカレーション経路の確立</li>
</ul>

<h4>② 検知・分析（Detection & Analysis）</h4>
<ul>
  <li>ログ・アラートによるインシデントの発見</li>
  <li>影響範囲・深刻度（CVSS）の評価</li>
  <li><strong>IoC（侵害指標）</strong>の収集: 不審なIPアドレス・ファイルハッシュ・ドメインなど</li>
</ul>

<h4>③ 封じ込め（Containment）</h4>
<ul>
  <li><strong>短期封じ込め</strong>: 感染端末をネットワークから切り離す（隔離）</li>
  <li><strong>長期封じ込め</strong>: システムを維持しつつ攻撃の拡大を防ぐ</li>
  <li>証拠保全のため<strong>フォレンジクスイメージ</strong>を取得（削除前に必ず実施）</li>
</ul>

<h4>④ 根絶（Eradication）</h4>
<ul>
  <li>マルウェアの除去・バックドアの閉鎖</li>
  <li>脆弱性へのパッチ適用</li>
  <li>侵害された認証情報の変更</li>
</ul>

<h4>⑤ 復旧（Recovery）</h4>
<ul>
  <li>クリーンなバックアップからの復元</li>
  <li>監視を強化した状態でのシステム稼働再開</li>
</ul>

<h4>⑥ 事後活動（Post-Incident Activity）</h4>
<ul>
  <li><strong>ポストモーテム（事後検証）</strong>: 何が起きたか・何がうまくいったか・何を改善するか</li>
  <li>再発防止策の策定・セキュリティポリシーの更新</li>
  <li>JPCERT/CC や警察への届出（必要に応じて）</li>
</ul>

<h3>デジタルフォレンジクス</h3>
<p>インシデント発生後に証拠を収集・保全・分析する技術領域です。</p>
<ul>
  <li><strong>揮発性情報の優先収集</strong>: メモリ（RAM）の内容・実行中プロセス・ネットワーク接続状態は電源断で消える</li>
  <li><strong>チェーン・オブ・カストディ</strong>: 証拠の収集・移送・保管の記録。法的証拠力の維持に必要</li>
  <li><strong>ハッシュ値による完全性検証</strong>: 収集した証拠が改ざんされていないことをSHA-256などで証明</li>
  <li><strong>タイムライン分析</strong>: ファイルのタイムスタンプ（作成・変更・アクセス）から攻撃の経緯を再構築</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
量子コンピュータはRSA・ECCを脅かすが、AES-256は引き続き有効。<br/>
ゼロトラスト = 「場所を信頼しない」→ 毎回検証・最小権限・継続的監視。<br/>
インシデント対応順序: 準備→検知→封じ込め→根絶→復旧→事後活動。<br/>
フォレンジクスは「揮発性情報を先に」「ハッシュで完全性を確保」が鉄則。
</div>
        `,
        questions: [
          {
            id: 1076,
            question: '量子コンピュータのショアのアルゴリズムによって解読が困難になると考えられる暗号方式はどれか。',
            choices: [
              'AES-256（共通鍵暗号）',
              'RSA（公開鍵暗号）',
              'ハッシュ関数（SHA-256）',
              '耐量子暗号（格子暗号）',
            ],
            answer: 1,
            explanation: 'ショアのアルゴリズムは素因数分解や離散対数問題を多項式時間で解けるため、RSA・ECCなどの公開鍵暗号を脅かします。AES-256はグローバーのアルゴリズムで安全性が半減するものの128ビット相当の強度を維持します。格子暗号はそもそも量子コンピュータへの耐性を持つ耐量子暗号です。',
          },
          {
            id: 1077,
            question: '量子鍵配送（QKD）の特徴として正しいものはどれか。',
            choices: [
              '量子コンピュータがあれば誰でも鍵を解読できる',
              '盗聴しようとすると量子状態が変化し盗聴を検出できる',
              '既存の公開鍵インフラ（PKI）をそのまま置き換える技術である',
              '鍵を暗号化して送信することで安全性を確保する',
            ],
            answer: 1,
            explanation: 'QKDは量子力学の不確定性原理・量子複製不可能定理を利用します。盗聴者が量子ビット（光子等）を観測すると量子状態が不可逆に変化するため、盗聴の事実を通信当事者が検出できます。これにより情報理論的に安全な鍵配送が実現します。',
          },
          {
            id: 1078,
            question: 'ゼロトラストセキュリティモデルの基本原則として正しいものはどれか。',
            choices: [
              '社内ネットワーク内のアクセスは信頼し、外部からのアクセスのみ検証する',
              'VPNで社内に接続すれば全リソースへのアクセスを許可する',
              '場所・デバイスに関わらず常に認証・認可を行い最小権限を適用する',
              'ファイアウォールで境界を強固にすることで内部は安全とみなす',
            ],
            answer: 2,
            explanation: 'ゼロトラストは「Never Trust, Always Verify（何も信頼しない、常に検証する）」が原則です。社内ネットワーク内であっても全アクセスを検証し、最小権限の原則を適用します。テレワーク・クラウド利用が増えた現代において有効なモデルです。',
          },
          {
            id: 1079,
            question: 'ゼロトラストアーキテクチャの主要な技術要素として適切でないものはどれか。',
            choices: [
              '多要素認証（MFA）による認証強化',
              'マイクロセグメンテーションによるネットワーク分割',
              '社内ネットワーク全体をVPN内に置いて境界を強化する',
              'SIEMによる継続的な監視と異常検知',
            ],
            answer: 2,
            explanation: 'VPNによる境界強化は従来の「境界防御モデル」の考え方であり、ゼロトラストとは逆の発想です。ゼロトラストでは境界を前提とせず、MFA・マイクロセグメンテーション・最小権限・継続的監視を組み合わせます。',
          },
          {
            id: 1080,
            question: 'セキュリティインシデント対応において、封じ込め（Containment）フェーズで最初に行うべき行動として適切なものはどれか。',
            choices: [
              '脆弱性へのパッチを適用して根本原因を除去する',
              '感染端末をネットワークから切り離して被害拡大を防ぐ',
              'システムを完全に初期化して復旧する',
              'インシデント対応チームを組織化する',
            ],
            answer: 1,
            explanation: '封じ込めフェーズの最初のステップは感染端末のネットワーク隔離（短期封じ込め）です。パッチ適用は根絶フェーズ、システム復元は復旧フェーズの作業です。チームの組織化は準備フェーズで行います。フォレンジクスのためのイメージ取得も封じ込め段階で行う重要作業です。',
          },
          {
            id: 1081,
            question: 'デジタルフォレンジクスにおける「揮発性情報」として正しいものはどれか。',
            choices: [
              'ハードディスクに保存されたログファイル',
              'OS起動時に読み込まれる設定ファイル',
              '実行中のプロセスリストとRAM（メモリ）の内容',
              'ファイルシステム上のタイムスタンプ',
            ],
            answer: 2,
            explanation: '揮発性情報とは電源を切ると消えてしまう情報です。RAM上の実行中プロセス・ネットワーク接続状態・暗号化キー・クリップボードの内容などが該当します。フォレンジクスでは揮発性の高い情報から優先的に収集するのが原則（RFC 3227）です。',
          },
        ],
      },
    ],
  },
  {
    id: 'b1',
    title: 'アルゴリズムとデータ構造',
    subject: 'B',
    description: '配列・連結リスト・スタック・キュー・ソート・探索アルゴリズムを擬似コードで徹底解説します。',
    sections: [
      {
        id: 'b1-1',
        title: '配列と連結リスト',
        content: `
<h3>配列（Array）</h3>
<p>同じ型のデータを<strong>連続したメモリ領域</strong>に並べたデータ構造です。</p>
<ul>
  <li><strong>アクセス</strong>: インデックスで直接アクセス → <strong>O(1)</strong></li>
  <li><strong>挿入・削除</strong>: 後ろの要素をずらす必要がある → <strong>O(n)</strong></li>
  <li><strong>検索</strong>: 先頭から順に比較（線形探索）→ <strong>O(n)</strong></li>
</ul>

<h3>配列の基本操作（擬似コード）</h3>
<pre>
配列 A ← [10, 20, 30, 40, 50]   // 0始まりインデックス
n ← Aの要素数  // n = 5

// ① 要素へのアクセス
表示する(A[0])   // → 10
表示する(A[2])   // → 30

// ② 合計を求める
合計 ← 0
i を 0 から n-1 まで繰り返す:
    合計 ← 合計 + A[i]
表示する(合計)   // → 150

// ③ 最大値を求める
最大 ← A[0]
i を 1 から n-1 まで繰り返す:
    もし A[i] > 最大 なら:
        最大 ← A[i]
表示する(最大)   // → 50

// ④ 要素を逆順にする
左 ← 0
右 ← n - 1
左 < 右 の間繰り返す:
    A[左] と A[右] を交換する
    左 ← 左 + 1
    右 ← 右 - 1
// A → [50, 40, 30, 20, 10]
</pre>

<h3>連結リスト（Linked List）</h3>
<p>各要素（ノード）が<strong>値と次のノードへのポインタ</strong>を持つデータ構造です。</p>
<ul>
  <li><strong>アクセス</strong>: 先頭から順にたどる → <strong>O(n)</strong></li>
  <li><strong>挿入・削除</strong>: ポインタを付け替えるだけ → <strong>O(1)</strong>（位置が分かれば）</li>
  <li><strong>メモリ</strong>: 不連続なメモリでも使える</li>
</ul>
<pre>
// ノードの構造
ノード:
    値: 整数
    次: ノード または null

// 先頭から順に表示
現在 ← 先頭ノード
現在 が null でない間 繰り返す:
    表示する(現在.値)
    現在 ← 現在.次
</pre>

<h3>2次元配列（行列）</h3>
<p>行と列で構成される表形式のデータ構造です。<code>A[行][列]</code> でアクセスします。</p>
<pre>
// 2行3列の2次元配列
行列 ← [[1, 2, 3],
         [4, 5, 6]]

表示する(行列[0][0])  // → 1
表示する(行列[1][2])  // → 6

// 全要素の合計
合計 ← 0
i を 0 から 1 まで繰り返す:      // 行
    j を 0 から 2 まで繰り返す:  // 列
        合計 ← 合計 + 行列[i][j]
表示する(合計)  // → 21
</pre>

<h3>ハッシュテーブル</h3>
<p>キーにハッシュ関数を適用して配列の添字を決定し、O(1)でデータを格納・取得するデータ構造です。</p>
<ul>
  <li><strong>ハッシュ関数</strong>: キーから添字（バケット）を計算する関数</li>
  <li><strong>衝突（コリジョン）</strong>: 異なるキーが同じ添字になる現象</li>
  <li><strong>衝突解決</strong>: チェイン法（連結リストで複数格納）またはオープンアドレス法（空きを探す）</li>
</ul>

<h3>配列 vs 連結リストの使い分け</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">操作</th><th style="padding:6px 8px;border:1px solid var(--color-border)">配列</th><th style="padding:6px 8px;border:1px solid var(--color-border)">連結リスト</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">インデックスアクセス</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(1) ✓速い</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(n) 遅い</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">任意位置への挿入・削除</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(n) 遅い</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(1) ✓速い</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">メモリ効率</td><td style="padding:5px 8px;border:1px solid var(--color-border)">連続領域・効率的</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ポインタ分余分に使用</td></tr>
</table>
        `,
        diagram: 'array-list',
        questions: [
          {
            id: 11,
            question: '配列 A = [3, 1, 4, 1, 5] の最大値を求める上記のアルゴリズムを実行したとき、最終的な「最大」の値はどれか。',
            choices: ['3', '4', '5', '1'],
            answer: 2,
            explanation: '最大変数は3→4→5と更新されます。最終的な最大値は5です。',
          },
          {
            id: 1001,
            question: '連結リストが配列より優れている操作はどれか。',
            choices: ['インデックスによるランダムアクセス', '任意位置への挿入・削除', '末尾要素へのアクセス', 'メモリ使用量の節約'],
            answer: 1,
            explanation: '連結リストはポインタの付け替えだけで挿入・削除できるためO(1)です。配列は要素をずらす必要があるためO(n)です。',
          },
          {
            id: 1021,
            question: '2次元配列 A = [[1,2,3],[4,5,6]] のとき A[1][2] の値はどれか。',
            choices: ['2', '3', '5', '6'],
            answer: 3,
            explanation: 'A[1][2] は 1行目（0始まりで2行目）の2列目（0始まりで3列目）の値 = 6 です。',
          },
          {
            id: 1022,
            question: 'ハッシュテーブルで「衝突（コリジョン）」が発生する状況はどれか。',
            choices: [
              '配列のインデックスが範囲外になったとき',
              '異なるキーが同じハッシュ値（添字）になったとき',
              'ハッシュ関数が負の値を返したとき',
              'テーブルの全要素が埋まったとき',
            ],
            answer: 1,
            explanation: '衝突（コリジョン）は異なるキーが同じハッシュ値（配列の添字）に対応するときに発生します。チェイン法やオープンアドレス法で解決します。',
          },
        ],
      },
      {
        id: 'b1-2',
        title: 'スタックとキュー',
        content: `
<h3>スタック（Stack）— LIFO</h3>
<p><strong>後入れ先出し（Last In First Out）</strong>のデータ構造です。</p>
<ul>
  <li><strong>push</strong>（プッシュ）: 先頭に要素を追加</li>
  <li><strong>pop</strong>（ポップ）: 先頭から要素を取り出す</li>
  <li><strong>peek</strong>: 取り出さずに先頭を確認</li>
</ul>
<p>用途: 関数呼び出しの管理・Undo機能・括弧の対応チェック・逆順変換</p>

<h3>スタックの擬似コード実装</h3>
<pre>
// スタック操作のシミュレーション
スタック ← []   // 空のスタック

// push
スタックの末尾に 10 を追加  // [10]
スタックの末尾に 20 を追加  // [10, 20]
スタックの末尾に 30 を追加  // [10, 20, 30]

// pop（末尾から取り出す）
値 ← スタックの末尾を取り出す  // 値=30, スタック=[10,20]
表示する(値)   // → 30

値 ← スタックの末尾を取り出す  // 値=20, スタック=[10]
表示する(値)   // → 20
</pre>

<h3>スタックの応用：括弧チェック</h3>
<pre>
関数 括弧チェック(文字列):
    スタック ← []
    文字列 の 各文字 に対して:
        もし 文字 = "(" なら:
            スタックに "(" をプッシュ
        そうでなく 文字 = ")" なら:
            もし スタックが空 なら:
                "不正" を返す
            スタックからポップ
    スタックが空 なら "正常" を返す
    そうでなければ "不正" を返す

// 例: "(())" → 正常、"(()" → 不正
</pre>

<h3>キュー（Queue）— FIFO</h3>
<p><strong>先入れ先出し（First In First Out）</strong>のデータ構造です。</p>
<ul>
  <li><strong>enqueue</strong>（エンキュー）: 末尾に追加</li>
  <li><strong>dequeue</strong>（デキュー）: 先頭から取り出す</li>
</ul>
<p>用途: タスクスケジューリング・印刷待ち行列・BFS（幅優先探索）</p>

<h3>キューの擬似コード</h3>
<pre>
キュー ← []

// enqueue（末尾に追加）
キューの末尾に "A" を追加  // [A]
キューの末尾に "B" を追加  // [A, B]
キューの末尾に "C" を追加  // [A, B, C]

// dequeue（先頭から取り出す）
値 ← キューの先頭を取り出す  // 値="A", キュー=[B,C]
表示する(値)   // → A

値 ← キューの先頭を取り出す  // 値="B", キュー=[C]
表示する(値)   // → B
</pre>

<h3>優先度キュー（Priority Queue）</h3>
<p>通常のキューと異なり、<strong>優先度の高い要素から取り出す</strong>データ構造です。</p>
<ul>
  <li>用途: OS のタスクスケジューリング・ダイクストラ法（最短経路）・イベント管理</li>
  <li>実装: ヒープ（Heap）を使うことが多い。取り出しが O(log n)</li>
</ul>

<h3>スタック vs キューの比較</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)"></th><th style="padding:6px 8px;border:1px solid var(--color-border)">スタック（Stack）</th><th style="padding:6px 8px;border:1px solid var(--color-border)">キュー（Queue）</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">順序</td><td style="padding:5px 8px;border:1px solid var(--color-border)">LIFO（後入れ先出し）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">FIFO（先入れ先出し）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">追加</td><td style="padding:5px 8px;border:1px solid var(--color-border)">push（末尾へ）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">enqueue（末尾へ）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">取り出し</td><td style="padding:5px 8px;border:1px solid var(--color-border)">pop（末尾から）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">dequeue（先頭から）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">用途</td><td style="padding:5px 8px;border:1px solid var(--color-border)">関数コール・Undo・括弧チェック</td><td style="padding:5px 8px;border:1px solid var(--color-border)">タスク待ち・BFS・印刷待ち</td></tr>
</table>
        `,
        diagram: 'stack-queue',
        questions: [
          {
            id: 12,
            question: 'スタックに 1, 2, 3 の順でプッシュした後、2回ポップすると取り出せる値はどれか（2回目）。',
            choices: ['1', '2', '3', '4'],
            answer: 1,
            explanation: 'LIFOなので取り出し順は 3→2→1 です。2回目のポップで取り出せるのは 2 です。',
          },
          {
            id: 1002,
            question: 'キューに "X", "Y", "Z" の順でエンキューし、2回デキューした後にエンキューした "W" がある。次にデキューで取り出せる値はどれか。',
            choices: ['X', 'Y', 'Z', 'W'],
            answer: 2,
            explanation: 'FIFOなのでX,Yをデキュー後はZ,Wの順。次のデキューはZです。',
          },
          {
            id: 1003,
            question: '括弧チェックアルゴリズムで "(()())" を処理したとき結果はどれか。',
            choices: ['不正', '正常', 'エラー', '不明'],
            answer: 1,
            explanation: '(→(→)→(→)→) の順に処理。開く括弧と閉じる括弧が正しく対応しているため正常です。',
          },
          {
            id: 1023,
            question: '優先度キュー（Priority Queue）の説明として正しいものはどれか。',
            choices: [
              '先に入れた要素から順番に取り出すデータ構造',
              '後に入れた要素から順番に取り出すデータ構造',
              '優先度の高い要素から取り出すデータ構造',
              '要素を並べ替えてから取り出すデータ構造',
            ],
            answer: 2,
            explanation: '優先度キューは挿入順ではなく優先度の高い要素から取り出します。OSのタスクスケジューリングやダイクストラ法に使われます。ヒープで実装されることが多いです。',
          },
        ],
      },
      {
        id: 'b1-3',
        title: '整列アルゴリズム',
        content: `
<h3>計算量の記法（オーダー記法）</h3>
<p>アルゴリズムの<strong>処理時間の増加の傾向</strong>を表す記法です。nはデータ数。</p>
<ul>
  <li><strong>O(1)</strong>: 定数時間（n に無関係）</li>
  <li><strong>O(log n)</strong>: 対数時間（nが2倍になっても1回しか増えない）</li>
  <li><strong>O(n)</strong>: 線形時間（nに比例）</li>
  <li><strong>O(n log n)</strong>: 準線形時間（効率的なソートの計算量）</li>
  <li><strong>O(n²)</strong>: 二乗時間（nが2倍で4倍に増える）</li>
</ul>

<h3>バブルソート — O(n²)</h3>
<p>隣り合う要素を比較して交換を繰り返す、最もシンプルなソートです。</p>
<pre>
配列 A ← [5, 3, 1, 4, 2]
n ← Aの要素数

i を 0 から n-2 まで繰り返す:
    j を 0 から n-2-i まで繰り返す:
        もし A[j] > A[j+1] なら:
            A[j] と A[j+1] を交換する

// パス1後: [3,1,4,2,5] ← 5が末尾に確定
// パス2後: [1,3,2,4,5] ← 4が確定
// 最終:    [1,2,3,4,5]
</pre>

<h3>選択ソート — O(n²)</h3>
<p>未ソート部分の最小値を探して先頭と交換します。</p>
<pre>
i を 0 から n-2 まで繰り返す:
    最小位置 ← i
    j を i+1 から n-1 まで繰り返す:
        もし A[j] < A[最小位置] なら:
            最小位置 ← j
    A[i] と A[最小位置] を交換する
</pre>

<h3>挿入ソート — O(n²)（ほぼ整列済みならO(n)）</h3>
<p>未ソート部分の要素を、ソート済み部分の適切な位置に挿入します。</p>
<pre>
i を 1 から n-1 まで繰り返す:
    キー ← A[i]
    j ← i - 1
    j >= 0 かつ A[j] > キー の間繰り返す:
        A[j+1] ← A[j]
        j ← j - 1
    A[j+1] ← キー
</pre>

<h3>クイックソートの仕組み</h3>
<p>基準値（ピボット）を選び、それより小さい要素を左、大きい要素を右に分割して再帰的にソートします。</p>
<pre>
関数 クイックソート(配列, 左, 右):
    もし 左 >= 右 なら: 終了  // 1要素以下なら完了
    ピボット ← 配列[(左+右) div 2]
    i ← 左, j ← 右
    i <= j の間繰り返す:
        配列[i] >= ピボット になるまで i を増加
        配列[j] <= ピボット になるまで j を減少
        もし i <= j なら:
            配列[i] と 配列[j] を交換
            i ← i+1, j ← j-1
    クイックソート(配列, 左, j)   // 左部分
    クイックソート(配列, i, 右)   // 右部分
</pre>

<h3>ソートアルゴリズムの比較</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">アルゴリズム</th><th style="padding:6px 8px;border:1px solid var(--color-border)">計算量</th><th style="padding:6px 8px;border:1px solid var(--color-border)">安定性</th><th style="padding:6px 8px;border:1px solid var(--color-border)">特徴</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">バブルソート</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(n²)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">安定</td><td style="padding:5px 8px;border:1px solid var(--color-border)">実装簡単・実用では遅い</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">選択ソート</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(n²)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">不安定</td><td style="padding:5px 8px;border:1px solid var(--color-border)">交換回数が少ない</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">挿入ソート</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(n²)〜O(n)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">安定</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ほぼ整列済みなら速い</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">マージソート</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(n log n)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">安定</td><td style="padding:5px 8px;border:1px solid var(--color-border)">分割統治法・追加メモリ必要</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">クイックソート</td><td style="padding:5px 8px;border:1px solid var(--color-border)">平均O(n log n)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">不安定</td><td style="padding:5px 8px;border:1px solid var(--color-border)">実用最速・最悪O(n²)</td></tr>
</table>
<p><strong>安定ソート</strong>: 同じ値の要素の相対順序が保たれるソート（バブル・挿入・マージ）。</p>
        `,
        diagram: 'sort',
        questions: [
          {
            id: 13,
            question: 'バブルソートの平均計算量はどれか。',
            choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            answer: 3,
            explanation: 'バブルソートはn個の要素に対して最大n(n-1)/2回の比較が必要なのでO(n²)です。',
          },
          {
            id: 1004,
            question: '配列 [4, 2, 7, 1, 3] をバブルソートで1パス実行した結果はどれか。',
            choices: ['[1,2,3,4,7]', '[2,4,1,3,7]', '[2,4,7,1,3]', '[1,2,4,3,7]'],
            answer: 1,
            explanation: '隣接比較: (4,2)→交換[2,4,7,1,3] → (4,7)→そのまま → (7,1)→交換[2,4,1,7,3] → (7,3)→交換[2,4,1,3,7]。1パス後は[2,4,1,3,7]です。',
          },
          {
            id: 1005,
            question: 'n=1000のとき、O(n²)とO(n log n)のアルゴリズムの比較回数の比はおよそどれか。',
            choices: ['約10倍', '約100倍', '約1000倍', '同じ'],
            answer: 1,
            explanation: 'O(n²)=1,000,000回、O(n log n)≈10,000回。比率は約100倍です。nが大きくなるほど差が開きます。',
          },
          {
            id: 1024,
            question: 'クイックソートの特徴として正しいものはどれか。',
            choices: [
              '常にO(n log n)の計算量が保証される安定ソートである',
              'ピボットを基準に要素を分割して再帰的にソートし、平均O(n log n)だが最悪O(n²)になる',
              '隣接する要素を比較・交換を繰り返すシンプルなソートである',
              '未ソート部分の最小値を選んで先頭と交換するソートである',
            ],
            answer: 1,
            explanation: 'クイックソートはピボットを基準に分割・再帰する方法で平均O(n log n)の高速なソートですが、ピボット選択が悪いと最悪O(n²)になります。安定ソートではありません。',
          },
        ],
      },
      {
        id: 'b1-4',
        title: '探索アルゴリズム',
        content: `
<h3>線形探索（逐次探索）— O(n)</h3>
<p>配列を先頭から順番に目的の値と比較していく最もシンプルな探索です。ソートは不要です。</p>
<pre>
関数 線形探索(A, 目標値):
    i を 0 から Aの要素数-1 まで繰り返す:
        もし A[i] = 目標値 なら:
            i を返す  // 見つかった位置
    -1 を返す         // 見つからなかった

// 例: A=[3,1,4,1,5], 目標値=4
// i=0: 3≠4, i=1: 1≠4, i=2: 4=4 → 2 を返す
</pre>

<h3>二分探索（バイナリサーチ）— O(log n)</h3>
<p><strong>ソート済み</strong>配列を対象に、探索範囲を半分ずつ絞り込む高速な探索です。</p>
<pre>
関数 二分探索(A, 目標値):
    左 ← 0
    右 ← Aの要素数 - 1

    左 <= 右 の間繰り返す:
        中央 ← (左 + 右) ÷ 2 の整数部分

        もし A[中央] = 目標値 なら:
            中央 を返す          // 発見！
        そうでなく A[中央] < 目標値 なら:
            左 ← 中央 + 1       // 右半分を探す
        そうでなければ:
            右 ← 中央 - 1       // 左半分を探す

    -1 を返す  // 見つからなかった

// 例: A=[1,3,5,7,9,11,13], 目標値=7
// 1回目: 中央=3, A[3]=7 → 発見！ → 3 を返す
</pre>

<h3>二分探索のトレース例</h3>
<p>配列 <code>[2, 5, 8, 12, 16, 23, 38, 56]</code> から <code>23</code> を探す場合：</p>
<ul>
  <li>左=0, 右=7 → 中央=3 → A[3]=12 &lt; 23 → 左=4</li>
  <li>左=4, 右=7 → 中央=5 → A[5]=23 = 23 → <strong>発見！</strong></li>
</ul>
<p>8要素を<strong>わずか2回</strong>の比較で発見できました。線形探索なら最大8回。</p>

<h3>ハッシュ探索 — O(1)（平均）</h3>
<p>ハッシュ関数でキーから直接格納位置を計算する探索法です。平均的にO(1)で探索できます。</p>
<p>ハッシュテーブル（辞書・マップ）の内部実装として使われます。衝突（コリジョン）が多いと O(n) に劣化します。</p>

<h3>探索アルゴリズムの比較</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">手法</th><th style="padding:6px 8px;border:1px solid var(--color-border)">計算量</th><th style="padding:6px 8px;border:1px solid var(--color-border)">前提条件</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">線形探索</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(n)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">なし（どんな配列でも可）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">二分探索</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(log n)</td><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>ソート済み</strong>配列が必要</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">ハッシュ探索</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(1)（平均）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ハッシュテーブル構築が必要</td></tr>
</table>
        `,
        diagram: 'search',
        questions: [
          {
            id: 14,
            question: '二分探索が使える前提条件はどれか。',
            choices: ['配列がソート済みであること', '配列の要素が整数であること', '配列のサイズが偶数であること', '重複する要素がないこと'],
            answer: 0,
            explanation: '二分探索は配列が昇順または降順にソートされていることが前提条件です。',
          },
          {
            id: 1006,
            question: '1024要素のソート済み配列を二分探索するとき、最大何回の比較で見つかるか。',
            choices: ['10回', '32回', '512回', '1024回'],
            answer: 0,
            explanation: '二分探索の最大比較回数はlog₂n回です。log₂1024 = 10 なので最大10回です。',
          },
          {
            id: 1007,
            question: '線形探索と二分探索の説明として正しいものはどれか。',
            choices: [
              '二分探索はソートなしでも使える',
              '線形探索はO(log n)、二分探索はO(n)',
              '線形探索はソート不要でO(n)、二分探索はソート必要でO(log n)',
              '両方ともO(n²)の計算量',
            ],
            answer: 2,
            explanation: '線形探索は先頭から順にO(n)で探索（ソート不要）。二分探索はソート済みを前提にO(log n)で探索できます。',
          },
          {
            id: 1025,
            question: 'ハッシュ探索の平均計算量として正しいものはどれか。',
            choices: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'],
            answer: 3,
            explanation: 'ハッシュ探索はハッシュ関数でキーから直接格納位置を計算するため平均O(1)で探索できます。ただし衝突が多発すると最悪O(n)に劣化します。',
          },
          {
            id: 1109,
            question: 'ソート済み配列 [10, 20, 30, 40, 50, 60, 70]（インデックス0〜6）を二分探索で60を探す。最初の比較対象はどれか。',
            choices: ['10（インデックス0）', '40（インデックス3）', '60（インデックス5）', '70（インデックス6）'],
            answer: 1,
            explanation: '二分探索は中央要素から比較を始めます。配列の要素数は7なので中央インデックスは(0+6)÷2=3。A[3]=40と60を比較すると40<60なので右半分（インデックス4〜6）を探します。最初の比較対象は40（インデックス3）です。',
          },
          {
            id: 1110,
            question: '100万件のデータをソートする場合、最も効率のよいアルゴリズムはどれか。',
            choices: [
              'バブルソート（最悪O(n²)）',
              '選択ソート（常にO(n²)）',
              '挿入ソート（最悪O(n²)）',
              'クイックソート（平均O(n log n)）',
            ],
            answer: 3,
            explanation: 'n=100万のとき、O(n²)では1兆回の比較が必要です。クイックソートはO(n log n)で約2000万回です。マージソートもO(n log n)ですが、クイックソートは実装コストが低くキャッシュ効率も良いため実際に最もよく使われます。',
          },
        ],
      },
    ],
  },
  {
    id: 'b2',
    title: 'プログラミング基礎',
    subject: 'B',
    description: '変数・型・条件分岐・繰り返し・関数・配列操作まで、科目Bの擬似コードを完全攻略します。',
    sections: [
      {
        id: 'b2-1',
        title: '変数・型・演算子',
        content: `
<h3>基本情報技術者試験の擬似コード規則</h3>
<p>試験では特定の擬似コード記法が使われます。しっかり覚えましょう。</p>
<ul>
  <li><strong>←</strong>: 代入（右辺を左辺に代入）</li>
  <li><strong>÷</strong>: 実数除算 / <strong>div</strong>: 整数除算（商）/ <strong>mod</strong>: 剰余</li>
  <li><strong>AND / OR / NOT</strong>: 論理演算子</li>
  <li><strong>= / ≠ / < / > / ≦ / ≧</strong>: 比較演算子</li>
</ul>

<h3>変数と代入</h3>
<pre>
// 基本的な代入
x ← 10
y ← 3

// 算術演算
表示する(x + y)       // → 13（加算）
表示する(x - y)       // → 7 （減算）
表示する(x * y)       // → 30（乗算）
表示する(x ÷ y)       // → 3.333...（実数除算）
表示する(x div y)     // → 3 （整数除算・切り捨て）
表示する(x mod y)     // → 1 （剰余: 10 = 3×3 + 1）

// 複合代入
x ← x + 1   // x を 11 に更新（インクリメント）
x ← x * 2   // x を 22 に更新
</pre>

<h3>型（データ型）</h3>
<ul>
  <li><strong>整数型</strong>: 1, -5, 100 など小数なし</li>
  <li><strong>実数型</strong>: 3.14, -0.5 など小数あり</li>
  <li><strong>文字型</strong>: 'A', 'あ' など1文字</li>
  <li><strong>文字列型</strong>: "こんにちは" など複数文字</li>
  <li><strong>論理型</strong>: true（真）/ false（偽）</li>
</ul>

<h3>よく使う演算パターン</h3>
<pre>
// 偶奇判定
n ← 7
もし n mod 2 = 0 なら:
    表示する("偶数")
そうでなければ:
    表示する("奇数")   // → 奇数

// 絶対値
x ← -5
もし x < 0 なら:
    x ← x * (-1)
表示する(x)   // → 5

// 2つの変数を交換（tmpを使う）
a ← 10
b ← 20
tmp ← a
a ← b
b ← tmp
// a=20, b=10
</pre>

<h3>論理演算子の真理値表</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">A</th><th style="padding:6px 8px;border:1px solid var(--color-border)">B</th><th style="padding:6px 8px;border:1px solid var(--color-border)">A AND B</th><th style="padding:6px 8px;border:1px solid var(--color-border)">A OR B</th><th style="padding:6px 8px;border:1px solid var(--color-border)">NOT A</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">true</td><td style="padding:5px 8px;border:1px solid var(--color-border)">true</td><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>true</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>true</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">true</td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>true</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)">true</td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>true</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">true</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)">false</td><td style="padding:5px 8px;border:1px solid var(--color-border)">true</td></tr>
</table>
        `,
        diagram: 'flowchart',
        questions: [
          {
            id: 1008,
            question: 'x ← 17, y ← 5 のとき、x mod y の値はどれか。',
            choices: ['2', '3', '4', '5'],
            answer: 0,
            explanation: '17 ÷ 5 = 3 余り 2。mod（剰余）は余りなので答えは2です。17 = 5×3 + 2 で確認できます。',
          },
          {
            id: 1009,
            question: 'x ← 17, y ← 5 のとき、x div y の値はどれか。',
            choices: ['2', '3', '3.4', '4'],
            answer: 1,
            explanation: 'divは整数除算（商）です。17 ÷ 5 の商は3（小数点以下切り捨て）。',
          },
          {
            id: 1026,
            question: '次の擬似コードで、実行後の a と b の値の組み合わせとして正しいものはどれか。\n\na ← 10\nb ← 20\ntmp ← a\na ← b\nb ← tmp',
            choices: ['a=10, b=20', 'a=20, b=10', 'a=20, b=20', 'a=10, b=10'],
            answer: 1,
            explanation: 'tmpにaの値(10)を退避してからa←b(20)、b←tmp(10)と代入。結果はa=20, b=10。tmpを使った変数交換の定型パターンです。',
          },
          {
            id: 1027,
            question: '次の式の結果を正しく表しているものはどれか。\n\n(10 > 5) AND (3 mod 2 = 0)',
            choices: ['true', 'false', 'エラーになる', '0'],
            answer: 1,
            explanation: '10>5はtrue。3 mod 2=1なので 1=0 はfalse。true AND false = false。ANDは両方trueのときのみtrueになります。',
          },
        ],
      },
      {
        id: 'b2-2',
        title: '条件分岐',
        content: `
<h3>if-else 構文</h3>
<pre>
// 基本形
もし 条件 なら:
    処理A
そうでなければ:
    処理B

// 多分岐
点数 ← 75

もし 点数 >= 90 なら:
    表示する("優")
そうでなく 点数 >= 70 なら:
    表示する("良")   // ← ここが実行される
そうでなく 点数 >= 60 なら:
    表示する("可")
そうでなければ:
    表示する("不可")
</pre>

<h3>論理演算子を使った条件</h3>
<pre>
x ← 15

// AND: 両方の条件を満たす
もし x > 10 AND x < 20 なら:
    表示する("10より大きく20より小さい")  // → 表示される

// OR: どちらかの条件を満たす
もし x < 0 OR x > 10 なら:
    表示する("0未満か10より大きい")  // → 表示される

// NOT: 条件を反転
もし NOT (x = 0) なら:
    表示する("xは0ではない")  // → 表示される
</pre>

<h3>入れ子（ネスト）した条件分岐</h3>
<pre>
年齢 ← 25
収入 ← 300

もし 年齢 >= 20 なら:
    もし 収入 >= 200 なら:
        表示する("成人かつ一定収入あり")  // → 実行される
    そうでなければ:
        表示する("成人だが収入少ない")
そうでなければ:
    表示する("未成年")
</pre>

<h3>case 式（多分岐選択）</h3>
<p>複数の値を比較する場合、if-else を重ねるより case（switch）式が読みやすくなります。FE試験の科目B問題でも登場します。</p>
<pre>
// 曜日番号（1〜7）から曜日名を返す
曜日番号 ← 3

曜日番号 の値によって:
    1 の場合: 表示する("月曜日")
    2 の場合: 表示する("火曜日")
    3 の場合: 表示する("水曜日")  // → ここが実行される
    4 の場合: 表示する("木曜日")
    5 の場合: 表示する("金曜日")
    それ以外: 表示する("週末")

// 同じ処理を if-else で書くと:
// もし 曜日番号 = 1 なら: ... そうでなく 曜日番号 = 2 なら: ... （繰り返し）
// → case の方がシンプルで読みやすい
</pre>
<p>FE試験の擬似コードでは「〜 の値によって: ○の場合: ...」という形式で表現されます。</p>

<h3>擬似コードのトレース練習</h3>
<pre>
a ← 5
b ← 3
c ← 0

もし a > b なら:
    c ← a - b   // c ← 5 - 3 = 2
そうでなければ:
    c ← b - a

表示する(c)  // → 2
</pre>
        `,
        diagram: 'flowchart',
        questions: [
          {
            id: 15,
            question: '次の擬似コードの実行結果はどれか。\n\nx ← 1\nx <= 5 の間繰り返す:\n    x ← x + 2\n表示する(x)',
            choices: ['5', '6', '7', '8'],
            answer: 2,
            explanation: 'x: 1→3→5→7。x=7のとき 7>5 になりループを抜けるので結果は7です。',
          },
          {
            id: 1010,
            question: '次の擬似コードの実行結果はどれか。\n\na ← 8\nb ← 3\nもし a mod b = 0 なら:\n    表示する("割り切れる")\nそうでなければ:\n    表示する("割り切れない")',
            choices: ['割り切れる', '割り切れない', '0', 'エラー'],
            answer: 1,
            explanation: '8 mod 3 = 2（8÷3の余り）。2 ≠ 0 なのでelseブランチが実行されます。',
          },
          {
            id: 1028,
            question: '次の擬似コードを実行したとき、表示される結果はどれか。\n\n点数 ← 65\nもし 点数 >= 90 なら:\n    表示する("A")\nそうでなく 点数 >= 70 なら:\n    表示する("B")\nそうでなく 点数 >= 60 なら:\n    表示する("C")\nそうでなければ:\n    表示する("D")',
            choices: ['A', 'B', 'C', 'D'],
            answer: 2,
            explanation: '点数65は90未満・70未満・60以上。条件を上から評価して「点数>=60」がtrueになるのでCが表示されます。',
          },
          {
            id: 1029,
            question: '次の条件式が true になる x の値はどれか。\n\nx >= 10 AND x <= 20',
            choices: ['5', '9', '15', '25'],
            answer: 2,
            explanation: 'AND条件は両方が成立する必要があります。x=15は 15>=10(true) AND 15<=20(true) で true。他の値は少なくとも一方の条件がfalseです。',
          },
          {
            id: 1111,
            question: '次の擬似コードを実行したとき、表示される結果はどれか。\n\nx ← 7\nもし x > 10 なら:\n    表示する("大")\nそうでなく x > 5 なら:\n    表示する("中")\nそうでなければ:\n    表示する("小")',
            choices: ['大', '中', '小', '何も表示されない'],
            answer: 1,
            explanation: 'x=7。最初の条件 7>10 は偽。次の条件 7>5 は真なので"中"が表示されます。条件は上から順に評価され、最初に真になった分岐だけ実行されます。',
          },
          {
            id: 1112,
            question: '論理演算 NOT (n < 5) が真になるとき、n の取りうる値はどれか。',
            choices: ['n < 5（5未満）', 'n = 5（5のみ）', 'n >= 5（5以上）', 'n > 5（5より大きい）'],
            answer: 2,
            explanation: 'NOT は条件を反転します。NOT (n < 5) は「n < 5 でない」つまり n >= 5 が真になります。n=5のとき「5<5」は偽 → NOT(偽)=真。n=4のとき「4<5」は真 → NOT(真)=偽。',
          },
        ],
      },
      {
        id: 'b2-3',
        title: '繰り返し処理',
        content: `
<h3>for 型繰り返し（回数が決まっている場合）</h3>
<pre>
// 基本形: i を 開始値 から 終了値 まで繰り返す
合計 ← 0
i を 1 から 10 まで繰り返す:
    合計 ← 合計 + i
表示する(合計)  // → 55（1+2+...+10）

// 偶数の合計
合計 ← 0
i を 1 から 10 まで繰り返す:
    もし i mod 2 = 0 なら:
        合計 ← 合計 + i
表示する(合計)  // → 30（2+4+6+8+10）
</pre>

<h3>while 型繰り返し（条件が続く間）</h3>
<pre>
// 2のべき乗で100を超える最小値
n ← 1
n <= 100 の間繰り返す:
    n ← n * 2
表示する(n)  // → 128

// 桁数を数える
数値 ← 12345
桁数 ← 0
数値 > 0 の間繰り返す:
    数値 ← 数値 div 10
    桁数 ← 桁数 + 1
表示する(桁数)  // → 5
</pre>

<h3>二重ループ</h3>
<pre>
// 九九の表（3×3）
i を 1 から 3 まで繰り返す:
    行 ← ""
    j を 1 から 3 まで繰り返す:
        行 ← 行 + (i*j の文字列) + " "
    表示する(行)
// → "1 2 3 "
// → "2 4 6 "
// → "3 6 9 "

// 二重ループの合計回数
外ループ3回 × 内ループ3回 = 9回
</pre>

<h3>繰り返しの途中終了・スキップ</h3>
<pre>
// break相当: 特定条件でループ脱出
i を 1 から 100 まで繰り返す:
    もし i * i > 50 なら:
        表示する(i)
        繰り返しを終了する  // i=8のとき終了（8²=64>50）

// continue相当: 特定条件をスキップ
i を 1 から 10 まで繰り返す:
    もし i mod 3 = 0 なら:
        次の繰り返しへ  // 3,6,9をスキップ
    表示する(i)  // 1,2,4,5,7,8,10 を表示
</pre>
        `,
        diagram: 'flowchart',
        questions: [
          {
            id: 1011,
            question: '次の擬似コードの実行後の合計の値はどれか。\n\n合計 ← 0\ni を 1 から 5 まで繰り返す:\n    もし i mod 2 ≠ 0 なら:\n        合計 ← 合計 + i\n表示する(合計)',
            choices: ['6', '9', '15', '25'],
            answer: 1,
            explanation: 'i mod 2 ≠ 0 は奇数の条件。1+3+5 = 9 です。',
          },
          {
            id: 1012,
            question: '次のwhileループは何回実行されるか。\n\nn ← 1\nn < 32 の間繰り返す:\n    n ← n * 2',
            choices: ['4回', '5回', '6回', '32回'],
            answer: 1,
            explanation: 'n: 1→2→4→8→16→32。n=32になったときn<32が偽になりループ終了。実行回数は5回です。',
          },
          {
            id: 1030,
            question: '次の擬似コードを実行した後の 合計 の値はどれか。\n\n合計 ← 0\ni を 1 から 10 まで繰り返す:\n    もし i mod 3 = 0 なら:\n        合計 ← 合計 + i',
            choices: ['15', '18', '55', '10'],
            answer: 1,
            explanation: '3の倍数（i=3,6,9）のみ加算。3+6+9=18。mod 3 = 0 は3の倍数の判定条件です。',
          },
          {
            id: 1031,
            question: '次の二重ループは合計何回の処理Xを実行するか。\n\ni を 1 から 4 まで繰り返す:\n    j を 1 から i まで繰り返す:\n        処理X',
            choices: ['4回', '8回', '10回', '16回'],
            answer: 2,
            explanation: 'i=1のとき j=1(1回)、i=2のとき j=1,2(2回)、i=3(3回)、i=4(4回)。合計1+2+3+4=10回。内ループの上限が i なので回数が変化します。',
          },
          {
            id: 1113,
            question: '次の擬似コードを実行した後の x の値はどれか。\n\nx ← 1\nx < 100 の間繰り返す:\n    x ← x × 2',
            choices: ['64', '128', '100', '256'],
            answer: 1,
            explanation: 'x の変化: 1→2→4→8→16→32→64→128。x=64 のとき 64<100 なのでループ継続し x=128 に更新。x=128 のとき 128<100 は偽でループ終了。答えは128。',
          },
          {
            id: 1114,
            question: '次の擬似コードで表示される値はどれか。\n\n積 ← 1\ni を 1 から 5 まで繰り返す:\n    積 ← 積 × i\n表示する(積)',
            choices: ['15', '25', '120', '625'],
            answer: 2,
            explanation: '積の変化: 1×1=1, 1×2=2, 2×3=6, 6×4=24, 24×5=120。これは5!（5の階乗）= 120 の計算です。',
          },
        ],
      },
      {
        id: 'b2-4',
        title: '関数とスコープ',
        content: `
<h3>関数（サブルーチン）</h3>
<p>処理をまとめて名前をつけ、繰り返し呼び出せるようにしたものです。</p>
<pre>
// 関数の定義
関数 最大値(a, b):
    もし a >= b なら:
        a を返す
    そうでなければ:
        b を返す

// 関数の呼び出し
結果 ← 最大値(10, 7)
表示する(結果)   // → 10

結果 ← 最大値(3, 9)
表示する(結果)   // → 9
</pre>

<h3>引数と戻り値</h3>
<pre>
// 複数の引数・戻り値なし（手続き）
関数 あいさつ(名前, 時間帯):
    もし 時間帯 = "朝" なら:
        表示する("おはよう、" + 名前)
    そうでなければ:
        表示する("こんにちは、" + 名前)

あいさつ("田中", "朝")    // → おはよう、田中
あいさつ("鈴木", "昼")    // → こんにちは、鈴木

// 累乗を計算する関数
関数 累乗(底, 指数):
    結果 ← 1
    i を 1 から 指数 まで繰り返す:
        結果 ← 結果 * 底
    結果 を返す

表示する(累乗(2, 8))  // → 256（2の8乗）
</pre>

<h3>関数を使った配列処理</h3>
<pre>
// 配列の合計を返す関数
関数 配列合計(A):
    合計 ← 0
    i を 0 から Aの要素数-1 まで繰り返す:
        合計 ← 合計 + A[i]
    合計 を返す

// 配列の平均を返す関数
関数 平均(A):
    配列合計(A) ÷ Aの要素数 を返す

データ ← [10, 20, 30, 40, 50]
表示する(配列合計(データ))  // → 150
表示する(平均(データ))      // → 30
</pre>

<h3>値渡しと参照渡し</h3>
<p><strong>値渡し</strong>: 引数の<strong>コピー</strong>を渡す。関数内で変更しても元の変数は変わらない。</p>
<p><strong>参照渡し</strong>: 引数の<strong>参照（アドレス）</strong>を渡す。関数内で変更すると元の変数も変わる。</p>
<p>配列は参照渡しになることが多いため、関数内での変更に注意が必要です。</p>

<h3>スコープ（変数の有効範囲）</h3>
<p>変数が参照できる範囲のことです。</p>
<pre>
グローバル変数 count ← 0   // プログラム全体から参照可能

関数 加算(a, b):
    ローカル変数 合計 ← a + b   // この関数内のみ有効
    count ← count + 1           // グローバル変数を更新
    合計 を返す

加算(3, 5)    // 合計=8, count=1
// ここで 合計 を参照するとエラー（スコープ外）
</pre>
<ul>
  <li><strong>ローカル変数</strong>: 関数内で宣言。関数が終わると消える。他の関数からは参照不可。</li>
  <li><strong>グローバル変数</strong>: 関数の外で宣言。プログラム全体から参照可能。ただし多用すると管理が複雑になる。</li>
</ul>

<h3>再帰関数（Recursive Function）</h3>
<p>関数が自分自身を呼び出す関数です。FE科目B問題で頻繁に出題されます。</p>
<pre>
// 階乗の計算（n! = n × (n-1) × ... × 2 × 1）
関数 階乗(n):
    もし n <= 1 なら:        // ← 終了条件（ベースケース）必須！
        1 を返す
    そうでなければ:
        n * 階乗(n - 1) を返す  // ← 自分自身を呼び出す

// 呼び出し例: 階乗(4)
// = 4 * 階乗(3)
// = 4 * 3 * 階乗(2)
// = 4 * 3 * 2 * 階乗(1)
// = 4 * 3 * 2 * 1
// = 24
</pre>
<p><strong>重要</strong>: 再帰関数には必ず<strong>終了条件（ベースケース）</strong>が必要です。ないと無限に呼び出されてスタックオーバーフローになります。</p>

<h3>再帰トレースの読み方</h3>
<p>試験では「このコードの出力は？」という形で再帰の追跡問題が出ます。</p>
<pre>
// フィボナッチ数列（F(n) = F(n-1) + F(n-2)）
関数 fib(n):
    もし n <= 1 なら:
        n を返す     // fib(0)=0, fib(1)=1
    そうでなければ:
        fib(n-1) + fib(n-2) を返す

// fib(5) の展開:
// fib(5) = fib(4) + fib(3)
//        = (fib(3)+fib(2)) + (fib(2)+fib(1))
//        = 3 + 2 = 5
</pre>
        `,
        diagram: 'flowchart',
        questions: [
          {
            id: 1013,
            question: '次の関数の呼び出し 累乗(3, 4) の戻り値はどれか。\n\n関数 累乗(底, 指数):\n    結果 ← 1\n    i を 1 から 指数 まで繰り返す:\n        結果 ← 結果 * 底\n    結果 を返す',
            choices: ['12', '27', '64', '81'],
            answer: 3,
            explanation: '3の4乗 = 3×3×3×3 = 81。結果: 1→3→9→27→81。',
          },
          {
            id: 1014,
            question: '値渡しの説明として正しいものはどれか。',
            choices: [
              '関数内で引数を変更すると呼び出し元の変数も変わる',
              '関数内で引数を変更しても呼び出し元の変数は変わらない',
              '配列を渡すときは必ず値渡しになる',
              '戻り値が必要な場合は参照渡しを使う',
            ],
            answer: 1,
            explanation: '値渡しは引数のコピーを関数に渡すため、関数内での変更は呼び出し元の変数に影響しません。',
          },
          {
            id: 1032,
            question: '次の再帰関数 fact(4) の戻り値はどれか。\n\n関数 fact(n):\n    もし n = 1 なら:\n        1 を返す\n    そうでなければ:\n        n * fact(n-1) を返す',
            choices: ['4', '8', '16', '24'],
            answer: 3,
            explanation: 'fact(4)=4×fact(3)=4×3×fact(2)=4×3×2×fact(1)=4×3×2×1=24。これは4の階乗（4!）の計算です。',
          },
          {
            id: 1033,
            question: '関数の引数として配列を参照渡しした場合の説明として正しいものはどれか。',
            choices: [
              '関数内で配列要素を変更しても呼び出し元は変わらない',
              '関数内で配列要素を変更すると呼び出し元の配列も変わる',
              '配列は参照渡しできない',
              '参照渡しは実行速度が遅い',
            ],
            answer: 1,
            explanation: '参照渡しは変数のアドレスを渡すため、関数内での変更が呼び出し元にも反映されます。配列は多くの言語で参照渡しになるため注意が必要です。',
          },
        ],
      },
    ],
  },
];

// ===== 追加章 =====

const additionalChapters: Chapter[] = [
  {
    id: 'a5',
    title: 'ソフトウェア',
    subject: 'A',
    description: 'OS・プロセス管理・メモリ管理・ファイルシステム・ミドルウェア・仮想化まで、ソフトウェアの仕組みを深く学びます。',
    sections: [
      {
        id: 'a5-1',
        title: 'OSの役割とプロセス管理',
        content: `
<h3>OSがないとどうなるか？</h3>
<p>OSがない世界を想像してみましょう。アプリは画面を直接制御する方法を自分で実装し、ディスクの物理的なアドレスを直接指定し、他のアプリとCPUの使用時間を自分で調整しなければなりません。これは現実的ではありません。</p>
<p>OSはハードウェアの複雑さを隠蔽し、アプリが「ファイルを開く」「画面に描く」という抽象的な命令だけで動けるようにする<strong>仲介役</strong>です。</p>

<h3>OSの主な機能（なぜ必要か）</h3>
<ul>
  <li><strong>プロセス管理</strong>: 複数アプリを同時に動かす（マルチタスク）。CPUは1つでも「切り替え」で同時に見せる。</li>
  <li><strong>メモリ管理</strong>: 各プロセスが使うメモリ領域を割り当て・回収。他プロセスへの不正アクセスを防ぐ。</li>
  <li><strong>ファイル管理</strong>: ファイル・フォルダの操作をAPIで提供。物理的なディスクのアドレス管理はOSが担当。</li>
  <li><strong>デバイス管理</strong>: キーボード・カメラ等を<strong>デバイスドライバ</strong>経由で統一的に制御。メーカーが違っても同じAPIで使える。</li>
  <li><strong>セキュリティ</strong>: ユーザー認証・ファイルのアクセス権限・プロセスの分離を管理。</li>
</ul>

<h3>プロセスとスレッドの違い</h3>
<p><strong>プロセス</strong>: 実行中プログラムの独立した実行環境。各プロセスは<strong>独自のメモリ空間</strong>を持つ。ChromeとWordはそれぞれ別のプロセスなので、どちらかがクラッシュしてももう一方は影響を受けない。</p>
<p><strong>スレッド</strong>: プロセス内の軽量な実行単位。<strong>同じメモリ空間を共有</strong>するため切り替えが速い。1つのプロセスが複数スレッドを持ち、並行処理できる。例：Webブラウザが画像のダウンロードとUIの更新を同時に行う。</p>
<ul>
  <li>プロセス生成: 重い（メモリ空間のコピーが必要）</li>
  <li>スレッド生成: 軽い（メモリ共有なので少ない資源で起動）</li>
</ul>

<h3>CPUスケジューリング</h3>
<p>CPUが1つしかない場合、「どのプロセスを次に実行するか」を決めるのがスケジューラです。</p>
<ul>
  <li><strong>ラウンドロビン</strong>: 全プロセスに均等なタイムスライス（例: 10ms）を順番に割り当てる。公平だが優先度を考慮しない。</li>
  <li><strong>優先度方式</strong>: 優先度の高いプロセスを先に実行。OSカーネルのプロセスは最高優先度。</li>
  <li><strong>FCFS（First Come First Served）</strong>: 到着順に実行。シンプルだが長いジョブがあると後のジョブが長時間待たされる（コンボイ効果）。</li>
  <li><strong>SJF（Shortest Job First）</strong>: 最も短いジョブから実行。平均待ち時間が最小になるが、実行時間の予測が難しい。</li>
</ul>

<h3>デッドロック（Deadlock）</h3>
<p>複数のプロセスが互いに相手が持つ資源の解放を<strong>永遠に待ち続ける</strong>状態です。</p>
<p>例えるなら：道幅1台分の橋の両側からトラックが来て、どちらも「相手が下がるまで進めない」と待ち続ける状態。</p>
<pre>
プロセスA: ファイルXを保持 → データベースYを待っている
プロセスB: データベースYを保持 → ファイルXを待っている
→ 互いに待ち続けて永遠に進まない
</pre>
<p>デッドロックの発生条件（コフマン条件）: 以下の4つが全て成立するとデッドロックが発生します。</p>
<ol>
  <li>相互排除（資源を1プロセスしか使えない）</li>
  <li>占有と待機（資源を持ったまま別の資源を待つ）</li>
  <li>非横取り（強制的に資源を奪えない）</li>
  <li>循環待機（プロセスが循環して待ち合う）</li>
</ol>

<h3>排他制御（ミューテックス・セマフォ）</h3>
<p>複数スレッドが共有メモリを同時に書き換えると、データが壊れます（競合状態・レースコンディション）。これを防ぐための仕組みが<strong>排他制御</strong>です。</p>
<ul>
  <li>
    <strong>ミューテックス（Mutex）</strong>: 鍵のようなもの。ロックを取得したスレッドだけが共有資源にアクセスでき、終わったらアンロックする。同時に1スレッドのみが使える（バイナリセマフォの一種）。
  </li>
  <li>
    <strong>セマフォ（Semaphore）</strong>: カウンター付きの制御。「同時に最大N個まで利用可能」という制御ができる。カウンタが0になると次のスレッドは待機する。駐車場の満空表示に例えられる。
  </li>
</ul>
<p>排他制御が適切でないと<strong>デッドロック</strong>（互いがロックを待つ状態）が起きるため、ロックの取得順序を統一するなどの設計が重要です。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
プロセスとスレッドの違い（メモリ空間の独立 vs 共有）・デッドロックの説明が頻出。<br/>
スケジューリング方式: ラウンドロビン=公平・均等、優先度=重要タスク優先。<br/>
セマフォ=同時アクセス数を制限するカウンタ型の排他制御。
</div>
        `,
        diagram: 'os',
        questions: [
          {
            id: 20,
            question: 'OSのプロセス管理の説明として正しいものはどれか。',
            choices: [
              '1つのCPUで複数のプロセスを切り替えながら実行する',
              'プロセスごとに専用のCPUを割り当てる',
              'メモリを複数のプロセスで共有せず独占させる',
              'ディスクの読み書きを高速化する',
            ],
            answer: 0,
            explanation: 'タイムシェアリングにより、1つのCPUを短い時間で切り替えながら複数プロセスを並行実行します。',
          },
          {
            id: 501,
            question: 'プロセスとスレッドの説明として正しいものはどれか。',
            choices: [
              'スレッドはプロセスと独立したメモリ空間を持つ',
              'スレッドはプロセス内の実行単位でメモリ空間を共有する',
              'プロセスはスレッドよりも切り替えコストが低い',
              '1つのプロセスには必ず1つのスレッドしか持てない',
            ],
            answer: 1,
            explanation: 'スレッドはプロセス内の軽量な実行単位で、同一プロセス内のスレッドはメモリ空間を共有します。そのためプロセス切り替えよりコストが低いです。',
          },
          {
            id: 502,
            question: 'デッドロックの説明として正しいものはどれか。',
            choices: [
              'CPUが高負荷になりシステムが遅くなる状態',
              '複数プロセスが互いの資源を待ち合い、どちらも進めなくなる状態',
              'メモリが不足してスワップが頻発する状態',
              'プロセスの優先度が高すぎて他のプロセスが実行できない状態',
            ],
            answer: 1,
            explanation: 'デッドロックは複数プロセスが互いに相手の保持する資源を待ち続けることで、すべてのプロセスが永久に待機状態になる現象です。',
          },
          {
            id: 509,
            question: 'ラウンドロビンスケジューリングの説明として正しいものはどれか。',
            choices: [
              '優先度の高いプロセスを常に先に実行する方式',
              '全プロセスに均等なタイムスライスを順番に割り当てる公平な方式',
              '最も実行時間が短いプロセスを先に実行する方式',
              '到着した順に実行し、割り込みを許さない方式',
            ],
            answer: 1,
            explanation: 'ラウンドロビンは各プロセスに一定のタイムスライス（例:10ms）を順番に割り当てます。公平性が高く、時分割処理の基本方式ですが、優先度は考慮されません。',
          },
          {
            id: 510,
            question: 'セマフォを使った排他制御の説明として正しいものはどれか。',
            choices: [
              '共有資源へのアクセスを完全に禁止する仕組み',
              'カウンタを使って同時にアクセスできるスレッド数を制限する仕組み',
              'デッドロックが発生したときに自動的に解消する仕組み',
              'プロセス間でメモリを完全に分離するための仕組み',
            ],
            answer: 1,
            explanation: 'セマフォはカウンタ値で同時アクセス数を管理します。カウンタ>0なら入れる、0になると待機します。バイナリセマフォ（0/1のみ）はミューテックスと同等の働きをします。',
          },
        ],
      },
      {
        id: 'a5-2',
        title: 'メモリ管理と仮想記憶',
        content: `
<h3>メモリの割り当て方式</h3>
<ul>
  <li><strong>固定区画方式</strong>: メモリをあらかじめ固定サイズの区画に分割する。実装が簡単だが内部断片化が発生。</li>
  <li><strong>可変区画方式</strong>: プロセスの必要量に応じて動的にメモリを割り当てる。外部断片化が発生する。</li>
  <li><strong>ページング方式</strong>: メモリを固定サイズのページに分割して管理。仮想記憶の基本。断片化を解消。</li>
  <li><strong>セグメント方式</strong>: プログラムをコード・データ・スタックなど論理的な単位で分割して管理。</li>
</ul>

<h3>仮想記憶とページング</h3>
<p>物理メモリより大きなアドレス空間をプロセスに提供する仕組みです。</p>
<p>必要なページだけを物理メモリに置き、不要なページはディスク（スワップ領域）に退避します。</p>

<h3>ページ置換アルゴリズム</h3>
<p>物理メモリが満杯のとき、どのページをディスクに追い出すかを決めるアルゴリズムです。</p>
<ul>
  <li><strong>FIFO（先入れ先出し）</strong>: 最も古く読み込まれたページを追い出す。シンプルだが最適ではない。</li>
  <li><strong>LRU（最近最も長く使われていないページ）</strong>: 最も長い間参照されていないページを追い出す。局所性を活用した実用的な方法。</li>
  <li><strong>最適アルゴリズム（OPT）</strong>: 将来最も長く使われないページを追い出す。理論上最高だが将来予測は不可能。</li>
</ul>

<h3>内部断片化と外部断片化</h3>
<p>メモリ管理で無駄な空き領域が生じる現象を<strong>断片化（フラグメンテーション）</strong>といいます。</p>
<ul>
  <li>
    <strong>内部断片化</strong>: 割り当てたブロックの中に使われない隙間が生じる現象。固定区画方式で起きやすい。<br/>
    例: 100KBの区画に60KBのプロセスを配置 → 40KBが無駄になる。
  </li>
  <li>
    <strong>外部断片化</strong>: 割り当てできない小さな空き領域が分散して残る現象。可変区画方式で起きやすい。<br/>
    解消方法: <strong>コンパクション（メモリの再配置）</strong>でまとめる。
  </li>
</ul>
<p>ページング方式は固定サイズのページで管理するため外部断片化がなく、仮想記憶の主流方式になっています。</p>

<h3>スラッシング</h3>
<p>ページの置換が頻繁に発生し、CPUがほとんどページ入れ替えに費やされてしまう状態です。物理メモリが極端に不足したときに発生します。</p>
<p>対策: 物理メモリを増設する、同時実行プロセス数を減らす（ワーキングセットの制御）。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
固定区画→内部断片化、可変区画→外部断片化（コンパクションで対策）。<br/>
LRU=「最近使っていない」ページを追い出す。スラッシング=ページ置換が多すぎてCPUが有効に使えない状態。
</div>
        `,
        diagram: 'paging',
        questions: [
          {
            id: 21,
            question: '仮想記憶の説明として正しいものはどれか。',
            choices: [
              'CPUの処理速度を向上させる技術',
              'ディスクの一部を主記憶として利用し物理メモリより大きなアドレス空間を実現する技術',
              'ネットワーク経由でメモリを拡張する技術',
              'キャッシュメモリを増やす技術',
            ],
            answer: 1,
            explanation: '仮想記憶はディスクの一部をスワップ領域として使い、物理メモリより大きなアドレス空間を実現します。',
          },
          {
            id: 503,
            question: 'LRUページ置換アルゴリズムの説明として正しいものはどれか。',
            choices: [
              '最も古く読み込まれたページを追い出す',
              '最も長い間参照されていないページを追い出す',
              '将来最も長く使われないページを追い出す',
              'ランダムにページを選んで追い出す',
            ],
            answer: 1,
            explanation: 'LRU（Least Recently Used）は最近最も長く使われていないページを置換します。時間的局所性を活用した実用的なアルゴリズムです。',
          },
          {
            id: 511,
            question: '固定区画方式のメモリ管理で発生しやすい断片化はどれか。',
            choices: [
              '外部断片化：割り当てられない小さな空き領域が分散する',
              '内部断片化：割り当てたブロック内に無駄な空き領域が生じる',
              'コンパクション：メモリを再配置して断片化を解消する',
              '仮想断片化：仮想アドレス空間に無駄が生じる',
            ],
            answer: 1,
            explanation: '固定区画方式はメモリを固定サイズに分割するため、プロセスがブロックより小さい場合、その差分が無駄（内部断片化）になります。可変区画方式では外部断片化が問題となります。',
          },
          {
            id: 512,
            question: 'スラッシングが発生したときの状態として正しいものはどれか。',
            choices: [
              'CPUがほとんどアイドル状態になり、プロセスが待機する',
              'ページ置換が頻繁に起きてCPUの有効利用率が著しく低下する',
              'メモリが増設されて処理速度が向上する',
              'キャッシュヒット率が上がり処理が高速化する',
            ],
            answer: 1,
            explanation: 'スラッシングは物理メモリ不足でページ置換（スワップ）が頻発し、CPUがページの入れ替え処理だけに費やされてスループットが大幅に低下する状態です。',
          },
        ],
      },
      {
        id: 'a5-3',
        title: 'ファイルシステム',
        content: `
<h3>ファイルシステムの役割</h3>
<p>ディスク上のデータを<strong>ファイル</strong>と<strong>ディレクトリ（フォルダ）</strong>で管理する仕組みです。ファイルの作成・読み書き・削除・アクセス権限管理を担います。</p>

<h3>代表的なファイルシステム</h3>
<ul>
  <li><strong>FAT32</strong>: Windowsの旧方式。最大ファイルサイズ4GB。USBメモリなどで広く使用。</li>
  <li><strong>NTFS</strong>: Windowsの現行方式。大容量ファイル・アクセス権限・暗号化に対応。</li>
  <li><strong>ext4</strong>: Linuxの標準ファイルシステム。ジャーナリング機能でデータ保護。</li>
  <li><strong>APFS</strong>: macOSの現行方式。SSD最適化・スナップショット対応。</li>
</ul>

<h3>パスの種類</h3>
<p><strong>絶対パス</strong>: ルートディレクトリ（<code>/</code> または <code>C:\\</code>）から記述。</p>
<p>例: <code>/home/user/documents/file.txt</code></p>
<p><strong>相対パス</strong>: 現在の作業ディレクトリを起点に記述。</p>
<p><code>./</code>（カレント）、<code>../</code>（1つ上）などの記号を使用。</p>
<p>例: <code>../images/photo.png</code>（1つ上のフォルダのimages内）</p>

<h3>ファイルのアクセス権限（Linuxパーミッション）</h3>
<p>Linuxでは所有者・グループ・その他に対して読み（r=4）・書き（w=2）・実行（x=1）の権限を設定します。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 10px;border:1px solid var(--color-border)">表記</th><th style="padding:6px 10px;border:1px solid var(--color-border)">数値</th><th style="padding:6px 10px;border:1px solid var(--color-border)">意味</th></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><code>rwx</code></td><td style="padding:5px 10px;border:1px solid var(--color-border)">7</td><td style="padding:5px 10px;border:1px solid var(--color-border)">読み・書き・実行すべて許可</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><code>r-x</code></td><td style="padding:5px 10px;border:1px solid var(--color-border)">5</td><td style="padding:5px 10px;border:1px solid var(--color-border)">読み・実行のみ許可（書き不可）</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><code>r--</code></td><td style="padding:5px 10px;border:1px solid var(--color-border)">4</td><td style="padding:5px 10px;border:1px solid var(--color-border)">読みのみ許可</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><code>---</code></td><td style="padding:5px 10px;border:1px solid var(--color-border)">0</td><td style="padding:5px 10px;border:1px solid var(--color-border)">すべて禁止</td></tr>
</table>
<p>例: <code>rwxr-xr--</code> (754) → 所有者=全権限(7)、グループ=読み・実行(5)、その他=読みのみ(4)</p>

<h3>ジャーナリング</h3>
<p>ファイルシステムへの変更をジャーナル（ログ）に先行して記録し、障害発生時に整合性を復元する仕組みです。</p>

<h3>RAID（Redundant Array of Independent Disks）</h3>
<p>複数のディスクを組み合わせて<strong>パフォーマンス向上</strong>や<strong>冗長性（耐障害性）</strong>を実現する技術です。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">RAID種別</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">方式</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">特徴</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">耐障害性</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>RAID 0</strong><br/>ストライピング</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">2台以上。データを分割して複数ディスクに並行書き込み</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">読み書き高速化。容量=N台分</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">冗長性なし。1台故障でデータ全滅</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>RAID 1</strong><br/>ミラーリング</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">2台。同じデータを2台に書き込む（鏡像）</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">高い冗長性。容量=N/2台分</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">1台故障でも継続稼働可能</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>RAID 5</strong><br/>パリティ分散</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">3台以上。データとパリティ（誤り訂正情報）を全ディスクに分散</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">高速＋冗長性。容量=(N-1)台分</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">1台故障まで耐性。2台同時故障でデータ消失</td>
  </tr>
</table>
<p><strong>RAID 1+0（RAID 10）</strong>: ミラーリング後にストライピング。高速＋高冗長性。最低4台必要。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
絶対パス=ルートから記述。相対パス=現在地から記述（<code>../</code>で1つ上）。<br/>
Linuxパーミッション: r=4, w=2, x=1 の合計。rwxr-xr--=754。<br/>
ジャーナリング=変更を先にログへ書き、クラッシュ時の整合性を保証。<br/>
RAID 0=高速化のみ（冗長性なし）。RAID 1=ミラーリング（1台故障耐性）。RAID 5=パリティ分散（1台故障耐性・容量効率良）。
</div>
        `,
        diagram: 'filesystem',
        questions: [
          {
            id: 22,
            question: 'ルートディレクトリからのファイルの場所を示すパスを何というか。',
            choices: ['相対パス', '絶対パス', 'フルパス名', 'カレントパス'],
            answer: 1,
            explanation: 'ルートから記述するパスを絶対パスといいます（フルパスとも呼ばれます）。',
          },
          {
            id: 504,
            question: 'ファイルシステムのジャーナリングの説明として正しいものはどれか。',
            choices: [
              'ファイルを圧縮して保存する仕組み',
              '変更をログに先行記録して障害時の整合性を保つ仕組み',
              'ファイルへのアクセスを高速化するキャッシュ機能',
              '削除したファイルを自動的に復元する機能',
            ],
            answer: 1,
            explanation: 'ジャーナリングは変更内容をジャーナル（ログ）に先に記録することで、システムクラッシュ後にファイルシステムの整合性を素早く回復できます。',
          },
          {
            id: 513,
            question: 'Linuxのファイルパーミッション "rwxr-xr--" を数値表記にすると何か。',
            choices: ['644', '755', '754', '777'],
            answer: 2,
            explanation: 'r=4, w=2, x=1 です。所有者: rwx=4+2+1=7、グループ: r-x=4+0+1=5、その他: r--=4+0+0=4 → 754 です。',
          },
          {
            id: 514,
            question: '相対パスの説明として正しいものはどれか。',
            choices: [
              'ルートディレクトリを起点にファイルの位置を記述するパス',
              '現在の作業ディレクトリを起点にファイルの位置を記述するパス',
              'ネットワーク上のファイルサーバへのパス',
              'ファイルの絶対的な物理アドレスを示すパス',
            ],
            answer: 1,
            explanation: '相対パスはカレントディレクトリ（現在の作業ディレクトリ）を起点として記述します。<code>./</code>はカレント、<code>../</code>は1つ上のディレクトリを意味します。',
          },
        ],
      },
      {
        id: 'a5-4',
        title: 'ミドルウェアとAPI',
        content: `
<h3>ミドルウェアとは</h3>
<p>OSとアプリケーションの中間に位置するソフトウェアです。データベース・Webサーバ・メッセージキューなどが代表例です。</p>

<h3>Webサーバとアプリケーションサーバ</h3>
<p><strong>Webサーバ</strong>: HTTP(S)リクエストを受け付け、静的コンテンツ（HTML・CSS・画像）を返す。Apache・Nginxが代表例。</p>
<p><strong>アプリケーションサーバ</strong>: 動的なコンテンツ生成・ビジネスロジック処理を担う。DBと連携してHTMLを生成する。</p>

<h3>API（Application Programming Interface）</h3>
<p>ソフトウェア同士が通信するためのインタフェースです。</p>
<ul>
  <li><strong>REST API</strong>: HTTPメソッド（GET/POST/PUT/DELETE）でリソースを操作する設計スタイル。現在のWeb APIの主流。</li>
  <li><strong>SOAP</strong>: XML形式のメッセージを使う古典的なWebサービス規格。</li>
  <li><strong>GraphQL</strong>: クライアントが必要なデータ構造を指定できる新しいAPI設計。</li>
</ul>

<h3>クラウドサービスの形態</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 10px;border:1px solid var(--color-border)">種類</th><th style="padding:6px 10px;border:1px solid var(--color-border)">提供内容</th><th style="padding:6px 10px;border:1px solid var(--color-border)">例</th><th style="padding:6px 10px;border:1px solid var(--color-border)">利用者が管理</th></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>IaaS</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">仮想サーバ・ストレージ・NW</td><td style="padding:5px 10px;border:1px solid var(--color-border)">AWS EC2, Azure VM</td><td style="padding:5px 10px;border:1px solid var(--color-border)">OS〜アプリ</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>PaaS</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">アプリ開発・実行環境</td><td style="padding:5px 10px;border:1px solid var(--color-border)">AWS Beanstalk, GAE</td><td style="padding:5px 10px;border:1px solid var(--color-border)">アプリのみ</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>SaaS</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">完成したアプリ</td><td style="padding:5px 10px;border:1px solid var(--color-border)">Gmail, Salesforce</td><td style="padding:5px 10px;border:1px solid var(--color-border)">設定のみ</td></tr>
</table>

<h3>マイクロサービスアーキテクチャ</h3>
<p>アプリケーションを小さな独立したサービス（マイクロサービス）に分割して構築する設計スタイルです。</p>
<ul>
  <li><strong>モノリシック（一枚岩）</strong>: 機能が1つのアプリにまとまっている従来型。変更の影響範囲が大きい。</li>
  <li><strong>マイクロサービス</strong>: 機能ごとに独立したサービスに分割。サービスごとに独立デプロイ・スケールが可能。</li>
</ul>
<p>サービス間の通信には<strong>REST API</strong>や<strong>メッセージキュー</strong>（RabbitMQ・Kafka等）が使われます。メッセージキューはサービスを非同期につなぎ、負荷の平準化に有効です。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
IaaS=インフラ提供、PaaS=開発環境提供、SaaS=完成ソフト提供。<br/>
REST API=HTTPメソッドでリソース操作。GET=取得、POST=作成、PUT=更新、DELETE=削除。<br/>
マイクロサービス=機能を独立したサービスに分割し、独立デプロイを可能にするアーキテクチャ。
</div>
        `,
        diagram: 'cloud',
        questions: [
          {
            id: 505,
            question: 'IaaSの説明として正しいものはどれか。',
            choices: [
              '完成したアプリケーションをサービスとして提供する',
              'アプリ開発・実行環境（OS・ミドルウェア）をサービスとして提供する',
              '仮想サーバ・ストレージ・ネットワークをサービスとして提供する',
              'データベースのみをクラウドで提供する',
            ],
            answer: 2,
            explanation: 'IaaSは仮想サーバ・ストレージ・ネットワークなどのインフラをクラウドで提供します。OSからアプリまでの管理は利用者が行います。',
          },
          {
            id: 506,
            question: 'REST APIで特定リソースを取得するときに使うHTTPメソッドはどれか。',
            choices: ['POST', 'PUT', 'GET', 'DELETE'],
            answer: 2,
            explanation: 'REST APIではGETがリソースの取得、POSTが作成、PUTが更新、DELETEが削除に対応します。',
          },
          {
            id: 515,
            question: 'SaaS（Software as a Service）の説明として正しいものはどれか。',
            choices: [
              '仮想サーバとストレージをクラウドで提供するサービス',
              'アプリケーション開発・実行環境をクラウドで提供するサービス',
              '完成したソフトウェアをインターネット経由でサービスとして提供する形態',
              'ハードウェアをクラウドから遠隔操作するサービス',
            ],
            answer: 2,
            explanation: 'SaaSはGmailやSalesforceのように完成したアプリケーションをサービスとして提供します。利用者はアプリを設定して使うだけで、インフラ・OS・アプリの管理は不要です。',
          },
          {
            id: 516,
            question: 'マイクロサービスアーキテクチャの説明として正しいものはどれか。',
            choices: [
              'すべての機能を1つのアプリケーションにまとめて管理する方式',
              'アプリケーションを小さな独立したサービスに分割し、それぞれを独立して開発・デプロイできるようにする設計',
              'データベースを複数のサーバに分散配置する方式',
              'マイクロプロセッサを使った組み込みシステムの設計手法',
            ],
            answer: 1,
            explanation: 'マイクロサービスは機能単位で独立したサービスに分割するアーキテクチャです。サービスごとに独立してデプロイ・スケールでき、大規模システムの開発効率と保守性を高めます。',
          },
        ],
      },
      {
        id: 'a5-5',
        title: '仮想化とコンテナ技術',
        content: `
<h3>仮想化とは</h3>
<p>1台の物理サーバ上で複数の仮想的なコンピュータ（仮想マシン）を動かす技術です。サーバの効率利用・コスト削減・柔軟なスケールアップを実現します。</p>

<h3>仮想化の種類</h3>
<ul>
  <li><strong>ホスト型仮想化</strong>: 既存のOS（ホストOS）の上に仮想化ソフトウェアをインストールし、その上でゲストOSを動かす。VMware Workstation・VirtualBoxが代表例。手軽だが性能オーバーヘッドあり。</li>
  <li><strong>ハイパーバイザー型（ベアメタル型）</strong>: ハードウェア上に直接ハイパーバイザーを導入し、その上でゲストOSを動かす。VMware ESXi・Hyper-Vが代表例。高性能でデータセンターに向く。</li>
</ul>

<h3>コンテナ技術</h3>
<p>OSカーネルを共有しながら、プロセスレベルで隔離された実行環境（コンテナ）を作る技術です。仮想マシンよりも軽量・高速で起動できます。</p>
<p><strong>Docker</strong>が代表的なコンテナエンジンです。</p>
<ul>
  <li><strong>イメージ</strong>: コンテナの設計図（読み取り専用）</li>
  <li><strong>コンテナ</strong>: イメージから起動した実行中の環境</li>
  <li><strong>Dockerfile</strong>: イメージを作成するための手順書</li>
</ul>

<h3>仮想マシン vs コンテナ</h3>
<ul>
  <li><strong>仮想マシン</strong>: ゲストOSを含むため重い（GBオーダー）が、完全な分離を実現</li>
  <li><strong>コンテナ</strong>: OSカーネルを共有するため軽い（MBオーダー）が、分離は仮想マシンより弱い</li>
</ul>

<h3>Kubernetes（K8s）</h3>
<p>複数のコンテナを自動的に管理・スケールする<strong>コンテナオーケストレーション</strong>ツールです。Google発で現在クラウド展開の標準になっています。主な機能:</p>
<ul>
  <li><strong>自動スケーリング</strong>: 負荷に応じてコンテナ数を自動増減</li>
  <li><strong>自己修復</strong>: 障害が発生したコンテナを自動再起動</li>
  <li><strong>ローリングアップデート</strong>: 無停止でコンテナをバージョンアップ</li>
</ul>

<h3>サーバレスコンピューティング</h3>
<p>サーバの管理を一切せず、コードのみを書いて実行できるクラウドサービスの形態です。</p>
<ul>
  <li>実際にはサーバは存在するが、利用者はサーバを意識しない</li>
  <li>関数単位でコードを実行（Function as a Service: FaaS）</li>
  <li>代表例: <strong>AWS Lambda</strong>・Azure Functions・Google Cloud Functions</li>
  <li>イベント駆動型（HTTPリクエスト・ファイルアップロード・タイマーなどをトリガーに実行）</li>
  <li>実行時間・実行回数に応じた課金で、アイドル時のコスト不要</li>
</ul>

<h3>CI/CD（継続的インテグレーション / 継続的デリバリー）</h3>
<p>コードの変更を頻繁かつ自動的にテスト・ビルド・デプロイするプロセスです。</p>
<ul>
  <li><strong>CI（Continuous Integration）</strong>: コードのコミット時に自動でビルド・テストを実行。バグを早期発見。</li>
  <li><strong>CD（Continuous Delivery/Deployment）</strong>: テスト通過後に自動でステージング・本番環境へデプロイ。</li>
</ul>
<p>代表ツール: GitHub Actions・Jenkins・GitLab CI</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
コンテナ=OSカーネル共有で軽量、VM=ゲストOSを持ち完全分離。<br/>
Kubernetes=複数コンテナを自動管理するオーケストレーションツール。<br/>
サーバレス（FaaS）=サーバ管理不要・イベント駆動・使った分だけ課金。<br/>
CI=自動テスト、CD=自動デプロイ。合わせてCI/CD。
</div>
        `,
        diagram: 'virtualization',
        questions: [
          {
            id: 507,
            question: 'コンテナ技術の特徴として正しいものはどれか。',
            choices: [
              'ゲストOSを含むため仮想マシンより重い',
              'ハードウェア上に直接ハイパーバイザーを導入する',
              'OSカーネルを共有するため仮想マシンより軽量・高速に起動できる',
              'Dockerfileはコンテナの実行中の状態を記録したものである',
            ],
            answer: 2,
            explanation: 'コンテナはホストOSのカーネルを共有するため、ゲストOSを必要とする仮想マシンよりも軽量で高速に起動できます。',
          },
          {
            id: 508,
            question: 'ハイパーバイザー型仮想化の説明として正しいものはどれか。',
            choices: [
              'ホストOSの上に仮想化ソフトを導入する方式',
              'ハードウェア上に直接仮想化層を置く方式',
              'コンテナを使って環境を分離する方式',
              'クラウド上でのみ使用できる仮想化方式',
            ],
            answer: 1,
            explanation: 'ハイパーバイザー型（ベアメタル型）はOS不要でハードウェア上に直接動作するため、オーバーヘッドが小さく高性能です。データセンターで広く使われます。',
          },
          {
            id: 517,
            question: 'Kubernetes（K8s）の主な役割として正しいものはどれか。',
            choices: [
              'Dockerイメージを作成するための設計ツール',
              '複数のコンテナを自動管理・スケールするオーケストレーションツール',
              'ハイパーバイザー型仮想化を実現するソフトウェア',
              '仮想マシンのスナップショットを管理するツール',
            ],
            answer: 1,
            explanation: 'Kubernetesは複数のコンテナを自動でデプロイ・スケール・管理するオーケストレーションツールです。自動スケーリング・自己修復・無停止アップデートが主な機能です。',
          },
          {
            id: 518,
            question: 'サーバレスコンピューティング（FaaS）の説明として正しいものはどれか。',
            choices: [
              'サーバが物理的に存在しないクラウドサービス',
              '利用者がサーバを管理せずコード（関数）のみを実行でき、実行分だけ課金される形態',
              '仮想マシンを自動的にスケールさせる仕組み',
              'データベースをサーバ不要で利用できるサービス',
            ],
            answer: 1,
            explanation: 'サーバレス（FaaS）はAWS Lambdaに代表され、利用者はサーバ管理不要でコード（関数）のみを記述します。イベント駆動で実行され、実行時間・回数に応じた課金なのでアイドル時のコストがかかりません。',
          },
        ],
      },
      {
        id: 'a5-6',
        title: 'クラウドコンピューティング',
        content: `
<h3>クラウドコンピューティングとは</h3>
<p>インターネット経由でサーバ・ストレージ・データベース・ソフトウェアなどのITリソースを<strong>必要なときに必要なだけ</strong>利用できる仕組みです。自社でサーバを購入・管理する「オンプレミス」と対照的です。</p>

<h3>サービスモデル（SaaS / PaaS / IaaS）</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">モデル</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">提供範囲</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">利用者が管理するもの</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">代表例</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>SaaS</strong><br/><small>Software as a Service</small></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">アプリまで全て提供</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">データのみ</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">Gmail・Slack・Salesforce・Office 365</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>PaaS</strong><br/><small>Platform as a Service</small></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">OS・ミドルウェアまで提供</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">アプリ・データ</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">AWS Elastic Beanstalk・Google App Engine・Heroku</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>IaaS</strong><br/><small>Infrastructure as a Service</small></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">仮想サーバ・ネットワーク・ストレージを提供</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">OS・ミドルウェア・アプリ・データ</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">AWS EC2・Azure VM・GCP Compute Engine</td>
  </tr>
</table>
<div class="point-box">
<strong>覚え方</strong>: 上に行くほど「自分で管理するものが少ない」。<br/>
SaaS（全おまかせ）→ PaaS（アプリだけ作る）→ IaaS（OSから自分で管理）
</div>

<h3>展開モデル</h3>
<ul>
  <li><strong>パブリッククラウド</strong>: AWS・Azure・GCPなど事業者が提供する共有インフラ。初期費用ゼロ・従量課金。</li>
  <li><strong>プライベートクラウド</strong>: 特定の企業・組織だけが使う専用クラウド環境。セキュリティ・カスタマイズ性に優れる。</li>
  <li><strong>ハイブリッドクラウド</strong>: パブリックとプライベートを組み合わせて利用。機密データはプライベート、処理能力が必要な時はパブリックへ拡張（クラウドバースティング）。</li>
  <li><strong>マルチクラウド</strong>: 複数のクラウド事業者を組み合わせて利用。特定事業者への依存（ベンダーロックイン）を回避。</li>
</ul>

<h3>クラウドのメリット・デメリット</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">メリット</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">デメリット</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">初期投資が不要（資本支出→運用支出へ）</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">長期では総コストが高くなる場合がある</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">需要に応じた柔軟なスケールアップ・ダウン</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">インターネット依存（障害時に影響大）</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">世界中のデータセンターで高可用性を実現</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">ベンダーロックインのリスク</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">最新技術（AI・ML・セキュリティ）をすぐ利用可能</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">機密データの社外保管に関するコンプライアンス懸念</td>
  </tr>
</table>

<h3>主要クラウドサービス（三大クラウド）</h3>
<ul>
  <li><strong>AWS（Amazon Web Services）</strong>: 世界シェア1位。EC2（仮想サーバ）・S3（ストレージ）・RDS（DB）・Lambda（サーバレス）など200以上のサービス。</li>
  <li><strong>Azure（Microsoft Azure）</strong>: シェア2位。Active DirectoryなどMicrosoft製品との親和性が高く、企業向けに強い。</li>
  <li><strong>GCP（Google Cloud Platform）</strong>: シェア3位。BigQuery（大規模データ解析）・AI/ML系サービスが強み。</li>
</ul>

<h3>クラウドセキュリティの責任共有モデル</h3>
<p>クラウドでのセキュリティ責任は、クラウド事業者と利用者で分担します。</p>
<ul>
  <li><strong>事業者の責任</strong>: 物理インフラ・ネットワーク・ハイパーバイザーのセキュリティ</li>
  <li><strong>利用者の責任</strong>: OS設定・アプリ・データ・アクセス権限の管理（IaaSの場合）</li>
  <li>SaaSでは利用者の責任範囲は最小（データとアクセス管理のみ）</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
SaaS＝アプリまで全提供、PaaS＝開発基盤まで提供、IaaS＝仮想サーバのみ提供。<br/>
パブリック（共有）・プライベート（専用）・ハイブリッド（組み合わせ）の3展開モデル。<br/>
ベンダーロックイン＝特定クラウドへの過度な依存で乗り換えが困難になること。
</div>
        `,
        questions: [
          {
            id: 1050,
            question: 'SaaS（Software as a Service）の説明として最も適切なものはどれか。',
            choices: [
              '仮想サーバやストレージなどのインフラだけを提供し、OSやアプリは利用者が管理する',
              'OSやミドルウェアまでを提供し、利用者はアプリケーションの開発・実行に専念できる',
              'アプリケーションまでを含む全ITリソースをネット経由で提供し、利用者はデータ管理のみ行う',
              'オンプレミスのサーバを仮想化してインターネットから利用可能にするサービス',
            ],
            answer: 2,
            explanation: 'SaaSはアプリケーションを含むすべてをサービスとして提供します。利用者はブラウザやアプリからアクセスするだけでよく、インフラ・OS・ミドルウェアの管理は不要です。Gmail・Slack・Salesforceが代表例です。',
          },
          {
            id: 1051,
            question: 'クラウドの展開モデルのうち、機密性の高いデータは自社専用環境に置きつつ、高負荷時にはパブリッククラウドへ処理を拡張する形態はどれか。',
            choices: [
              'パブリッククラウド',
              'プライベートクラウド',
              'ハイブリッドクラウド',
              'マルチクラウド',
            ],
            answer: 2,
            explanation: 'ハイブリッドクラウドはパブリックとプライベートを組み合わせた形態です。機密データはプライベートクラウドで安全に管理しつつ、必要時にパブリッククラウドの処理能力を活用するクラウドバースティングが実現できます。',
          },
          {
            id: 1052,
            question: 'IaaS（Infrastructure as a Service）を利用する場合、利用者が自分で管理する必要があるものはどれか。',
            choices: [
              '物理サーバとネットワーク機器',
              'ハイパーバイザーの保守',
              'OSのインストールとパッチ適用',
              '電源・空調などのデータセンター設備',
            ],
            answer: 2,
            explanation: 'IaaSでは物理インフラ・ネットワーク・仮想化レイヤーはクラウド事業者が管理します。利用者はその上のOSから上（OS・ミドルウェア・アプリ・データ）を管理する責任があります。',
          },
          {
            id: 1053,
            question: 'ベンダーロックインの説明として正しいものはどれか。',
            choices: [
              '特定のクラウド事業者のサービスに深く依存し、他への乗り換えが困難になること',
              '複数のクラウド事業者を同時に利用してコストを最適化すること',
              'クラウド事業者がサービスの仕様を一方的に変更できる権限を持つこと',
              '利用者がクラウドのデータセンターを物理的に施錠管理できないこと',
            ],
            answer: 0,
            explanation: 'ベンダーロックインとは、特定クラウド事業者の独自サービス（専用DB・独自API等）に依存しすぎることで、他社へ移行するコストが非常に高くなる状態です。マルチクラウド戦略がその対策の一つです。',
          },
        ],
      },
    ],
  },
  {
    id: 'a6',
    title: 'データベース',
    subject: 'A',
    description: 'SQL・正規化・ER図・トランザクション・NoSQLまでデータベースを体系的に学びます。',
    sections: [
      {
        id: 'a6-1',
        title: 'リレーショナルデータベースとSQL',
        content: `
<h3>なぜデータベースが必要か</h3>
<p>ファイルにデータを保存するだけでは、「30歳以上の社員を名前順で取得して」「部署ごとの平均年齢を出して」といった複雑な操作が困難です。データベースは<strong>大量のデータを効率よく保存・検索・更新・削除</strong>できる仕組みです。</p>

<h3>リレーショナルデータベース（RDB）の基本概念</h3>
<p>データを<strong>表（テーブル）</strong>の形式で管理します。Excelの表と似ていますが、テーブル間の関係（リレーション）を定義できる点が特徴です。</p>
<ul>
  <li><strong>テーブル（表）</strong>: データの集合。「社員」「部署」などエンティティごとに作成。</li>
  <li><strong>行（レコード・タプル）</strong>: 1件のデータ。「田中さんの情報」が1行。</li>
  <li><strong>列（カラム・フィールド）</strong>: データの属性。「氏名」「年齢」など。</li>
</ul>

<h3>キーの種類と役割</h3>
<p><strong>主キー（Primary Key）</strong>: 各行を<strong>一意に識別</strong>する列。重複とNULLは絶対に不可。学生証番号・社員IDのような番号が典型例。</p>
<p><strong>外部キー（Foreign Key）</strong>: 別テーブルの主キーを参照する列。テーブル間の「関係」を表現し、参照整合性（存在しない部署IDを設定できないなど）を保証する。</p>
<p><strong>複合キー</strong>: 複数列を組み合わせた主キー。「学生ID + 科目ID」で受講テーブルを一意識別するなど。</p>

<h3>SQLの4大命令（DML）</h3>
<p>SQLはデータベースを操作する言語です。DML（Data Manipulation Language）は以下の4つが基本です。</p>
<pre>
-- SELECT: データを取得する（最も重要・最頻出）
SELECT 氏名, 年齢
FROM 社員
WHERE 年齢 >= 30          -- 条件絞り込み
ORDER BY 年齢 DESC;       -- 降順ソート（ASCで昇順）

-- INSERT: データを追加する
INSERT INTO 社員 (社員ID, 氏名, 年齢)
VALUES (101, '田中太郎', 25);

-- UPDATE: データを更新する
UPDATE 社員
SET 年齢 = 26
WHERE 社員ID = 101;

-- DELETE: データを削除する
DELETE FROM 社員
WHERE 社員ID = 101;
</pre>

<h3>集計・グループ化（頻出！）</h3>
<pre>
-- 集計関数
SELECT COUNT(*) FROM 社員;           -- 総件数
SELECT AVG(年齢) FROM 社員;           -- 平均年齢
SELECT MAX(年齢), MIN(年齢) FROM 社員; -- 最大・最小

-- GROUP BY: 部署ごとに集計
SELECT 部署ID, COUNT(*) AS 人数
FROM 社員
GROUP BY 部署ID
HAVING COUNT(*) >= 3;  -- ← HAVINGはGROUP BY後の条件（WHEREとの違いに注意！）
</pre>

<h3>テーブル結合（JOIN）</h3>
<pre>
-- INNER JOIN: 両テーブルで一致する行だけを返す
SELECT 社員.氏名, 部署.部署名
FROM 社員
INNER JOIN 部署 ON 社員.部署ID = 部署.部署ID;

-- LEFT JOIN: 社員テーブルの全行 + 一致する部署情報
-- 部署IDがない社員も含まれ、部署名はNULL
SELECT 社員.氏名, 部署.部署名
FROM 社員
LEFT JOIN 部署 ON 社員.部署ID = 部署.部署ID;
</pre>

<h3>サブクエリと DISTINCT</h3>
<pre>
-- DISTINCT: 重複を除いて取得
SELECT DISTINCT 部署ID FROM 社員;

-- サブクエリ: SELECT内にSELECTを入れ子にする
-- 例: 平均年齢より高い社員を取得
SELECT 氏名, 年齢
FROM 社員
WHERE 年齢 > (SELECT AVG(年齢) FROM 社員);

-- IN句でのサブクエリ（東京の部署に所属する社員）
SELECT 氏名 FROM 社員
WHERE 部署ID IN (SELECT 部署ID FROM 部署 WHERE 所在地 = '東京');
</pre>

<h3>NULLの扱い</h3>
<p>SQLでNULLは「不明・未設定」を意味し、通常の比較演算子では検索できません。</p>
<pre>
-- NG: WHERE 電話番号 = NULL  （常に偽になる）
-- OK: IS NULL / IS NOT NULL を使う
SELECT * FROM 社員 WHERE 電話番号 IS NULL;
SELECT * FROM 社員 WHERE 電話番号 IS NOT NULL;
</pre>

<h3>DDL（Data Definition Language）— テーブル定義</h3>
<p>テーブル自体を作成・変更・削除する命令です。</p>
<pre>
-- CREATE TABLE: テーブル作成
CREATE TABLE 社員 (
    社員ID   INT         PRIMARY KEY,
    氏名     VARCHAR(50) NOT NULL,
    年齢     INT,
    部署ID   INT         REFERENCES 部署(部署ID)  -- 外部キー
);

-- ALTER TABLE: 列を追加する
ALTER TABLE 社員 ADD 入社日 DATE;

-- DROP TABLE: テーブルを削除する（元に戻せない）
DROP TABLE 社員;
</pre>

<h3>VIEW（ビュー）— 仮想テーブル</h3>
<p>SELECTの結果に名前をつけて「仮想テーブル」として扱える仕組みです。実データは保存せず、参照時に毎回SQLが実行されます。</p>
<pre>
-- ビューの作成（東京在籍の社員のみ見せるビュー）
CREATE VIEW 東京社員 AS
    SELECT 社員ID, 氏名, 年齢
    FROM 社員
    WHERE 部署ID IN (SELECT 部署ID FROM 部署 WHERE 所在地 = '東京');

-- ビューはテーブルと同じように参照できる
SELECT * FROM 東京社員 WHERE 年齢 >= 30;
</pre>
<p>用途：複雑なSQLを隠蔽してシンプルに見せる・必要な列だけを公開してアクセス制御する。</p>

<h3>INDEX（インデックス）— 検索高速化</h3>
<p>特定の列に索引（目次）を作成して検索を高速化する仕組みです。主キーには自動的に作成されます。</p>
<pre>
-- インデックスの作成
CREATE INDEX idx_年齢 ON 社員(年齢);

-- インデックスがあると WHERE 年齢 = 30 の検索が高速化される
-- インデックスがなければ全行スキャン（O(n)）
-- インデックスがあれば B木探索（O(log n)）
</pre>
<p>注意：インデックスは検索を高速化しますが、INSERT/UPDATE/DELETE時にインデックスも更新されるため書き込みは遅くなります。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
WHERE=グループ化前の条件、HAVING=GROUP BY後の集計条件（違いは必出）。<br/>
INNER JOIN=一致した行のみ、LEFT JOIN=左テーブル全件（右がなければNULL）。<br/>
NULLの比較は = NULL ではなく IS NULL を使う。サブクエリ=SELECT内にSELECTを入れる。<br/>
DDL: CREATE=作成、ALTER=変更、DROP=削除。VIEW=仮想テーブル（実データは持たない）。INDEX=検索高速化（B木）。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
集計関数（AVG・COUNT等）はWHEREでは使えません。集計後の条件にはHAVINGを使います。
</div>
        `,
        diagram: 'database',
        questions: [
          {
            id: 23,
            question: '各行を一意に識別するためのフィールドを何というか。',
            choices: ['外部キー', '主キー', 'インデックス', 'ビュー'],
            answer: 1,
            explanation: '主キー（Primary Key）は各レコードを一意に識別するフィールドで、重複やNULLは許可されません。',
          },
          {
            id: 24,
            question: 'SQLでデータを取得するときに使う命令はどれか。',
            choices: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
            answer: 2,
            explanation: 'SELECTはテーブルからデータを取得するDML命令です。',
          },
          {
            id: 601,
            question: 'GROUP BY句と共に使用し、グループ化後の条件を指定するSQL句はどれか。',
            choices: ['WHERE', 'HAVING', 'ORDER BY', 'JOIN'],
            answer: 1,
            explanation: 'HAVINGはGROUP BYでグループ化した後の集計結果に条件を指定します。WHEREはグループ化前の行に条件を指定します。',
          },
          {
            id: 602,
            question: 'LEFT JOINの説明として正しいものはどれか。',
            choices: [
              '両テーブルで一致する行のみを返す',
              '左テーブルの全行と右テーブルで一致する行を返す',
              '右テーブルの全行と左テーブルで一致する行を返す',
              '両テーブルの全行を返す',
            ],
            answer: 1,
            explanation: 'LEFT JOINは左テーブルの全行を返し、右テーブルに一致する行がない場合はNULLを補完します。',
          },
          {
            id: 607,
            question: 'SQLでNULL値を持つ行を検索するとき正しい書き方はどれか。',
            choices: [
              'WHERE 電話番号 = NULL',
              'WHERE 電話番号 != NULL',
              'WHERE 電話番号 IS NULL',
              'WHERE 電話番号 == NULL',
            ],
            answer: 2,
            explanation: 'NULLは「不明な値」を意味するため = では比較できません。IS NULL または IS NOT NULL を使います。',
          },
          {
            id: 608,
            question: 'サブクエリの説明として正しいものはどれか。',
            choices: [
              'テーブルを結合するためのSQL構文',
              'SELECT文の中に別のSELECT文を入れ子にした構造',
              'グループ化した結果に条件を指定する句',
              '重複した行を除外して取得するオプション',
            ],
            answer: 1,
            explanation: 'サブクエリはSELECT文の中にさらにSELECT文を入れる構造です。WHERE句やFROM句などで使用でき、動的な条件指定に活用されます。',
          },
          {
            id: 1102,
            question: '次のSQLで取得される行数はどれか。\n\n社員テーブル（社員ID, 部署ID）: 5行\n部署テーブル（部署ID, 部署名）: 3行\n※全社員に部署が割り当てられている\n\nSELECT 社員ID, 部署名\nFROM 社員\nINNER JOIN 部署 ON 社員.部署ID = 部署.部署ID;',
            choices: ['3行（部署テーブルの行数）', '5行（社員テーブルの行数）', '8行（5+3の合計）', '15行（5×3の積）'],
            answer: 1,
            explanation: 'INNER JOINは両テーブルで結合条件が一致する行を返します。全社員に部署が割り当てられているため、社員テーブルの全5行が結果に含まれ、5行が返ります。',
          },
          {
            id: 1103,
            question: '次のSQLの説明として正しいものはどれか。\n\nSELECT 部署ID, COUNT(*) AS 人数\nFROM 社員\nGROUP BY 部署ID\nHAVING COUNT(*) >= 3;',
            choices: [
              '社員数が3人以上の部署IDと人数を取得する',
              '部署IDが3以上の部署の社員数を取得する',
              '社員テーブルの3行目を取得する',
              '全部署から上位3部署の人数を取得する',
            ],
            answer: 0,
            explanation: 'GROUP BY 部署ID で部署ごとにグループ化し、HAVING COUNT(*) >= 3 でそのグループの件数（人数）が3以上のものだけを絞り込みます。HAVING は集計後の条件指定に使います。',
          },
          {
            id: 1104,
            question: 'WHERE句とHAVING句の違いとして正しいものはどれか。',
            choices: [
              'WHERE句はGROUP BY後の集計結果に条件を指定し、HAVING句はGROUP BY前の行に条件を指定する',
              'WHERE句はGROUP BY前の個々の行に条件を指定し、HAVING句はGROUP BY後の集計結果に条件を指定する',
              'WHERE句とHAVING句はまったく同じ目的で使用できる',
              'HAVING句はSELECT句でしか使用できない',
            ],
            answer: 1,
            explanation: 'WHERE句はGROUP BYの前に行を絞り込み（集計関数は使えない）、HAVING句はGROUP BYで集計した後の結果に条件を付けます（COUNT(*)などの集計関数が使える）。',
          },
        ],
      },
      {
        id: 'a6-2',
        title: 'データベース設計と正規化',
        content: `
<h3>ER図（Entity-Relationship Diagram）</h3>
<p>データベースの論理設計を視覚化する図です。エンティティ（実体）・属性・リレーションシップ（関係）で構成され、テーブル設計の前に作成します。</p>
<ul>
  <li><strong>1対1</strong>: 社員1人に対してパスポート1冊</li>
  <li><strong>1対多</strong>: 部署1つに対して社員複数人（最も多い）</li>
  <li><strong>多対多</strong>: 学生複数人が複数の授業を受講 → <strong>中間テーブル</strong>（受講テーブル）が必要</li>
</ul>

<h3>正規化とは</h3>
<p>データの<strong>冗長性を排除</strong>して整合性を保つための設計手法です。正規化しないと「更新異常」（データを1か所変えると他の行とずれる）が発生します。</p>

<h3>正規化の手順（具体例）</h3>
<p>例: 「注文」テーブルを設計する</p>

<p><strong>非正規形（問題あり）</strong></p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.85em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:5px 8px;border:1px solid var(--color-border)">注文ID</th><th style="padding:5px 8px;border:1px solid var(--color-border)">顧客名</th><th style="padding:5px 8px;border:1px solid var(--color-border)">商品（複数）</th><th style="padding:5px 8px;border:1px solid var(--color-border)">担当者</th><th style="padding:5px 8px;border:1px solid var(--color-border)">担当部署</th></tr>
  <tr><td style="padding:4px 8px;border:1px solid var(--color-border)">1001</td><td style="padding:4px 8px;border:1px solid var(--color-border)">田中</td><td style="padding:4px 8px;border:1px solid var(--color-border)">商品A, 商品B</td><td style="padding:4px 8px;border:1px solid var(--color-border)">山田</td><td style="padding:4px 8px;border:1px solid var(--color-border)">営業部</td></tr>
</table>

<p><strong>第1正規形（1NF）</strong>: 1セルに値を1つだけ（繰り返しグループを行に分解）</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.85em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:5px 8px;border:1px solid var(--color-border)">注文ID</th><th style="padding:5px 8px;border:1px solid var(--color-border)">商品ID</th><th style="padding:5px 8px;border:1px solid var(--color-border)">顧客名</th><th style="padding:5px 8px;border:1px solid var(--color-border)">担当者</th><th style="padding:5px 8px;border:1px solid var(--color-border)">担当部署</th></tr>
  <tr><td style="padding:4px 8px;border:1px solid var(--color-border)">1001</td><td style="padding:4px 8px;border:1px solid var(--color-border)">A</td><td style="padding:4px 8px;border:1px solid var(--color-border)">田中</td><td style="padding:4px 8px;border:1px solid var(--color-border)">山田</td><td style="padding:4px 8px;border:1px solid var(--color-border)">営業部</td></tr>
  <tr><td style="padding:4px 8px;border:1px solid var(--color-border)">1001</td><td style="padding:4px 8px;border:1px solid var(--color-border)">B</td><td style="padding:4px 8px;border:1px solid var(--color-border)">田中</td><td style="padding:4px 8px;border:1px solid var(--color-border)">山田</td><td style="padding:4px 8px;border:1px solid var(--color-border)">営業部</td></tr>
</table>
<p>主キー=（注文ID, 商品ID）の複合キー。ただし「顧客名」は注文IDだけで決まる（<strong>部分関数従属</strong>＝問題）。</p>

<p><strong>第2正規形（2NF）</strong>: 部分関数従属を排除 → 注文IDだけで決まる列を別テーブルに分離</p>
<ul>
  <li>注文明細テーブル (注文ID, 商品ID) ← 主キー全体に従属する列のみ</li>
  <li>注文テーブル (注文ID, 顧客名, 担当者, 担当部署) ← 注文IDだけで決まる列</li>
</ul>
<p>しかし「担当者→担当部署」という依存（<strong>推移関数従属</strong>）がまだ残っている。</p>

<p><strong>第3正規形（3NF）</strong>: 推移関数従属を排除 → 非キー属性間の依存を分離</p>
<ul>
  <li>注文テーブル (注文ID, 顧客名, 担当者ID)</li>
  <li>担当者テーブル (担当者ID, 担当者名, 担当部署) ← 担当者に関する情報を独立させる</li>
</ul>

<h3>正規化のまとめ</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">正規形</th><th style="padding:6px 8px;border:1px solid var(--color-border)">排除するもの</th><th style="padding:6px 8px;border:1px solid var(--color-border)">キーワード</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>1NF</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">繰り返しグループ</td><td style="padding:5px 8px;border:1px solid var(--color-border)">1セル1値・原子値</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>2NF</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">部分関数従属</td><td style="padding:5px 8px;border:1px solid var(--color-border)">主キーの一部だけで決まる列を分離</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>3NF</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">推移関数従属</td><td style="padding:5px 8px;border:1px solid var(--color-border)">非キー属性が別の非キー属性に依存する関係を分離</td></tr>
</table>

<h3>インデックス</h3>
<p>検索を高速化するための補助データ構造（B木構造）です。本の索引と同じ仕組みで、特定の列に作成します。</p>
<ul>
  <li><strong>メリット</strong>: SELECT・JOINが高速になる</li>
  <li><strong>デメリット</strong>: INSERT・UPDATE・DELETEが遅くなる（インデックスも更新が必要）。ストレージ消費が増える。</li>
  <li><strong>適切な列</strong>: WHERE句・JOINの結合条件によく使う列、カーディナリティ（値の種類）が多い列</li>
</ul>

<h3>ビュー</h3>
<p>SELECT文の結果を<strong>仮想テーブル</strong>として保存したものです。複雑なクエリの再利用・アクセス制御に使います。実データを持たないため、元テーブルの変更は即座にビューに反映されます。</p>
<pre>
CREATE VIEW 東京社員 AS
SELECT 氏名, 年齢 FROM 社員
WHERE 勤務地 = '東京';

-- テーブルと同じように使える
SELECT * FROM 東京社員 WHERE 年齢 >= 30;
</pre>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
正規化の目的=冗長性の排除・更新異常の防止（検索速度向上が目的ではない）。<br/>
2NF=部分関数従属排除（複合キーの一部だけで決まる列を分離）、3NF=推移関数従属排除（非キー属性間の依存を分離）。<br/>
インデックス=検索は速くなるが更新（INSERT/UPDATE/DELETE）は遅くなる。ビュー=実データなしの仮想テーブル。
</div>
        `,
        diagram: 'er-diagram',
        questions: [
          {
            id: 603,
            question: 'データベースの正規化の目的として最も適切なものはどれか。',
            choices: [
              '検索速度を向上させる',
              'データの冗長性を排除して整合性を保つ',
              'インデックスを自動的に作成する',
              'バックアップを効率化する',
            ],
            answer: 1,
            explanation: '正規化はデータの重複（冗長性）を排除し、更新時の不整合を防ぐための設計手法です。',
          },
          {
            id: 604,
            question: '第2正規形の説明として正しいものはどれか。',
            choices: [
              '繰り返しグループを排除した状態',
              '第1正規形 + 部分関数従属を排除した状態',
              '第2正規形 + 推移関数従属を排除した状態',
              'すべての属性が主キーに直接従属した状態',
            ],
            answer: 1,
            explanation: '第2正規形は第1正規形を満たした上で、部分関数従属（主キーの一部への従属）を排除した状態です。',
          },
          {
            id: 609,
            question: 'データベースのインデックスに関する説明として正しいものはどれか。',
            choices: [
              'インデックスを作成すると、INSERT・UPDATE・DELETEが高速になる',
              'インデックスを作成すると、SELECT・JOINは高速になるが更新処理は遅くなる',
              'インデックスはすべての列に作成するとパフォーマンスが最大化する',
              'インデックスはビューと同じ役割を持つ',
            ],
            answer: 1,
            explanation: 'インデックスは検索・JOIN を高速化しますが、データ変更（INSERT・UPDATE・DELETE）時にインデックスも更新する必要があるため更新処理は遅くなります。また余分なストレージも消費します。',
          },
          {
            id: 610,
            question: '第1正規形（1NF）を満たすための条件として正しいものはどれか。',
            choices: [
              '推移関数従属をすべて排除する',
              '主キーの一部への従属を排除する',
              '各セルに1つの値のみを持ち、繰り返しグループを排除する',
              'テーブルを複数のテーブルに分割する',
            ],
            answer: 2,
            explanation: '第1正規形は各属性（セル）が原子値（分割不可能な単一の値）を持ち、1行に複数の電話番号を持つような繰り返しグループがない状態です。',
          },
          {
            id: 1105,
            question: '次のテーブルが第2正規形（2NF）に違反している理由はどれか。\n\n受注明細（受注ID, 商品ID, 商品名, 単価, 数量）\n主キー: （受注ID, 商品ID）',
            choices: [
              '各セルに複数の値が含まれているため',
              '商品名・単価が主キーの一部（商品ID）だけに依存する部分関数従属があるため',
              '受注IDから単価への推移関数従属があるため',
              '外部キーが設定されていないため',
            ],
            answer: 1,
            explanation: '第2正規形は「主キーの一部への従属（部分関数従属）」を排除した状態です。商品名と単価は受注IDに関係なく商品IDだけで決まるため、部分関数従属が発生しています。解消するには商品テーブル（商品ID, 商品名, 単価）を分離します。',
          },
          {
            id: 1106,
            question: '第3正規形（3NF）の説明として正しいものはどれか。',
            choices: [
              '繰り返しグループを排除し、各セルが原子値を持つ状態',
              '主キーへの部分関数従属をすべて排除した状態',
              '非キー属性が別の非キー属性を経由して主キーに依存する推移関数従属を排除した状態',
              'テーブルをできる限り少ない数に統合した状態',
            ],
            answer: 2,
            explanation: '第3正規形は「推移関数従属」を排除した状態です。例えば社員テーブルで「社員ID→部署ID→部署名」という依存がある場合、部署名が社員IDに直接ではなく部署IDを経由して依存します。これを分離して3NFにします。',
          },
        ],
      },
      {
        id: 'a6-3',
        title: 'トランザクションと同時実行制御',
        content: `
<h3>トランザクション</h3>
<p>一連のデータ操作を<strong>一つの処理単位</strong>として扱う仕組みです。BEGIN〜COMMITで確定、ROLLBACKで取り消します。</p>

<h3>ACID特性</h3>
<ul>
  <li><strong>原子性（Atomicity）</strong>: 全て成功か全て失敗か（一部だけ完了はない）</li>
  <li><strong>一貫性（Consistency）</strong>: 処理前後でDBの整合性ルールが保たれる</li>
  <li><strong>独立性（Isolation）</strong>: 複数トランザクションが互いに干渉しない</li>
  <li><strong>耐久性（Durability）</strong>: コミット済みの変更は障害後も保持される</li>
</ul>

<h3>同時実行時の問題</h3>
<ul>
  <li><strong>ダーティリード</strong>: 未コミットのデータを別トランザクションが読む</li>
  <li><strong>ノンリピータブルリード</strong>: 同じ行を2回読むと異なる値になる</li>
  <li><strong>ファントムリード</strong>: 同じ条件で検索すると行数が変わる</li>
</ul>

<h3>ロック（排他制御）</h3>
<p>複数のトランザクションが同時に同じデータを操作するときの整合性を守る仕組みです。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 10px;border:1px solid var(--color-border)">ロック種類</th><th style="padding:6px 10px;border:1px solid var(--color-border)">用途</th><th style="padding:6px 10px;border:1px solid var(--color-border)">他の共有ロックと共存</th><th style="padding:6px 10px;border:1px solid var(--color-border)">他の排他ロックと共存</th></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>共有ロック（Sロック）</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">読み取り</td><td style="padding:5px 10px;border:1px solid var(--color-border)">○ 可能</td><td style="padding:5px 10px;border:1px solid var(--color-border)">× 不可</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>排他ロック（Xロック）</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">書き込み</td><td style="padding:5px 10px;border:1px solid var(--color-border)">× 不可</td><td style="padding:5px 10px;border:1px solid var(--color-border)">× 不可</td></tr>
</table>
<p><strong>デッドロック</strong>: 互いに相手のロック解放を待ち合って永久に停止する状態。対策: ロックの取得順序を統一する、タイムアウトで強制解除する。</p>

<h3>トランザクション分離レベル</h3>
<p>同時実行時の問題（ダーティリード・ノンリピータブルリード・ファントムリード）をどこまで防ぐかの設定です。</p>
<ul>
  <li><strong>READ UNCOMMITTED</strong>: 最も低い分離。ダーティリードが発生する可能性あり。</li>
  <li><strong>READ COMMITTED</strong>: コミット済みデータのみ読む。多くのDBのデフォルト。</li>
  <li><strong>REPEATABLE READ</strong>: 同じ行を2回読んでも同じ値が保証される。</li>
  <li><strong>SERIALIZABLE</strong>: 最も高い分離。完全に直列実行と同等。性能は最低。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
ACID: 原子性=全成功か全失敗、一貫性=整合性保持、独立性=干渉なし、耐久性=コミット後は永続。<br/>
共有ロック=読み取り用・共存可、排他ロック=書き込み用・共存不可。<br/>
ダーティリード=未コミットデータを読む現象（READ COMMITTEDで防止可能）。
</div>
        `,
        diagram: 'transaction',
        questions: [
          {
            id: 25,
            question: 'トランザクションのACID特性のうち「原子性」の説明として正しいものはどれか。',
            choices: [
              'トランザクションが完全に実行されるか、全く実行されないかのどちらかである',
              'トランザクションが並行実行されても互いに干渉しない',
              'コミット後のデータは障害が発生しても失われない',
              'トランザクション前後でデータの整合性が保たれる',
            ],
            answer: 0,
            explanation: '原子性（Atomicity）とは、トランザクションが全て成功（コミット）するか全て失敗（ロールバック）するかの二択であることです。',
          },
          {
            id: 605,
            question: '排他ロック（Xロック）の説明として正しいものはどれか。',
            choices: [
              '複数のトランザクションが同時に取得できる読み取り専用ロック',
              '書き込み用のロックで他のロックと共存できない',
              'デッドロックを自動的に解消するロック',
              'テーブル全体をロックする方式',
            ],
            answer: 1,
            explanation: '排他ロック（Xロック）は書き込み操作のために取得され、他のすべてのロック（共有・排他）と共存できません。',
          },
          {
            id: 611,
            question: 'ACID特性のうち「独立性（Isolation）」の説明として正しいものはどれか。',
            choices: [
              'コミット後のデータは障害があっても消えない',
              'トランザクション前後でデータの整合性が保たれる',
              '複数のトランザクションが並行実行されても互いに干渉しない',
              'トランザクションは全て成功か全て失敗かのどちらかである',
            ],
            answer: 2,
            explanation: '独立性（Isolation）は複数のトランザクションが同時実行されても、互いに影響を与えないことを保証します。分離レベルで干渉の度合いを調整できます。',
          },
          {
            id: 612,
            question: 'ダーティリードの説明として正しいものはどれか。',
            choices: [
              '同じ行を2回読むと異なる値になる現象',
              '未コミットのデータを別のトランザクションが読み取ってしまう現象',
              '同じ条件で検索すると行数が変わる現象',
              'ロックの取得順序が逆になりデッドロックが発生する現象',
            ],
            answer: 1,
            explanation: 'ダーティリードはトランザクションAがコミットしていない変更をトランザクションBが読み取る現象です。Aがロールバックするとそのデータは無効になり、Bは誤ったデータを処理したことになります。',
          },
          {
            id: 1107,
            question: 'デッドロックの説明として正しいものはどれか。',
            choices: [
              '1つのトランザクションが同じレコードを2回更新すること',
              '2つのトランザクションが互いに相手のロックしているリソースを待ち合い、両方とも先に進めなくなること',
              'トランザクションがタイムアウトにより強制終了されること',
              'ロールバックにより全変更が取り消されること',
            ],
            answer: 1,
            explanation: 'デッドロックはT1がリソースAをロックしてBを待ち、T2がリソースBをロックしてAを待つという循環待ちが起きた状態です。どちらも解放できず永遠に待ち続けます。DBMSは検出後どちらかのトランザクションを強制ロールバックして解消します。',
          },
          {
            id: 1108,
            question: 'トランザクションの分離レベル「READ COMMITTED」の特徴として正しいものはどれか。',
            choices: [
              'コミットされていない変更（未確定データ）も読み取れる',
              'コミット済みデータのみ読み取れるが、同一トランザクション内で同じ行を2回読むと結果が変わる可能性がある',
              '同一トランザクション内の繰り返し読み取りで常に同じ結果が保証される',
              '全トランザクションを直列実行したのと等価な結果が保証される',
            ],
            answer: 1,
            explanation: 'READ COMMITTEDはダーティリードを防ぎますが、他のトランザクションがコミットすると同じ行の2回目の読み取り結果が変わる「反復不能読み取り（Non-repeatable Read）」が発生する可能性があります。REPEATABLE READやSERIALIZABLEはこれも防ぎます。',
          },
        ],
      },
      {
        id: 'a6-4',
        title: 'NoSQLとデータベース選択',
        content: `
<h3>NoSQLとは</h3>
<p>リレーショナルデータベース以外のデータベース総称です。大量データの分散処理・柔軟なスキーマが特徴です。</p>

<h3>NoSQLの種類</h3>
<ul>
  <li><strong>キーバリュー型</strong>: キーと値のペアで管理。超高速。Redis・DynamoDB。セッション管理・キャッシュに使用。</li>
  <li><strong>ドキュメント型</strong>: JSON/XMLなどの文書形式で管理。スキーマ柔軟。MongoDB・Firestore。Webアプリに使用。</li>
  <li><strong>カラム型</strong>: 列単位でデータを格納。分析系クエリが高速。Cassandra・HBase。ビッグデータ処理に使用。</li>
  <li><strong>グラフ型</strong>: ノードとエッジでデータを表現。関係性の探索が得意。Neo4j。SNSのフォロー関係など。</li>
</ul>

<h3>RDB vs NoSQL の使い分け</h3>
<ul>
  <li><strong>RDB向き</strong>: 複雑な結合クエリ、トランザクション重視、整合性が最重要</li>
  <li><strong>NoSQL向き</strong>: 大量データの高速読み書き、スキーマ変更が頻繁、スケールアウトが必要</li>
</ul>

<h3>CAP定理</h3>
<p>分散システムは以下の3つの性質を同時にすべて満たすことはできません（トレードオフ）。</p>
<ul>
  <li><strong>一貫性（Consistency）</strong>: 全ノードが同じ（最新の）データを返す</li>
  <li><strong>可用性（Availability）</strong>: 常にレスポンスを返せる（エラーにならない）</li>
  <li><strong>分断耐性（Partition tolerance）</strong>: ネットワーク分断が起きても動作する</li>
</ul>
<p>例: ネットワーク分断が起きたとき「一貫性を保つ」か「可用性を保つ」かどちらかを選ぶ必要がある。</p>

<h3>BASE特性（NoSQLの考え方）</h3>
<p>RDBのACIDに対し、NoSQLはBASEを採用することが多いです。</p>
<ul>
  <li><strong>BA（Basically Available）</strong>: 基本的に常に利用可能</li>
  <li><strong>S（Soft state）</strong>: 状態は時間とともに変化しうる（常に最新とは限らない）</li>
  <li><strong>E（Eventually consistent）</strong>: 最終的には一貫した状態になる（結果整合性）</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
NoSQL4種類: キーバリュー型（Redis・高速・キャッシュ向け）、ドキュメント型（MongoDB・JSON形式）、カラム型（Cassandra・大量データ分析）、グラフ型（Neo4j・関係性探索）。<br/>
CAP定理: 一貫性・可用性・分断耐性の3つを同時に満たすことは不可能。
</div>
        `,
        diagram: 'nosql',
        questions: [
          {
            id: 606,
            question: 'セッション管理やキャッシュに適したNoSQLのデータモデルはどれか。',
            choices: ['ドキュメント型', 'グラフ型', 'キーバリュー型', 'カラム型'],
            answer: 2,
            explanation: 'キーバリュー型はキーと値のシンプルな構造で超高速なアクセスが可能なため、セッション管理やキャッシュに適しています。',
          },
          {
            id: 613,
            question: 'CAP定理の説明として正しいものはどれか。',
            choices: [
              '分散システムは一貫性・可用性・分断耐性の3つをすべて同時に満たせる',
              '分散システムは一貫性・可用性・分断耐性の3つを同時にすべて満たすことはできない',
              'NoSQLはRDBより必ず高速である',
              'ACID特性を満たすデータベースはスケールアウトできない',
            ],
            answer: 1,
            explanation: 'CAP定理は分散システムの3特性（一貫性・可用性・分断耐性）を同時にすべて満たすことは不可能であり、最大2つしか選べないことを示した定理です。',
          },
          {
            id: 614,
            question: 'MongoDBに代表される、JSONのような文書形式でデータを管理するNoSQLのデータモデルはどれか。',
            choices: ['キーバリュー型', 'ドキュメント型', 'カラム型', 'グラフ型'],
            answer: 1,
            explanation: 'ドキュメント型はJSON/BSONなどの文書形式でデータを管理します。MongoDBやFirestoreが代表例で、スキーマが柔軟なためWebアプリのデータ管理に広く使われます。',
          },
          {
            id: 615,
            question: 'RDBよりNoSQLが適しているユースケースはどれか。',
            choices: [
              '複雑なSQL結合クエリが必要な場合',
              'ACIDトランザクションが最重要の場合',
              '大量データを高速に読み書きし、スキーマ変更が頻繁な場合',
              '外部キー制約で整合性を厳密に管理する場合',
            ],
            answer: 2,
            explanation: 'NoSQLは大量データの高速読み書き・水平スケール・スキーマ柔軟性に優れます。複雑なJOINやトランザクションが必要な場合はRDBが適しています。',
          },
        ],
      },
    ],
  },
  {
    id: 'a7',
    title: 'システム開発',
    subject: 'A',
    description: '開発モデル・設計技法・テスト・品質・DevOpsまでシステム開発を体系的に学びます。',
    sections: [
      {
        id: 'a7-1',
        title: 'ソフトウェア開発モデル',
        content: `
<h3>ソフトウェア開発の難しさ</h3>
<p>ソフトウェア開発は他の製造業と違い、要件が曖昧なまま始まり、途中で仕様が変わり、完成後に「思ってたのと違う」ということが多発します。これらの問題に対処するために様々な<strong>開発モデル</strong>が生まれました。</p>

<h3>ウォーターフォールモデル</h3>
<p>川が流れるように「要件定義→設計→実装→テスト→運用」を<strong>一方向に</strong>進める古典的な手法です。</p>
<p><strong>メリット</strong>: 計画・見積もりが立てやすい。文書化が充実。大規模・品質重視のプロジェクト（官公庁・航空・医療）に向く。</p>
<p><strong>デメリット</strong>: 要件変更への対応が難しい。完成まで動くものが見えない。最終テストで大量の不具合が出ることも。</p>
<p>現代では「要件が最初から完全に決まっている」という前提が崩れているため、アジャイルへのシフトが進んでいます。</p>

<h3>スパイラルモデル</h3>
<p>「設計→プロトタイプ作成→評価→リスク分析」を<strong>螺旋状に繰り返す</strong>モデルです。各サイクルでリスクを明確にしながら徐々に機能を拡張します。大規模・リスクの高いプロジェクトに向いています。</p>

<h3>アジャイル開発</h3>
<p>「動くソフトウェアを早く届け、変化に対応する」という価値観に基づいた開発手法の総称です。2001年に「アジャイルソフトウェア開発宣言」として発表されました。</p>

<p><strong>スクラム（Scrum）</strong></p>
<p>最も普及しているアジャイルフレームワークです。</p>
<ul>
  <li><strong>スプリント</strong>: 1〜4週間の開発サイクル。各スプリントで計画→開発→レビュー→振り返りを行う。</li>
  <li><strong>プロダクトバックログ</strong>: 機能要件の優先度付きリスト。</li>
  <li><strong>スクラムチーム</strong>: プロダクトオーナー・スクラムマスター・開発チームの3役割。</li>
  <li><strong>デイリースクラム</strong>: 毎日15分の進捗共有ミーティング。</li>
</ul>

<p><strong>XP（エクストリームプログラミング）</strong></p>
<p>技術的なプラクティスを重視。テスト駆動開発（TDD）・ペアプログラミング・継続的インテグレーションが特徴。</p>

<h3>プロトタイプモデル</h3>
<p>開発初期に<strong>試作品（プロトタイプ）</strong>を作り、ユーザーに評価してもらいながら要件を確定していく手法です。</p>
<ul>
  <li>要件が不明確なプロジェクトで有効</li>
  <li>ユーザーの「思ってたのと違う」を早期に発見できる</li>
  <li>デメリット：プロトタイプを本番コードと誤解されるリスクがある</li>
</ul>

<h3>開発モデルの比較</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">モデル</th><th style="padding:6px 8px;border:1px solid var(--color-border)">特徴</th><th style="padding:6px 8px;border:1px solid var(--color-border)">向いているプロジェクト</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>ウォーターフォール</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">一方向・順次進行</td><td style="padding:5px 8px;border:1px solid var(--color-border)">要件固定・大規模・品質重視</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>プロトタイプ</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">試作→評価を繰り返す</td><td style="padding:5px 8px;border:1px solid var(--color-border)">要件不明確・UI重視</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>スパイラル</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">リスク分析しながら反復</td><td style="padding:5px 8px;border:1px solid var(--color-border)">大規模・リスクの高いシステム</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>アジャイル（スクラム）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">短サイクルで反復・変化対応</td><td style="padding:5px 8px;border:1px solid var(--color-border)">要件変化が多い・Webサービス</td></tr>
</table>

<h3>DevOps</h3>
<p>開発（Dev）と運用（Ops）のサイロを壊し、<strong>継続的にソフトウェアをリリース</strong>する文化と技術の組み合わせです。</p>
<ul>
  <li><strong>CI（継続的インテグレーション）</strong>: コードをマージするたびに自動でビルド・テストを実行。不具合を早期発見。</li>
  <li><strong>CD（継続的デリバリー）</strong>: CIを通過したコードをステージング環境へ自動デプロイ。</li>
  <li><strong>CD（継続的デプロイ）</strong>: 本番環境への自動デプロイまで行う（人間の承認なし）。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
ウォーターフォール=一方向・計画重視、アジャイル=反復・変化対応、スクラムのスプリント=1〜4週間の短い開発サイクルという対比を押さえましょう。プロトタイプ=試作品で要件確認。スパイラル=リスク分析しながら反復。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「アジャイルはテストを軽視する」は誤りです。アジャイルでは各スプリントでテストを繰り返すため、むしろテストの頻度は高いです。
</div>
        `,
        diagram: 'waterfall',
        questions: [
          {
            id: 26,
            question: 'ウォーターフォールモデルの特徴として正しいものはどれか。',
            choices: [
              '短い開発サイクルを繰り返しながら開発する',
              '各工程を順番に一方向で進める',
              '要件変更に柔軟に対応できる',
              'テストを最初に書いてから実装する',
            ],
            answer: 1,
            explanation: 'ウォーターフォールモデルは要件定義→設計→実装→テストを順番に進め、原則として前の工程に戻りません。',
          },
          {
            id: 701,
            question: 'スクラムのスプリントとはどれか。',
            choices: [
              'プロジェクト全体のスケジュール',
              '短い開発サイクルの繰り返し単位',
              'テスト自動化のツール',
              'チームメンバーの作業分担表',
            ],
            answer: 1,
            explanation: 'スクラムのスプリントは1〜4週間の短い開発サイクルで、この単位で計画・実装・レビューを繰り返します。',
          },
          {
            id: 704,
            question: 'プロトタイプモデルを採用する主な目的として正しいものはどれか。',
            choices: [
              '開発コストを最小化するため',
              '要件が不明確なときに試作品でユーザーの要件を確定するため',
              'リスクを最小化しながら段階的に開発するため',
              '短サイクルで反復して要件変更に対応するため',
            ],
            answer: 1,
            explanation: 'プロトタイプモデルは要件が曖昧な場合に試作品（プロトタイプ）を作り、ユーザーに確認してもらいながら要件を固めていく開発手法です。',
          },
          {
            id: 705,
            question: 'XP（エクストリームプログラミング）の特徴的なプラクティスとして正しいものはどれか。',
            choices: [
              'スプリントレビューで顧客にデモを行う',
              'テスト駆動開発（TDD）・ペアプログラミング・継続的インテグレーション',
              'リスク分析を中心に置いた反復開発',
              'WBSによる作業分解と進捗管理',
            ],
            answer: 1,
            explanation: 'XP（エクストリームプログラミング）は技術的プラクティスを重視し、テスト駆動開発（TDD）・ペアプログラミング・継続的インテグレーションなどが特徴的な実践手法です。',
          },
        ],
      },
      {
        id: 'a7-2',
        title: 'システム設計技法',
        content: `
<h3>要件定義</h3>
<p>システムが「何をすべきか」を明確にする工程です。あいまいな要件が後工程のバグや手戻りの原因になるため、最も重要な工程の一つです。</p>
<ul>
  <li><strong>機能要件</strong>: システムが行うべき機能（何ができるか）<br/>
    例: 「ユーザーはメールアドレスとパスワードでログインできる」「注文履歴を一覧で確認できる」</li>
  <li><strong>非機能要件</strong>: 品質・制約に関する要件（どのくらいの性能・信頼性で動くか）<br/>
    例: 「応答時間は2秒以内」「稼働率99.9%以上」「1000人同時アクセスに耐えられる」「個人情報は暗号化して保存」</li>
</ul>

<h3>UML（統一モデリング言語）の主要図</h3>
<p>システムの設計を視覚化するための標準的な図法です。目的によって使い分けます。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">図の種類</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">何を表すか</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">使いどころ</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>ユースケース図</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">ユーザー（アクター）とシステムの対話</td><td style="padding:5px 8px;border:1px solid var(--color-border)">要件定義。「誰が何をできるか」を俯瞰する</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>クラス図</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">クラスの属性・メソッド・クラス間の関係</td><td style="padding:5px 8px;border:1px solid var(--color-border)">設計。静的な構造を表す</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>シーケンス図</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">オブジェクト間のメッセージのやり取りを時系列で</td><td style="padding:5px 8px;border:1px solid var(--color-border)">詳細設計。ログイン・API呼び出しの流れを追う</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>アクティビティ図</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">処理の流れ・分岐・並行処理</td><td style="padding:5px 8px;border:1px solid var(--color-border)">業務フロー・アルゴリズムの可視化</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>状態遷移図</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">オブジェクトの状態変化とトリガー</td><td style="padding:5px 8px;border:1px solid var(--color-border)">注文状態・認証状態など状態を持つシステム</td></tr>
</table>

<h3>シーケンス図の例（ログイン処理）</h3>
<pre>
ユーザー      Webブラウザ      Webサーバ      DB
  │               │               │            │
  │─ ログイン入力→│               │            │
  │               │─ POST /login→│            │
  │               │               │─ SELECT→  │
  │               │               │  ←結果─── │
  │               │←─ 200 OK ────│            │
  │←─ ログイン成功│               │            │
</pre>
<p>縦軸が時間の流れで、左から右へメッセージが渡ります。誰がどの順番で何をするかが一目でわかります。</p>

<h3>状態遷移図の例（注文状態）</h3>
<pre>
[注文確定] ──支払い完了──→ [支払済] ──発送──→ [発送済] ──到着──→ [完了]
    │                          │
    └──────キャンセル──────→ [キャンセル済]
</pre>
<p>「注文確定」「支払済」「発送済」「完了」「キャンセル済」が状態で、矢印がトリガー（イベント）です。</p>

<h3>DFD（データフロー図）</h3>
<p>データがシステム内をどのように流れるかを表す図です。UMLとは別の表記法で、特に構造化分析で使われます。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">要素</th><th style="padding:6px 8px;border:1px solid var(--color-border)">記号</th><th style="padding:6px 8px;border:1px solid var(--color-border)">意味</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>外部エンティティ</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">四角</td><td style="padding:5px 8px;border:1px solid var(--color-border)">システム外部の人・組織（顧客・他システム）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>プロセス</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">円・角丸</td><td style="padding:5px 8px;border:1px solid var(--color-border)">データを変換・処理する機能</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>データストア</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">二重線</td><td style="padding:5px 8px;border:1px solid var(--color-border)">データの保存場所（DB・ファイル）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>データフロー</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">矢印</td><td style="padding:5px 8px;border:1px solid var(--color-border)">データの流れ・方向</td></tr>
</table>

<h3>モジュール設計の原則</h3>
<ul>
  <li><strong>高凝集（高凝集度）</strong>: 1モジュールは1責務に集中する。「関連するものはまとめる」。修正箇所が局所化されて保守しやすい。</li>
  <li><strong>低結合（疎結合）</strong>: モジュール間の依存を最小にする。「変更が他に波及しない」。一方を変えても他方を変えなくて済む。</li>
</ul>
<p>アンチパターン: 「低凝集・高結合」→ 1つの変更が多くのモジュールに影響し、テスト・修正が困難になる。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
UML: ユースケース図=アクターとシステムの対話（要件定義）、クラス図=静的構造、シーケンス図=時系列メッセージ、アクティビティ図=処理フロー、状態遷移図=状態変化。<br/>
DFD=外部エンティティ・プロセス・データストア・データフローの4要素（UMLとは別）。<br/>
高凝集・低結合=良い設計の原則。凝集度↑・結合度↓が保守性向上につながる。
</div>
        `,
        diagram: 'uml',
        questions: [
          {
            id: 702,
            question: 'ユーザーとシステムの対話を表現するUML図はどれか。',
            choices: ['クラス図', 'シーケンス図', 'ユースケース図', 'アクティビティ図'],
            answer: 2,
            explanation: 'ユースケース図はアクター（ユーザーや外部システム）とシステムの機能的な対話を俯瞰的に表現します。',
          },
          {
            id: 706,
            question: 'DFD（データフロー図）の構成要素として正しい組み合わせはどれか。',
            choices: [
              'クラス・属性・メソッド・継承',
              'アクター・ユースケース・システム境界',
              'プロセス・データフロー・データストア・外部エンティティ',
              'ノード・エッジ・ガード条件・アクション',
            ],
            answer: 2,
            explanation: 'DFDはプロセス（処理）・データフロー（データの流れ）・データストア（データの保管場所）・外部エンティティ（外部のシステムや人）の4要素でシステム内のデータの流れを表現します。',
          },
          {
            id: 707,
            question: 'モジュール設計における「低結合度」の説明として正しいものはどれか。',
            choices: [
              '1つのモジュールが1つの責務に集中している状態',
              'モジュール間の依存関係が少なく変更の影響が局所化された状態',
              'モジュールが互いに密接に連携し協調動作する状態',
              'モジュールのコード行数が少ない状態',
            ],
            answer: 1,
            explanation: '低結合度（疎結合）はモジュール間の依存を最小化した状態で、あるモジュールの変更が他に波及しにくく、保守性・テストしやすさが向上します。高凝集（1責務集中）とセットで理解しましょう。',
          },
        ],
      },
      {
        id: 'a7-3',
        title: 'テスト技法',
        content: `
<h3>テストレベル（V字モデル）</h3>
<ul>
  <li><strong>単体テスト</strong>: 個々の関数・クラス・モジュールを単独でテスト。開発者が実施。</li>
  <li><strong>結合テスト</strong>: 複数モジュールを組み合わせてインタフェースをテスト。</li>
  <li><strong>システムテスト</strong>: システム全体が要件を満たすかテスト。QAチームが実施。</li>
  <li><strong>受入テスト（UAT）</strong>: ユーザーが実際に操作して確認するテスト。</li>
</ul>

<h3>ブラックボックステスト技法</h3>
<p>内部構造を見ずに入出力で確認するテストです。</p>
<ul>
  <li><strong>同値分割</strong>: 入力を有効/無効なグループに分け、各グループの代表値1つでテスト</li>
  <li><strong>境界値分析</strong>: 境界（最大値・最小値・境界±1）を重点的にテスト。バグが多い箇所。</li>
  <li><strong>デシジョンテーブルテスト</strong>: 条件の組み合わせを表で整理してテスト</li>
</ul>

<h3>ホワイトボックステスト技法</h3>
<p>ソースコードの内部構造を確認しながら行うテストです。</p>
<ul>
  <li><strong>命令網羅（C0）</strong>: 全ての命令を最低1回実行</li>
  <li><strong>分岐網羅（C1）</strong>: 全ての分岐（真・偽）を最低1回実行</li>
  <li><strong>条件網羅（C2）</strong>: 全ての条件の真偽組み合わせを実行</li>
</ul>

<h3>V字モデル（テストレベルと開発工程の対応）</h3>
<p>開発工程とテストレベルを対応させたモデルです。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">開発工程</th><th style="padding:6px 8px;border:1px solid var(--color-border)">対応するテスト</th><th style="padding:6px 8px;border:1px solid var(--color-border)">確認内容</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">要件定義</td><td style="padding:5px 8px;border:1px solid var(--color-border)">受入テスト（UAT）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ユーザーが業務要件を満たすか確認</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">基本設計</td><td style="padding:5px 8px;border:1px solid var(--color-border)">システムテスト</td><td style="padding:5px 8px;border:1px solid var(--color-border)">システム全体が設計通り動くか確認</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">詳細設計</td><td style="padding:5px 8px;border:1px solid var(--color-border)">結合テスト</td><td style="padding:5px 8px;border:1px solid var(--color-border)">モジュール間のインタフェースを確認</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">実装</td><td style="padding:5px 8px;border:1px solid var(--color-border)">単体テスト</td><td style="padding:5px 8px;border:1px solid var(--color-border)">個々のモジュールの動作を確認</td></tr>
</table>

<h3>その他のテスト種別</h3>
<ul>
  <li><strong>回帰テスト（リグレッションテスト）</strong>: 修正後に既存機能が壊れていないか確認</li>
  <li><strong>負荷テスト</strong>: 大量アクセス時の性能・応答時間を確認</li>
  <li><strong>ペネトレーションテスト</strong>: セキュリティ上の脆弱性を実際に攻撃して確認</li>
  <li><strong>α（アルファ）テスト</strong>: 開発者組織内でのユーザーテスト</li>
  <li><strong>β（ベータ）テスト</strong>: 一般ユーザーへの公開前試験運用</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
ブラックボックス=入出力のみ確認（仕様ベース）、ホワイトボックス=内部構造を確認（コードベース）。<br/>
カバレッジ: C0=命令網羅（全命令を実行）、C1=分岐網羅（全分岐の真偽を実行）、C1 &gt; C0の順に厳しくなる。<br/>
境界値分析: バグが多い境界の値とその±1をテスト。同値分割: 同じ結果になる入力グループから代表値1つを選ぶ。<br/>
回帰テスト=修正後に既存機能が壊れていないか確認（リグレッションテスト）。
</div>
        `,
        diagram: 'testing',
        questions: [
          {
            id: 27,
            question: 'プログラムの内部構造を考慮せず、入力と出力だけを確認するテスト手法はどれか。',
            choices: ['ホワイトボックステスト', 'ブラックボックステスト', '回帰テスト', '単体テスト'],
            answer: 1,
            explanation: 'ブラックボックステストは内部実装を意識せず、仕様通りの入出力かどうかを確認するテスト手法です。',
          },
          {
            id: 703,
            question: '境界値分析でテストすべき値として適切なものはどれか（入力範囲が1〜100の場合）。',
            choices: ['50のみ', '1, 100のみ', '0, 1, 100, 101', '1〜100の全て'],
            answer: 2,
            explanation: '境界値分析では境界の値（1, 100）と境界外の値（0, 101）をテストします。バグは境界付近に多く発生します。',
          },
          {
            id: 708,
            question: 'ホワイトボックステストにおける「分岐網羅（C1）」の説明として正しいものはどれか。',
            choices: [
              '全ての命令文を最低1回実行するテスト',
              '全ての分岐の真・偽の両方を最低1回実行するテスト',
              '全ての条件の真偽の組み合わせをすべて実行するテスト',
              '全てのパス（経路）を実行するテスト',
            ],
            answer: 1,
            explanation: '分岐網羅（C1）はif文などの分岐において、真になる場合と偽になる場合の両方を最低1回ずつ実行するテストです。命令網羅（C0）より厳しく、条件網羅（C2）より緩い基準です。',
          },
          {
            id: 709,
            question: '回帰テスト（リグレッションテスト）の目的として正しいものはどれか。',
            choices: [
              'システムに対して大量のアクセスをかけて性能を確認する',
              'バグ修正や機能追加後に既存機能が壊れていないことを確認する',
              'セキュリティ脆弱性を実際に攻撃して確認する',
              'ユーザーが実際に操作して業務要件を満たすか確認する',
            ],
            answer: 1,
            explanation: '回帰テスト（リグレッションテスト）はバグ修正・機能追加・変更後に、既存の機能が意図せず壊れていないことを確認するテストです。継続的インテグレーション（CI）と組み合わせて自動実行するのが一般的です。',
          },
        ],
      },
      {
        id: 'a7-4',
        title: 'ソフトウェア品質管理とメトリクス',
        content: `
<h3>ソフトウェアメトリクス（定量的品質評価）</h3>
<p>ソフトウェアの品質を客観的に評価するための測定指標です。</p>
<ul>
  <li><strong>LOC（Lines of Code）</strong>: コード行数。生産性の大まかな指標だが、行数が多いほど良いわけではない。</li>
  <li><strong>サイクロマティック複雑度（McCabe複雑度）</strong>: プログラムの制御フローの複雑さを数値化。分岐（if・switch・while・for）の数 + 1 が基本計算式。値が大きいほどテストケースが多く必要。10以下が目安。</li>
  <li><strong>バグ密度</strong>: コード1000行あたりのバグ数（バグ数 ÷ KLOC）。品質基準の設定に使用。</li>
  <li><strong>テストカバレッジ（網羅率）</strong>: テストで実行されたコードの割合。命令網羅（C0）・分岐網羅（C1）などで計測。</li>
</ul>

<h3>ソフトウェアレビュー技法</h3>
<p>テスト実行前にドキュメントやコードを人間の目で確認する手法です。バグの早期発見に有効で、テストより安価に欠陥を除去できます。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">手法</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">特徴</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">公式さ</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>インスペクション</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">訓練されたモデレーターが進行。欠陥を記録・分類する最も正式なレビュー</td><td style="padding:5px 8px;border:1px solid var(--color-border)">高</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>ウォークスルー</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">作成者が口頭で内容を説明しながら参加者が質問・意見を言う非公式なレビュー</td><td style="padding:5px 8px;border:1px solid var(--color-border)">中</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>ピアレビュー</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">同僚が非公式にコードを確認。GitHubのプルリクエストレビューが代表例</td><td style="padding:5px 8px;border:1px solid var(--color-border)">低〜中</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>静的解析</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">ツールがコードを実行せず解析してバグ・脆弱性・コーディング規約違反を検出</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ツール自動</td></tr>
</table>

<h3>品質特性（ISO/IEC 25010）</h3>
<p>ソフトウェアの品質を評価する国際標準です。8つの主要品質特性があります。</p>
<ul>
  <li><strong>機能適合性</strong>: 要求した機能を正確に実現できる</li>
  <li><strong>性能効率性</strong>: リソース（CPU・メモリ）に対して適切な性能を発揮</li>
  <li><strong>互換性</strong>: 他のシステム・環境と共存・連携できる</li>
  <li><strong>使用性</strong>: ユーザーが効果的・効率的・満足に使える（UX）</li>
  <li><strong>信頼性</strong>: 障害なく継続して機能を実行できる</li>
  <li><strong>セキュリティ</strong>: 不正アクセスからデータを保護できる</li>
  <li><strong>保守性</strong>: 変更・修正・テストが容易にできる</li>
  <li><strong>移植性</strong>: 別の環境へ移行・適応させやすい</li>
</ul>

<h3>CMM/CMMI（プロセス成熟度モデル）</h3>
<p>組織のソフトウェア開発プロセスの成熟度を5段階で評価するモデルです。</p>
<pre>
レベル1: 初期 ─── プロセスが場当たり的・個人依存
レベル2: 管理された ─── プロジェクト単位の計画・追跡が可能
レベル3: 定義された ─── 組織全体で標準プロセスを定義・文書化
レベル4: 定量的に管理 ─── メトリクスで品質を数値管理
レベル5: 最適化 ─── 継続的なプロセス改善が組織文化になっている
</pre>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
サイクロマティック複雑度＝分岐の数+1。値が大きいほど複雑でテストが困難。<br/>
インスペクション＝最も正式（モデレーターが進行・欠陥記録）、ウォークスルー＝作成者が説明しながら議論。<br/>
ISO/IEC 25010の8特性：機能適合性・性能効率性・互換性・使用性・信頼性・セキュリティ・保守性・移植性。
</div>
        `,
        questions: [
          {
            id: 1091,
            question: 'McCabe（マッケーブ）のサイクロマティック複雑度の説明として正しいものはどれか。',
            choices: [
              'コードの行数（LOC）を測定してプログラムの大きさを示す指標',
              'プログラムの制御フローの複雑さを数値化した指標で、分岐が多いほど値が大きくなる',
              'テスト実行でカバーされたコードの割合を示すカバレッジ指標',
              'バグの修正に要した平均時間を示す品質指標',
            ],
            answer: 1,
            explanation: 'サイクロマティック複雑度はif・for・while・switchなどの分岐の数+1で計算します。値が大きいほど制御フローが複雑でテストケースが多く必要になります。10以下が保守しやすいコードの目安とされています。',
          },
          {
            id: 1092,
            question: 'コードレビューの手法「ウォークスルー」の説明として正しいものはどれか。',
            choices: [
              '訓練されたモデレーターが進行し欠陥を正式に記録する最も厳密なレビュー',
              '作成者が参加者に内容を説明しながら進める非公式なレビュー形式',
              '実行せずにツールがソースコードを解析して問題を検出する手法',
              'コードを実際に実行して動作を確認するテスト手法',
            ],
            answer: 1,
            explanation: 'ウォークスルーは作成者が参加者（開発者・設計者など）に設計書やコードを口頭で説明しながら進めるレビューです。インスペクションより非公式で、ブレインストーミング的な意見交換が行われます。欠陥の発見より理解の共有を重視する場合も多いです。',
          },
          {
            id: 1093,
            question: 'ISO/IEC 25010が定めるソフトウェア品質特性「保守性（Maintainability）」の説明として正しいものはどれか。',
            choices: [
              'リソース（CPU・メモリ）に対して適切な性能を発揮できる性質',
              '不正アクセス・改ざん・情報漏洩からシステムを保護できる性質',
              '修正・改善・適応が容易で変更容易性・再利用性・試験性などを含む性質',
              '別の環境・プラットフォームへ移行・適応させやすい性質',
            ],
            answer: 2,
            explanation: '保守性は「変えやすさ」を表す品質特性で、変更容易性（修正しやすい）・再利用性・解析性（問題箇所の特定しやすさ）・試験性（テストしやすさ）などのサブ特性があります。高凝集・低結合の設計が保守性を高めます。移植性は別の環境への移行容易さです。',
          },
          {
            id: 1094,
            question: 'ソフトウェア開発プロセスの改善モデルCMMIのレベル3「定義された」の説明として正しいものはどれか。',
            choices: [
              'プロセスが個人に依存しており場当たり的で繰り返し可能ではない',
              'プロジェクト単位で計画・追跡は行われているが組織標準プロセスはない',
              '組織全体で標準プロセスが定義・文書化されており全プロジェクトで共有されている',
              'メトリクスによる定量的な品質管理が行われている',
            ],
            answer: 2,
            explanation: 'CMMIレベル3「定義された」は組織全体の標準プロセスが文書化・定義されており、全プロジェクトがそのプロセスに従って開発します。レベル2は「プロジェクト単位の管理」で組織横断の標準化はまだです。レベル4では定量的測定、レベル5では継続的最適化が行われます。',
          },
          {
            id: 1095,
            question: 'ソフトウェアの静的解析（Static Analysis）ツールの説明として正しいものはどれか。',
            choices: [
              'プログラムを実際に実行してその振る舞いを確認するテスト手法',
              'プログラムを実行せずにソースコードを解析してバグ・脆弱性・コーディング規約違反を自動検出する手法',
              'ユーザーが実際に操作して業務要件を満たすか確認する受入テスト手法',
              '大量アクセス時の性能・レスポンスタイムを測定する負荷テスト手法',
            ],
            answer: 1,
            explanation: '静的解析（静的テスト）はプログラムを実行せずにソースコード・バイトコードを解析します。未初期化変数・NullPointerException・SQLインジェクション脆弱性・コーディング規約違反などを自動検出できます。ESLint・FindBugs・SonarQubeが代表ツールです。CIパイプラインに組み込んで継続的に実行するのが一般的です。',
          },
        ],
      },
    ],
  },
  {
    id: 'a8',
    title: 'マネジメント',
    subject: 'A',
    description: 'プロジェクト管理・品質管理・ITサービス管理・監査まで、ITマネジメントを体系的に学びます。',
    sections: [
      {
        id: 'a8-1',
        title: 'プロジェクトマネジメント',
        content: `
<h3>プロジェクトとは何か</h3>
<p>「毎日の定型業務」とは異なり、プロジェクトは<strong>特定の目標を達成するための一時的な取り組み</strong>です。明確な開始日・終了日・予算・目標を持ちます。</p>
<p>プロジェクトマネジメントの難しさ：<strong>スコープ・コスト・スケジュール・品質</strong>の4つを同時にバランスさせる必要があります。1つを変えると他に影響します（スコープを増やすとコストと期間が増える、など）。</p>

<h3>WBS（Work Breakdown Structure）</h3>
<p>プロジェクトの全作業を<strong>ツリー状に分解</strong>した図です。「大きな作業を小さく分割し続ける」ことで作業の漏れを防ぎ、工数見積もりを正確にします。</p>
<p>最小単位を<strong>ワークパッケージ</strong>といい、担当者・期間・コストを割り当てられる粒度に分解します。</p>
<p>例：「Webサイト構築」→「フロントエンド開発」→「トップページ作成」→「デザイン/コーディング/テスト」</p>

<h3>ガントチャート vs アローダイアグラム</h3>
<p><strong>ガントチャート</strong>: 各作業の<strong>期間を横棒</strong>で表したスケジュール表。「いつ何をするか」が一目でわかる。進捗管理に使用。作業間の依存関係を表すのは苦手。</p>
<p><strong>アローダイアグラム（PERT図）</strong>: 作業の<strong>依存関係と順序</strong>を矢印で表したネットワーク図。クリティカルパスの計算に使用。</p>

<h3>クリティカルパス（最重要！）</h3>
<p>アローダイアグラムで<strong>最も時間がかかる経路</strong>のことです。この経路上の作業が1日遅れると、プロジェクト全体が1日遅れます。</p>
<p><strong>フロート（余裕時間）</strong>: 作業を遅らせてもプロジェクト完了に影響しない余裕時間。クリティカルパス上の作業はフロート=0。</p>
<pre>
【例】作業A(3日)→作業C(2日)→完了（計5日）
      作業B(2日)→作業D(4日)→完了（計6日）

クリティカルパス: B→D（6日）← こちらが長い
フロート(A→C):  6-5 = 1日の余裕がある
</pre>
<p>つまり、作業Aや作業Cは1日遅れても問題ありません。しかし作業B・Dは1日でも遅れると全体が遅延します。</p>

<h3>リスクマネジメント</h3>
<p>プロジェクトを脅かすリスクを特定・分析・対応する活動です。</p>
<p><strong>リスクマトリクス</strong>: リスクの「発生確率」×「影響度」で優先度を評価します。</p>
<ul>
  <li><strong>リスク回避</strong>: リスクの原因自体を取り除く（高リスクな機能を削除など）</li>
  <li><strong>リスク軽減</strong>: 発生確率や影響度を下げる（早期テスト・冗長化など）</li>
  <li><strong>リスク転嫁</strong>: 保険・外注などで損失を他者に移す</li>
  <li><strong>リスク受容</strong>: 対策コストより損失が小さい場合、そのまま受け入れる</li>
</ul>

<h3>PMBOK（知識体系）</h3>
<p>PMI（米国PMI協会）が整理したプロジェクト管理のベストプラクティス集です。</p>
<p><strong>5プロセス群</strong>: 立上げ → 計画 → 実行 → 監視・コントロール → 終結</p>
<p><strong>10知識エリア</strong>: スコープ・スケジュール・コスト・品質・資源・コミュニケーション・リスク・調達・ステークホルダー・統合</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
クリティカルパス=プロジェクト完了までの最長経路（最短でも最小コストでもない）。フロート=余裕時間。<br/>
ガントチャート=横棒でスケジュール表示、アローダイアグラム=依存関係・クリティカルパスの計算。<br/>
WBS=作業を階層分解、ワークパッケージ=最小単位。リスクの4対応: 回避・軽減・転嫁・受容。
</div>
        `,
        diagram: 'gantt',
        questions: [
          {
            id: 28,
            question: 'プロジェクトの作業を階層的に分解して整理したものを何というか。',
            choices: ['ガントチャート', 'WBS', 'クリティカルパス', 'PMBOK'],
            answer: 1,
            explanation: 'WBS（Work Breakdown Structure）はプロジェクトの作業を階層的に分解した図で、作業の漏れ防止と工数見積もりに使います。',
          },
          {
            id: 29,
            question: 'クリティカルパスの説明として正しいものはどれか。',
            choices: [
              'プロジェクトで最もコストがかかる経路',
              'プロジェクト完了までの最長経路',
              '品質上最も重要な作業の経路',
              '最初に完了できる最短経路',
            ],
            answer: 1,
            explanation: 'クリティカルパスはプロジェクト完了までの最長経路で、この経路の作業が遅れると全体のスケジュールが遅延します。',
          },
          {
            id: 801,
            question: 'ガントチャートの説明として正しいものはどれか。',
            choices: [
              '作業の依存関係を矢印で表した図',
              '各作業の開始・終了日程を横棒で表した図',
              '作業を階層的に分解した図',
              'リスクの確率と影響度をマトリクスで表した図',
            ],
            answer: 1,
            explanation: 'ガントチャートは各作業の期間を横棒で表した進捗管理ツールです。アローダイアグラムは依存関係と順序を表します。',
          },
          {
            id: 804,
            question: 'アローダイアグラムでフロート（余裕時間）が0の作業の説明として正しいものはどれか。',
            choices: [
              '最も短時間で完了できる作業',
              'クリティカルパス上にあり、遅延するとプロジェクト全体が遅延する作業',
              '最も多くのコストがかかる作業',
              '並行して実行できる作業',
            ],
            answer: 1,
            explanation: 'フロート（余裕時間）が0の作業はクリティカルパス上に位置します。1日でも遅延するとプロジェクト全体の完了が遅れるため、最優先で管理します。',
          },
          {
            id: 805,
            question: 'プロジェクトリスクへの対応策のうち「リスク転嫁」の例として正しいものはどれか。',
            choices: [
              'リスクの発生確率を下げるために早期テストを実施する',
              'リスクの原因となる機能を削除してリスク自体をなくす',
              '保険に加入してリスクによる損失を保険会社に移す',
              '対策コストが損失より高いためリスクをそのまま受け入れる',
            ],
            answer: 2,
            explanation: 'リスク転嫁は保険加入・外注・契約など他者に損失を移す対応です。リスク回避=原因除去、リスク軽減=確率や影響度を下げる、リスク受容=受け入れる、の違いも整理しましょう。',
          },
          {
            id: 1096,
            question: '次のアローダイアグラムにおいてプロジェクト完了までの最短日数はどれか。\n経路①: A(3日)→C(4日)→F(2日)\n経路②: A(3日)→D(5日)→F(2日)\n経路③: B(6日)→E(3日)→F(2日)',
            choices: ['9日', '10日', '11日', '12日'],
            answer: 2,
            explanation: '各経路の合計：①A+C+F=3+4+2=9日、②A+D+F=3+5+2=10日、③B+E+F=6+3+2=11日。最長経路（クリティカルパス）は③の11日がプロジェクト完了までの最短日数（＝最速でも11日かかる）です。',
          },
          {
            id: 1097,
            question: 'PMBOKで定義されるプロジェクトマネジメントの「5プロセス群」の正しい順序はどれか。',
            choices: [
              '計画→立上げ→実行→監視・コントロール→終結',
              '立上げ→計画→実行→監視・コントロール→終結',
              '立上げ→実行→計画→監視・コントロール→終結',
              '計画→立上げ→監視・コントロール→実行→終結',
            ],
            answer: 1,
            explanation: 'PMBOKの5プロセス群は「立上げ→計画→実行→監視・コントロール→終結」の順です。実行と監視・コントロールは並行して繰り返し行われます。PMBOKはPMI（プロジェクトマネジメント協会）が整理したベストプラクティス集です。',
          },
        ],
      },
      {
        id: 'a8-2',
        title: '品質管理と信頼性設計',
        content: `
<h3>品質管理ツール（QC7つ道具）</h3>
<ul>
  <li><strong>チェックシート</strong>: 不良や欠陥の発生状況を記録・集計するための表。「どこで・何が・何回発生したか」をその場で記入して収集する。</li>
  <li><strong>ヒストグラム</strong>: データの分布（ばらつき）を棒グラフで表示。製品寸法のばらつきが規格内か確認するなどに使う。</li>
  <li><strong>パレート図</strong>: 問題の原因を頻度順に並べた棒グラフ。上位2〜3件で全体の約80%を占める（80:20の法則）。重要な原因の特定に使う。</li>
  <li><strong>特性要因図（フィッシュボーン図・石川ダイアグラム）</strong>: 問題（特性）の原因を骨組み状に整理。「なぜ？」を繰り返して根本原因を探る。</li>
  <li><strong>管理図</strong>: 工程の安定性を時系列で監視。上方・下方管理限界線を設けて異常を検知する。</li>
  <li><strong>散布図</strong>: 2変量の関係を点で表示。相関関係（正・負・無）の有無を確認する。</li>
  <li><strong>層別</strong>: データを属性（機械・作業者・時間帯など）ごとにグループ分けして比較・分析する。他の6つの道具と組み合わせて使う。</li>
</ul>

<h3>品質特性（ISO/IEC 25010）</h3>
<ul>
  <li><strong>機能適合性</strong>: 要求機能を正しく提供しているか</li>
  <li><strong>性能効率性</strong>: 応答時間・スループットが要件を満たすか</li>
  <li><strong>信頼性</strong>: 障害なく動作し続けられるか（MTBF・稼働率）</li>
  <li><strong>使用性</strong>: ユーザーが使いやすいか</li>
  <li><strong>保守性</strong>: 修正・変更しやすいか</li>
  <li><strong>移植性</strong>: 他の環境へ移行できるか</li>
</ul>

<h3>稼働率の計算</h3>
<p><code>稼働率 = MTBF ÷ (MTBF + MTTR)</code></p>
<p><strong>MTBF</strong>（平均故障間隔）: 正常稼働している平均時間</p>
<p><strong>MTTR</strong>（平均修復時間）: 故障から復旧までの平均時間</p>

<h3>システム構成と信頼性</h3>
<p><strong>直列接続</strong>: 全コンポーネントが動作する必要がある。稼働率 = R₁ × R₂（全部正常でないと動かない分、低下する）</p>
<p><strong>並列接続（冗長構成）</strong>: どれか1つ動けば良い。稼働率 = 1 - (1-R₁) × (1-R₂)（どれか動けばいい分、向上する）</p>
<pre>
【例】稼働率0.9の装置A・B
直列: 0.9 × 0.9 = 0.81（下がる）
並列: 1 - (1-0.9) × (1-0.9) = 1 - 0.01 = 0.99（上がる）
</pre>

<h3>PDCAサイクル</h3>
<p>品質改善を継続的に行うための管理サイクルです。</p>
<ul>
  <li><strong>Plan（計画）</strong>: 目標設定・改善計画を立案</li>
  <li><strong>Do（実行）</strong>: 計画に基づいて実施</li>
  <li><strong>Check（評価）</strong>: 結果を測定・分析</li>
  <li><strong>Act（改善）</strong>: 問題点を改善し次のPlanへ反映</li>
</ul>
<p>PDCAを回し続けることで継続的な品質向上を実現します。情報セキュリティ管理（ISMS）でも同様のサイクルを用います。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
稼働率 = MTBF ÷ (MTBF + MTTR)。MTBF=故障間隔（長いほど良い）、MTTR=修復時間（短いほど良い）。<br/>
直列=稼働率の積（下がる）、並列=1−故障率の積（上がる）。<br/>
パレート図=原因を頻度順に並べ重要な原因（80:20の法則）を特定。PDCA=継続的改善サイクル。
</div>
        `,
        diagram: 'reliability',
        questions: [
          {
            id: 30,
            question: 'MTBF=90時間、MTTR=10時間のとき、稼働率はいくつか。',
            choices: ['0.9', '0.99', '0.1', '9.0'],
            answer: 0,
            explanation: '稼働率 = MTBF ÷ (MTBF + MTTR) = 90 ÷ (90 + 10) = 90 ÷ 100 = 0.9 です。',
          },
          {
            id: 802,
            question: '稼働率0.9の装置を2台並列（冗長）接続したとき、システム全体の稼働率はいくつか。',
            choices: ['0.81', '0.9', '0.99', '1.0'],
            answer: 2,
            explanation: '並列の稼働率 = 1 - (1-0.9) × (1-0.9) = 1 - 0.1 × 0.1 = 1 - 0.01 = 0.99 です。',
          },
          {
            id: 806,
            question: 'QC7つ道具のうち「パレート図」の説明として正しいものはどれか。',
            choices: [
              'データの分布（ばらつき）を棒グラフで表示する図',
              '問題の原因を頻度順に並べ重要な原因を特定する図',
              '2変量の相関関係を点で表示する図',
              '工程の安定性を時系列で監視する図',
            ],
            answer: 1,
            explanation: 'パレート図は問題の原因・欠陥などを頻度の多い順に並べた棒グラフです。上位2〜3件で全体の約80%を占めることが多く（80:20の法則）、重要な原因の特定に使います。',
          },
          {
            id: 807,
            question: '稼働率0.8の装置2台を直列接続した場合のシステム稼働率はどれか。',
            choices: ['0.96', '0.8', '0.64', '0.36'],
            answer: 2,
            explanation: '直列接続の稼働率 = 0.8 × 0.8 = 0.64 です。直列では全装置が動作しないとシステムが動かないため、稼働率は各装置の積となり低下します。',
          },
          {
            id: 1098,
            question: '稼働率0.9の装置2台を並列接続した場合のシステム稼働率はどれか。',
            choices: ['0.81', '0.90', '0.99', '0.95'],
            answer: 2,
            explanation: '並列接続の稼働率 = 1 − (1−0.9) × (1−0.9) = 1 − 0.01 = 0.99 です。並列では両方故障したときだけシステム停止するため、稼働率は大幅に向上します。直列（0.9×0.9=0.81）と対比して理解しましょう。',
          },
          {
            id: 1099,
            question: 'QC7つ道具のうち「特性要因図（フィッシュボーン図）」の主な用途として正しいものはどれか。',
            choices: [
              '不良の発生頻度を時系列で監視し工程の安定性を確認する',
              '問題（特性）の原因を骨組み状に整理して根本原因を探る',
              '2つの変数の相関関係を散布図で可視化する',
              '問題の原因を頻度順に並べて重要な原因上位を特定する',
            ],
            answer: 1,
            explanation: '特性要因図（フィッシュボーン図・石川ダイアグラム）は問題（特性）に対し「なぜ？」を繰り返して原因を4M（Man・Machine・Material・Method）などの視点から魚の骨のように整理する手法です。管理図は時系列監視、パレート図は頻度順整理、散布図は相関確認に使います。',
          },
        ],
      },
      {
        id: 'a8-3',
        title: 'ITサービスマネジメントと監査',
        content: `
<h3>ITサービスマネジメント（ITSM）</h3>
<p>ITサービスを安定して提供するための管理活動です。<strong>ITIL（IT Infrastructure Library）</strong>がベストプラクティス集として広く参照されています。</p>

<h3>サービスデスク</h3>
<p>ユーザーからの問い合わせ・インシデント報告を受け付ける<strong>単一の窓口</strong>です。</p>

<h3>変更管理・構成管理</h3>
<p><strong>変更管理</strong>: システムへの変更を計画・承認・記録して影響を最小化する。</p>
<p><strong>構成管理</strong>: IT資産（ハードウェア・ソフトウェア・ドキュメント）の情報をCMDB（構成管理データベース）で一元管理する。</p>

<h3>SLA（サービスレベル合意書）</h3>
<p>サービス提供者とユーザー間で品質水準を合意した文書です。</p>
<p>例: 「稼働率99.9%以上」「障害応答時間1時間以内」「月次報告書を10日以内に提出」</p>

<h3>ITILのサービス管理プロセス</h3>
<p>ITILではインシデント・問題・変更を明確に区別して管理します。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">プロセス</th><th style="padding:6px 8px;border:1px solid var(--color-border)">目的</th><th style="padding:6px 8px;border:1px solid var(--color-border)">例</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>インシデント管理</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">サービスを早期に回復する</td><td style="padding:5px 8px;border:1px solid var(--color-border)">サーバ再起動で一時復旧</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>問題管理</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">根本原因を特定し再発を防ぐ</td><td style="padding:5px 8px;border:1px solid var(--color-border)">障害の根本原因を解析・修正</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>変更管理</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">変更リスクを管理して安全に実施</td><td style="padding:5px 8px;border:1px solid var(--color-border)">パッチ適用・設定変更の承認</td></tr>
</table>

<h3>情報システム監査</h3>
<p>情報システムが適切に管理・運用されているかを独立した立場で検証する活動です。</p>
<ul>
  <li><strong>システム監査</strong>: ITシステム全般の有効性・効率性・安全性を評価</li>
  <li><strong>セキュリティ監査</strong>: セキュリティ対策の有効性を評価</li>
  <li><strong>内部監査</strong>: 組織内部の人員が実施。独立性はやや低いが、業務知識が深い。</li>
  <li><strong>外部監査</strong>: 独立した第三者機関が実施。客観性・独立性が高い。</li>
</ul>
<p>監査の独立性を保つため、監査担当者は被監査部門の業務に関わってはいけません。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
SLA=サービスレベル合意書（稼働率・応答時間などを合意した文書）。<br/>
インシデント管理=早期回復が目的、問題管理=根本原因特定・再発防止が目的（違いは必出）。<br/>
変更管理=変更リスクを評価・承認して安全に実施。構成管理=IT資産をCMDBで一元管理。<br/>
監査の独立性: 外部監査 &gt; 内部監査。監査人は被監査業務に携わってはならない。
</div>
        `,
        diagram: 'itsm',
        questions: [
          {
            id: 803,
            question: 'ITサービスマネジメントにおけるSLAの説明として正しいものはどれか。',
            choices: [
              'ソフトウェア開発の標準的な手順書',
              'サービス提供者とユーザー間でサービス品質水準を合意した文書',
              'システムの設定情報を管理するデータベース',
              'インシデントの対応手順を記したマニュアル',
            ],
            answer: 1,
            explanation: 'SLA（サービスレベル合意書）はサービス提供者とユーザーがサービスの品質・可用性・応答時間などの水準を合意した契約的な文書です。',
          },
          {
            id: 808,
            question: 'ITILにおけるインシデント管理の目的として正しいものはどれか。',
            choices: [
              'インシデントの根本原因を特定して再発を防止する',
              'サービスへの影響を最小化して早期にサービスを回復する',
              'IT資産の構成情報をデータベースで一元管理する',
              'サービス変更のリスクを評価して安全に実施する',
            ],
            answer: 1,
            explanation: 'インシデント管理の目的はサービスを早期に回復することです。根本原因の特定は問題管理が担います。インシデントでは一時対応（ワークアラウンド）でも早期回復を優先します。',
          },
          {
            id: 809,
            question: '情報システム監査における「監査の独立性」に関して正しいものはどれか。',
            choices: [
              '内部監査のほうが外部監査より客観性が高い',
              '監査担当者は被監査部門の業務に携わっていてはならない',
              '監査はシステム開発チームのメンバーが実施するのが最も効果的',
              '監査の独立性は重要ではなく、専門知識があれば誰でもよい',
            ],
            answer: 1,
            explanation: '監査の独立性を確保するため、監査担当者は被監査部門の業務に関わってはなりません。被監査業務に携わった人が自身の仕事を監査しても客観性が保てないためです。',
          },
          {
            id: 1100,
            question: 'ITIL（IT Infrastructure Library）におけるインシデント管理と問題管理の違いとして正しいものはどれか。',
            choices: [
              'インシデント管理は根本原因の特定、問題管理はサービスの早期回復を担う',
              'インシデント管理はサービス早期回復、問題管理はインシデントの根本原因特定と再発防止を担う',
              'インシデント管理はシステム変更の承認、問題管理はIT資産の記録を担う',
              'インシデント管理と問題管理は同じ活動で担当者だけが異なる',
            ],
            answer: 1,
            explanation: 'インシデント管理は「発生した問題を一時対応も含めてできるだけ早くサービスを回復すること」が目的です。問題管理は「インシデントの根本原因（Problem）を特定して再発を防止すること」が目的です。インシデントが多発する場合、問題管理で根本原因を分析して恒久対策を実施します。',
          },
          {
            id: 1101,
            question: 'SLA（サービスレベル合意）に記載される内容として適切なものはどれか。',
            choices: [
              'システムのソースコードの品質基準と開発手法',
              'サービス提供者とユーザー間で合意したサービス品質水準（稼働率・応答時間・サポート時間など）',
              'プロジェクトチームの組織図と役割分担',
              '開発費用の見積もりとコスト管理方針',
            ],
            answer: 1,
            explanation: 'SLA（Service Level Agreement）はサービス提供者とユーザーが「稼働率99.9%以上」「問い合わせ初回応答は4時間以内」「計画停止は月1回・4時間以内」などのサービス品質水準を合意した文書です。SLAを下回った場合のペナルティ（返金・代替サービスなど）も規定されます。',
          },
        ],
      },
    ],
  },
  {
    id: 'a9',
    title: 'ストラテジ',
    subject: 'A',
    description: '経営戦略・マーケティング・財務会計・OR手法・情報システム戦略・法務など、ストラテジ系の全範囲を体系的に学びます。',
    sections: [
      {
        id: 'a9-1',
        title: '経営戦略とITガバナンス',
        content: `
<h3>経営戦略フレームワーク</h3>
<p><strong>SWOT分析</strong>: 強み(S)・弱み(W)・機会(O)・脅威(T)を整理して戦略を立案。</p>
<p><strong>PEST分析</strong>: 政治（P）・経済（E）・社会（S）・技術（T）の外部環境を分析。</p>
<p><strong>PPM（プロダクト・ポートフォリオ・マネジメント）</strong>: 市場成長率×市場占有率で事業を「花形」「金のなる木」「問題児」「負け犬」に分類して経営資源を配分。</p>

<h3>コア・コンピタンス</h3>
<p>競合他社が真似しにくい<strong>自社独自の強み・能力</strong>のことです。競争優位の源泉となります。</p>

<h3>ファイブフォース分析（ポーターの5つの競争要因）</h3>
<p>業界の競争環境を5つの力で分析するフレームワークです。</p>
<ul>
  <li>① <strong>既存競合他社との競争</strong>: 競合の数・強さ</li>
  <li>② <strong>新規参入の脅威</strong>: 参入障壁の高さ</li>
  <li>③ <strong>代替品・代替サービスの脅威</strong>: 他の手段に乗り換えられるリスク</li>
  <li>④ <strong>買い手（顧客）の交渉力</strong>: 顧客がどれだけ価格交渉できるか</li>
  <li>⑤ <strong>売り手（供給業者）の交渉力</strong>: 部材・素材の供給者がどれだけ価格を上げられるか</li>
</ul>

<h3>ポーターの3つの競争戦略</h3>
<p>ファイブフォース分析で把握した競争環境に対して、<strong>どのように競争優位を築くか</strong>を示す戦略です。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">戦略</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">内容</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">代表例</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>コストリーダーシップ戦略</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">業界最低コストを実現して価格競争力を持つ。大量生産・効率化が鍵。</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">ディスカウントスーパー、格安航空会社</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>差別化戦略</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">品質・ブランド・機能・サービスなどで独自性を発揮し、価格競争から距離を置く。</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">高級ブランド品、Appleのプレミアム製品</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>集中戦略</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">特定の顧客層・地域・製品に経営資源を集中する（コスト集中 or 差別化集中）。</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">高級時計の特定ブランド、特定地域専門の運送会社</td>
  </tr>
</table>
<p>コストリーダーシップと差別化は「全体市場」を対象、集中は「特定セグメント」を対象とする点が違いです。</p>

<h3>BSC（バランスト・スコアカード）</h3>
<p>財務の視点だけでなく、4つの視点から組織の戦略達成状況を評価する経営管理ツールです。</p>
<ul>
  <li><strong>財務の視点</strong>: 売上・利益・ROIなど</li>
  <li><strong>顧客の視点</strong>: 顧客満足度・市場シェアなど</li>
  <li><strong>業務プロセスの視点</strong>: 業務効率・品質・リードタイムなど</li>
  <li><strong>学習と成長の視点</strong>: 従業員スキル・イノベーション能力など</li>
</ul>

<h3>BPR・BPM・ERP</h3>
<ul>
  <li><strong>BPR（業務プロセス再設計）</strong>: ITを活用して業務プロセスを<strong>抜本的・根本的</strong>に見直す。現状の延長線上ではなく「白紙から再設計」するのが特徴。</li>
  <li><strong>BPM（業務プロセス管理）</strong>: 業務プロセスを継続的に改善・管理する</li>
  <li><strong>ERP（統合基幹業務システム）</strong>: 会計・人事・生産・販売などを一元管理するシステム。SAP・Oracle ERPが代表例。</li>
</ul>

<h3>ITガバナンスとDX</h3>
<p><strong>ITガバナンス</strong>: 経営目標の達成に向けてITの利用を組織的に管理・統制する仕組み。CIO（最高情報責任者）が中心的役割を担います。</p>
<p><strong>DX（デジタルトランスフォーメーション）</strong>: デジタル技術を活用してビジネスモデル・業務プロセス・企業文化を変革し、競争優位を確立する取り組みです。単なるIT化・効率化とは異なり、事業モデル自体の変革を目指します。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
SWOT: S=強み、W=弱み、O=機会、T=脅威。PPM: 花形=成長率高・占有率高、金のなる木=成長率低・占有率高。<br/>
ファイブフォース=業界の競争を5つの力で分析（ポーター）。ポーターの3競争戦略: コストリーダーシップ・差別化・集中。<br/>
BSC=4視点（財務・顧客・業務プロセス・学習と成長）で戦略評価。<br/>
BPR=業務プロセスを抜本的に再設計（既存の改善ではなく白紙から）。ERP=基幹業務を一元管理するシステム。
</div>
        `,
        diagram: 'strategy',
        questions: [
          {
            id: 31,
            question: 'SWOT分析の「O」が表すものはどれか。',
            choices: ['強み', '弱み', '機会', '脅威'],
            answer: 2,
            explanation: 'SWOTのOはOpportunities（機会）を表します。外部環境における有利な状況のことです。',
          },
          {
            id: 901,
            question: 'PPM（プロダクト・ポートフォリオ・マネジメント）で「市場成長率が高く市場占有率も高い」事業の分類はどれか。',
            choices: ['金のなる木', '負け犬', '問題児', '花形'],
            answer: 3,
            explanation: 'PPMでは市場成長率（高/低）×市場占有率（高/低）の4象限に分類します。両方高い事業が「花形（スター）」です。',
          },
          {
            id: 904,
            question: 'BPR（業務プロセス再設計）の説明として正しいものはどれか。',
            choices: [
              '現状の業務プロセスを少しずつ継続的に改善する活動',
              '業務プロセスを白紙に戻して抜本的・根本的に再設計する活動',
              '会計・人事・生産などの基幹業務を統合するシステムの導入',
              'IT資産を一元管理するデータベースの構築',
            ],
            answer: 1,
            explanation: 'BPRは既存の業務プロセスの延長線上で改善するのではなく、「白紙から再設計」するのが特徴です。小改善を積み重ねるBPMや継続的改善（カイゼン）とは区別して覚えましょう。',
          },
          {
            id: 905,
            question: 'BSC（バランスト・スコアカード）の4つの視点として正しいものはどれか。',
            choices: [
              '強み・弱み・機会・脅威',
              '財務・顧客・業務プロセス・学習と成長',
              '計画・実行・評価・改善',
              '政治・経済・社会・技術',
            ],
            answer: 1,
            explanation: 'BSCは財務・顧客・業務プロセス・学習と成長の4視点から経営戦略の達成状況を評価します。財務指標だけでなく非財務指標も含めることで、短期・長期両面の経営管理ができます。',
          },
        ],
      },
      {
        id: 'a9-2',
        title: '情報システム戦略',
        content: `
<h3>情報システム戦略の立案</h3>
<p>経営戦略と整合した形でITをどう活用するかを決める活動です。CIO（最高情報責任者）が中心となり、全社的なIT戦略を策定・推進します。</p>

<h3>主要な業務システム（頻出！）</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">略称</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">正式名称</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">目的・概要</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>ERP</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">統合基幹業務システム</td><td style="padding:5px 8px;border:1px solid var(--color-border)">会計・人事・在庫・生産・販売を1つのDBで一元管理。SAP・Oracle ERP が代表。</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>CRM</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">顧客関係管理</td><td style="padding:5px 8px;border:1px solid var(--color-border)">顧客情報・購買履歴・問い合わせ履歴を管理し、顧客満足度向上・リピート促進に使う。Salesforce が代表。</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>SFA</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">営業支援システム</td><td style="padding:5px 8px;border:1px solid var(--color-border)">営業活動（訪問記録・商談進捗・見積もり）を管理して営業効率を上げる。CRMと組み合わせて使うことが多い。</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>SCM</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">サプライチェーン管理</td><td style="padding:5px 8px;border:1px solid var(--color-border)">調達→生産→在庫→配送の一連の流れを最適化。リードタイム短縮・在庫削減が目的。</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>KMS</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">ナレッジマネジメント</td><td style="padding:5px 8px;border:1px solid var(--color-border)">社員の知識・ノウハウを組織全体で共有・蓄積・活用する仕組み。</td></tr>
</table>

<h3>エンタープライズアーキテクチャ（EA）</h3>
<p>組織全体のIT・業務を4つの層で整理するフレームワークです。「理想の姿（To-Be）」と「現状（As-Is）」を4層で比較し、移行計画を立てます。</p>
<ul>
  <li><strong>ビジネスアーキテクチャ（BA）</strong>: 業務プロセス・組織の在り方・役割分担</li>
  <li><strong>データアーキテクチャ（DA）</strong>: 利用するデータの構造・流れ・管理方法</li>
  <li><strong>アプリケーションアーキテクチャ（AA）</strong>: 業務を支えるシステム・アプリの全体像</li>
  <li><strong>テクノロジアーキテクチャ（TA）</strong>: インフラ・ネットワーク・プラットフォームの技術構成</li>
</ul>

<h3>システム調達の流れ</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">文書</th><th style="padding:6px 8px;border:1px solid var(--color-border)">正式名称</th><th style="padding:6px 8px;border:1px solid var(--color-border)">目的</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>RFI</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">情報提供依頼書</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ベンダーに技術・製品情報の提供を求める（情報収集段階）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>RFP</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">提案依頼書</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ベンダーに具体的な提案・見積もりを求める（発注段階）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>SLA</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">サービスレベル合意書</td><td style="padding:5px 8px;border:1px solid var(--color-border)">調達サービスの品質水準（稼働率・応答時間等）を合意した文書</td></tr>
</table>
<p>調達の流れ: <strong>RFI（情報収集）→ RFP（提案依頼）→ 選定・契約 → SLA締結 → サービス開始</strong></p>

<h3>IT投資評価指標</h3>
<ul>
  <li><strong>ROI（Return on Investment）</strong>: (利益 ÷ 投資額) × 100%。高いほど投資効率が良い。</li>
  <li><strong>TCO（Total Cost of Ownership）</strong>: 購入費だけでなく<strong>運用・保守・廃棄費も含めた総コスト</strong>。見た目のコストより実際は高くなりがち。</li>
  <li><strong>NPV（正味現在価値）</strong>: 将来の収益を現在価値に割り引いた指標。NPV &gt; 0 なら投資価値あり。</li>
  <li><strong>回収期間法（Payback Period）</strong>: 投資額を何年で回収できるかで評価。計算が簡単だが時間価値を考慮しない欠点がある。</li>
</ul>

<h3>新技術の活用（IoT・AI・ビッグデータ）</h3>
<ul>
  <li><strong>IoT（Internet of Things）</strong>: センサー・機器をネットに接続してデータを収集・制御する。工場の設備管理・スマートホームなどに活用。</li>
  <li><strong>AI（人工知能）</strong>: 機械学習・深層学習で画像認識・自然言語処理・需要予測などを実現。</li>
  <li><strong>ビッグデータ</strong>: 大量・多様・高速に生成されるデータを分析して意思決定に活用。特徴は「3V」（Volume=量、Variety=多様性、Velocity=速度）。</li>
  <li><strong>RPA（Robotic Process Automation）</strong>: 定型的な業務（データ入力・転記・ファイル操作）をソフトウェアロボットで自動化。人の作業を代替。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
業務システム4つ: ERP=全業務一元管理、CRM=顧客管理、SFA=営業支援、SCM=サプライチェーン最適化。<br/>
RFI=情報収集、RFP=提案依頼（順序に注意。RFIが先）。TCO=購入費＋運用・保守・廃棄の総コスト。<br/>
ビッグデータの3V: Volume（量）・Variety（多様性）・Velocity（速度）。RPAは定型業務の自動化。
</div>
        `,
        diagram: 'ea',
        questions: [
          {
            id: 902,
            question: 'RFP（提案依頼書）の説明として正しいものはどれか。',
            choices: [
              'ベンダーに技術・製品情報の提供を依頼する文書',
              'ベンダーに具体的な提案と見積もりを求める文書',
              'システムの要件定義をまとめた文書',
              'サービス品質の水準を合意した契約文書',
            ],
            answer: 1,
            explanation: 'RFP（提案依頼書）はシステム調達の際にベンダーに提案・見積もり提出を求める文書です。RFIは情報収集目的で使います。',
          },
          {
            id: 906,
            question: 'TCO（総所有コスト）の説明として正しいものはどれか。',
            choices: [
              '投資額に対する利益の割合を示す指標',
              'システムの購入費・導入費・運用費・保守費・廃棄費を含めた総コスト',
              '将来のキャッシュフローを現在価値に割り引いた投資評価指標',
              '投資を何年で回収できるかを示す指標',
            ],
            answer: 1,
            explanation: 'TCO（Total Cost of Ownership）は購入費だけでなく、導入・運用・保守・廃棄まですべてのライフサイクルコストを含みます。表面上安い製品でも運用コストが高ければTCOが大きくなります。',
          },
          {
            id: 907,
            question: 'エンタープライズアーキテクチャ（EA）の4つの層として正しいものはどれか。',
            choices: [
              '計画・設計・実装・運用',
              'ビジネス・データ・アプリケーション・テクノロジ',
              '財務・顧客・業務プロセス・学習と成長',
              'IaaS・PaaS・SaaS・ユーザー',
            ],
            answer: 1,
            explanation: 'EAは組織全体のIT・業務をビジネスアーキテクチャ（業務プロセス）・データアーキテクチャ（データ構造）・アプリケーションアーキテクチャ（システム全体像）・テクノロジアーキテクチャ（インフラ）の4層で整理します。',
          },
        ],
      },
      {
        id: 'a9-3',
        title: '法務・知的財産権',
        content: `
<h3>知的財産権とは何か</h3>
<p>物理的な「モノ」と違い、アイデア・創作物・デザインは誰でも簡単にコピーできます。「苦労して作ったのに勝手にコピーされて利益を得られない」という問題を防ぐために<strong>知的財産権</strong>という法的な保護制度があります。IT業界では特に重要な法律知識です。</p>

<h3>著作権（最重要）</h3>
<p>文章・絵・音楽・プログラムなどの創作物を<strong>作った瞬間から自動的に発生</strong>する権利です。登録や申請は一切不要（これを「無方式主義」という）。</p>
<ul>
  <li>保護期間: 著作者の<strong>死後70年</strong>（法人の場合は公表後70年）</li>
  <li>プログラムも著作物として保護（ソースコード・オブジェクトコード両方）</li>
  <li><strong>職務著作</strong>: 会社の業務として作ったプログラムは、原則として<strong>会社が著作者</strong>になる（就業規則の定めによる）</li>
</ul>
<p>注意：著作権は「表現」を保護するのであって「アイデア」は保護しません。同じアイデアの作品でも、独自に作れば著作権侵害にはなりません。</p>

<h3>産業財産権（特許庁への出願・登録が必要）</h3>
<p>技術・デザイン・ブランドを保護する権利です。<strong>先に出願した者が権利を得る</strong>（先願主義）。</p>
<ul>
  <li><strong>特許権</strong>: 新しい技術的アイデア（発明）を保護。出願から<strong>20年</strong>。審査が厳しい。IT分野では特許取得困難なものも多い。</li>
  <li><strong>実用新案権</strong>: 物の形状・構造の工夫（考案）を保護。出願から<strong>10年</strong>。無審査登録で手軽。</li>
  <li><strong>意匠権</strong>: 製品の外観デザインを保護。登録から<strong>25年</strong>。UIデザインも保護対象になりうる。</li>
  <li><strong>商標権</strong>: ブランド名・ロゴ・キャラクターを保護。登録から<strong>10年（何度でも更新可能）</strong>。</li>
</ul>

<h3>著作権 vs 特許権の違い（超頻出）</h3>
<ul>
  <li>著作権: 登録<strong>不要</strong>・自動発生・死後70年</li>
  <li>特許権: 登録<strong>必要</strong>・審査あり・出願から20年</li>
</ul>

<h3>個人情報保護法</h3>
<p>生存する個人を識別できる情報（氏名・住所・メールアドレス等）の適切な取り扱いを定めた法律です。</p>
<ul>
  <li><strong>取得時</strong>: 利用目的を明示する必要がある</li>
  <li><strong>第三者提供</strong>: 原則として<strong>本人の事前同意（オプトイン）</strong>が必要</li>
  <li><strong>要配慮個人情報</strong>（病歴・犯罪歴・障害・人種など）: 特に厳格な取り扱いが必要。取得自体に同意が必要。</li>
  <li><strong>開示・訂正・削除</strong>: 本人から要求があれば対応する義務がある</li>
</ul>

<h3>不正競争防止法</h3>
<p>営業秘密（技術情報・顧客データなど）の不正取得・使用・漏洩を禁止する法律です。</p>
<ul>
  <li><strong>営業秘密の3条件</strong>: ①秘密管理性（秘密として管理されている）②有用性（事業に有用）③非公知性（公に知られていない）</li>
  <li>退職者が営業秘密を持ち出して競合他社に提供した場合も違反となる</li>
</ul>

<h3>不正アクセス禁止法</h3>
<p>許可なく他人のIDでログインしたり、セキュリティホールを突いてシステムに侵入することを禁止する法律です。IT業界で働く人全員が知っておくべき法律です。</p>
<p>違反すると<strong>3年以下の懲役または100万円以下の罰金</strong>（未遂も罰則あり）。</p>

<h3>知的財産権まとめ</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">権利</th><th style="padding:6px 8px;border:1px solid var(--color-border)">対象</th><th style="padding:6px 8px;border:1px solid var(--color-border)">登録</th><th style="padding:6px 8px;border:1px solid var(--color-border)">保護期間</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>著作権</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">文章・プログラム・音楽等</td><td style="padding:5px 8px;border:1px solid var(--color-border)">不要（自動発生）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">死後70年</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>特許権</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">発明（技術的アイデア）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">必要（先願主義）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">出願から20年</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>実用新案権</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">物の形状・構造の工夫</td><td style="padding:5px 8px;border:1px solid var(--color-border)">必要（無審査）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">出願から10年</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>意匠権</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">製品の外観デザイン</td><td style="padding:5px 8px;border:1px solid var(--color-border)">必要</td><td style="padding:5px 8px;border:1px solid var(--color-border)">登録から25年</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>商標権</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">ブランド名・ロゴ</td><td style="padding:5px 8px;border:1px solid var(--color-border)">必要</td><td style="padding:5px 8px;border:1px solid var(--color-border)">10年（更新可）</td></tr>
</table>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
著作権=登録不要・自動発生・死後70年。特許権=登録必要・先願主義・出願から20年。商標権=10年・何度でも更新可能。<br/>
職務著作: 会社の業務で作成したプログラムは原則「会社」が著作者。プログラムも著作物で保護される。<br/>
不正アクセス禁止法: 他人のIDでのログイン・セキュリティホールを突いた侵入は違法（未遂も罰則）。
</div>

<div class="caution-box">
<strong>⚠️ よくある間違い</strong><br/>
「プログラムには著作権がない」は誤りです。プログラムは著作権法で保護される著作物です。また「先に作った人が特許を取れる」も誤りで、特許は<strong>先に出願した人</strong>が取れます（先願主義）。
</div>
        `,
        diagram: 'law',
        questions: [
          {
            id: 32,
            question: '特許権の保護期間として正しいものはどれか。',
            choices: ['5年', '10年', '20年', '70年'],
            answer: 2,
            explanation: '特許権は出願日から20年間保護されます。著作権（死後70年）や商標権（10年・更新可）と区別して覚えましょう。',
          },
          {
            id: 33,
            question: '著作権について正しいものはどれか。',
            choices: [
              '特許庁に登録しないと権利が発生しない',
              '創作した時点で自動的に権利が発生する',
              'プログラムは著作権の保護対象外である',
              '保護期間は著作者の死後30年である',
            ],
            answer: 1,
            explanation: '著作権は創作した時点で自動的に発生します（無方式主義）。プログラムも著作物として保護され、保護期間は死後70年です。',
          },
          {
            id: 903,
            question: '個人情報保護法において、個人情報を第三者に提供する際の原則として正しいものはどれか。',
            choices: [
              '利用目的を公表すれば同意なしに提供できる',
              '本人の同意を得る必要がある',
              '国の機関であれば同意なしに提供できる',
              '氏名を伏せれば同意なしに提供できる',
            ],
            answer: 1,
            explanation: '個人情報を第三者に提供する際は原則として本人の事前同意が必要です（オプトイン方式）。',
          },
          {
            id: 908,
            question: '製品の外観デザインを保護する知的財産権はどれか。',
            choices: ['特許権', '実用新案権', '意匠権', '商標権'],
            answer: 2,
            explanation: '意匠権は製品の外観デザイン（形状・模様・色彩の組み合わせ）を保護する権利です。スマートフォンのUIデザインなども意匠権の対象になりえます。登録から25年間保護されます。',
          },
          {
            id: 909,
            question: '不正アクセス禁止法に違反する行為はどれか。',
            choices: [
              '自分のアカウントでシステムにログインする',
              '他人のIDとパスワードを使って無断でシステムにログインする',
              '公開されているWebページを閲覧する',
              '会社のシステムに割り当てられた自分のアカウントを使用する',
            ],
            answer: 1,
            explanation: '不正アクセス禁止法は他人のIDやパスワードを使った無断ログイン、セキュリティホールを突いたシステムへの侵入などを禁止しています。違反すると3年以下の懲役または100万円以下の罰金（未遂も罰則あり）です。',
          },
        ],
      },
      {
        id: 'a9-4',
        title: 'マーケティング基礎',
        content: `
<h3>マーケティングとは</h3>
<p>「売れる仕組みをつくる」ための活動全般です。製品開発・価格設定・販売チャネル・広告宣伝など、顧客に価値を届けるプロセスを体系的に管理します。</p>

<h3>STP分析（戦略の3ステップ）</h3>
<p>誰に何を売るかを決める、マーケティング戦略の基本フレームワークです。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">ステップ</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">内容</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">例</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>S: セグメンテーション</strong><br/>（市場細分化）</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">市場を年齢・地域・ニーズ・行動などで細分化する</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">「20代女性」「法人中小企業」</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>T: ターゲティング</strong><br/>（標的市場選定）</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">どのセグメントを狙うか絞り込む</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">「都市部の20代女性に特化」</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>P: ポジショニング</strong><br/>（位置付け）</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">競合他社との差別化ポイントを決める</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">「高品質・プレミアム価格帯」</td>
  </tr>
</table>

<h3>マーケティングミックス — 4P と 4C</h3>
<p>4P は企業視点、4C は顧客視点で同じ要素を捉え直したものです。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">4P（企業視点）</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">内容</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">4C（顧客視点）</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Product（製品）</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">何を売るか。品質・機能・デザイン</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">Customer Value（顧客価値）</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Price（価格）</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">いくらで売るか。値引き・支払い方法</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">Cost（顧客コスト）</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Place（流通）</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">どこで売るか。店舗・EC・代理店</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">Convenience（利便性）</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Promotion（プロモーション）</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">どう知らせるか。広告・PR・SNS</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">Communication（コミュニケーション）</td>
  </tr>
</table>

<h3>プロダクトライフサイクル</h3>
<p>製品は市場投入から撤退までの間、4つのフェーズを経るとされます。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">フェーズ</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">特徴</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">戦略の方向</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>導入期</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">売上低・費用大・利益赤字。認知拡大が優先</td><td style="padding:5px 8px;border:1px solid var(--color-border)">広告投資・市場開拓</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>成長期</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">売上急増・競合参入・利益増加</td><td style="padding:5px 8px;border:1px solid var(--color-border)">シェア拡大・差別化</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>成熟期</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">売上ピーク・競争激化・利益率低下</td><td style="padding:5px 8px;border:1px solid var(--color-border)">コスト削減・ブランド維持</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>衰退期</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">売上低下・需要縮小</td><td style="padding:5px 8px;border:1px solid var(--color-border)">撤退・新製品へ移行</td></tr>
</table>
<p>PPM（a9-1）の「花形→金のなる木→負け犬」はプロダクトライフサイクルの「成長期→成熟期→衰退期」に対応します。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
STP: セグメンテーション（細分化）→ターゲティング（選択）→ポジショニング（差別化）の順番を覚える。<br/>
4P: Product・Price・Place・Promotion。4C は顧客視点の対応概念（Customer Value・Cost・Convenience・Communication）。<br/>
プロダクトライフサイクル: 導入期→成長期→成熟期→衰退期。各フェーズで利益・競合・戦略が変化する。
</div>
        `,
        diagram: 'strategy',
        questions: [
          {
            id: 910,
            question: 'STP分析の「T」が表すステップはどれか。',
            choices: [
              '市場を属性・ニーズで細分化する',
              '狙うセグメントを選択する',
              '競合との差別化ポイントを決める',
              '製品の売り方を決める',
            ],
            answer: 1,
            explanation: 'STPのTはTargeting（ターゲティング）で、セグメンテーションで細分化した市場の中から自社が狙うセグメントを選択するステップです。',
          },
          {
            id: 911,
            question: 'マーケティングの4Pのうち「Place」が表すものはどれか。',
            choices: [
              '製品の品質・機能・デザイン',
              '価格設定・値引き・支払い条件',
              '販売チャネル・流通経路・店舗展開',
              '広告・宣伝・PR活動',
            ],
            answer: 2,
            explanation: 'PlaceはProducts（製品）をどこで販売するかの流通チャネルを指します。実店舗・EC・代理店・直販などの選択がPlace戦略です。',
          },
          {
            id: 912,
            question: 'プロダクトライフサイクルの「成長期」の特徴として正しいものはどれか。',
            choices: [
              '売上が低く費用が大きいため赤字になりやすい',
              '売上が急増し競合他社が参入してくる時期',
              '売上がピークに達し競争が最も激しくなる時期',
              '需要が縮小し売上が低下していく時期',
            ],
            answer: 1,
            explanation: '成長期は市場が急拡大して売上が急増する一方、市場の魅力に気づいた競合他社が参入してきます。シェア拡大と差別化が戦略の重点となります。',
          },
        ],
      },
      {
        id: 'a9-5',
        title: '財務・会計基礎',
        content: `
<h3>なぜ財務知識が必要か</h3>
<p>ITプロジェクトの投資判断、システム導入効果の測定、予算管理には財務の基礎知識が欠かせません。FE試験でも ROI・損益分岐点・TCO などの計算問題が出題されます。</p>

<h3>ROI（投資対効果）</h3>
<p>投資した資金に対してどれだけの利益が得られたかを示す指標です。</p>
<pre>
ROI（%） = 利益 ÷ 投資額 × 100

【例】 1,000万円のシステムを導入し、年間200万円のコスト削減
ROI = 200 ÷ 1,000 × 100 = 20%

投資回収期間 = 投資額 ÷ 年間利益（削減額）
            = 1,000 ÷ 200 = 5年
</pre>
<p>ROIが高いほど投資効率が良い。複数の投資案件を比較するときに使います。</p>

<h3>TCO（Total Cost of Ownership：総所有コスト）</h3>
<p>システムの<strong>初期費用だけでなく、導入から廃棄までの総コスト</strong>を考える概念です。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">費用の種類</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">具体例</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>初期費用</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">ハードウェア購入費・ソフトウェアライセンス・導入工事費・初期教育費</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>運用費用</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">保守・サポート契約費・電気代・人件費・アップグレード費・トレーニング費</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>廃棄費用</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">データ消去費・廃棄処分費・移行費用</td></tr>
</table>
<p>TCO = 初期費用 + 運用費用の合計 + 廃棄費用</p>
<p>「安いクラウドサービス」でも、移行コストや教育費を含めると高くなることがあります。意思決定には必ずTCOで比較します。</p>

<h3>損益計算書（P/L）の基本構造</h3>
<pre>
売上高
　- 売上原価（仕入れ・製造コスト）
= 売上総利益（粗利）

売上総利益
　- 販売費及び一般管理費（人件費・広告費等）
= 営業利益

営業利益
　+ 営業外収益（受取利息等）
　- 営業外費用（支払利息等）
= 経常利益
</pre>

<h3>損益分岐点（BEP: Break Even Point）</h3>
<p>利益も損失も出ない「収支ゼロ」の売上高のことです。これを超えると利益が出始めます。</p>
<pre>
損益分岐点売上高 = 固定費 ÷ (1 − 変動費率)

変動費率 = 変動費 ÷ 売上高

【例】 固定費300万、変動費率60%（売上の60%がコスト）
損益分岐点 = 300 ÷ (1 − 0.6) = 300 ÷ 0.4 = 750万円
→ 750万以上売れれば黒字、未満は赤字
</pre>
<ul>
  <li><strong>固定費</strong>: 売上に関係なく発生するコスト（家賃・人件費・減価償却費）</li>
  <li><strong>変動費</strong>: 売上に比例して増減するコスト（材料費・仕入れ費）</li>
</ul>

<h3>財務指標まとめ</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">指標</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">計算式</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">意味</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>ROI</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">利益 ÷ 投資額 × 100</td><td style="padding:5px 8px;border:1px solid var(--color-border)">投資効率（高いほど良い）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>TCO</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">初期費用 + 運用費用 + 廃棄費用</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ライフサイクル全体のコスト</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>損益分岐点</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">固定費 ÷ (1 − 変動費率)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">黒字になる最低売上高</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>粗利率</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">売上総利益 ÷ 売上高 × 100</td><td style="padding:5px 8px;border:1px solid var(--color-border)">製品の利益率</td></tr>
</table>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
ROI = 利益 ÷ 投資額 × 100（投資効率の指標）。投資回収期間 = 投資額 ÷ 年間利益。<br/>
TCO = 初期費用だけでなく運用・廃棄費用も含めたライフサイクル全体のコスト。<br/>
損益分岐点 = 固定費 ÷ (1 − 変動費率)。固定費÷変動費率ではないことに注意。
</div>
        `,
        diagram: 'strategy',
        questions: [
          {
            id: 913,
            question: '500万円の投資で年間100万円のコスト削減が得られる場合、ROIはいくつか。',
            choices: ['5%', '10%', '20%', '50%'],
            answer: 2,
            explanation: 'ROI = 利益 ÷ 投資額 × 100 = 100 ÷ 500 × 100 = 20% です。投資回収期間は 500 ÷ 100 = 5年となります。',
          },
          {
            id: 914,
            question: 'TCO（総所有コスト）の説明として正しいものはどれか。',
            choices: [
              'システムの初期購入費用のみを指す',
              '初期費用に年間保守費用を加えた2年分のコスト',
              '初期費用から廃棄費用まで、ライフサイクル全体を通じた総コスト',
              'クラウドサービスの利用料金の合計',
            ],
            answer: 2,
            explanation: 'TCOは初期費用（購入・導入）＋運用費用（保守・電力・人件費）＋廃棄費用の合計です。初期費用が安くても運用コストが高ければTCOは大きくなります。',
          },
          {
            id: 915,
            question: '固定費が400万円、変動費率が50%のとき、損益分岐点売上高はいくつか。',
            choices: ['400万円', '600万円', '800万円', '1,200万円'],
            answer: 2,
            explanation: '損益分岐点 = 固定費 ÷ (1 − 変動費率) = 400 ÷ (1 − 0.5) = 400 ÷ 0.5 = 800万円です。',
          },
        ],
      },
      {
        id: 'a9-6',
        title: 'OR・IE手法（経営工学）',
        content: `
<h3>OR（Operations Research）とは</h3>
<p>数学的・統計的手法を用いて、経営上の意思決定を<strong>科学的に最適化</strong>する学問分野です。「最小のコストで最大の効果」を追求します。</p>

<h3>ABC分析（頻出！）</h3>
<p>商品・顧客・在庫などを<strong>重要度順に A・B・C の3ランクに分類</strong>する手法です。パレートの法則（80:20の法則）に基づいています。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">ランク</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">対象</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">売上構成比（目安）</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">管理方針</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>A（重点品目）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">上位 約20% の品目</td><td style="padding:5px 8px;border:1px solid var(--color-border)">全体の約80%</td><td style="padding:5px 8px;border:1px solid var(--color-border)">重点管理・在庫を多く確保</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>B（準重点品目）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">中位 約30% の品目</td><td style="padding:5px 8px;border:1px solid var(--color-border)">全体の約15%</td><td style="padding:5px 8px;border:1px solid var(--color-border)">通常管理</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>C（一般品目）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">下位 約50% の品目</td><td style="padding:5px 8px;border:1px solid var(--color-border)">全体の約5%</td><td style="padding:5px 8px;border:1px solid var(--color-border)">簡易管理・在庫を絞る</td></tr>
</table>
<p>パレート図（a8-2 QC7つ道具）と組み合わせて使われます。「全体の20%の品目が80%の売上を生む」という法則を活用した優先度管理です。</p>

<h3>線形計画法</h3>
<p>製品の生産量・資源の配分など、<strong>制約条件の下で目的関数（利益・コスト）を最大化/最小化</strong>する数学的手法です。</p>
<pre>
【例題】 製品AとBを生産する。
  ・製品A: 利益3万円、材料2kg、工数3時間 が必要
  ・製品B: 利益5万円、材料4kg、工数2時間 が必要
  ・材料の上限: 20kg
  ・工数の上限: 18時間
  ・A=x個、B=y個 生産するとき利益を最大化せよ

目的関数: 最大化 Z = 3x + 5y
制約条件: 2x + 4y ≤ 20（材料）
          3x + 2y ≤ 18（工数）
          x ≥ 0, y ≥ 0

グラフ法: 実行可能領域の頂点 (0,5), (4,3), (6,0) で Z を計算
  (0,5): Z = 0+25 = 25
  (4,3): Z = 12+15 = 27 ← 最大！
  (6,0): Z = 18+0 = 18
→ A=4個、B=3個 生産するとき最大利益27万円
</pre>

<h3>在庫管理（発注点・安全在庫）</h3>
<p>在庫管理では「いつ・いくつ発注するか」が重要です。</p>
<ul>
  <li><strong>発注点（ROP: Reorder Point）</strong>: この在庫量になったら発注する水準。<br/>発注点 = リードタイム中の需要量 + 安全在庫</li>
  <li><strong>安全在庫</strong>: 需要の変動や配送遅延に備えた緩衝在庫</li>
  <li><strong>リードタイム</strong>: 発注してから入荷するまでの期間</li>
</ul>
<pre>
【例】 1日平均10個売れる商品、リードタイム3日、安全在庫20個の場合
発注点 = 10 × 3 + 20 = 50個
→ 在庫が50個になったら発注する
</pre>

<h3>モンテカルロ法</h3>
<p>乱数を大量に使って確率的なシミュレーションを行う手法です。</p>
<p>例: 円の面積計算（円周率πの近似）</p>
<pre>
1辺=1の正方形にランダムに点を打つ
円内に入った点 ÷ 全点数 ≈ 円の面積 ÷ 正方形の面積 = π/4
→ 試行回数が多いほど π/4 に近づく
</pre>
<p>金融リスク評価・物流シミュレーション・工程計画に活用されます。</p>

<h3>IE（Industrial Engineering）手法</h3>
<p>作業の効率化・改善を目的とした手法群です。</p>
<ul>
  <li><strong>動作研究</strong>: 作業動作を分析して無駄な動きを排除する</li>
  <li><strong>時間研究</strong>: 各作業にかかる時間を計測・標準化する</li>
  <li><strong>稼働分析（ワークサンプリング）</strong>: 無作為な時点に観測して作業比率を推定する</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
ABC分析: Aが品目数の上位20%で売上の80%を占める（パレートの法則）。重点管理はA品目に集中。<br/>
線形計画法: 目的関数を制約条件の下で最大/最小化。グラフ法では実行可能領域の頂点が最適解。<br/>
発注点 = リードタイム中の需要量 + 安全在庫。モンテカルロ法 = 乱数を使ったシミュレーション。
</div>
        `,
        diagram: 'strategy',
        questions: [
          {
            id: 916,
            question: 'ABC分析で「Aランク」に分類される品目の説明として正しいものはどれか。',
            choices: [
              '品目数は多いが売上全体への貢献度が低い品目',
              '品目数は少ないが売上全体の大部分を占める重要品目',
              '在庫管理コストが最も高い品目',
              '販売数量が最も少ない品目',
            ],
            answer: 1,
            explanation: 'ABC分析のAランクは品目数の上位約20%でありながら売上全体の約80%を占める重要品目です。パレートの法則（80:20の法則）に基づいており、重点的に在庫管理・販売促進を行います。',
          },
          {
            id: 917,
            question: '線形計画法の説明として正しいものはどれか。',
            choices: [
              '過去のデータから将来の売上を統計的に予測する手法',
              '制約条件の下で目的関数（利益・コストなど）を最大化または最小化する数学的手法',
              '在庫の発注タイミングを自動的に決定するアルゴリズム',
              '乱数を用いて確率的事象をシミュレーションする手法',
            ],
            answer: 1,
            explanation: '線形計画法は、材料・人員・時間などの制約条件の下で、利益最大化やコスト最小化などの目的関数を最適化する数学的手法です。製造・物流・資源配分などに活用されます。',
          },
          {
            id: 918,
            question: '1日平均20個売れる商品のリードタイムが5日、安全在庫が30個のとき、発注点はいくつか。',
            choices: ['70個', '100個', '130個', '150個'],
            answer: 2,
            explanation: '発注点 = リードタイム中の需要量 + 安全在庫 = 20×5 + 30 = 100 + 30 = 130個です。在庫が130個になった時点で発注します。',
          },
        ],
      },
    ],
  },
  {
    id: 'b3',
    title: '再帰・木・グラフ',
    subject: 'B',
    description: '再帰アルゴリズム・木構造のトラバーサル・グラフ探索（BFS/DFS）を擬似コードで徹底解説します。',
    sections: [
      {
        id: 'b3-1',
        title: '再帰アルゴリズム',
        content: `
<h3>再帰とは</h3>
<p>関数が<strong>自分自身を呼び出す</strong>プログラミング技法です。問題を同じ構造の小さな問題に分割できるとき有効です。</p>
<p>必ず2つの要素が必要です：</p>
<ol>
  <li><strong>基底条件</strong>: これ以上再帰しない終了条件</li>
  <li><strong>再帰ステップ</strong>: 自分自身を呼び出して問題を小さくする処理</li>
</ol>

<h3>階乗の計算（再帰）</h3>
<pre>
関数 階乗(n):
    もし n = 0 または n = 1 なら:
        1 を返す            // 基底条件
    そうでなければ:
        n × 階乗(n - 1) を返す  // 再帰ステップ

// 実行トレース: 階乗(4)
// = 4 × 階乗(3)
// = 4 × 3 × 階乗(2)
// = 4 × 3 × 2 × 階乗(1)
// = 4 × 3 × 2 × 1 = 24
</pre>

<h3>フィボナッチ数列</h3>
<pre>
関数 フィボナッチ(n):
    もし n <= 1 なら:
        n を返す
    そうでなければ:
        フィボナッチ(n-1) + フィボナッチ(n-2) を返す

// F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8...
</pre>

<h3>再帰とスタックの関係</h3>
<p>関数呼び出しは内部的にスタックを使います。再帰が深すぎると<strong>スタックオーバーフロー</strong>が発生します。メモ化（計算済み結果のキャッシュ）で重複計算を避けられます。</p>

<h3>分割統治法</h3>
<p>問題を小さなサブ問題に分割して解き、結果を統合する手法です。マージソート・クイックソートが代表例です。</p>
<pre>
関数 マージソート(配列):
    もし 配列の長さ <= 1 なら:
        配列を返す
    中央 ← 配列の長さ ÷ 2
    左 ← マージソート(配列の前半)
    右 ← マージソート(配列の後半)
    マージ(左, 右) を返す   // 計算量: O(n log n)
</pre>

<h3>メモ化（Memoization）</h3>
<p>計算済みの結果をキャッシュしておき、同じ入力に対する再計算を省略する最適化技法です。再帰とよく組み合わせます。</p>
<pre>
// フィボナッチのメモ化（重複計算を排除）
メモ ← 空の辞書

関数 フィボナッチ(n):
    もし n <= 1 なら:
        n を返す
    もし メモ[n] が存在するなら:
        メモ[n] を返す      // キャッシュヒット
    メモ[n] ← フィボナッチ(n-1) + フィボナッチ(n-2)
    メモ[n] を返す

// メモ化なし: F(5) で約15回呼び出し
// メモ化あり: F(5) で9回まで削減
</pre>
        `,
        diagram: 'recursion',
        questions: [
          {
            id: 34,
            question: '再帰関数において無限ループを防ぐために必要なものはどれか。',
            choices: ['ループ変数', '基底条件', '配列', 'スタック'],
            answer: 1,
            explanation: '再帰関数には必ず基底条件（再帰呼び出しを終了させる条件）が必要です。これがないと無限に自分を呼び出し続けます。',
          },
          {
            id: 35,
            question: '階乗(3) の計算結果はどれか（上記の再帰関数を使用）。',
            choices: ['3', '6', '9', '12'],
            answer: 1,
            explanation: '3! = 3 × 2 × 1 = 6 です。',
          },
          {
            id: 1015,
            question: 'マージソートの平均計算量はどれか。',
            choices: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
            answer: 1,
            explanation: 'マージソートは分割統治法を使い、分割にO(log n)回、各段階でO(n)の結合処理を行うためO(n log n)です。',
          },
          {
            id: 1034,
            question: 'フィボナッチ数列 F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2) で F(5) の値はどれか。',
            choices: ['3', '4', '5', '8'],
            answer: 2,
            explanation: 'F(2)=1, F(3)=2, F(4)=3, F(5)=5。F(5)=F(4)+F(3)=3+2=5 です。',
          },
          {
            id: 1035,
            question: 'メモ化（Memoization）の目的として正しいものはどれか。',
            choices: [
              '再帰を繰り返し（ループ）に変換する',
              '計算済みの結果をキャッシュして重複計算を省く',
              '基底条件を不要にする',
              'スタックオーバーフローを解消する',
            ],
            answer: 1,
            explanation: 'メモ化は同じ入力に対する計算結果を辞書に保存し、次に同じ入力が来たらキャッシュから返すことで重複計算を省く最適化技法です。',
          },
        ],
      },
      {
        id: 'b3-2',
        title: '木構造のトラバーサル',
        content: `
<h3>木（ツリー）構造の用語</h3>
<ul>
  <li><strong>根（ルート）</strong>: 最上位ノード。親を持たない。</li>
  <li><strong>葉（リーフ）</strong>: 子を持たないノード。末端。</li>
  <li><strong>高さ</strong>: ルートから最遠リーフまでの距離</li>
  <li><strong>深さ</strong>: ルートから各ノードまでの距離</li>
  <li><strong>次数</strong>: ノードの子の数（二分木は最大2）</li>
  <li><strong>完全二分木</strong>: 最下層以外すべて埋まっており、最下層は左詰めの二分木</li>
</ul>

<h3>二分探索木（BST）</h3>
<p>各ノードで <code>左の子 &lt; 親 &lt; 右の子</code> を保つ木です。探索・挿入・削除がO(log n)（平衡時）。</p>
<pre>
// 挿入の例：3, 1, 5 をBSTに挿入
// 最初に3を挿入 → ルート
//       3
// 1を挿入（3より小さい → 左）
//       3
//      /
//     1
// 5を挿入（3より大きい → 右）
//       3
//      / \\
//     1   5
</pre>
<p>※ 挿入順によっては木が一直線になり（偏り）、最悪でO(n)になることがあります。</p>

<h3>平衡木（バランス木）</h3>
<p>BSTが偏ると探索がO(n)に劣化します。これを防ぐために自動的にバランスを取り直す木構造が平衡木です。</p>
<ul>
  <li><strong>AVL木</strong>: 各ノードの左右の高さの差を±1以内に保つ。回転操作で再バランスする。</li>
  <li><strong>赤黒木</strong>: ノードに色（赤・黒）を付けてバランスを保つ。JavaのTreeMap等に使われる。</li>
  <li><strong>B木</strong>: 1ノードに複数のキーを持てる木。ディスクI/O最適化のためDBのインデックスに使われる。</li>
</ul>
<p>いずれも探索・挿入・削除を<strong>O(log n)に保証</strong>します。</p>

<h3>ヒープ（Heap）</h3>
<p><strong>完全二分木</strong>で、親ノードが常に子ノードより小さい（最小ヒープ）または大きい（最大ヒープ）性質を持つデータ構造です。</p>
<ul>
  <li><strong>最小ヒープ</strong>: 根が最小値。取り出し・挿入ともにO(log n)。</li>
  <li><strong>最大ヒープ</strong>: 根が最大値。</li>
  <li><strong>用途</strong>: 優先度付きキュー（最小/最大を高速に取り出したい場面）・ヒープソート</li>
</ul>
<pre>
// 最小ヒープの例（親 <= 子を常に保つ）
//         1        ← 最小値が常にルートにある
//        / \\
//       3   2
//      / \\
//     5   4
// 取り出し: 根(1)を取り出す → O(log n)で再ヒープ化
</pre>

<h3>木の3種の走査（トラバーサル）</h3>
<pre>
// 前順（プレオーダー）: 親 → 左 → 右
前順(ノード):
    ノードの値を表示
    前順(左の子)
    前順(右の子)

// 中順（インオーダー）: 左 → 親 → 右
中順(ノード):
    中順(左の子)
    ノードの値を表示    // ← BST では昇順になる
    中順(右の子)

// 後順（ポストオーダー）: 左 → 右 → 親
後順(ノード):
    後順(左の子)
    後順(右の子)
    ノードの値を表示    // ← 葉から処理（ファイル削除などに向く）
</pre>
<p>BST <code>8-3-10-1-6-14-4-7</code> の中順: <strong>1, 3, 4, 6, 7, 8, 10, 14</strong>（昇順）</p>

<h3>前順（プレオーダー）トラバーサルの例</h3>
<pre>
//          5
//         / \\
//        3   7
//       / \\   \\
//      1   4   9

前順（親→左→右）の訪問順: 5 → 3 → 1 → 4 → 7 → 9
中順（左→親→右）の訪問順: 1 → 3 → 4 → 5 → 7 → 9（昇順！）
後順（左→右→親）の訪問順: 1 → 4 → 3 → 9 → 7 → 5
</pre>
        `,
        diagram: 'tree',
        questions: [
          {
            id: 36,
            question: '二分探索木において、あるノードの左の子の値はどれか。',
            choices: ['親ノードより大きい', '親ノードより小さい', '親ノードと等しい', '任意の値'],
            answer: 1,
            explanation: '二分探索木では「左の子 < 親 < 右の子」の規則があります。この性質により効率的な検索が可能です。',
          },
          {
            id: 1016,
            question: '二分探索木を中順（インオーダー）でトラバーサルした結果はどれか。',
            choices: ['ランダムな順序', '降順（大きい順）', '昇順（小さい順）', '挿入順'],
            answer: 2,
            explanation: '二分探索木を中順（左→親→右）でトラバーサルすると必ず昇順にノードの値が並びます。',
          },
          {
            id: 1036,
            question: '次の二分木を前順（プレオーダー）でトラバーサルしたとき、最初に訪問されるノードはどれか。\n\n     5\n    / \\\n   3   7\n  / \\\n 1   4',
            choices: ['1', '3', '5', '7'],
            answer: 2,
            explanation: '前順は「親→左→右」の順に訪問します。最初に訪問するのはルートノード（5）です。',
          },
          {
            id: 1037,
            question: '二分探索木に値 6, 3, 8, 1, 5 の順に挿入したとき、中順トラバーサルの結果はどれか。',
            choices: ['6, 3, 8, 1, 5', '1, 3, 5, 6, 8', '6, 8, 3, 5, 1', '1, 5, 3, 8, 6'],
            answer: 1,
            explanation: '二分探索木を中順トラバーサルすると昇順になります。1, 3, 5, 6, 8 が正解です。挿入順に関わらず中順は常に昇順になります。',
          },
        ],
      },
      {
        id: 'b3-3',
        title: 'グラフ探索（BFS・DFS）',
        content: `
<h3>グラフとは</h3>
<p>ノード（頂点）とエッジ（辺）で構成されるデータ構造です。SNSの人間関係・地図の道路・ネットワーク経路など様々な問題をモデル化できます。</p>
<ul>
  <li><strong>有向グラフ</strong>: エッジに向きがある（一方通行。Twitterのフォロー関係など）</li>
  <li><strong>無向グラフ</strong>: エッジに向きがない（双方向。友人関係など）</li>
  <li><strong>重み付きグラフ</strong>: エッジに距離やコストが付いている（地図の道路距離など）</li>
</ul>

<h3>グラフの表現方法</h3>
<p>グラフをプログラムで表現する方法は主に2つあります。</p>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">方法</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">仕組み</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">エッジ確認</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">メモリ</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">向き</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>隣接行列</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">N×Nの2次元配列。A[i][j]=1ならエッジあり</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(1)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(N²)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">密なグラフ向き</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>隣接リスト</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">各ノードの隣接ノードリストを保持</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(次数)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">O(N+E)</td><td style="padding:5px 8px;border:1px solid var(--color-border)">疎なグラフ向き</td></tr>
</table>
<pre>
// グラフ例: 1—2—3、1—3
//
// 隣接行列（3×3）:        隣接リスト:
//   1 2 3                  1: [2, 3]
// 1[0,1,1]                 2: [1, 3]
// 2[1,0,1]                 3: [2, 1]
// 3[1,1,0]
</pre>

<h3>BFS（幅優先探索）の具体例</h3>
<p>グラフ: 1—2—4、1—3—4（1から4への最短ルート探索）</p>
<pre>
// BFS の探索順（キューを使う）
開始: キュー=[1], 訪問済み={1}

ステップ1: 1を取り出す → 隣接: 2, 3 をキューに追加
  キュー=[2, 3], 訪問済み={1,2,3}

ステップ2: 2を取り出す → 隣接: 4 をキューに追加
  キュー=[3, 4], 訪問済み={1,2,3,4}

ステップ3: 3を取り出す → 隣接: 4 は訪問済みのためスキップ
ステップ4: 4を取り出す → ゴール到達！

訪問順: 1 → 2 → 3 → 4（幅=レベル順に訪問）
最短ルート: 1→2→4（2ステップ）
</pre>

<h3>BFS（幅優先探索）</h3>
<p><strong>キュー</strong>を使い、近いノードから順に探索します。最短経路の発見に使います。</p>
<pre>
関数 BFS(開始ノード):
    キュー ← [開始ノード]
    訪問済み ← {開始ノード}

    キューが空でない間 繰り返す:
        現在 ← キューから取り出す
        現在を処理する

        現在の隣接ノード の各 隣接 に対して:
            もし 隣接 が 訪問済みでない なら:
                訪問済みに 隣接 を追加
                キューに 隣接 を追加
</pre>

<h3>DFS（深さ優先探索）</h3>
<p><strong>スタック</strong>（または再帰）を使い、行けるところまで深く進んでから戻ります。迷路・連結成分・トポロジカルソートに使います。</p>
<pre>
関数 DFS(ノード, 訪問済み):
    訪問済みに ノード を追加
    ノードを処理する

    ノードの隣接ノード の各 隣接 に対して:
        もし 隣接 が 訪問済みでない なら:
            DFS(隣接, 訪問済み)
</pre>

<h3>BFS vs DFS の使い分け</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff"><th style="padding:6px 8px;border:1px solid var(--color-border)">項目</th><th style="padding:6px 8px;border:1px solid var(--color-border)">BFS（幅優先）</th><th style="padding:6px 8px;border:1px solid var(--color-border)">DFS（深さ優先）</th></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">使うデータ構造</td><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>キュー</strong>（FIFO）</td><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>スタック</strong>（または再帰）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">探索の向き</td><td style="padding:5px 8px;border:1px solid var(--color-border)">近い順（横方向）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">深い方向（縦方向）</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)">主な用途</td><td style="padding:5px 8px;border:1px solid var(--color-border)">最短経路・レベル順処理</td><td style="padding:5px 8px;border:1px solid var(--color-border)">迷路・連結成分・トポロジカルソート</td></tr>
</table>
        `,
        diagram: 'graph',
        questions: [
          {
            id: 37,
            question: '最短経路を求める際に適した探索アルゴリズムはどれか。',
            choices: ['DFS（深さ優先探索）', 'BFS（幅優先探索）', 'バブルソート', '二分探索'],
            answer: 1,
            explanation: 'BFS（幅優先探索）は近いノードから順に探索するため、重みなしグラフでの最短経路発見に適しています。',
          },
          {
            id: 1017,
            question: 'BFS（幅優先探索）で使用するデータ構造はどれか。',
            choices: ['スタック', 'キュー', '配列', '二分木'],
            answer: 1,
            explanation: 'BFSはキュー（FIFO）を使って近いノードから順番に処理します。DFSはスタック（または再帰）を使います。',
          },
          {
            id: 1038,
            question: 'DFS（深さ優先探索）を反復（ループ）で実装する場合に使うデータ構造はどれか。',
            choices: ['キュー', 'スタック', '優先度キュー', '配列'],
            answer: 1,
            explanation: 'DFSを反復で実装する場合はスタック（LIFO）を使います。再帰実装では関数呼び出しスタックが暗黙的に使われます。BFSはキューを使う点と対比して覚えましょう。',
          },
          {
            id: 1039,
            question: 'グラフを隣接行列で表現したとき、頂点iから頂点jへのエッジが存在するかどうかの確認に必要な時間計算量はどれか。',
            choices: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
            answer: 2,
            explanation: '隣接行列は2次元配列 A[i][j] でエッジの有無を表します。A[i][j]を参照するだけなのでO(1)です。隣接リストはO(次数)かかる点と対比して覚えましょう。',
          },
        ],
      },
      {
        id: 'b3-4',
        title: '動的計画法・最短経路',
        content: `
<h3>動的計画法（Dynamic Programming: DP）とは</h3>
<p>問題を<strong>重複するサブ問題</strong>に分割し、各サブ問題の解を表（テーブル）に記録しながら解く手法です。「記憶しながら解く」のが特徴で、再帰+メモ化と本質的に同じです。</p>
<p>適用条件：</p>
<ol>
  <li><strong>最適部分構造</strong>: 問題の最適解がサブ問題の最適解から構成できる</li>
  <li><strong>重複部分問題</strong>: 同じサブ問題が複数回登場する</li>
</ol>

<h3>DP の基本パターン：フィボナッチ数列</h3>
<pre>
// 再帰では F(5) の計算で F(3) が2回、F(2) が3回呼ばれる（無駄）
// DP（ボトムアップ）では表に順番に埋めていく

dp[0] ← 0
dp[1] ← 1
i を 2 から n まで繰り返す:
    dp[i] ← dp[i-1] + dp[i-2]
dp[n] を返す

// F(5) の計算例
// dp = [0, 1, 1, 2, 3, 5]
// 計算量: O(n)、空間: O(n)
</pre>

<h3>0/1ナップサック問題</h3>
<p>重さと価値を持つ n 個のアイテムを、重量上限 W のナップサックに詰める問題（各アイテムは0個か1個のみ選択可）。</p>
<pre>
// dp[i][w] = 最初のi個のアイテムから重さw以内で選んだときの最大価値
アイテム: [(重さ2, 価値3), (重さ3, 価値4), (重さ4, 価値5)]
重量上限 W = 5

dp[0][w] ← 0  // アイテム0個のとき価値0

i を 1 から n まで繰り返す:
    w を 0 から W まで繰り返す:
        もし items[i].重さ > w なら:
            dp[i][w] ← dp[i-1][w]  // このアイテムは入らない
        そうでなければ:
            dp[i][w] ← max(dp[i-1][w],                          // 入れない
                           dp[i-1][w - items[i].重さ] + items[i].価値) // 入れる

// dp[3][5] = 7  (重さ2の価値3 + 重さ3の価値4 = 合計重さ5, 価値7)
// 計算量: O(n × W)
</pre>

<h3>最長共通部分列（LCS）</h3>
<p>2つの文字列に共通して現れる最長の部分列（連続でなくてもよい）を求める問題。</p>
<pre>
// 文字列 X="ABCB", Y="BDCAB" の LCS は "BCB" (長さ3)

dp[i][j] = X[1..i] と Y[1..j] の LCS の長さ

i を 1 から |X| まで繰り返す:
    j を 1 から |Y| まで繰り返す:
        もし X[i] = Y[j] なら:
            dp[i][j] ← dp[i-1][j-1] + 1  // 文字が一致
        そうでなければ:
            dp[i][j] ← max(dp[i-1][j], dp[i][j-1])

// 計算量: O(|X| × |Y|)
</pre>

<h3>ダイクストラ法（最短経路）</h3>
<p>重み付きグラフで、1つの始点から全頂点への最短経路を求めるアルゴリズム。<strong>負の重みは使えない</strong>点に注意。</p>
<pre>
関数 ダイクストラ(グラフ, 始点):
    dist ← 全頂点を∞で初期化, dist[始点] ← 0
    未確定頂点の集合 ← 全頂点

    未確定頂点が空になるまで繰り返す:
        u ← 未確定頂点の中で dist が最小の頂点
        未確定頂点から u を削除

        u の各隣接頂点 v に対して:
            もし dist[u] + 辺(u,v)の重み < dist[v] なら:
                dist[v] ← dist[u] + 辺(u,v)の重み  // 距離を更新

    dist を返す

// 優先度キュー（ヒープ）を使うと O((V + E) log V)
</pre>

<h3>DP vs 貪欲法</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">手法</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">考え方</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">保証</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">代表例</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>DP</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">全パターンを表に記録して最適解を求める</td><td style="padding:5px 8px;border:1px solid var(--color-border)">最適解を保証</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ナップサック・LCS</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>貪欲法</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">各ステップで局所最適な選択をする</td><td style="padding:5px 8px;border:1px solid var(--color-border)">問題によっては最適解を保証しない</td><td style="padding:5px 8px;border:1px solid var(--color-border)">コイン問題・クラスカル法</td></tr>
</table>
        `,
        questions: [
          {
            id: 1066,
            question: '動的計画法（DP）の適用条件として正しいものを2つ選んだ組み合わせはどれか。',
            choices: [
              '最適部分構造と重複部分問題が存在する',
              '問題の解が一意に決まる',
              '全探索より必ず遅い',
              '負の重みを持つグラフにも必ず適用できる',
            ],
            answer: 0,
            explanation: '動的計画法の適用には「最適部分構造（サブ問題の最適解から全体の最適解が構成できる）」と「重複部分問題（同じサブ問題が複数回登場する）」の2条件が必要です。全探索より高速であることがDPの利点です。',
          },
          {
            id: 1067,
            question: 'ナップサック問題（0/1型）をDPで解くとき、dp[i][w]が表す意味として正しいものはどれか。',
            choices: [
              'i番目のアイテムの価値',
              '最初のi個のアイテムから重さw以内で選んだときの最大価値',
              'i番目のアイテムを必ず入れたときの重さw以内の最大価値',
              '重さw以下のアイテムの個数',
            ],
            answer: 1,
            explanation: 'dp[i][w]は「最初のi個のアイテムの中から、合計重量w以内で選んだときに得られる最大の価値」を表します。この定義からi番目のアイテムを「入れる」か「入れない」かの選択をDP遷移として記述します。',
          },
          {
            id: 1068,
            question: 'フィボナッチ数列をDPで計算したとき（F(0)=0, F(1)=1）、F(6)の値はどれか。',
            choices: ['6', '7', '8', '13'],
            answer: 2,
            explanation: 'F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8 です。DPでは表に順番に値を埋めていくため、F(5)+F(4)=5+3=8 と計算できます。',
          },
          {
            id: 1069,
            question: 'ダイクストラ法で解決できる問題として正しいものはどれか。',
            choices: [
              '負の重みを含むグラフでの最短経路',
              '重み付きグラフ（非負の重み）での最短経路',
              'グラフの連結成分の個数',
              'グラフのトポロジカルソート',
            ],
            answer: 1,
            explanation: 'ダイクストラ法は非負の重みを持つグラフで、単一始点から全頂点への最短経路を求めます。負の重みがあるとベルマンフォード法を使います。グラフの連結成分はDFS/BFS、トポロジカルソートはDAGのDFSで求めます。',
          },
          {
            id: 1070,
            question: '優先度キュー（ヒープ）を使ったダイクストラ法の時間計算量はどれか（V=頂点数、E=辺数）。',
            choices: ['O(V²)', 'O(V × E)', 'O((V + E) log V)', 'O(E log E)'],
            answer: 2,
            explanation: '優先度キュー（ヒープ）を使ったダイクストラ法の計算量はO((V + E) log V)です。単純な配列で実装するとO(V²)です。辺の数が少ない疎なグラフではヒープを使った実装が有利です。',
          },
        ],
      },
    ],
  },
  {
    id: 'b4',
    title: 'オブジェクト指向',
    subject: 'B',
    description: 'クラス・カプセル化・継承・ポリモーフィズム・抽象クラス・デザインパターンを擬似コードで学びます。',
    sections: [
      {
        id: 'b4-1',
        title: 'クラスとカプセル化',
        content: `
<h3>オブジェクト指向の4大原則</h3>
<ol>
  <li><strong>カプセル化</strong>: データとメソッドをひとまとめにし、内部を外部から隠蔽する</li>
  <li><strong>継承（インヘリタンス）</strong>: 既存クラスの機能を引き継いで拡張する</li>
  <li><strong>ポリモーフィズム（多態性）</strong>: 同じ操作を異なる型で統一的に扱う</li>
  <li><strong>抽象化</strong>: 共通の特徴を抽出して汎用的に定義する</li>
</ol>

<h3>クラスとインスタンス</h3>
<p><strong>クラス</strong>は属性（データ）とメソッド（操作）を定義した<strong>設計図</strong>です。<strong>インスタンス</strong>はその設計図から実際に作られた<strong>実体</strong>です。</p>
<p>例: 「犬」クラスという設計図から「ポチ（柴犬・3歳）」「タロウ（ゴールデン・5歳）」という個別のインスタンスを生成する。</p>
<pre>
クラス 銀行口座:
    属性:
        残高（プライベート）: 整数    // 外部から直接変更不可
        口座番号（パブリック）: 文字列

    // コンストラクタ: インスタンス生成時に自動的に呼ばれる初期化メソッド
    コンストラクタ(口座番号, 初期残高):
        自身.口座番号 ← 口座番号
        自身.残高 ← 初期残高

    // メソッド: 残高を安全に操作する（バリデーション付き）
    メソッド 入金(金額):
        もし 金額 <= 0 なら:
            エラー("金額は正の数にしてください")
        自身.残高 ← 自身.残高 + 金額

    メソッド 出金(金額):
        もし 金額 > 自身.残高 なら:
            エラー("残高不足")
        自身.残高 ← 自身.残高 - 金額

    // getter: privateな残高を安全に読み取るためのメソッド
    メソッド 残高を取得():
        自身.残高 を返す

// 使い方: インスタンスを生成して操作
口座A ← 銀行口座.新規作成("12345", 10000)
口座A.入金(5000)
口座A.出金(3000)
表示する(口座A.残高を取得())   // → 12000

// 残高に直接アクセスしようとするとエラー（カプセル化）
// 口座A.残高 ← -999999  ← privateなのでできない！
</pre>

<h3>カプセル化のメリット</h3>
<p>「残高」を private にすることで、不正な操作（マイナス値の代入など）を防げます。外部からは必ずメソッドを通じてのみアクセスさせることで、データの<strong>整合性を保証</strong>できます。</p>
<ul>
  <li><strong>データ保護</strong>: 外部から直接変更されることで不正な値が入るのを防ぐ</li>
  <li><strong>変更の局所化</strong>: 内部実装を変えても外部インタフェースが同じなら呼び出し側を変える必要がない</li>
  <li><strong>バリデーション</strong>: setter/メソッド内で値の検証ができる</li>
</ul>

<h3>アクセス修飾子</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 10px;border:1px solid var(--color-border)">修飾子</th>
    <th style="padding:6px 10px;border:1px solid var(--color-border)">アクセス可能な範囲</th>
    <th style="padding:6px 10px;border:1px solid var(--color-border)">用途</th>
  </tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>public</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">どこからでも可</td><td style="padding:5px 10px;border:1px solid var(--color-border)">外部に公開するメソッド</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>private</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">クラス内部のみ</td><td style="padding:5px 10px;border:1px solid var(--color-border)">内部データ・内部処理（カプセル化の核心）</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)"><strong>protected</strong></td><td style="padding:5px 10px;border:1px solid var(--color-border)">クラス内部＋子クラス</td><td style="padding:5px 10px;border:1px solid var(--color-border)">継承先で使いたいが外部には隠したい処理</td></tr>
</table>

<h3>コンストラクタとデストラクタ</h3>
<ul>
  <li><strong>コンストラクタ</strong>: インスタンス生成時に<strong>自動的に呼ばれる</strong>初期化メソッド。属性に初期値を設定する。</li>
  <li><strong>デストラクタ</strong>: インスタンスが不要になって破棄される際に自動的に呼ばれる後処理メソッド。リソースの解放などに使う（Javaなど言語によっては明示的なデストラクタを持たない）。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
カプセル化=データ（属性）とメソッドをひとまとめにし、privateで外部から隠蔽する。直接変更不可にすることでデータ整合性を保証。<br/>
コンストラクタ=インスタンス生成時に自動呼び出しされる初期化メソッド。<br/>
アクセス修飾子: public=全体公開、private=クラス内のみ、protected=クラス内+子クラス。
</div>
        `,
        diagram: 'oop',
        questions: [
          {
            id: 38,
            question: 'クラスを元に作られた具体的なオブジェクトを何というか。',
            choices: ['クラス', 'インスタンス', 'メソッド', '属性'],
            answer: 1,
            explanation: 'クラスは設計図、インスタンスはその設計図から作られた実体です。',
          },
          {
            id: 1018,
            question: 'カプセル化の目的として正しいものはどれか。',
            choices: [
              '複数のクラスで同じメソッド名を使えるようにする',
              'クラスの内部データを隠蔽し外部からの直接変更を防ぐ',
              '親クラスの機能を子クラスに引き継ぐ',
              '抽象クラスを具体的に実装する',
            ],
            answer: 1,
            explanation: 'カプセル化はデータ（属性）をprivateにして隠蔽し、publicなメソッド（getter/setter）を通じてのみアクセスを許可する設計原則です。',
          },
          {
            id: 1040,
            question: 'コンストラクタの役割として正しいものはどれか。',
            choices: [
              'クラスを削除するときに呼ばれるメソッド',
              'インスタンス生成時に自動的に呼ばれ初期化を行うメソッド',
              '静的メソッドを定義するための特殊なメソッド',
              '親クラスのメソッドを上書きするメソッド',
            ],
            answer: 1,
            explanation: 'コンストラクタはオブジェクト（インスタンス）が生成されたときに自動的に呼ばれ、属性の初期化などを行います。',
          },
          {
            id: 1041,
            question: 'アクセス修飾子 private の説明として正しいものはどれか。',
            choices: [
              'どこからでもアクセスできる',
              'クラス内部と子クラスからのみアクセスできる',
              'クラス内部からのみアクセスできる',
              'パッケージ内からのみアクセスできる',
            ],
            answer: 2,
            explanation: 'privateはクラス内部からのみアクセスできる最も制限の強い修飾子です。子クラスからもアクセスできないため、データの隠蔽に使われます。',
          },
        ],
      },
      {
        id: 'b4-2',
        title: '継承とポリモーフィズム',
        content: `
<h3>継承（インヘリタンス）とは</h3>
<p>既存クラス（親クラス・スーパークラス）の属性・メソッドを引き継いで新しいクラス（子クラス・サブクラス）を作る仕組みです。<code>is-a</code>関係（「犬は動物である」）を表し、共通の処理を親クラスにまとめることでコードの重複を排除できます。</p>
<pre>
クラス 図形:                              // 親クラス
    属性: 色
    メソッド 面積を返す(): 抽象メソッド   // 子クラスで必ず実装する

クラス 円 は 図形 を継承:                 // 子クラス①
    属性: 半径
    メソッド 面積を返す():                // オーバーライド（再定義）
        3.14 × 半径 × 半径 を返す

クラス 長方形 は 図形 を継承:             // 子クラス②
    属性: 幅, 高さ
    メソッド 面積を返す():
        幅 × 高さ を返す
</pre>
<p>「色」属性は両方の子クラスが親から自動的に引き継ぐため、定義を繰り返す必要がありません。</p>

<h3>ポリモーフィズム（多態性）</h3>
<p>親クラス型の変数に子クラスのインスタンスを代入し、<strong>同じメソッド呼び出しで異なる動作</strong>をさせられる性質です。新しい図形クラスを追加しても、呼び出し側のコードを変える必要がないため拡張性が高まります。</p>
<pre>
// 親クラス型のリストに異なる子クラスを混在させられる
図形リスト ← [円(半径=5), 長方形(幅=4, 高さ=6), 三角形(底辺=3, 高さ=4)]

図形リスト の 各図形 に対して:
    表示する(図形.面積を返す())   // 同じ呼び方でも結果は異なる
// 出力:
// 78.5  （円の面積）
// 24    （長方形の面積）
// 6     （三角形の面積）
</pre>

<h3>抽象クラス vs インタフェース</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 10px;border:1px solid var(--color-border)">項目</th>
    <th style="padding:6px 10px;border:1px solid var(--color-border)">抽象クラス</th>
    <th style="padding:6px 10px;border:1px solid var(--color-border)">インタフェース</th>
  </tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)">実装の有無</td><td style="padding:5px 10px;border:1px solid var(--color-border)">共通処理を持てる</td><td style="padding:5px 10px;border:1px solid var(--color-border)">定義のみ（実装なし）</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)">多重継承</td><td style="padding:5px 10px;border:1px solid var(--color-border)">1つのみ継承可能</td><td style="padding:5px 10px;border:1px solid var(--color-border)">複数同時に実装可能</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)">直接生成</td><td style="padding:5px 10px;border:1px solid var(--color-border)">不可（抽象メソッドがあるため）</td><td style="padding:5px 10px;border:1px solid var(--color-border)">不可</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)">用途</td><td style="padding:5px 10px;border:1px solid var(--color-border)">共通処理を持つ基底クラス</td><td style="padding:5px 10px;border:1px solid var(--color-border)">「できること」の規約定義</td></tr>
  <tr><td style="padding:5px 10px;border:1px solid var(--color-border)">関係</td><td style="padding:5px 10px;border:1px solid var(--color-border)">is-a（〜は〜の一種）</td><td style="padding:5px 10px;border:1px solid var(--color-border)">can-do（〜を行える）</td></tr>
</table>
<pre>
// インタフェース: 「飛べる」という能力の規約
インタフェース 飛べる:
    メソッド 飛ぶ()       // 実装なし

// 鳥は動物を継承しつつ「飛べる」インタフェースも実装
クラス 鳥 は 動物 を継承, 飛べる を実装:
    メソッド 飛ぶ():
        "羽ばたいて飛ぶ" を表示

// 飛行機は動物ではないが「飛べる」は実装できる
クラス 飛行機 は 飛べる を実装:
    メソッド 飛ぶ():
        "エンジンで飛ぶ" を表示
</pre>

<h3>オーバーライドとオーバーロード</h3>
<ul>
  <li><strong>オーバーライド（Override）</strong>: 子クラスが親クラスのメソッドを<strong>同名・同引数で再定義</strong>する。ポリモーフィズムの実現手段。</li>
  <li><strong>オーバーロード（Overload）</strong>: 同名のメソッドを<strong>引数の型・数を変えて</strong>複数定義する。呼び出し時の引数で自動的に選ばれる。</li>
</ul>
<pre>
クラス 計算機:
    // オーバーロード: 同名だが引数が異なる（引数の数で使い分け）
    メソッド 合計(a, b):
        a + b を返す

    メソッド 合計(a, b, c):    // 引数3つ版
        a + b + c を返す

計算機.合計(3, 4)      // → 7  （2引数版が呼ばれる）
計算機.合計(1, 2, 3)   // → 6  （3引数版が呼ばれる）
</pre>

<h3>継承の「is-a」と委譲の「has-a」</h3>
<p>オブジェクト指向では継承（is-a）と委譲（has-a）を使い分けます。</p>
<ul>
  <li><strong>is-a（継承）</strong>: 「犬は動物である」→ クラス 犬 は 動物 を継承</li>
  <li><strong>has-a（委譲/コンポジション）</strong>: 「車はエンジンを持つ」→ クラス 車 は エンジン を属性として持つ</li>
</ul>
<p>継承は「本当に同種か」を慎重に判断する必要があります。単に機能を使いたいだけなら委譲のほうが変更に強くなります。</p>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
is-a=継承（犬は動物）、has-a=委譲（車はエンジンを持つ）。<br/>
抽象クラス=共通処理を持てる・1つだけ継承、インタフェース=実装なし・複数実装可能・can-do関係。<br/>
オーバーライド=同名同引数で再定義（ポリモーフィズムの基礎）、オーバーロード=同名で引数が違う複数定義。
</div>
        `,
        diagram: 'inheritance',
        questions: [
          {
            id: 39,
            question: '同じメソッド名でもオブジェクトの種類によって異なる動作をする性質を何というか。',
            choices: ['カプセル化', '継承', 'ポリモーフィズム', '抽象化'],
            answer: 2,
            explanation: 'ポリモーフィズム（多態性）は、同じインタフェースで異なる型のオブジェクトを統一的に扱える性質です。',
          },
          {
            id: 40,
            question: '親クラスのメソッドを子クラスで再定義することを何というか。',
            choices: ['オーバーロード', 'オーバーライド', 'カプセル化', 'インスタンス化'],
            answer: 1,
            explanation: 'オーバーライドは親クラスのメソッドを子クラスで上書きして再定義することです。オーバーロードは同名で引数が異なるメソッドを複数定義することです。',
          },
          {
            id: 1042,
            question: '抽象クラスとインタフェースの違いとして正しいものはどれか。',
            choices: [
              '抽象クラスは複数継承できるがインタフェースは1つしか実装できない',
              'インタフェースは実装を持てるが抽象クラスは持てない',
              '抽象クラスは実装を持てるがインタフェースは原則メソッド定義のみ',
              'どちらも直接インスタンス化できる',
            ],
            answer: 2,
            explanation: '抽象クラスは実装（具体的なメソッド）を持てます。インタフェースは原則メソッドの定義のみ（シグネチャのみ）を持ちます。クラスは複数のインタフェースを実装できますが、継承できる親クラスは1つだけです。',
          },
          {
            id: 1043,
            question: 'オブジェクト指向における「is-a 関係」を正しく表しているものはどれか。',
            choices: [
              '車は「エンジン」を持つ',
              '犬は「動物」の一種である',
              '社員は「会社」に所属する',
              'ファイルは「フォルダ」の中にある',
            ],
            answer: 1,
            explanation: 'is-a 関係は継承の関係を表します。「犬 is-a 動物」は Dog extends Animal のように親子クラスで表現します。has-a 関係（「車はエンジンを持つ」）は組み合わせ（コンポジション）で表現します。',
          },
        ],
      },
      {
        id: 'b4-3',
        title: 'デザインパターン',
        content: `
<h3>デザインパターンとは</h3>
<p>オブジェクト指向設計でよく使われる<strong>再利用可能な設計の定石</strong>です。GoF（Gang of Four）が23パターンを「生成」「構造」「振る舞い」の3カテゴリに分類しました。パターンを知ることで設計の意図を素早く共有できます。</p>

<h3>生成パターン（オブジェクトの作り方を管理）</h3>
<p><strong>Singleton（シングルトン）</strong>: クラスのインスタンスが<strong>1つだけ</strong>存在することを保証する。設定管理・ログ管理・DBコネクションプールに使用。</p>
<pre>
クラス 設定管理:
    静的属性 インスタンス ← null

    静的メソッド 取得():
        もし インスタンス が null なら:
            インスタンス ← 設定管理.新規作成()
        インスタンス を返す   // 常に同じ1つのインスタンスを返す
</pre>

<p><strong>Factory Method（ファクトリメソッド）</strong>: オブジェクトの生成をサブクラスに委ねる。どのクラスを生成するかを呼び出し側ではなくサブクラスが決める。</p>
<pre>
抽象クラス 通知送信者:
    抽象メソッド 通知作成()     // サブクラスで実装
    メソッド 送信():
        通知 ← 自身.通知作成()  // サブクラスが決めた種類を生成
        通知.送る()

クラス メール送信者 extends 通知送信者:
    メソッド 通知作成():
        メール を返す           // メール固有の生成ロジック
</pre>

<h3>構造パターン（クラスの組み合わせ方を整理）</h3>
<p><strong>Adapter（アダプタ）</strong>: 互換性のないインタフェースを変換して使えるようにする。コンセントの変換アダプタと同じ概念。既存クラスをそのまま再利用しつつ新しいインタフェースに対応できる。</p>
<pre>
// 既存の古いクラス（インタフェースが合わない）
クラス 旧印刷機:
    メソッド 印字する(テキスト): ...

// アダプタ：新インタフェース「print()」で旧クラスを使えるようにする
クラス 印刷アダプタ:
    属性: 旧印刷機

    メソッド print(テキスト):
        自身.旧印刷機.印字する(テキスト)  // 内部で変換して委譲
</pre>

<p><strong>Decorator（デコレータ）</strong>: 既存オブジェクトを包んで動的に機能を追加する。継承を使わず、実行時に組み合わせを変えられる。</p>
<pre>
// コーヒーの例: 基本 → ミルク追加 → シロップ追加 と後から機能を付け足す
クラス ミルクデコレータ:
    属性: コーヒー

    メソッド 金額():
        自身.コーヒー.金額() + 50 を返す  // 元の金額に追加

    メソッド 説明():
        自身.コーヒー.説明() + "＋ミルク" を返す
</pre>

<p><strong>Facade（ファサード）</strong>: 複雑なサブシステムに対して<strong>シンプルな窓口（窓口クラス）</strong>を提供する。利用者は内部の複雑さを意識しなくて済む。</p>
<pre>
// 内部は複雑（CPU起動・メモリ確認・ディスク読込など）でも
// 利用者はこれだけ呼べばよい
クラス コンピュータFacade:
    メソッド 電源ON():
        CPU.初期化()
        メモリ.確認()
        ディスク.読込()
        OS.起動()
</pre>

<h3>振る舞いパターン（オブジェクト間の責任の分担）</h3>
<p><strong>Template Method（テンプレートメソッド）</strong>: 処理の<strong>骨格（アルゴリズムの流れ）をスーパークラスで定義</strong>し、具体的な実装はサブクラスに委ねる。</p>
<pre>
抽象クラス データ処理:
    // テンプレートメソッド: 処理の流れを固定
    メソッド 実行():
        自身.読み込む()   // ←サブクラスで実装
        自身.変換する()   // ←サブクラスで実装
        自身.保存する()   // ←サブクラスで実装

クラス CSV処理 extends データ処理:
    メソッド 読み込む(): CSVファイルを開く
    メソッド 変換する(): カンマ区切りを解析する
    メソッド 保存する(): DBに挿入する
</pre>

<p><strong>Observer（オブザーバー）</strong>: オブジェクトの状態変化を、登録された<strong>複数の観察者（Observer）に自動通知</strong>する。イベント駆動・MVCのモデル変更通知に使用。</p>
<pre>
クラス ニュース配信（Subject）:
    属性: 購読者リスト ← []

    メソッド 購読登録(購読者):
        購読者リスト.追加(購読者)

    メソッド ニュース発行(内容):
        購読者リスト の各 購読者 に対して:
            購読者.更新通知(内容)   // 全員に自動通知
</pre>

<p><strong>Strategy（ストラテジー）</strong>: アルゴリズムを交換可能なオブジェクトとして切り出す。実行時にアルゴリズムを差し替えられる。</p>
<pre>
クラス ソーター:
    属性: ストラテジー

    メソッド ソート(配列):
        自身.ストラテジー.実行(配列) を返す

// 実行時に差し替えるだけで動作が変わる
ソーター.ストラテジー ← バブルソート
ソーター.ストラテジー ← クイックソート
</pre>

<p><strong>Iterator（イテレータ）</strong>: コレクション（配列・リストなど）の内部構造を隠蔽しながら、要素を順番に走査する方法を提供する。</p>
<pre>
クラス 数列イテレータ:
    属性: データ, 現在位置 ← 0

    メソッド 次がある():
        現在位置 &lt; データ.長さ を返す

    メソッド 次を取得():
        要素 ← データ[現在位置]
        現在位置 ← 現在位置 + 1
        要素 を返す

// 使い方（内部構造を知らなくても走査できる）
イテレータ ← 数列イテレータ([1,3,5,7,9])
繰り返し イテレータ.次がある() の間:
    表示(イテレータ.次を取得())
</pre>

<h3>パターン早見表</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.88em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">パターン</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">カテゴリ</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">一言で言うと</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">典型的な使いどころ</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Singleton</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">生成</td><td style="padding:5px 8px;border:1px solid var(--color-border)">インスタンスを1つだけ</td><td style="padding:5px 8px;border:1px solid var(--color-border)">設定管理・ログ</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Factory Method</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">生成</td><td style="padding:5px 8px;border:1px solid var(--color-border)">生成をサブクラスに委ねる</td><td style="padding:5px 8px;border:1px solid var(--color-border)">プラグイン・通知種別</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Adapter</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">構造</td><td style="padding:5px 8px;border:1px solid var(--color-border)">インタフェースを変換</td><td style="padding:5px 8px;border:1px solid var(--color-border)">既存クラスの再利用</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Decorator</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">構造</td><td style="padding:5px 8px;border:1px solid var(--color-border)">機能を動的に追加</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ロギング・権限チェック</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Facade</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">構造</td><td style="padding:5px 8px;border:1px solid var(--color-border)">複雑なシステムに窓口</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ライブラリのラッパー</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Template Method</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">振る舞い</td><td style="padding:5px 8px;border:1px solid var(--color-border)">骨格を親が定義</td><td style="padding:5px 8px;border:1px solid var(--color-border)">データ処理・ゲームのターン進行</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Observer</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">振る舞い</td><td style="padding:5px 8px;border:1px solid var(--color-border)">変化を複数に通知</td><td style="padding:5px 8px;border:1px solid var(--color-border)">イベント・MVC</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Strategy</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">振る舞い</td><td style="padding:5px 8px;border:1px solid var(--color-border)">アルゴリズムを差し替え</td><td style="padding:5px 8px;border:1px solid var(--color-border)">ソート・課金方式</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>Iterator</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">振る舞い</td><td style="padding:5px 8px;border:1px solid var(--color-border)">コレクションを順に走査</td><td style="padding:5px 8px;border:1px solid var(--color-border)">for-each構文の内部</td></tr>
</table>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
生成: Singleton=インスタンス1つ保証、Factory Method=生成をサブクラスに委ねる。<br/>
構造: Adapter=インタフェース変換（既存クラス再利用）、Facade=複雑な内部への窓口。<br/>
振る舞い: Template Method=処理の骨格を親が固定、Observer=状態変化を複数に通知、Strategy=アルゴリズムを実行時に差し替え、Iterator=内部構造を隠してコレクション走査。
</div>
        `,
        diagram: 'design-pattern',
        questions: [
          {
            id: 1019,
            question: 'Singletonパターンの説明として正しいものはどれか。',
            choices: [
              'オブジェクトの生成をサブクラスに委ねるパターン',
              'クラスのインスタンスが1つだけ存在することを保証するパターン',
              '互換性のないインタフェースを変換するパターン',
              'アルゴリズムを交換可能にするパターン',
            ],
            answer: 1,
            explanation: 'Singletonパターンはクラスのインスタンスがシステム全体で1つだけ存在することを保証します。設定管理・ログ管理などに使われます。',
          },
          {
            id: 1020,
            question: 'Strategyパターンの主な目的はどれか。',
            choices: [
              'オブジェクトの状態変化を複数の観察者に通知する',
              'アルゴリズムを交換可能にして動的に切り替えられるようにする',
              '既存オブジェクトに動的に機能を追加する',
              'クラスのインスタンス数を制限する',
            ],
            answer: 1,
            explanation: 'Strategyパターンはアルゴリズム（戦略）をクラスとして定義し、実行時に差し替えられるようにするパターンです。',
          },
          {
            id: 1044,
            question: 'Observerパターンの説明として正しいものはどれか。',
            choices: [
              '互換性のないインタフェースを変換して使えるようにする',
              'あるオブジェクトの状態変化を複数の観察者オブジェクトに自動通知する',
              'クラスのインスタンスが1つだけ存在することを保証する',
              'オブジェクトの生成をサブクラスに委ねる',
            ],
            answer: 1,
            explanation: 'Observerパターンは「出版者（Subject）」と「購読者（Observer）」の関係を定義します。出版者の状態が変わると全購読者に自動通知されます。GUIのイベントリスナーがその代表例です。',
          },
          {
            id: 1045,
            question: 'Adapterパターンが解決する問題はどれか。',
            choices: [
              'クラスに機能を動的に追加したい',
              '既存の互換性のないインタフェースを変換して再利用したい',
              'インスタンスの生成方法を抽象化したい',
              'アルゴリズムを切り替え可能にしたい',
            ],
            answer: 1,
            explanation: 'Adapterパターンは既存クラスのインタフェースを、クライアントが期待する別のインタフェースに変換します。電源コンセントのアダプタと同じ概念で、互換性のない既存コードを変更せずに再利用できます。',
          },
        ],
      },
      {
        id: 'b4-4',
        title: 'SOLID原則・UML基礎',
        content: `
<h3>SOLID原則とは</h3>
<p>Robert C. Martin が提唱した、オブジェクト指向設計の5つの指針です。保守性・拡張性・テスト容易性の高いコードを書くための原則です。</p>

<h3>S — 単一責任原則（Single Responsibility Principle）</h3>
<p>「クラスは1つの責任（理由）のみで変更される」べきです。</p>
<pre>
// 悪い例: UserクラスがDB保存とメール送信の両方を担う
クラス User:
    メソッド save():      // DB担当
    メソッド sendEmail(): // メール担当 ← 別責任！

// 良い例: 責任を分割する
クラス User:           // データ担当
クラス UserRepository: // DB保存担当
クラス EmailService:   // メール担当
</pre>

<h3>O — 開放閉鎖原則（Open/Closed Principle）</h3>
<p>「拡張には開いており（Open）、修正には閉じている（Closed）」べきです。新機能追加時に既存コードを変更しない設計が理想です。</p>
<pre>
// 悪い例: 新形状を追加するたびに既存コードを修正
関数 面積計算(形状):
    もし 形状.種類 = "円" なら: ...
    もし 形状.種類 = "四角" なら: ...   // 新形状で変更が必要

// 良い例: 抽象クラスで拡張
抽象クラス 形状:
    抽象メソッド 面積(): 数値

クラス 円 extends 形状:
    メソッド 面積(): 3.14 × 半径²

クラス 三角形 extends 形状:     // 既存コード変更なしで追加
    メソッド 面積(): 底辺 × 高さ ÷ 2
</pre>

<h3>L — リスコフ置換原則（Liskov Substitution Principle）</h3>
<p>「サブクラスは親クラスと置換可能でなければならない」。子クラスが親クラスの期待を裏切ると問題が起きます。</p>
<pre>
// 問題例: 正方形は長方形のサブクラスとして正しいか？
クラス 長方形:
    メソッド 幅を設定(w): 自身.幅 ← w
    メソッド 高さを設定(h): 自身.高さ ← h
    メソッド 面積(): 幅 × 高さ

クラス 正方形 extends 長方形:
    メソッド 幅を設定(w):
        自身.幅 ← w
        自身.高さ ← w   // 正方形なので高さも変える

// 長方形として扱うと期待と違う動作になる → LSP違反
r ← 正方形()
r.幅を設定(4)
r.高さを設定(5)
表示(r.面積())  // 25 が返る（期待値は20）
</pre>

<h3>I — インタフェース分離原則（Interface Segregation Principle）</h3>
<p>「クライアントが使わないメソッドへの依存を強制してはならない」。大きなインタフェースは小さく分割する。</p>
<pre>
// 悪い例: 1つの肥大インタフェース
インタフェース 動物:
    歩く()
    飛ぶ()   // 鳥以外には不要
    泳ぐ()   // 魚以外には不要

// 良い例: 分割
インタフェース 歩ける: 歩く()
インタフェース 飛べる: 飛ぶ()
インタフェース 泳げる: 泳ぐ()

クラス 犬 implements 歩ける, 泳げる:  // 飛ぶは実装しなくてよい
</pre>

<h3>D — 依存性逆転原則（Dependency Inversion Principle）</h3>
<p>「上位モジュールは下位モジュールに直接依存してはならない。どちらも抽象（インタフェース）に依存すべき」。</p>
<pre>
// 悪い例: 上位クラスが具体的な実装クラスに依存
クラス 注文サービス:
    db ← MySQLデータベース()  // 具体実装に直接依存

// 良い例: インタフェースを通じて依存
インタフェース データベース:
    保存(データ)

クラス MySQL implements データベース: 保存(データ): ...
クラス PostgreSQL implements データベース: 保存(データ): ...

クラス 注文サービス:
    コンストラクタ(db: データベース):  // 抽象に依存
        自身.db ← db              // MySQL でも PostgreSQL でも差し替え可能
</pre>

<h3>UMLクラス図の基本記法</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">記号</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">意味</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">例</th>
  </tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>実線＋矢印（→）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">関連（Association）— 使う関係</td><td style="padding:5px 8px;border:1px solid var(--color-border)">注文 → 商品</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>白抜き三角（△）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">継承（Generalization）— is-a関係</td><td style="padding:5px 8px;border:1px solid var(--color-border)">犬 ▷ 動物</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>破線＋白抜き三角</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">実現（Realization）— インタフェース実装</td><td style="padding:5px 8px;border:1px solid var(--color-border)">MySQL ▷ DB</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>白抜きひし形（◇）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">集約（Aggregation）— has-a（弱い）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">部署 ◇ 社員</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>塗りひし形（◆）</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">コンポジション（Composition）— has-a（強い）</td><td style="padding:5px 8px;border:1px solid var(--color-border)">家 ◆ 部屋</td></tr>
  <tr><td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>多重度 1..* / 0..1</strong></td><td style="padding:5px 8px;border:1px solid var(--color-border)">端点の数量制約</td><td style="padding:5px 8px;border:1px solid var(--color-border)">1人が0..* 注文を持つ</td></tr>
</table>
<p><strong>集約 vs コンポジション</strong>: 集約は部品が独立して存在できる（社員は部署がなくなっても存在する）。コンポジションは全体が消えると部品も消える（家が取り壊されると部屋も消える）。</p>
        `,
        questions: [
          {
            id: 1071,
            question: 'SOLID原則の「S」（単一責任原則）の説明として正しいものはどれか。',
            choices: [
              'クラスは最低1つの抽象メソッドを持つべきである',
              'クラスは1つの責任のみを持ち、1つの理由でのみ変更される',
              'サブクラスは親クラスと置換可能でなければならない',
              '上位モジュールは下位モジュールに直接依存してはならない',
            ],
            answer: 1,
            explanation: '単一責任原則（SRP）は「クラスを変更する理由はただ1つであるべき」という原則です。複数の責任を持つクラスは変更の影響範囲が広がり、バグの原因になりやすいです。選択肢3はリスコフ置換原則、選択肢4は依存性逆転原則です。',
          },
          {
            id: 1072,
            question: '開放閉鎖原則（OCP）に従った設計の特徴として正しいものはどれか。',
            choices: [
              '新機能追加時に既存クラスを直接修正する',
              '新機能追加時に既存クラスを修正せず、新しいクラスを追加して拡張する',
              'インタフェースを使わずに直接クラス間で通信する',
              '全メソッドをpublicにして外部から自由に変更できるようにする',
            ],
            answer: 1,
            explanation: '開放閉鎖原則は「拡張には開いており（新クラス追加可）、修正には閉じている（既存コード変更不要）」という原則です。抽象クラスやインタフェースを使うことで、既存コードを変更せずに新機能を追加できます。',
          },
          {
            id: 1073,
            question: 'UMLクラス図で「継承（is-a関係）」を表す記号はどれか。',
            choices: [
              '実線に塗りつぶしひし形（◆）',
              '実線に白抜きひし形（◇）',
              '実線に白抜き三角形（△）の矢印',
              '破線に通常の矢印',
            ],
            answer: 2,
            explanation: 'UMLクラス図で継承（Generalization）は白抜き三角形（△）の矢印で表します。子クラスから親クラスに向けて引きます。塗りひし形はコンポジション、白抜きひし形は集約、破線矢印は依存関係を表します。',
          },
          {
            id: 1074,
            question: 'UMLクラス図の「コンポジション（Composition）」が示す関係として正しいものはどれか。',
            choices: [
              'has-a 関係で、部品が独立して存在できる',
              'has-a 関係で、全体が消えると部品も消える強い所有関係',
              'is-a 関係で、サブクラスが親クラスを継承する',
              'インタフェースをクラスが実装する関係',
            ],
            answer: 1,
            explanation: 'コンポジション（強い集約）は「全体が消えると部品も消える」強い所有関係です（例：家が取り壊されると部屋も消える）。これに対し集約（弱い集約）は部品が独立して存在できる関係（例：社員は部署がなくなっても存在する）です。',
          },
          {
            id: 1075,
            question: '依存性逆転原則（DIP）の目的として正しいものはどれか。',
            choices: [
              '上位モジュールが下位モジュールの具体実装に直接依存することで結合を強める',
              'インタフェース（抽象）を挟むことで上位・下位モジュールの結合を疎にする',
              'クラスを1つの責任のみに集中させる',
              'サブクラスが親クラスの期待を裏切らないようにする',
            ],
            answer: 1,
            explanation: '依存性逆転原則（DIP）は上位・下位モジュールがともにインタフェース（抽象）に依存することで、具体実装の変更が上位モジュールに影響しないようにする原則です。Dependency Injection（DI）はDIPを実現する代表的な手法です。選択肢3はSRP、選択肢4はLSPの説明です。',
          },
        ],
      },
    ],
  },
  {
    id: 'a10',
    title: 'AI・機械学習基礎',
    subject: 'A',
    description: '機械学習の種類・ディープラーニング・自然言語処理・AI倫理など、試験頻出のAI分野を学びます。',
    sections: [
      {
        id: 'a10-1',
        title: '機械学習の基礎概念',
        content: `
<h3>AIと機械学習の関係</h3>
<p>AI（人工知能）は「人間の知的活動をコンピュータで実現する」技術の総称です。機械学習はAIを実現する手法の一つで、<strong>データから自動的にパターンを学習</strong>します。ディープラーニングはさらにその中の手法です。</p>
<pre>
AI（人工知能）
 └─ 機械学習（Machine Learning）
      └─ ディープラーニング（Deep Learning）
</pre>

<h3>機械学習の3種類</h3>
<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:0.9em">
  <tr style="background:var(--color-accent);color:#fff">
    <th style="padding:6px 8px;border:1px solid var(--color-border)">種類</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">概要</th>
    <th style="padding:6px 8px;border:1px solid var(--color-border)">用途例</th>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>教師あり学習</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">正解ラベル付きデータで学習。入力→正解の関係を学ぶ。</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">スパムメール判定・価格予測・画像分類</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>教師なし学習</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">正解ラベルなしでデータの構造・パターンを発見する。</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">顧客セグメンテーション・異常検知・次元削減</td>
  </tr>
  <tr>
    <td style="padding:5px 8px;border:1px solid var(--color-border)"><strong>強化学習</strong></td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">エージェントが試行錯誤しながら報酬最大化を学ぶ。</td>
    <td style="padding:5px 8px;border:1px solid var(--color-border)">ゲームAI・ロボット制御・自動運転</td>
  </tr>
</table>

<h3>主なアルゴリズム</h3>
<ul>
  <li><strong>決定木</strong>: 条件分岐を木構造で表現。解釈しやすい。</li>
  <li><strong>ランダムフォレスト</strong>: 多数の決定木の多数決。過学習に強い。</li>
  <li><strong>サポートベクターマシン（SVM）</strong>: データを最も広い余白で分類する境界を見つける手法。</li>
  <li><strong>k-近傍法（kNN）</strong>: 新しいデータに最も近いk個の既存データの多数決で分類。</li>
  <li><strong>k-means クラスタリング</strong>: データをk個のグループ（クラスタ）に分類する教師なし学習。</li>
</ul>

<h3>過学習（オーバーフィッティング）と汎化</h3>
<p><strong>過学習</strong>とは、訓練データに特化しすぎて未知のデータに対する精度が落ちる現象です。</p>
<ul>
  <li><strong>訓練データ</strong>: モデルの学習に使うデータ</li>
  <li><strong>検証データ</strong>: ハイパーパラメータ調整に使うデータ</li>
  <li><strong>テストデータ</strong>: 最終的な精度評価に使うデータ（学習に使ってはいけない）</li>
  <li>対策: 正則化・ドロップアウト・データ拡張・交差検証</li>
</ul>

<h3>モデルの評価指標</h3>
<ul>
  <li><strong>正解率（Accuracy）</strong>: 全予測のうち正解の割合。データ不均衡時は不適切。</li>
  <li><strong>適合率（Precision）</strong>: 陽性と予測したうち実際に陽性の割合。「誤検知を減らしたい」時に重視。</li>
  <li><strong>再現率（Recall）</strong>: 実際の陽性のうち正しく陽性と予測した割合。「見逃しを減らしたい」時に重視。</li>
  <li><strong>F値（F1スコア）</strong>: 適合率と再現率の調和平均。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
教師あり＝正解ラベルあり、教師なし＝パターン発見、強化学習＝報酬最大化。<br/>
過学習＝訓練データに過度に適合し汎化性能が低下すること。<br/>
精度指標：正解率・適合率・再現率・F値の違いを区別できること。
</div>
        `,
        questions: [
          {
            id: 1060,
            question: '機械学習の「教師あり学習」の説明として正しいものはどれか。',
            choices: [
              '正解ラベルのないデータからパターンや構造を自動的に発見する手法',
              '正解ラベル付きのデータを使って入力と出力の関係を学習する手法',
              'エージェントが試行錯誤しながら報酬を最大化するように学習する手法',
              'ルールベースでプログラマが明示的に条件を記述して分類する手法',
            ],
            answer: 1,
            explanation: '教師あり学習は「入力と正解ラベル（出力）のペア」を大量に用意し、入力から正解を予測するモデルを学習します。スパムフィルタ（スパム/非スパム）や画像分類（犬/猫）が代表例です。',
          },
          {
            id: 1061,
            question: '機械学習における過学習（オーバーフィッティング）の説明として正しいものはどれか。',
            choices: [
              'モデルが単純すぎて訓練データでも精度が出ない状態',
              '訓練データには高精度だが未知のテストデータに対して精度が低い状態',
              'データ量が少なすぎてモデルが学習できない状態',
              '計算量が多すぎて学習が完了しない状態',
            ],
            answer: 1,
            explanation: '過学習は訓練データを「暗記」してしまい、未知データへの汎化能力が失われた状態です。訓練精度は高いのにテスト精度が低い場合に疑います。正則化・データ拡張・交差検証が主な対策です。',
          },
          {
            id: 1082,
            question: 'ランダムフォレストの説明として正しいものはどれか。',
            choices: [
              '単一の深い決定木を構築してデータを分類する手法',
              '多数の決定木を独立に学習させ、多数決（回帰は平均）で予測するアンサンブル学習手法',
              'ランダムに選んだk個の近傍データで分類するk-近傍法の別名',
              'ニューラルネットワークを複数組み合わせたアンサンブル手法',
            ],
            answer: 1,
            explanation: 'ランダムフォレストはデータのランダムサンプリングと特徴量のランダム選択で多数の決定木を独立に学習させ、予測時に多数決（分類）または平均（回帰）を取ります。1本の決定木より過学習に強く汎化性能が高いです。',
          },
          {
            id: 1083,
            question: '機械学習の評価指標「再現率（Recall）」の説明として正しいものはどれか。',
            choices: [
              '陽性と予測したサンプルのうち実際に陽性だった割合',
              '全サンプルのうち正しく予測できた割合',
              '実際に陽性のサンプルのうち正しく陽性と予測できた割合',
              '適合率と再現率の調和平均',
            ],
            answer: 2,
            explanation: '再現率（Recall）＝TP ÷ (TP + FN)。「実際の陽性のうち何件見つけられたか」を表します。がん検診・スパムフィルタなど見逃しが致命的な場面で重視します。適合率（Precision）は「陽性予測のうち本当に陽性の割合」で方向が逆です。',
          },
          {
            id: 1084,
            question: 'k-fold 交差検証（クロスバリデーション）の目的として正しいものはどれか。',
            choices: [
              'モデルのハイパーパラメータを自動で最適化する手法',
              'データをk分割して各分割を検証データとしてk回評価し汎化性能をより正確に推定する手法',
              'データを無作為に並び替えてバイアスを除去する前処理手法',
              'k個のモデルを並列学習してアンサンブルする手法',
            ],
            answer: 1,
            explanation: 'k-fold交差検証はデータをk個に分割し、k回の反復でそれぞれを検証データ・残りを訓練データとして使います。評価が1回のホールドアウト法より信頼性が高く、データが少ない場合に特に有効です。',
          },
        ],
      },
      {
        id: 'a10-2',
        title: 'ディープラーニングと応用',
        content: `
<h3>ニューラルネットワーク</h3>
<p>人間の脳の神経回路を模した機械学習モデルです。<strong>入力層・隠れ層・出力層</strong>の3種類の層で構成されます。各ノード（ニューロン）は前の層の出力を受け取り、重み付き合計を計算して次の層へ渡します。</p>
<pre>
入力層    隠れ層    出力層
  ○ ─────── ○
  ○    ×   ○ ─── ○（予測値）
  ○ ─────── ○
（特徴量）  （中間表現）
</pre>

<h3>ディープラーニング（深層学習）</h3>
<p>隠れ層を多数重ねたニューラルネットワークです。大量データとGPU計算により、従来手法を大幅に超える精度を実現しました。</p>
<ul>
  <li><strong>CNN（畳み込みニューラルネットワーク）</strong>: 画像認識に特化。畳み込み層でローカルな特徴（エッジ・形状）を抽出する。顔認識・自動車の自動運転・医療画像診断。</li>
  <li><strong>RNN（再帰型ニューラルネットワーク）</strong>: 時系列データ・言語に特化。前の出力を次の入力に使う。LSTM・GRUが改良版。翻訳・音声認識に使われていた。</li>
  <li><strong>Transformer</strong>: 現在の主流。Attention機構で文中の単語間の関係を効率的に学習。GPT・BERTのベースアーキテクチャ。</li>
</ul>

<h3>自然言語処理（NLP）</h3>
<p>コンピュータが人間の言語（テキスト）を理解・生成する技術です。</p>
<ul>
  <li><strong>形態素解析</strong>: 文章を意味を持つ最小単位（形態素）に分割する。MeCab・Janomeが代表ツール。</li>
  <li><strong>Word2Vec</strong>: 単語を数値ベクトルで表現。意味が近い単語はベクトルが近い。</li>
  <li><strong>BERT</strong>: 双方向Transformerで文脈を理解する事前学習モデル。</li>
  <li><strong>GPT（生成AIの代表）</strong>: 大規模言語モデル（LLM）。文章生成・質問応答・コード生成を行う。</li>
</ul>

<h3>生成AI（Generative AI）</h3>
<p>新しいコンテンツ（テキスト・画像・音声・動画）を生成できるAIです。</p>
<ul>
  <li><strong>LLM（大規模言語モデル）</strong>: GPT-4・Claude・Geminiなど。テキスト生成・翻訳・コーディング支援。</li>
  <li><strong>GAN（敵対的生成ネットワーク）</strong>: 生成器と識別器が競い合いながらリアルな画像・動画を生成する。ディープフェイクも同手法。</li>
  <li><strong>拡散モデル（Diffusion Model）</strong>: 現在の画像生成AIの主流。Stable Diffusion・DALL-E・Midjourneyが代表。</li>
  <li><strong>ハルシネーション</strong>: LLMが事実と異なる情報を自信を持って生成する問題。出力の検証が必要。</li>
</ul>

<h3>転移学習とファインチューニング</h3>
<ul>
  <li><strong>転移学習</strong>: 大量データで学習済みのモデル（事前学習モデル）の知識を別のタスクに流用する手法。学習データが少なくても高精度を実現。</li>
  <li><strong>ファインチューニング</strong>: 事前学習モデルを特定タスク向けのデータで追加学習して最適化すること。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
CNN＝画像認識、RNN＝時系列・言語、Transformer＝現在のNLPの主流。<br/>
LLM（大規模言語モデル）はTransformerベース。ハルシネーション（誤情報生成）に注意。<br/>
転移学習＝学習済みモデルの知識を流用、ファインチューニング＝追加学習で特化。
</div>
        `,
        questions: [
          {
            id: 1062,
            question: 'CNN（畳み込みニューラルネットワーク）が特に得意とする分野はどれか。',
            choices: [
              '時系列データの予測（株価・気温の推移）',
              '強化学習によるゲームの最適戦略の学習',
              '画像の特徴抽出と画像認識',
              '数値データのクラスタリング',
            ],
            answer: 2,
            explanation: 'CNNは畳み込み層でエッジ・テクスチャ・形状などの局所的な視覚的特徴を階層的に抽出するため、画像認識・物体検出・医療画像診断に特に優れています。',
          },
          {
            id: 1063,
            question: 'LLM（大規模言語モデル）における「ハルシネーション」とはどれか。',
            choices: [
              'モデルの学習が途中で停止してしまう現象',
              'モデルが事実と異なる情報を自信をもって生成してしまう問題',
              'モデルへの不正なプロンプト入力による誤動作',
              'モデルの推論速度が遅くなる問題',
            ],
            answer: 1,
            explanation: 'ハルシネーションはLLMが存在しない事実・引用・人物などを確信を持って生成してしまう現象です。LLMは「次のトークンを予測する確率モデル」なので、知識が不足している場合でも尤もらしい文章を生成しようとします。出力の事実検証が重要です。',
          },
          {
            id: 1085,
            question: 'Transformerアーキテクチャの中心的な機構「Attention（注意機構）」の説明として正しいものはどれか。',
            choices: [
              'データを畳み込んで局所的な空間的特徴を抽出する仕組み',
              '「入力のどの部分に注目すべきか」をクエリ・キー・バリューの内積で動的に計算する仕組み',
              '前の時刻の隠れ状態を次の時刻の入力として引き継ぐ仕組み',
              'モデルの不要なノードをランダムに無効化して過学習を防ぐ仕組み',
            ],
            answer: 1,
            explanation: 'Attentionは入力の各トークンに対して「どの他トークンと関連が強いか」を内積スコアで計算し重み付け集約します。この仕組みにより文中の離れた単語間の関係を並列に捉えることができ、RNNより長距離依存性の処理に優れています。GPT・BERTのコア技術です。',
          },
          {
            id: 1086,
            question: '転移学習における「ファインチューニング」の説明として正しいものはどれか。',
            choices: [
              'ランダム初期化したモデルを特定タスクのデータだけで一から学習する手法',
              '大規模データで事前学習済みのモデルを少量の特定タスクデータで追加学習して最適化する手法',
              '複数の学習済みモデルを組み合わせて精度を向上させる手法',
              '不要なパラメータを削除してモデルを軽量化する手法',
            ],
            answer: 1,
            explanation: 'ファインチューニングはBERT・GPT・ImageNetモデルなど大規模データで学習済みの知識を基盤に、少量のドメイン固有データで追加学習します。一から学習するより少ないデータで高精度を実現でき、ChatGPTも事前学習+RLHFファインチューニングで作られています。',
          },
          {
            id: 1087,
            question: 'GANについての説明として正しいものはどれか。',
            choices: [
              '大量のラベル付きデータで事前学習し汎用的な表現を学ぶモデル',
              '生成器と識別器が競い合いながら学習し、リアルなデータを生成する敵対的生成ネットワーク',
              'ノイズから段階的にデータを復元してコンテンツを生成するモデル',
              '入力データをエンコードしてコンパクトな表現を学習するモデル',
            ],
            answer: 1,
            explanation: 'GAN（Generative Adversarial Network）は「本物らしいデータを生成する生成器」と「本物か偽物かを見分ける識別器」が競い合って学習します。ディープフェイク動画・高品質な画像生成に使われています。現在の画像生成AIの主流は拡散モデル（Stable Diffusionなど）に移っています。',
          },
        ],
      },
      {
        id: 'a10-3',
        title: 'AI倫理とデータ活用',
        content: `
<h3>AI倫理の重要性</h3>
<p>AIが社会に深く浸透する中、技術面だけでなく<strong>倫理・公平性・透明性</strong>が重要な課題になっています。基本情報技術者試験でも近年この分野からの出題が増えています。</p>

<h3>AIバイアス（偏り）</h3>
<p>訓練データに含まれる偏りがモデルの判断に影響する問題です。</p>
<ul>
  <li><strong>データバイアス</strong>: 訓練データに特定グループが過少/過多に含まれることで不公平な判断が生まれる。採用AIが特定性別・人種を不利に扱った事例がある。</li>
  <li><strong>フィードバックバイアス</strong>: モデルの出力が次の訓練データに影響し、偏りが増幅するループ。</li>
  <li>対策: 多様なデータの収集・アルゴリズムの公平性監査・人間によるレビュー</li>
</ul>

<h3>説明可能なAI（XAI: Explainable AI）</h3>
<p>なぜそのような判断をしたかを人間が理解できる形で説明できるAIです。</p>
<ul>
  <li>ブラックボックス問題：ディープラーニングは高精度だが判断根拠が不透明。</li>
  <li>医療診断・融資審査・採用などの高リスク場面では説明責任が求められる。</li>
  <li>LIME・SHAPなどの解釈ツールが開発されている。</li>
</ul>

<h3>個人情報とプライバシー</h3>
<ul>
  <li><strong>個人情報保護法</strong>: 個人が識別できる情報の取り扱いを規制。2022年改正で強化。</li>
  <li><strong>GDPR（EU一般データ保護規則）</strong>: EUの厳格な個人データ保護規則。忘れられる権利・データポータビリティ権を規定。違反時は高額制裁金。</li>
  <li><strong>匿名加工情報</strong>: 個人を特定できないよう加工した情報。第三者提供が可能になる。</li>
  <li><strong>差分プライバシー</strong>: データに意図的なノイズを加えて個人が特定されないようにしながら統計的な有用性を保つ技術。</li>
</ul>

<h3>データの前処理</h3>
<p>機械学習の精度はデータ品質に大きく依存します（Garbage In, Garbage Out）。</p>
<ul>
  <li><strong>欠損値処理</strong>: 平均値・中央値での補完、または欠損行の削除。</li>
  <li><strong>正規化・標準化</strong>: 特徴量の値域をそろえる。勾配降下法の収束を改善。</li>
  <li><strong>外れ値処理</strong>: 測定誤差・異常値を除去またはキャップ処理。</li>
  <li><strong>特徴量エンジニアリング</strong>: ドメイン知識を活用して有用な新しい特徴量を生成する。</li>
</ul>

<h3>AIに関するガイドライン</h3>
<ul>
  <li><strong>AI原則（経産省・総務省）</strong>: 人間中心・安全性・公平性・透明性・アカウンタビリティなどの原則。</li>
  <li><strong>EU AI法</strong>: リスクレベルに応じたAI規制（高リスクAIは事前審査が必要）。</li>
  <li><strong>プロンプトインジェクション</strong>: LLMへの悪意ある入力でシステムを誤動作させる攻撃。セキュリティ上の新たな脅威。</li>
</ul>

<div class="point-box">
<strong>🎯 試験のポイント</strong><br/>
AIバイアス＝訓練データの偏りがモデルの不公平な判断につながる問題。<br/>
XAI（説明可能なAI）＝ブラックボックス問題を解決し判断根拠を提示する取り組み。<br/>
GDPR＝EUの個人データ保護規則。忘れられる権利・データポータビリティが特徴。
</div>
        `,
        questions: [
          {
            id: 1064,
            question: 'AIシステムにおける「バイアス」の説明として最も適切なものはどれか。',
            choices: [
              'モデルの計算速度を低下させるハードウェアの問題',
              '訓練データに含まれる偏りがモデルの判断に影響し、特定グループへの不公平な結果を生む問題',
              'モデルのパラメータ数が多すぎて過学習が発生する問題',
              'AIが人間の監督なく自律的に判断を行う問題',
            ],
            answer: 1,
            explanation: 'AIバイアスは訓練データの偏りに起因します。例えば、採用実績データが特定の属性に偏っていると、採用AIもその偏りを学習し不公平な判断を下します。多様なデータ収集と公平性監査が対策です。',
          },
          {
            id: 1065,
            question: 'GDPRの説明として正しいものはどれか。',
            choices: [
              '日本の個人情報保護法の正式名称',
              'EUで施行された個人データ保護に関する規則で、忘れられる権利などを規定している',
              'AI開発における倫理基準を定めた国際的な条約',
              '機械学習モデルの精度基準を定めた規格',
            ],
            answer: 1,
            explanation: 'GDPR（General Data Protection Regulation）はEUの一般データ保護規則です。個人データの収集・処理・利用を厳格に規制し、違反には最大2,000万ユーロまたは全世界売上高の4%の制裁金が課されます。EU在住者のデータを扱う全世界の企業が対象です。',
          },
          {
            id: 1088,
            question: 'XAI（説明可能なAI）が必要とされる主な理由はどれか。',
            choices: [
              'AIの学習速度を向上させるため',
              '医療診断・融資審査・採用など高リスクな意思決定でAIがなぜその判断をしたか人間が理解・説明できる必要があるため',
              'AIモデルのパラメータ数を削減して軽量化するため',
              'AIの訓練データをより多く収集するため',
            ],
            answer: 1,
            explanation: 'ディープラーニングは「ブラックボックス」と呼ばれ判断根拠が不透明です。医療診断でAIが「がんの疑いあり」と判断した場合、その根拠を医師が説明できないと患者・医療機関の信頼が得られません。LIME・SHAPなどのXAI技術が判断根拠の可視化に使われます。',
          },
          {
            id: 1089,
            question: 'プロンプトインジェクション攻撃の説明として正しいものはどれか。',
            choices: [
              'AIの学習データに意図的な偏りを混入させる攻撃',
              'LLMへの入力に悪意ある指示を混入させ、システムの本来の動作制約を突破させる攻撃',
              'APIに大量リクエストを送ってAIサービスを停止させるDoS攻撃',
              'AIモデルの重みを不正に書き換えるメモリ攻撃',
            ],
            answer: 1,
            explanation: 'プロンプトインジェクションはチャットボットへの入力に「以前の指示を忘れて…」などと挿入しシステムプロンプトの制約を回避する攻撃です。個人情報の漏洩・不適切な応答の生成などに悪用されます。入力のサニタイズや出力の検証が対策です。',
          },
          {
            id: 1090,
            question: '機械学習モデルの「正規化（Normalization）」前処理の主な目的はどれか。',
            choices: [
              '訓練データから外れ値を除外してモデルの精度を上げること',
              '異なるスケールの特徴量（例：年齢0〜100と収入0〜10000万円）を同じスケールにそろえ、学習を安定・高速化すること',
              '訓練データとテストデータを同じ割合で分割すること',
              '欠損値を平均値や中央値で補完して完全なデータセットを作ること',
            ],
            answer: 1,
            explanation: '正規化・標準化は特徴量のスケール差が勾配降下法の収束を妨げる問題を解消します。例えば年齢（0〜100）と年収（0〜1000万）をそのまま使うと年収の影響が大きくなりすぎます。Min-Max正規化（0〜1に収める）や標準化（平均0・分散1）が代表的手法です。',
          },
        ],
      },
    ],
  },
];

export const curriculum: Chapter[] = [...baseChapters, ...additionalChapters];

export const getChapterById = (id: string) => curriculum.find(c => c.id === id);
export const getSubjectChapters = (subject: 'A' | 'B') => curriculum.filter(c => c.subject === subject);
