import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用語集',
  description: '基本情報技術者試験（FE）の重要用語を分野別にまとめた用語集。ハードウェア・ソフトウェア・ネットワーク・セキュリティ・データベース・AI・マネジメント分野の頻出用語を網羅。',
};

interface Term {
  term: string;
  reading?: string;
  definition: string;
}

interface TermGroup {
  category: string;
  icon: string;
  terms: Term[];
}

const groups: TermGroup[] = [
  {
    category: 'ハードウェア・コンピュータ構成',
    icon: '🖥️',
    terms: [
      { term: 'CPU', definition: '中央処理装置。演算・制御を担当するコンピュータの中枢。制御装置と演算装置（ALU）で構成される。' },
      { term: 'ALU', definition: '算術論理演算装置。CPUの演算部分で、加減算・論理演算を実行する。' },
      { term: 'レジスタ', reading: 'register', definition: 'CPU内の高速な一時記憶領域。演算中のデータや命令を保持する。' },
      { term: 'キャッシュメモリ', definition: 'CPUと主記憶の速度差を埋める高速メモリ。L1・L2・L3と階層を持つ。' },
      { term: 'パイプライン', definition: '1つの命令を複数の段階（フェッチ・デコード・実行・ライトバック）に分割し並行処理する手法。' },
      { term: 'MIPS', definition: '1秒あたりに実行できる命令数（百万単位）。CPU性能の指標。クロック周波数÷CPI で求める。' },
      { term: 'DMA', definition: 'Direct Memory Access。CPUを介さずに入出力装置とメモリ間でデータを転送する仕組み。' },
      { term: 'MTBF', definition: '平均故障間隔（Mean Time Between Failures）。正常稼働している時間の平均。長いほど信頼性が高い。' },
      { term: 'MTTR', definition: '平均修復時間（Mean Time To Repair）。故障してから復旧するまでの平均時間。短いほど保守性が高い。' },
      { term: '稼働率', definition: 'MTBF÷(MTBF+MTTR)。システムが正常動作している時間の割合。' },
    ],
  },
  {
    category: 'データ表現・情報理論',
    icon: '🔢',
    terms: [
      { term: '2の補数', definition: '負の整数を2進数で表現する方式。ビットを反転させて1を加えた値。' },
      { term: '浮動小数点数', definition: '実数を符号・指数部・仮数部で表現する方式。IEEE 754が標準規格。' },
      { term: '桁落ち', definition: '近い値の引き算で有効桁数が失われる演算誤差。' },
      { term: '情報量', definition: '確率pの事象が持つ情報量 = log₂(1/p)ビット。確率が低いほど情報量が多い。' },
      { term: 'ハフマン符号', definition: '出現頻度が高い文字に短い符号を割り当てるデータ圧縮方式。' },
      { term: 'パリティビット', definition: '誤り検出のために付加するビット。奇数パリティと偶数パリティがある。1ビット誤りを検出できるが訂正はできない。' },
      { term: 'CRC', definition: '巡回冗長検査（Cyclic Redundancy Check）。多項式除算でチェックサムを生成する誤り検出方式。' },
      { term: 'ハミング符号', definition: '誤りを検出・訂正できる符号。1ビット誤り訂正、2ビット誤り検出が可能。' },
    ],
  },
  {
    category: 'ソフトウェア・OS',
    icon: '⚙️',
    terms: [
      { term: 'プロセス', definition: '実行中のプログラム。独自のメモリ空間を持ち、OSが管理する実行単位。' },
      { term: 'スレッド', definition: 'プロセス内の軽量な実行単位。同一プロセス内でメモリを共有するため切り替えコストが低い。' },
      { term: 'デッドロック', definition: '複数プロセスが互いに相手の資源解放を待ち続け、永久に進まなくなる状態。' },
      { term: 'セマフォ', definition: 'カウンタを使って同時アクセス数を制限する排他制御の仕組み。' },
      { term: 'スプーリング', definition: 'SPOOL。低速な出力装置（プリンタ等）へのデータを一時的に磁気ディスクに蓄積し、非同期で出力する仕組み。' },
      { term: '仮想記憶', definition: '主記憶の不足を補助記憶で仮想的に拡張する仕組み。ページング方式とセグメント方式がある。' },
      { term: 'スラッシング', definition: 'ページフォールトが頻発し、ページ置換処理に時間がとられてシステム性能が著しく低下する現象。' },
      { term: 'ガベージコレクション', definition: 'プログラムが使用しなくなったメモリ領域を自動的に回収する仕組み。JavaやPythonが採用。' },
      { term: 'API', definition: 'Application Programming Interface。ソフトウェア間の機能呼び出し規約。REST APIが現在の主流。' },
      { term: 'ミドルウェア', definition: 'OSとアプリケーションの中間に位置するソフトウェア。DBMSやWebサーバが代表例。' },
    ],
  },
  {
    category: 'ネットワーク',
    icon: '🌐',
    terms: [
      { term: 'IPアドレス', definition: 'ネットワーク上のホストを識別する番号。IPv4は32ビット、IPv6は128ビット。' },
      { term: 'サブネットマスク', definition: 'IPアドレスのネットワーク部とホスト部を区別するビットマスク。CIDR表記（/24など）と対応。' },
      { term: 'デフォルトゲートウェイ', definition: '異なるネットワークへのパケットを転送するルータのIPアドレス。' },
      { term: 'DNS', definition: 'Domain Name System。ドメイン名（example.com）をIPアドレスに変換する仕組み（名前解決）。' },
      { term: 'DHCP', definition: '動的にIPアドレスを割り当てるプロトコル。ネットワーク参加時に自動設定される。' },
      { term: 'NAT', definition: 'Network Address Translation。プライベートIPとグローバルIPを相互変換する技術。' },
      { term: 'TCP', definition: '信頼性のある通信を提供するトランスポート層プロトコル。3ウェイハンドシェイクで接続確立、ACKで信頼性を保証。' },
      { term: 'UDP', definition: '信頼性より速度を優先するトランスポート層プロトコル。コネクションレス型。動画ストリーミング・DNSで使用。' },
      { term: 'HTTP/HTTPS', definition: 'Webのデータ転送プロトコル。HTTPSはTLSで暗号化される。HTTPはポート80、HTTPSはポート443。' },
      { term: 'FTP', definition: 'File Transfer Protocol。ファイル転送用プロトコル。ポート20（データ）・21（制御）を使用。' },
      { term: 'SMTP/POP3/IMAP', definition: 'メール関連プロトコル。SMTP=送信、POP3=受信（ダウンロード型）、IMAP=受信（サーバ管理型）。' },
      { term: 'VPN', definition: 'Virtual Private Network。公共ネットワーク上に暗号化された仮想専用線を構築する技術。' },
    ],
  },
  {
    category: 'セキュリティ',
    icon: '🔐',
    terms: [
      { term: 'CIA', definition: '情報セキュリティの三大要素。機密性（Confidentiality）・完全性（Integrity）・可用性（Availability）。' },
      { term: '共通鍵暗号', definition: '暗号化と復号に同じ鍵を使う方式。AESが代表。高速だが鍵配送問題がある。n人の通信でn(n-1)/2本の鍵が必要。' },
      { term: '公開鍵暗号', definition: '公開鍵で暗号化、秘密鍵で復号する方式。RSAが代表。鍵配送問題を解決。n人でも2n本の鍵で足りる。' },
      { term: 'デジタル署名', definition: '送信者が秘密鍵で署名、受信者が公開鍵で検証。なりすまし防止と否認防止に使用。' },
      { term: 'PKI', definition: '公開鍵基盤。認証局（CA）がデジタル証明書を発行し、公開鍵の正当性を保証する仕組み。' },
      { term: 'ハッシュ関数', definition: '任意のデータから固定長のハッシュ値を生成する一方向関数。MD5・SHA-256が代表。改ざん検出に使用。' },
      { term: 'SQLインジェクション', definition: '悪意ある SQL文を入力してDBを不正操作する攻撃。プリペアドステートメントで対策。' },
      { term: 'XSS', definition: 'クロスサイトスクリプティング。悪意あるスクリプトをWebページに埋め込む攻撃。入力値のエスケープで対策。' },
      { term: 'CSRF', definition: 'クロスサイトリクエストフォージェリ。認証済みユーザに意図しないリクエストを送信させる攻撃。' },
      { term: 'フィッシング', definition: '正規サービスを装った偽サイト・メールで認証情報を詐取する攻撃。' },
      { term: 'ランサムウェア', definition: 'ファイルを暗号化して身代金を要求するマルウェア。バックアップが最重要対策。' },
      { term: 'ゼロデイ攻撃', definition: 'セキュリティパッチが存在しない脆弱性を悪用した攻撃。発見から対策公開までの間（ゼロデイ）に実行される。' },
    ],
  },
  {
    category: 'データベース',
    icon: '🗄️',
    terms: [
      { term: 'RDBMS', definition: 'リレーショナルデータベース管理システム。表（テーブル）の形式でデータを管理する。MySQL・PostgreSQL・Oracleが代表。' },
      { term: '主キー', definition: 'テーブル内の各行を一意に識別する列（または列の組み合わせ）。NULLは許可されない。' },
      { term: '外部キー', definition: '別テーブルの主キーを参照する列。参照整合性制約により不整合なデータの登録を防ぐ。' },
      { term: '正規化', definition: 'データの重複や更新異常を排除するためにテーブルを適切に分割する設計手法。1NF→2NF→3NFの順に進める。' },
      { term: 'ACID特性', definition: 'トランザクションが満たすべき4条件。原子性（Atomicity）・一貫性（Consistency）・独立性（Isolation）・耐久性（Durability）。' },
      { term: 'デッドロック（DB）', definition: '複数トランザクションが互いにロックの解放を待ち合う状態。DBMSが検出してロールバックで解消する。' },
      { term: 'インデックス', definition: 'データ検索を高速化するための索引。B木構造が一般的。SELECT速度は上がるがINSERT/UPDATEは遅くなる。' },
      { term: 'ビュー', definition: 'SELECT文の結果を仮想テーブルとして定義したもの。データを直接持たず、参照時に毎回クエリが実行される。' },
      { term: 'SQL', definition: 'Structured Query Language。RDBMSを操作するための言語。SELECT・INSERT・UPDATE・DELETE（DML）が基本。' },
      { term: 'NoSQL', definition: 'RDB以外のデータベース総称。キー・バリュー型（Redis）・ドキュメント型（MongoDB）・グラフ型などがある。大規模データ・高速処理向け。' },
    ],
  },
  {
    category: 'アルゴリズム・データ構造',
    icon: '⏱️',
    terms: [
      { term: 'スタック', definition: 'LIFO（後入れ先出し）のデータ構造。push/pop操作。関数呼び出しの管理・逆ポーランド記法計算に使用。' },
      { term: 'キュー', definition: 'FIFO（先入れ先出し）のデータ構造。enqueue/dequeue操作。タスクの待ち行列・BFSに使用。' },
      { term: '二分探索', definition: 'ソート済み配列を半分ずつ絞り込んで検索するアルゴリズム。O(log n)の計算量。' },
      { term: 'バブルソート', definition: '隣接要素を比較・交換を繰り返すソート。O(n²)。実装は単純だが効率は低い。' },
      { term: 'クイックソート', definition: 'ピボットを基準に分割を繰り返す高速ソート。平均O(n log n)、最悪O(n²)。' },
      { term: 'マージソート', definition: '配列を分割して整列済み部分をマージするソート。常にO(n log n)で安定ソート。' },
      { term: 'O記法', definition: 'アルゴリズムの計算量（時間・空間）を表す漸近的記法。O(1) < O(log n) < O(n) < O(n log n) < O(n²)の順で悪化。' },
      { term: '木構造', definition: '親子関係で繋がったノードの集合。二分探索木はO(log n)での探索・挿入が可能。' },
      { term: '再帰', definition: '関数が自分自身を呼び出す手法。階乗・フィボナッチ数・木の探索に使われる。スタックオーバーフローに注意。' },
    ],
  },
  {
    category: 'クラウド・仮想化',
    icon: '☁️',
    terms: [
      { term: 'IaaS', definition: 'Infrastructure as a Service。仮想サーバ・ネットワーク・ストレージを提供。OSから上は利用者が管理。AWS EC2が代表。' },
      { term: 'PaaS', definition: 'Platform as a Service。OSとミドルウェアまでを提供。利用者はアプリ開発に専念。Google App Engineが代表。' },
      { term: 'SaaS', definition: 'Software as a Service。アプリまでを含む全ITリソースを提供。利用者はデータ管理のみ。Gmail・Slackが代表。' },
      { term: 'ハイパーバイザー', definition: '物理ハードウェア上で複数のゲストOSを実行するための仮想化ソフトウェア。ベアメタル型がデータセンターの標準。' },
      { term: 'コンテナ', definition: 'OSカーネルを共有しながらプロセスレベルで隔離する仮想化技術。VMより軽量・高速。Dockerが代表。' },
      { term: 'Kubernetes', definition: '複数コンテナを自動管理するオーケストレーションツール。自動スケーリング・自己修復・ローリングアップデートを提供。' },
      { term: 'サーバレス', definition: 'FaaS（Function as a Service）。サーバ管理不要でコード（関数）のみを実行。イベント駆動・使った分だけ課金。AWS Lambdaが代表。' },
      { term: 'ベンダーロックイン', definition: '特定クラウド事業者の独自サービスへの依存が深まり、他社への乗り換えが困難・高コストになる状態。' },
    ],
  },
  {
    category: 'AI・機械学習',
    icon: '🤖',
    terms: [
      { term: '機械学習', definition: 'データからコンピュータがパターンを自動学習する手法。AIを実現する中心的技術。' },
      { term: '教師あり学習', definition: '正解ラベル付きデータを使い、入力→出力の関係を学習する手法。スパムフィルタ・画像分類が代表。' },
      { term: '教師なし学習', definition: 'ラベルなしデータからパターン・構造を発見する手法。クラスタリング・次元削減が代表。' },
      { term: '強化学習', definition: 'エージェントが環境との試行錯誤で報酬を最大化するよう学習する手法。ゲームAI・ロボット制御が代表。' },
      { term: 'ディープラーニング', definition: '多層ニューラルネットワークを使った機械学習。大量データとGPUにより画像・音声・言語で高精度を実現。' },
      { term: 'LLM', definition: '大規模言語モデル（Large Language Model）。Transformerベースの生成AI。GPT・Claude・Geminiが代表。' },
      { term: 'ハルシネーション', definition: 'LLMが事実と異なる情報を自信をもって生成する問題。出力の検証が必須。' },
      { term: 'バイアス（AI）', definition: '訓練データの偏りがモデルの判断に影響し、特定グループへの不公平な結果を生む問題。' },
      { term: '過学習', definition: '訓練データに過度に適合し未知データへの汎化性能が低下する現象。正則化・交差検証で対策。' },
    ],
  },
  {
    category: 'システム開発・プロジェクト管理',
    icon: '📋',
    terms: [
      { term: 'ウォーターフォール', definition: '要件定義→設計→実装→テスト→運用を一方向に進める開発モデル。要件が固定の大規模案件に向く。' },
      { term: 'アジャイル', definition: '短サイクル（スプリント）で反復開発し変化に対応する開発手法の総称。スクラム・XPが代表。' },
      { term: 'スクラム', definition: '最も普及したアジャイルフレームワーク。スプリント・プロダクトバックログ・デイリースクラムが特徴。' },
      { term: 'スプリント', definition: 'スクラムにおける1〜4週間の開発サイクル。計画→開発→レビュー→振り返りを繰り返す。' },
      { term: 'WBS', definition: 'Work Breakdown Structure。プロジェクトの作業を階層的に分解した構造図。作業漏れ防止と工数見積もりに使用。' },
      { term: 'クリティカルパス', definition: 'プロジェクト全体の最長経路。この経路上の遅延がプロジェクト全体の遅延に直結する。' },
      { term: 'EVM', definition: 'アーンドバリューマネジメント。計画・実績・完成済み価値を比較してプロジェクトの遅延・コスト超過を定量的に管理する手法。' },
      { term: 'SLA', definition: 'サービスレベルアグリーメント。サービス提供者と利用者間で合意するサービス品質の指標。稼働率・応答時間などを規定。' },
    ],
  },
  {
    category: 'ストラテジ・マネジメント',
    icon: '📊',
    terms: [
      { term: 'SWOT分析', definition: '自社の強み（S）・弱み（W）・外部機会（O）・脅威（T）を分析する経営フレームワーク。' },
      { term: 'BSC', definition: 'バランスト・スコアカード。財務・顧客・業務プロセス・学習成長の4視点で企業パフォーマンスを評価する手法。' },
      { term: 'BPR', definition: 'ビジネスプロセス・リエンジニアリング。業務プロセスを抜本的に再設計して効率化する取り組み。' },
      { term: 'ROI', definition: '投資対効果（Return on Investment）= 利益÷投資額×100(%)。ITプロジェクトの経済効果測定に使用。' },
      { term: 'TCO', definition: '総所有コスト（Total Cost of Ownership）。初期費用だけでなく運用・保守・廃棄コストを含む総コスト。' },
      { term: 'SaaS', definition: 'Software as a Service。クラウドでアプリを提供するサービスモデル。' },
      { term: 'GDPR', definition: 'EUの一般データ保護規則。忘れられる権利・データポータビリティを規定。違反には高額制裁金。' },
      { term: '個人情報保護法', definition: '個人識別情報の取り扱いを規制する日本の法律。2022年改正で第三者提供規制などが強化された。' },
    ],
  },
];

export default function GlossaryPage() {
  return (
    <main className="formulas-page">
      <div className="formulas-container">
        <div className="formulas-header">
          <h1 className="formulas-title">用語集</h1>
          <p className="formulas-subtitle">基本情報技術者試験の頻出用語を分野別にまとめました。試験直前の確認や学習の補助にご活用ください。</p>
        </div>

        <div className="glossary-search-hint">
          <span>💡</span>
          <span>ブラウザの検索機能（Ctrl+F / ⌘+F）で用語を素早く探せます</span>
        </div>

        <div className="formulas-grid glossary-grid">
          {groups.map((group) => (
            <section key={group.category} className="formula-card glossary-card">
              <h2 className="formula-card-title">
                <span className="formula-card-icon">{group.icon}</span>
                {group.category}
              </h2>
              <div className="glossary-term-list">
                {group.terms.map((t) => (
                  <div key={t.term} className="glossary-term-item">
                    <div className="glossary-term-name">
                      {t.term}
                      {t.reading && <span className="glossary-term-reading">（{t.reading}）</span>}
                    </div>
                    <div className="glossary-term-def">{t.definition}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
