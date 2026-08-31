'use client';
import React from 'react';

interface DiagramProps {
  type: string;
}

const BinaryDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">基数変換チャート</h4>
    <svg viewBox="0 0 500 200" className="diagram-svg">
      {/* Boxes */}
      <rect x="10" y="60" width="110" height="80" rx="8" fill="#2da3d9" opacity="0.15" stroke="#2da3d9" strokeWidth="2"/>
      <text x="65" y="95" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="14">10進数</text>
      <text x="65" y="115" textAnchor="middle" fill="#2da3d9" fontSize="20" fontWeight="bold">26</text>

      <rect x="195" y="60" width="110" height="80" rx="8" fill="#48bb78" opacity="0.15" stroke="#48bb78" strokeWidth="2"/>
      <text x="250" y="95" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="14">2進数</text>
      <text x="250" y="115" textAnchor="middle" fill="#276749" fontSize="20" fontWeight="bold">11010</text>

      <rect x="380" y="60" width="110" height="80" rx="8" fill="#ed8936" opacity="0.15" stroke="#ed8936" strokeWidth="2"/>
      <text x="435" y="95" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="14">16進数</text>
      <text x="435" y="115" textAnchor="middle" fill="#c05621" fontSize="20" fontWeight="bold">1A</text>

      {/* Arrows */}
      <path d="M 120 100 L 190 100" stroke="#718096" strokeWidth="2" markerEnd="url(#arrow)"/>
      <text x="155" y="90" textAnchor="middle" fill="#718096" fontSize="11">÷2</text>

      <path d="M 305 100 L 375 100" stroke="#718096" strokeWidth="2" markerEnd="url(#arrow)"/>
      <text x="340" y="90" textAnchor="middle" fill="#718096" fontSize="11">4bit→1桁</text>

      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#718096"/>
        </marker>
      </defs>

      {/* Labels */}
      <text x="250" y="170" textAnchor="middle" fill="#718096" fontSize="12">例: 26₁₀ = 11010₂ = 1A₁₆</text>
    </svg>
  </div>
);

const LogicDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">論理演算の真理値表</h4>
    <div className="truth-table-wrapper">
      <table className="truth-table">
        <thead>
          <tr>
            <th>A</th><th>B</th><th>A AND B</th><th>A OR B</th><th>A XOR B</th><th>NOT A</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>0</td><td>0</td><td className="and">0</td><td className="or">0</td><td className="xor">0</td><td className="not">1</td></tr>
          <tr><td>0</td><td>1</td><td className="and">0</td><td className="or">1</td><td className="xor">1</td><td className="not">1</td></tr>
          <tr><td>1</td><td>0</td><td className="and">0</td><td className="or">1</td><td className="xor">1</td><td className="not">0</td></tr>
          <tr><td>1</td><td>1</td><td className="and">1</td><td className="or">1</td><td className="xor">0</td><td className="not">0</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

const CpuDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">コンピュータの5大装置</h4>
    <svg viewBox="0 0 520 240" className="diagram-svg">
      {/* CPU box */}
      <rect x="170" y="10" width="180" height="130" rx="10" fill="#2da3d9" opacity="0.1" stroke="#2da3d9" strokeWidth="2.5"/>
      <text x="260" y="32" textAnchor="middle" fill="#2da3d9" fontWeight="bold" fontSize="13">CPU</text>

      {/* Control unit */}
      <rect x="182" y="42" width="72" height="44" rx="6" fill="#2da3d9" opacity="0.2" stroke="#2da3d9" strokeWidth="1.5"/>
      <text x="218" y="61" textAnchor="middle" fill="#4a5568" fontSize="11" fontWeight="bold">制御装置</text>
      <text x="218" y="77" textAnchor="middle" fill="#4a5568" fontSize="10">命令解読</text>

      {/* ALU */}
      <rect x="264" y="42" width="72" height="44" rx="6" fill="#2da3d9" opacity="0.2" stroke="#2da3d9" strokeWidth="1.5"/>
      <text x="300" y="61" textAnchor="middle" fill="#4a5568" fontSize="11" fontWeight="bold">演算装置</text>
      <text x="300" y="77" textAnchor="middle" fill="#4a5568" fontSize="10">ALU</text>

      {/* Memory */}
      <rect x="182" y="96" width="154" height="34" rx="6" fill="#48bb78" opacity="0.2" stroke="#48bb78" strokeWidth="1.5"/>
      <text x="259" y="118" textAnchor="middle" fill="#276749" fontSize="11" fontWeight="bold">主記憶装置（RAM）</text>

      {/* Input */}
      <rect x="10" y="90" width="110" height="50" rx="8" fill="#ed8936" opacity="0.15" stroke="#ed8936" strokeWidth="2"/>
      <text x="65" y="111" textAnchor="middle" fill="#c05621" fontWeight="bold" fontSize="12">入力装置</text>
      <text x="65" y="127" textAnchor="middle" fill="#744210" fontSize="10">キーボード等</text>

      {/* Output */}
      <rect x="400" y="90" width="110" height="50" rx="8" fill="#282867" opacity="0.15" stroke="#282867" strokeWidth="2"/>
      <text x="455" y="111" textAnchor="middle" fill="#1a2060" fontWeight="bold" fontSize="12">出力装置</text>
      <text x="455" y="127" textAnchor="middle" fill="#1a2060" fontSize="10">ディスプレイ等</text>

      {/* Storage */}
      <rect x="185" y="180" width="150" height="44" rx="8" fill="#fc8181" opacity="0.15" stroke="#fc8181" strokeWidth="2"/>
      <text x="260" y="199" textAnchor="middle" fill="#c53030" fontWeight="bold" fontSize="12">補助記憶装置</text>
      <text x="260" y="215" textAnchor="middle" fill="#822727" fontSize="10">HDD / SSD</text>

      {/* Arrows */}
      <path d="M 120 115 L 168 115" stroke="#ed8936" strokeWidth="2" markerEnd="url(#arrow2)"/>
      <path d="M 352 115 L 398 115" stroke="#282867" strokeWidth="2" markerEnd="url(#arrow2)"/>
      <path d="M 260 144 L 260 178" stroke="#fc8181" strokeWidth="2" markerEnd="url(#arrow2)"/>

      <defs>
        <marker id="arrow2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
        </marker>
      </defs>
    </svg>
  </div>
);

const OsiDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">OSI参照モデル</h4>
    <div className="osi-layers">
      {[
        { num: 7, name: 'アプリケーション層', protocol: 'HTTP, FTP, DNS', color: '#2da3d9' },
        { num: 6, name: 'プレゼンテーション層', protocol: '暗号化, 文字コード変換', color: '#2090bc' },
        { num: 5, name: 'セッション層', protocol: 'セッション管理', color: '#282867' },
        { num: 4, name: 'トランスポート層', protocol: 'TCP, UDP', color: '#48bb78' },
        { num: 3, name: 'ネットワーク層', protocol: 'IP, ICMP', color: '#38a169' },
        { num: 2, name: 'データリンク層', protocol: 'Ethernet, MACアドレス', color: '#ed8936' },
        { num: 1, name: '物理層', protocol: '電気信号, ビット', color: '#fc8181' },
      ].map(layer => (
        <div key={layer.num} className="osi-layer" style={{ borderLeftColor: layer.color }}>
          <span className="osi-num" style={{ background: layer.color }}>第{layer.num}層</span>
          <span className="osi-name">{layer.name}</span>
          <span className="osi-protocol">{layer.protocol}</span>
        </div>
      ))}
    </div>
  </div>
);

const StackQueueDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">スタック vs キュー</h4>
    <div className="stack-queue-wrapper">
      <div className="ds-box">
        <div className="ds-title" style={{ color: '#2da3d9' }}>スタック（LIFO）</div>
        <svg viewBox="0 0 120 160" width="120" height="160">
          <rect x="20" y="10" width="80" height="30" rx="4" fill="#2da3d9" opacity="0.8"/>
          <text x="60" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">3</text>
          <rect x="20" y="48" width="80" height="30" rx="4" fill="#2da3d9" opacity="0.6"/>
          <text x="60" y="68" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">2</text>
          <rect x="20" y="86" width="80" height="30" rx="4" fill="#2da3d9" opacity="0.4"/>
          <text x="60" y="106" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">1</text>
          <line x1="20" y1="125" x2="100" y2="125" stroke="#4a5568" strokeWidth="3"/>
          <text x="60" y="145" textAnchor="middle" fill="#718096" fontSize="11">↑ 3から取り出す</text>
        </svg>
        <div className="ds-note">後から入れたものが先に出る</div>
      </div>
      <div className="ds-box">
        <div className="ds-title" style={{ color: '#48bb78' }}>キュー（FIFO）</div>
        <svg viewBox="0 0 180 100" width="180" height="100">
          <rect x="10" y="30" width="40" height="40" rx="4" fill="#48bb78" opacity="0.4"/>
          <text x="30" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">1</text>
          <rect x="60" y="30" width="40" height="40" rx="4" fill="#48bb78" opacity="0.6"/>
          <text x="80" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">2</text>
          <rect x="110" y="30" width="40" height="40" rx="4" fill="#48bb78" opacity="0.8"/>
          <text x="130" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">3</text>
          <text x="10" y="20" fill="#718096" fontSize="10">← 取り出す</text>
          <text x="130" y="90" textAnchor="middle" fill="#718096" fontSize="10">追加 →</text>
        </svg>
        <div className="ds-note">先に入れたものが先に出る</div>
      </div>
    </div>
  </div>
);

const SecurityDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">情報セキュリティのCIA</h4>
    <svg viewBox="0 0 400 220" className="diagram-svg">
      <circle cx="200" cy="100" r="90" fill="none" stroke="#e2e8f0" strokeWidth="2"/>

      <circle cx="200" cy="50" r="55" fill="#2da3d9" opacity="0.2" stroke="#2da3d9" strokeWidth="2"/>
      <text x="200" y="42" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="13">機密性</text>
      <text x="200" y="58" textAnchor="middle" fill="#2da3d9" fontSize="11">Confidentiality</text>

      <circle cx="140" cy="148" r="55" fill="#48bb78" opacity="0.2" stroke="#48bb78" strokeWidth="2"/>
      <text x="140" y="140" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="13">完全性</text>
      <text x="140" y="156" textAnchor="middle" fill="#48bb78" fontSize="11">Integrity</text>

      <circle cx="260" cy="148" r="55" fill="#ed8936" opacity="0.2" stroke="#ed8936" strokeWidth="2"/>
      <text x="260" y="140" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="13">可用性</text>
      <text x="260" y="156" textAnchor="middle" fill="#ed8936" fontSize="11">Availability</text>

      <text x="200" y="105" textAnchor="middle" fill="#4a5568" fontSize="16" fontWeight="bold">CIA</text>

      <text x="200" y="200" textAnchor="middle" fill="#718096" fontSize="11">情報セキュリティの三大要素</text>
    </svg>
  </div>
);

const SortDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">バブルソートの動き（例: [5,3,1]）</h4>
    <div className="sort-steps">
      {[
        { label: '初期', arr: [5, 3, 1], highlight: [] },
        { label: 'パス1', arr: [3, 1, 5], highlight: [2] },
        { label: 'パス2', arr: [1, 3, 5], highlight: [1, 2] },
        { label: '完了', arr: [1, 2, 3].map((_, i) => [1, 3, 5][i]), highlight: [0, 1, 2] },
      ].map((step, si) => (
        <div key={si} className="sort-step">
          <span className="sort-label">{step.label}</span>
          <div className="sort-bars">
            {step.arr.map((val, i) => (
              <div key={i} className="sort-bar-wrap">
                <div
                  className="sort-bar"
                  style={{
                    height: `${val * 14}px`,
                    background: step.highlight.includes(i) ? '#48bb78' : '#2da3d9',
                  }}
                />
                <span className="sort-val">{val}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FlowchartDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">制御構造のフローチャート</h4>
    <svg viewBox="0 0 300 240" className="diagram-svg">
      {/* Start */}
      <ellipse cx="150" cy="20" rx="50" ry="16" fill="#2da3d9" opacity="0.8"/>
      <text x="150" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">開始</text>

      {/* Process */}
      <rect x="90" y="55" width="120" height="35" rx="4" fill="#2da3d9" opacity="0.2" stroke="#2da3d9" strokeWidth="1.5"/>
      <text x="150" y="78" textAnchor="middle" fill="#4a5568" fontSize="11">x ← 0</text>

      {/* Diamond */}
      <polygon points="150,108 210,130 150,152 90,130" fill="#ed8936" opacity="0.2" stroke="#ed8936" strokeWidth="1.5"/>
      <text x="150" y="126" textAnchor="middle" fill="#744210" fontSize="10" fontWeight="bold">x &lt; 5 ?</text>
      <text x="150" y="140" textAnchor="middle" fill="#744210" fontSize="10">True/False</text>

      {/* Process 2 */}
      <rect x="90" y="165" width="120" height="35" rx="4" fill="#48bb78" opacity="0.2" stroke="#48bb78" strokeWidth="1.5"/>
      <text x="150" y="188" textAnchor="middle" fill="#276749" fontSize="11">x ← x + 1</text>

      {/* End */}
      <ellipse cx="150" cy="224" rx="50" ry="14" fill="#718096" opacity="0.6"/>
      <text x="150" y="229" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">終了</text>

      {/* Arrows */}
      <path d="M 150 36 L 150 54" stroke="#718096" strokeWidth="1.5" markerEnd="url(#a3)"/>
      <path d="M 150 90 L 150 107" stroke="#718096" strokeWidth="1.5" markerEnd="url(#a3)"/>
      <path d="M 150 153 L 150 164" stroke="#718096" strokeWidth="1.5" markerEnd="url(#a3)"/>
      <path d="M 150 200 L 150 209" stroke="#718096" strokeWidth="1.5" markerEnd="url(#a3)"/>
      {/* Loop back arrow */}
      <path d="M 90 130 Q 40 130 40 182 Q 40 220 90 220" stroke="#ed8936" strokeWidth="1.5" fill="none" markerEnd="url(#a3)"/>
      <text x="30" y="182" fill="#c05621" fontSize="9">True</text>
      <text x="85" y="225" fill="#718096" fontSize="9">False</text>

      <defs>
        <marker id="a3" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
        </marker>
      </defs>
    </svg>
  </div>
);

const ClockDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">CPU性能の計算式</h4>
    <div className="formula-box">
      <div className="formula">
        <span className="formula-label">実行時間</span>
        <span className="formula-eq">=</span>
        <span className="formula-num">命令数 × CPI</span>
        <span className="formula-div">÷</span>
        <span className="formula-denom">クロック周波数</span>
      </div>
      <div className="formula" style={{ marginTop: '16px' }}>
        <span className="formula-label">MIPS</span>
        <span className="formula-eq">=</span>
        <span className="formula-num">クロック周波数(MHz)</span>
        <span className="formula-div">÷</span>
        <span className="formula-denom">CPI</span>
      </div>
      <div className="formula-example">
        例: 2GHz ÷ CPI4 = <strong>500 MIPS</strong>
      </div>
    </div>
  </div>
);

const OsDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">OSの主な機能</h4>
    <svg viewBox="0 0 480 200" className="diagram-svg">
      <rect x="10" y="10" width="460" height="60" rx="8" fill="#2da3d9" opacity="0.15" stroke="#2da3d9" strokeWidth="2"/>
      <text x="240" y="38" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="14">アプリケーション</text>
      <text x="240" y="58" textAnchor="middle" fill="#2da3d9" fontSize="12">Word / Chrome / ゲームなど</text>
      {[
        { x: 10, label: 'プロセス管理', sub: 'マルチタスク', color: '#48bb78' },
        { x: 125, label: 'メモリ管理', sub: '仮想記憶', color: '#ed8936' },
        { x: 240, label: 'ファイル管理', sub: 'ディスクI/O', color: '#282867' },
        { x: 355, label: 'デバイス管理', sub: 'ドライバ', color: '#fc8181' },
      ].map(item => (
        <g key={item.label}>
          <rect x={item.x} y="85" width="105" height="55" rx="6" fill={item.color} opacity="0.2" stroke={item.color} strokeWidth="1.5"/>
          <text x={item.x + 52} y="108" textAnchor="middle" fill="#4a5568" fontSize="12" fontWeight="bold">{item.label}</text>
          <text x={item.x + 52} y="128" textAnchor="middle" fill="#718096" fontSize="11">{item.sub}</text>
        </g>
      ))}
      <rect x="10" y="155" width="460" height="38" rx="8" fill="#2d3748" opacity="0.8"/>
      <text x="240" y="179" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">ハードウェア（CPU・メモリ・ディスク）</text>
    </svg>
  </div>
);

const FilesystemDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">ディレクトリ構造（ツリー）</h4>
    <svg viewBox="0 0 380 200" className="diagram-svg">
      <rect x="155" y="10" width="70" height="32" rx="6" fill="#2da3d9" opacity="0.8"/>
      <text x="190" y="31" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">/ (ルート)</text>
      <line x1="190" y1="42" x2="100" y2="75" stroke="#718096" strokeWidth="1.5"/>
      <line x1="190" y1="42" x2="190" y2="75" stroke="#718096" strokeWidth="1.5"/>
      <line x1="190" y1="42" x2="280" y2="75" stroke="#718096" strokeWidth="1.5"/>
      {[
        { x: 65, label: 'home' },
        { x: 155, label: 'etc' },
        { x: 245, label: 'var' },
      ].map(d => (
        <g key={d.label}>
          <rect x={d.x} y="75" width="70" height="28" rx="5" fill="#48bb78" opacity="0.7"/>
          <text x={d.x + 35} y="94" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.label}</text>
        </g>
      ))}
      <line x1="100" y1="103" x2="65" y2="135" stroke="#718096" strokeWidth="1.5"/>
      <line x1="100" y1="103" x2="135" y2="135" stroke="#718096" strokeWidth="1.5"/>
      {[
        { x: 30, label: 'user1' },
        { x: 100, label: 'user2' },
      ].map(d => (
        <g key={d.label}>
          <rect x={d.x} y="135" width="65" height="26" rx="5" fill="#ed8936" opacity="0.7"/>
          <text x={d.x + 32} y="152" textAnchor="middle" fill="white" fontSize="11">{d.label}</text>
        </g>
      ))}
      <text x="190" y="190" textAnchor="middle" fill="#718096" fontSize="11">絶対パス例: /home/user1/file.txt</text>
    </svg>
  </div>
);

const DatabaseDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">テーブルの構造と結合</h4>
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#2da3d9' }}>社員テーブル</div>
        <table className="truth-table" style={{ fontSize: 13 }}>
          <thead><tr><th>社員ID</th><th>氏名</th><th>部署ID</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>田中</td><td style={{ color: '#e53e3e', fontWeight: 700 }}>10</td></tr>
            <tr><td>2</td><td>鈴木</td><td style={{ color: '#e53e3e', fontWeight: 700 }}>20</td></tr>
            <tr><td>3</td><td>佐藤</td><td style={{ color: '#e53e3e', fontWeight: 700 }}>10</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: '#718096' }}>⟷</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#48bb78' }}>部署テーブル</div>
        <table className="truth-table" style={{ fontSize: 13 }}>
          <thead><tr><th>部署ID</th><th>部署名</th></tr></thead>
          <tbody>
            <tr><td style={{ color: '#e53e3e', fontWeight: 700 }}>10</td><td>開発部</td></tr>
            <tr><td style={{ color: '#e53e3e', fontWeight: 700 }}>20</td><td>営業部</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#718096' }}>
      部署IDが外部キー（Foreign Key）
    </div>
  </div>
);

const TransactionDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">トランザクションの流れ（銀行振込の例）</h4>
    <svg viewBox="0 0 480 180" className="diagram-svg">
      {[
        { x: 10, label: 'BEGIN', sub: 'トランザクション開始', color: '#2da3d9' },
        { x: 130, label: '引き落とし', sub: 'A口座 -1万円', color: '#ed8936' },
        { x: 250, label: '入金', sub: 'B口座 +1万円', color: '#48bb78' },
        { x: 370, label: 'COMMIT', sub: '確定', color: '#38a169' },
      ].map((step, i) => (
        <g key={step.label}>
          <rect x={step.x} y="50" width="100" height="60" rx="8" fill={step.color} opacity="0.2" stroke={step.color} strokeWidth="2"/>
          <text x={step.x + 50} y="77" textAnchor="middle" fill="#4a5568" fontSize="12" fontWeight="bold">{step.label}</text>
          <text x={step.x + 50} y="97" textAnchor="middle" fill="#718096" fontSize="10">{step.sub}</text>
          {i < 3 && <path d={`M ${step.x + 100} 80 L ${step.x + 128} 80`} stroke="#718096" strokeWidth="1.5" markerEnd="url(#a4)"/>}
        </g>
      ))}
      <path d="M 200 115 Q 200 150 240 150 Q 280 150 280 115" stroke="#fc8181" strokeWidth="1.5" fill="none" strokeDasharray="4"/>
      <text x="240" y="168" textAnchor="middle" fill="#fc8181" fontSize="11">失敗時 → ROLLBACK（全て元に戻す）</text>
      <defs>
        <marker id="a4" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
        </marker>
      </defs>
    </svg>
  </div>
);

const WaterfallDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">ウォーターフォールモデル</h4>
    <svg viewBox="0 0 420 220" className="diagram-svg">
      {[
        { y: 10, label: '要件定義', color: '#2da3d9' },
        { y: 55, label: '外部設計', color: '#2090bc' },
        { y: 100, label: '内部設計', color: '#282867' },
        { y: 145, label: '実装・単体テスト', color: '#48bb78' },
        { y: 190, label: '結合・システムテスト', color: '#38a169' },
      ].map((step, i) => (
        <g key={step.label}>
          <rect x={10 + i * 20} y={step.y} width={400 - i * 40} height="38" rx="6" fill={step.color} opacity="0.75"/>
          <text x={210} y={step.y + 24} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{step.label}</text>
        </g>
      ))}
    </svg>
  </div>
);

const TestingDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">テストの種類（V字モデル）</h4>
    <svg viewBox="0 0 440 200" className="diagram-svg">
      {[
        { lx: 10, ly: 20, label: '要件定義', rx: 340, ry: 20, rlabel: '受入テスト', color: '#2da3d9' },
        { lx: 50, ly: 60, label: '外部設計', rx: 300, ry: 60, rlabel: 'システムテスト', color: '#282867' },
        { lx: 90, ly: 100, label: '内部設計', rx: 260, ry: 100, rlabel: '結合テスト', color: '#ed8936' },
        { lx: 130, ly: 140, label: '実装', rx: 220, ry: 140, rlabel: '単体テスト', color: '#48bb78' },
      ].map(row => (
        <g key={row.label}>
          <rect x={row.lx} y={row.ly} width="90" height="28" rx="5" fill={row.color} opacity="0.7"/>
          <text x={row.lx + 45} y={row.ly + 19} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{row.label}</text>
          <rect x={row.rx} y={row.ry} width="90" height="28" rx="5" fill={row.color} opacity="0.4" stroke={row.color} strokeWidth="1.5"/>
          <text x={row.rx + 45} y={row.ry + 19} textAnchor="middle" fill="#4a5568" fontSize="11" fontWeight="bold">{row.rlabel}</text>
          <line x1={row.lx + 90} y1={row.ly + 14} x2={row.rx} y2={row.ry + 14} stroke={row.color} strokeWidth="1" strokeDasharray="4" opacity="0.5"/>
        </g>
      ))}
      <path d="M 175 155 L 215 155" stroke="#718096" strokeWidth="2" markerEnd="url(#a5)"/>
      <defs>
        <marker id="a5" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
        </marker>
      </defs>
    </svg>
  </div>
);

const GanttDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">ガントチャート（例）</h4>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 10px', background: '#2da3d9', color: 'white', textAlign: 'left', width: 120 }}>作業</th>
            {['1週', '2週', '3週', '4週', '5週', '6週'].map(w => (
              <th key={w} style={{ padding: '6px 8px', background: '#2da3d9', color: 'white', textAlign: 'center', width: 60 }}>{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { name: '要件定義', start: 0, len: 2, color: '#2da3d9' },
            { name: '設計', start: 1, len: 2, color: '#282867' },
            { name: '実装', start: 2, len: 3, color: '#48bb78' },
            { name: 'テスト', start: 4, len: 2, color: '#ed8936' },
          ].map(task => (
            <tr key={task.name}>
              <td style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>{task.name}</td>
              {[0, 1, 2, 3, 4, 5].map(w => (
                <td key={w} style={{ padding: 4, borderBottom: '1px solid #e2e8f0' }}>
                  {w >= task.start && w < task.start + task.len && (
                    <div style={{ background: task.color, borderRadius: 4, height: 20, opacity: 0.75 }} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ReliabilityDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">稼働率の計算</h4>
    <svg viewBox="0 0 440 160" className="diagram-svg">
      <rect x="10" y="30" width="180" height="50" rx="8" fill="#48bb78" opacity="0.2" stroke="#48bb78" strokeWidth="2"/>
      <text x="100" y="52" textAnchor="middle" fill="#276749" fontWeight="bold" fontSize="13">MTBF（平均故障間隔）</text>
      <text x="100" y="70" textAnchor="middle" fill="#276749" fontSize="12">正常に動いている時間</text>

      <rect x="250" y="30" width="180" height="50" rx="8" fill="#fc8181" opacity="0.2" stroke="#fc8181" strokeWidth="2"/>
      <text x="340" y="52" textAnchor="middle" fill="#c53030" fontWeight="bold" fontSize="13">MTTR（平均修復時間）</text>
      <text x="340" y="70" textAnchor="middle" fill="#c53030" fontSize="12">故障してから復旧までの時間</text>

      <rect x="100" y="110" width="240" height="40" rx="8" fill="#2da3d9" opacity="0.15" stroke="#2da3d9" strokeWidth="2"/>
      <text x="220" y="132" textAnchor="middle" fill="#4a5568" fontSize="13" fontWeight="bold">稼働率 = MTBF ÷ (MTBF + MTTR)</text>
    </svg>
  </div>
);

const StrategyDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">SWOT分析</h4>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[
        { label: 'S 強み', sub: 'Strengths', desc: '自社の競合優位性', color: '#2da3d9', bg: 'rgba(45,163,217,0.1)' },
        { label: 'W 弱み', sub: 'Weaknesses', desc: '自社の改善が必要な点', color: '#fc8181', bg: 'rgba(252,129,129,0.1)' },
        { label: 'O 機会', sub: 'Opportunities', desc: '外部環境の有利な変化', color: '#48bb78', bg: 'rgba(72,187,120,0.1)' },
        { label: 'T 脅威', sub: 'Threats', desc: '外部環境の不利な変化', color: '#ed8936', bg: 'rgba(237,137,54,0.1)' },
      ].map(item => (
        <div key={item.label} style={{ background: item.bg, border: `2px solid ${item.color}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ color: item.color, fontWeight: 800, fontSize: 15 }}>{item.label}</div>
          <div style={{ color: '#718096', fontSize: 11, marginBottom: 4 }}>{item.sub}</div>
          <div style={{ fontSize: 13, color: '#4a5568' }}>{item.desc}</div>
        </div>
      ))}
    </div>
  </div>
);

const LawDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">知的財産権の種類と保護期間</h4>
    <table className="truth-table">
      <thead>
        <tr><th>権利の種類</th><th>保護対象</th><th>保護期間</th><th>登録</th></tr>
      </thead>
      <tbody>
        <tr><td style={{ fontWeight: 700, color: '#2da3d9' }}>著作権</td><td>プログラム・文章・音楽</td><td>死後70年</td><td>不要</td></tr>
        <tr><td style={{ fontWeight: 700, color: '#48bb78' }}>特許権</td><td>発明（技術的アイデア）</td><td>出願から20年</td><td>必要</td></tr>
        <tr><td style={{ fontWeight: 700, color: '#ed8936' }}>実用新案権</td><td>考案（形状・構造）</td><td>出願から10年</td><td>必要</td></tr>
        <tr><td style={{ fontWeight: 700, color: '#282867' }}>意匠権</td><td>デザイン（外観）</td><td>登録から25年</td><td>必要</td></tr>
        <tr><td style={{ fontWeight: 700, color: '#fc8181' }}>商標権</td><td>ブランド名・ロゴ</td><td>登録から10年（更新可）</td><td>必要</td></tr>
      </tbody>
    </table>
  </div>
);

const RecursionDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">再帰呼び出しのスタック（階乗(3)の例）</h4>
    <svg viewBox="0 0 440 180" className="diagram-svg">
      {[
        { x: 10, label: '階乗(3)', sub: '3 × 階乗(2)', color: '#2da3d9' },
        { x: 120, label: '階乗(2)', sub: '2 × 階乗(1)', color: '#282867' },
        { x: 230, label: '階乗(1)', sub: '返り値: 1', color: '#48bb78' },
        { x: 340, label: '戻る', sub: '2×1=2, 3×2=6', color: '#ed8936' },
      ].map((step, i) => (
        <g key={step.label}>
          <rect x={step.x} y="50" width="100" height="60" rx="8" fill={step.color} opacity="0.2" stroke={step.color} strokeWidth="2"/>
          <text x={step.x + 50} y="77" textAnchor="middle" fill="#4a5568" fontSize="13" fontWeight="bold">{step.label}</text>
          <text x={step.x + 50} y="97" textAnchor="middle" fill="#718096" fontSize="11">{step.sub}</text>
          {i < 3 && <path d={`M ${step.x + 100} 80 L ${step.x + 118} 80`} stroke="#718096" strokeWidth="1.5" markerEnd="url(#a6)"/>}
        </g>
      ))}
      <defs>
        <marker id="a6" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
        </marker>
      </defs>
      <text x="220" y="160" textAnchor="middle" fill="#2da3d9" fontSize="13" fontWeight="bold">最終結果: 6</text>
    </svg>
  </div>
);

const TreeDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">二分探索木</h4>
    <svg viewBox="0 0 340 200" className="diagram-svg">
      {/* Lines */}
      <line x1="170" y1="40" x2="90" y2="90" stroke="#718096" strokeWidth="1.5"/>
      <line x1="170" y1="40" x2="250" y2="90" stroke="#718096" strokeWidth="1.5"/>
      <line x1="90" y1="110" x2="50" y2="155" stroke="#718096" strokeWidth="1.5"/>
      <line x1="90" y1="110" x2="130" y2="155" stroke="#718096" strokeWidth="1.5"/>
      <line x1="130" y1="175" x2="110" y2="195" stroke="#718096" strokeWidth="1"/>
      <line x1="130" y1="175" x2="150" y2="195" stroke="#718096" strokeWidth="1"/>
      {/* Nodes */}
      {[
        { x: 170, y: 20, val: '8', color: '#2da3d9' },
        { x: 90, y: 90, val: '3', color: '#282867' },
        { x: 250, y: 90, val: '10', color: '#282867' },
        { x: 50, y: 155, val: '1', color: '#48bb78' },
        { x: 130, y: 155, val: '6', color: '#48bb78' },
        { x: 110, y: 190, val: '4', color: '#ed8936' },
        { x: 150, y: 190, val: '7', color: '#ed8936' },
      ].map(n => (
        <g key={n.val}>
          <circle cx={n.x} cy={n.y + 10} r="18" fill={n.color} opacity="0.8"/>
          <text x={n.x} y={n.y + 15} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{n.val}</text>
        </g>
      ))}
      <text x="170" y="195" textAnchor="middle" fill="#718096" fontSize="11">左 &lt; 親 &lt; 右</text>
    </svg>
  </div>
);

const OopDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">クラスとインスタンスの関係</h4>
    <svg viewBox="0 0 420 180" className="diagram-svg">
      <rect x="10" y="20" width="130" height="130" rx="8" fill="#2da3d9" opacity="0.1" stroke="#2da3d9" strokeWidth="2"/>
      <text x="75" y="45" textAnchor="middle" fill="#2da3d9" fontWeight="bold" fontSize="13">クラス（設計図）</text>
      <text x="75" y="65" textAnchor="middle" fill="#4a5568" fontSize="11">動物</text>
      <line x1="20" y1="73" x2="130" y2="73" stroke="#e2e8f0" strokeWidth="1"/>
      <text x="75" y="90" textAnchor="middle" fill="#4a5568" fontSize="11">属性: 名前, 年齢</text>
      <line x1="20" y1="100" x2="130" y2="100" stroke="#e2e8f0" strokeWidth="1"/>
      <text x="75" y="117" textAnchor="middle" fill="#4a5568" fontSize="11">メソッド: 鳴く()</text>
      <text x="75" y="135" textAnchor="middle" fill="#4a5568" fontSize="11">メソッド: 走る()</text>

      <path d="M 145 85 L 175 85" stroke="#ed8936" strokeWidth="2" markerEnd="url(#a7)" strokeDasharray="5"/>
      <text x="160" y="78" textAnchor="middle" fill="#ed8936" fontSize="10">new</text>

      {[
        { x: 185, name: 'ポチ', age: '3歳' },
        { x: 310, name: 'タマ', age: '2歳' },
      ].map(inst => (
        <g key={inst.name}>
          <rect x={inst.x} y="40" width="115" height="90" rx="8" fill="#48bb78" opacity="0.1" stroke="#48bb78" strokeWidth="2"/>
          <text x={inst.x + 57} y="62" textAnchor="middle" fill="#276749" fontWeight="bold" fontSize="12">インスタンス</text>
          <line x1={inst.x + 10} y1="70" x2={inst.x + 105} y2="70" stroke="#e2e8f0" strokeWidth="1"/>
          <text x={inst.x + 57} y="87" textAnchor="middle" fill="#4a5568" fontSize="11">名前: {inst.name}</text>
          <text x={inst.x + 57} y="104" textAnchor="middle" fill="#4a5568" fontSize="11">年齢: {inst.age}</text>
        </g>
      ))}
      <defs>
        <marker id="a7" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#ed8936"/>
        </marker>
      </defs>
    </svg>
  </div>
);

const InheritanceDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">継承とポリモーフィズム</h4>
    <svg viewBox="0 0 380 200" className="diagram-svg">
      <rect x="130" y="10" width="120" height="60" rx="8" fill="#2da3d9" opacity="0.2" stroke="#2da3d9" strokeWidth="2"/>
      <text x="190" y="35" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="13">動物（親クラス）</text>
      <text x="190" y="55" textAnchor="middle" fill="#718096" fontSize="11">鳴く() → "..."</text>

      <path d="M 120 80 L 80 120" stroke="#2da3d9" strokeWidth="2"/>
      <path d="M 260 80 L 300 120" stroke="#2da3d9" strokeWidth="2"/>
      <polygon points="120,80 108,80 114,92" fill="white" stroke="#2da3d9" strokeWidth="1.5"/>
      <polygon points="260,80 272,80 266,92" fill="white" stroke="#2da3d9" strokeWidth="1.5"/>

      <rect x="20" y="120" width="120" height="60" rx="8" fill="#48bb78" opacity="0.2" stroke="#48bb78" strokeWidth="2"/>
      <text x="80" y="145" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="13">犬（子クラス）</text>
      <text x="80" y="163" textAnchor="middle" fill="#276749" fontSize="11">鳴く() → "ワン！"</text>

      <rect x="240" y="120" width="120" height="60" rx="8" fill="#ed8936" opacity="0.2" stroke="#ed8936" strokeWidth="2"/>
      <text x="300" y="145" textAnchor="middle" fill="#4a5568" fontWeight="bold" fontSize="13">猫（子クラス）</text>
      <text x="300" y="163" textAnchor="middle" fill="#c05621" fontSize="11">鳴く() → "ニャー！"</text>

      <text x="190" y="195" textAnchor="middle" fill="#718096" fontSize="11">↑ 同じ「鳴く()」でも動作が異なる = ポリモーフィズム</text>
    </svg>
  </div>
);

const ComplementDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">2の補数の求め方（例: +5 → -5）</h4>
    <svg viewBox="0 0 480 160" className="diagram-svg">
      <rect x="10" y="30" width="120" height="40" rx="6" fill="#2da3d9" opacity="0.2" stroke="#2da3d9" strokeWidth="2"/>
      <text x="70" y="47" textAnchor="middle" fill="#4a5568" fontSize="12" fontWeight="bold">元の数 (+5)</text>
      <text x="70" y="63" textAnchor="middle" fill="#2da3d9" fontSize="16" fontWeight="bold" fontFamily="monospace">0101</text>

      <path d="M 135 50 L 175 50" stroke="#718096" strokeWidth="2" markerEnd="url(#ac1)"/>
      <text x="155" y="42" textAnchor="middle" fill="#718096" fontSize="11">①反転</text>

      <rect x="180" y="30" width="120" height="40" rx="6" fill="#ed8936" opacity="0.2" stroke="#ed8936" strokeWidth="2"/>
      <text x="240" y="47" textAnchor="middle" fill="#4a5568" fontSize="12" fontWeight="bold">ビット反転</text>
      <text x="240" y="63" textAnchor="middle" fill="#ed8936" fontSize="16" fontWeight="bold" fontFamily="monospace">1010</text>

      <path d="M 305 50 L 345 50" stroke="#718096" strokeWidth="2" markerEnd="url(#ac1)"/>
      <text x="325" y="42" textAnchor="middle" fill="#718096" fontSize="11">②+1</text>

      <rect x="350" y="30" width="120" height="40" rx="6" fill="#48bb78" opacity="0.2" stroke="#48bb78" strokeWidth="2"/>
      <text x="410" y="47" textAnchor="middle" fill="#4a5568" fontSize="12" fontWeight="bold">2の補数 (-5)</text>
      <text x="410" y="63" textAnchor="middle" fill="#276749" fontSize="16" fontWeight="bold" fontFamily="monospace">1011</text>

      <text x="240" y="110" textAnchor="middle" fill="#4a5568" fontSize="13">確認: 0101 + 1011 = 10000 → 下4桁 = 0000 ✓</text>
      <text x="240" y="130" textAnchor="middle" fill="#718096" fontSize="11">（足すと桁溢れしてちょうど 0 になる = 正しい補数）</text>

      <defs>
        <marker id="ac1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
        </marker>
      </defs>
    </svg>
  </div>
);

const FloatingPointDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">IEEE 754 単精度浮動小数点数（32ビット）の構造</h4>
    <svg viewBox="0 0 480 140" className="diagram-svg">
      <rect x="10" y="30" width="40" height="50" rx="4" fill="#fc8181" opacity="0.7"/>
      <text x="30" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">符号</text>
      <text x="30" y="68" textAnchor="middle" fill="white" fontSize="11">1bit</text>

      <rect x="55" y="30" width="120" height="50" rx="4" fill="#2da3d9" opacity="0.7"/>
      <text x="115" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">指数部</text>
      <text x="115" y="68" textAnchor="middle" fill="white" fontSize="11">8bit</text>

      <rect x="180" y="30" width="290" height="50" rx="4" fill="#48bb78" opacity="0.7"/>
      <text x="325" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">仮数部</text>
      <text x="325" y="68" textAnchor="middle" fill="white" fontSize="11">23bit</text>

      <text x="30" y="105" textAnchor="middle" fill="#c53030" fontSize="11">0=正 1=負</text>
      <text x="115" y="105" textAnchor="middle" fill="#4a5568" fontSize="11">実際の指数+127</text>
      <text x="325" y="105" textAnchor="middle" fill="#276749" fontSize="11">小数点以下のビット列</text>

      <text x="240" y="130" textAnchor="middle" fill="#718096" fontSize="11">値 = (-1)^符号 × 1.仮数部 × 2^(指数部-127)</text>
    </svg>
  </div>
);

const DataSizeDiagram = () => (
  <div className="diagram-container">
    <h4 className="diagram-title">データ容量の単位</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[
        { label: '1 bit', desc: '0か1の1桁', size: 4, color: '#e2e8f0' },
        { label: '1 Byte = 8 bit', desc: '英字1文字（ASCII）', size: 20, color: '#bee3f8' },
        { label: '1 KB = 1,024 B', desc: '短いテキスト程度', size: 40, color: '#90cdf4' },
        { label: '1 MB = 1,024 KB', desc: '写真1枚〜音楽1曲', size: 65, color: '#2da3d9' },
        { label: '1 GB = 1,024 MB', desc: '動画10〜20分', size: 90, color: '#553c9a' },
        { label: '1 TB = 1,024 GB', desc: 'HDD/SSDの容量単位', size: 115, color: '#322659' },
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: item.size, height: 22, background: item.color, borderRadius: 4, flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 13, minWidth: 140 }}>{item.label}</span>
          <span style={{ fontSize: 12, color: '#718096' }}>{item.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const diagrams: Record<string, React.FC> = {
  binary: BinaryDiagram,
  logic: LogicDiagram,
  cpu: CpuDiagram,
  osi: OsiDiagram,
  'stack-queue': StackQueueDiagram,
  security: SecurityDiagram,
  sort: SortDiagram,
  flowchart: FlowchartDiagram,
  clock: ClockDiagram,
  os: OsDiagram,
  filesystem: FilesystemDiagram,
  database: DatabaseDiagram,
  transaction: TransactionDiagram,
  waterfall: WaterfallDiagram,
  testing: TestingDiagram,
  gantt: GanttDiagram,
  reliability: ReliabilityDiagram,
  strategy: StrategyDiagram,
  law: LawDiagram,
  recursion: RecursionDiagram,
  tree: TreeDiagram,
  oop: OopDiagram,
  inheritance: InheritanceDiagram,
  pipeline: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">パイプライン処理（4段）</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        {['フェッチ','デコード','実行','書戻し'].map((stage, si) => (
          <g key={stage}>
            <rect x={10 + si*116} y={10} width={108} height={32} rx={6} fill="#2da3d9" opacity={0.6 + si*0.1}/>
            <text x={10 + si*116 + 54} y={31} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">{stage}</text>
            {si < 3 && <path d={`M ${118+si*116} 26 L ${126+si*116} 26`} stroke="#718096" strokeWidth={2} markerEnd="url(#ap1)"/>}
          </g>
        ))}
        {[0,1,2,3].map(cmd => (
          [0,1,2,3].map(stage => {
            const col = cmd + stage;
            if (col > 6) return null;
            const colors = ['#2da3d9','#48bb78','#ed8936','#282867'];
            return (
              <rect key={`${cmd}-${stage}`} x={10 + col*60} y={60 + cmd*28} width={52} height={22} rx={4}
                fill={colors[cmd]} opacity={0.7}/>
            );
          })
        ))}
        {[0,1,2,3].map(cmd => (
          <text key={cmd} x={2} y={75 + cmd*28} fill="#718096" fontSize={11} textAnchor="middle">命令{cmd+1}</text>
        ))}
        <text x={240} y={175} textAnchor="middle" fill="#718096" fontSize={11}>→ クロック時間</text>
        <defs>
          <marker id="ap1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
          </marker>
        </defs>
      </svg>
    </div>
  )) as React.FC,
  memoryhierarchy: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">メモリ階層（速度 vs 容量）</h4>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
        {[
          { label:'レジスタ', speed:'〜1ns', cap:'数十B', w:80, color:'#2da3d9' },
          { label:'キャッシュ (L1/L2/L3)', speed:'1〜10ns', cap:'KB〜MB', w:160, color:'#282867' },
          { label:'主記憶（RAM）', speed:'〜100ns', cap:'GB', w:260, color:'#48bb78' },
          { label:'SSD', speed:'〜0.1ms', cap:'数百GB', w:340, color:'#ed8936' },
          { label:'HDD', speed:'〜10ms', cap:'TB', w:420, color:'#fc8181' },
        ].map(m => (
          <div key={m.label} style={{ width:m.w, background:m.color, borderRadius:6, padding:'6px 12px', color:'white', display:'flex', justifyContent:'space-between', opacity:0.85 }}>
            <span style={{ fontSize:12, fontWeight:700 }}>{m.label}</span>
            <span style={{ fontSize:11, opacity:0.9 }}>{m.speed} / {m.cap}</span>
          </div>
        ))}
        <div style={{ fontSize:12, color:'#718096', marginTop:4 }}>↑ 速い・小容量・高価　　↓ 遅い・大容量・安価</div>
      </div>
    </div>
  )) as React.FC,
  bus: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">バスとDMA転送</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        <rect x="10" y="60" width="90" height="60" rx="8" fill="#2da3d9" opacity="0.7"/>
        <text x="55" y="88" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">CPU</text>
        <text x="55" y="106" textAnchor="middle" fill="white" fontSize="10">制御・演算</text>
        <rect x="195" y="60" width="90" height="60" rx="8" fill="#48bb78" opacity="0.7"/>
        <text x="240" y="88" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">主記憶</text>
        <text x="240" y="106" textAnchor="middle" fill="white" fontSize="10">RAM</text>
        <rect x="380" y="20" width="90" height="50" rx="8" fill="#ed8936" opacity="0.7"/>
        <text x="425" y="43" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">入出力</text>
        <text x="425" y="60" textAnchor="middle" fill="white" fontSize="10">装置</text>
        <rect x="380" y="110" width="90" height="50" rx="8" fill="#282867" opacity="0.7"/>
        <text x="425" y="133" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">DMA</text>
        <text x="425" y="150" textAnchor="middle" fill="white" fontSize="10">コントローラ</text>
        <line x1="100" y1="90" x2="193" y2="90" stroke="#4a5568" strokeWidth="3"/>
        <line x1="285" y1="90" x2="378" y2="45" stroke="#4a5568" strokeWidth="1.5" strokeDasharray="4"/>
        <line x1="285" y1="90" x2="378" y2="135" stroke="#ed8936" strokeWidth="2"/>
        <line x1="378" y1="135" x2="325" y2="90" stroke="#ed8936" strokeWidth="2"/>
        <text x="240" y="170" textAnchor="middle" fill="#ed8936" fontSize="11">DMA: CPUを介さずに主記憶↔入出力を直結</text>
      </svg>
    </div>
  )) as React.FC,
  'network-devices': (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">ネットワーク機器とOSI層の対応</h4>
      <svg viewBox="0 0 480 200" className="diagram-svg">
        {[
          { layer: '第7〜5層', label: 'アプリケーション〜セッション', color: '#2da3d9', y: 10 },
          { layer: '第4層', label: 'トランスポート層', color: '#282867', y: 42 },
          { layer: '第3層', label: 'ネットワーク層', color: '#48bb78', y: 74 },
          { layer: '第2層', label: 'データリンク層', color: '#ed8936', y: 106 },
          { layer: '第1層', label: '物理層', color: '#fc8181', y: 138 },
        ].map(l => (
          <g key={l.layer}>
            <rect x={10} y={l.y} width={160} height={28} rx={5} fill={l.color} opacity={0.7}/>
            <text x={90} y={l.y+18} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">{l.layer}: {l.label}</text>
          </g>
        ))}
        {[
          { name: 'ルータ', layers: [74,106,138], color: '#48bb78', x: 220 },
          { name: 'L2スイッチ', layers: [106,138], color: '#ed8936', x: 320 },
          { name: 'ハブ', layers: [138], color: '#fc8181', x: 410 },
        ].map(dev => (
          <g key={dev.name}>
            {dev.layers.map(y => (
              <rect key={y} x={dev.x} y={y} width={70} height={28} rx={4} fill={dev.color} opacity={0.6}/>
            ))}
            <text x={dev.x+35} y={185} textAnchor="middle" fill="#4a5568" fontSize={11} fontWeight="bold">{dev.name}</text>
          </g>
        ))}
      </svg>
    </div>
  )) as React.FC,
  ipaddress: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">IPアドレスの構造（例: 192.168.1.10 /24）</h4>
      <svg viewBox="0 0 480 150" className="diagram-svg">
        <rect x="10" y="20" width="340" height="44" rx="6" fill="#2da3d9" opacity="0.2" stroke="#2da3d9" strokeWidth="2"/>
        <text x="180" y="38" textAnchor="middle" fill="#2da3d9" fontSize="12" fontWeight="bold">ネットワーク部（24ビット）</text>
        <text x="180" y="54" textAnchor="middle" fill="#4a5568" fontSize="13" fontFamily="monospace">192 . 168 . 1</text>

        <rect x="355" y="20" width="115" height="44" rx="6" fill="#48bb78" opacity="0.2" stroke="#48bb78" strokeWidth="2"/>
        <text x="412" y="38" textAnchor="middle" fill="#48bb78" fontSize="12" fontWeight="bold">ホスト部（8ビット）</text>
        <text x="412" y="54" textAnchor="middle" fill="#4a5568" fontSize="13" fontFamily="monospace">. 10</text>

        <text x="10" y="90" fill="#4a5568" fontSize="12">サブネットマスク: <tspan fontWeight="bold">255.255.255.0</tspan> = /24</text>
        <text x="10" y="110" fill="#4a5568" fontSize="12">ネットワークアドレス: <tspan fontWeight="bold">192.168.1.0</tspan>（ホスト部=全0）</text>
        <text x="10" y="130" fill="#4a5568" fontSize="12">ブロードキャスト: <tspan fontWeight="bold">192.168.1.255</tspan>（ホスト部=全1）</text>
        <text x="10" y="148" fill="#718096" fontSize="11">使用可能ホスト数: 2⁸ - 2 = <tspan fontWeight="bold">254台</tspan></text>
      </svg>
    </div>
  )) as React.FC,
  dns: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">DNS名前解決の流れ</h4>
      <svg viewBox="0 0 480 170" className="diagram-svg">
        {[
          { x:10, y:60, label:'クライアント', sub:'PC/スマホ', color:'#2da3d9' },
          { x:130, y:60, label:'DNSキャッシュ', sub:'サーバ', color:'#282867' },
          { x:260, y:10, label:'ルートDNS', sub:'サーバ', color:'#ed8936' },
          { x:260, y:110, label:'権威DNS', sub:'サーバ', color:'#48bb78' },
        ].map(n => (
          <g key={n.label}>
            <rect x={n.x} y={n.y} width={100} height={50} rx={8} fill={n.color} opacity={0.7}/>
            <text x={n.x+50} y={n.y+22} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">{n.label}</text>
            <text x={n.x+50} y={n.y+38} textAnchor="middle" fill="white" fontSize={10}>{n.sub}</text>
          </g>
        ))}
        <path d="M 110 80 L 128 80" stroke="#718096" strokeWidth="1.5" markerEnd="url(#adns)"/>
        <path d="M 230 75 L 258 35" stroke="#718096" strokeWidth="1.5" markerEnd="url(#adns)"/>
        <path d="M 230 85 L 258 125" stroke="#48bb78" strokeWidth="1.5" markerEnd="url(#adns)"/>
        <text x="240" y="160" textAnchor="middle" fill="#718096" fontSize="11">① 問い合わせ → ② ルート確認 → ③ 権威DNSからIPを取得</text>
        <defs>
          <marker id="adns" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
          </marker>
        </defs>
      </svg>
    </div>
  )) as React.FC,
  http: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">主なプロトコルとポート番号</h4>
      <table className="truth-table">
        <thead>
          <tr><th>プロトコル</th><th>ポート</th><th>用途</th><th>TCP/UDP</th></tr>
        </thead>
        <tbody>
          {[
            ['HTTP', '80', 'Webページ', 'TCP'],
            ['HTTPS', '443', '暗号化Web', 'TCP'],
            ['FTP', '21', 'ファイル転送', 'TCP'],
            ['SSH', '22', 'セキュアリモート', 'TCP'],
            ['SMTP', '25', 'メール送信', 'TCP'],
            ['POP3', '110', 'メール受信', 'TCP'],
            ['IMAP', '143', 'メール管理', 'TCP'],
            ['DNS', '53', '名前解決', 'UDP/TCP'],
            ['DHCP', '67/68', 'IP自動割当', 'UDP'],
          ].map(([proto, port, use, type]) => (
            <tr key={proto}>
              <td style={{ fontWeight: 700, color: '#2da3d9' }}>{proto}</td>
              <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{port}</td>
              <td>{use}</td>
              <td style={{ color: type.includes('TCP') ? '#48bb78' : '#ed8936' }}>{type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )) as React.FC,
  attack: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">主な攻撃手法の分類</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { cat: 'マルウェア系', items: ['ウイルス', 'ワーム', 'ランサムウェア', 'トロイの木馬'], color: '#fc8181' },
          { cat: 'Web攻撃系', items: ['SQLインジェクション', 'XSS', 'CSRF', 'DoS/DDoS'], color: '#ed8936' },
          { cat: 'ソーシャル系', items: ['フィッシング', 'スピアフィッシング', 'ビッシング', 'ショルダーハック'], color: '#282867' },
          { cat: 'パスワード系', items: ['ブルートフォース', '辞書攻撃', 'リスト型攻撃', '中間者攻撃'], color: '#2da3d9' },
        ].map(g => (
          <div key={g.cat} style={{ background: `${g.color}18`, border: `2px solid ${g.color}`, borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ color: g.color, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>{g.cat}</div>
            {g.items.map(item => (
              <div key={item} style={{ fontSize: 12, color: '#4a5568', padding: '2px 0' }}>• {item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )) as React.FC,
  crypto: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">共通鍵 vs 公開鍵暗号方式</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        {/* 共通鍵 */}
        <rect x="10" y="10" width="220" height="150" rx="8" fill="#2da3d9" opacity="0.08" stroke="#2da3d9" strokeWidth="2"/>
        <text x="120" y="32" textAnchor="middle" fill="#2da3d9" fontWeight="bold" fontSize="13">共通鍵暗号（AES等）</text>
        <rect x="20" y="42" width="60" height="28" rx="5" fill="#2da3d9" opacity="0.7"/>
        <text x="50" y="61" textAnchor="middle" fill="white" fontSize="11">送信者</text>
        <rect x="150" y="42" width="70" height="28" rx="5" fill="#2da3d9" opacity="0.7"/>
        <text x="185" y="61" textAnchor="middle" fill="white" fontSize="11">受信者</text>
        <path d="M 82 56 L 148 56" stroke="#2da3d9" strokeWidth="2" markerEnd="url(#akey)"/>
        <text x="115" y="50" textAnchor="middle" fill="#2da3d9" fontSize="10">同じ鍵🔑</text>
        <text x="120" y="100" textAnchor="middle" fill="#4a5568" fontSize="11">✓ 高速・大量データ向き</text>
        <text x="120" y="118" textAnchor="middle" fill="#c53030" fontSize="11">✗ 鍵の安全な配送が課題</text>
        <text x="120" y="148" textAnchor="middle" fill="#718096" fontSize="10">例: AES, DES</text>
        {/* 公開鍵 */}
        <rect x="250" y="10" width="220" height="150" rx="8" fill="#48bb78" opacity="0.08" stroke="#48bb78" strokeWidth="2"/>
        <text x="360" y="32" textAnchor="middle" fill="#48bb78" fontWeight="bold" fontSize="13">公開鍵暗号（RSA等）</text>
        <rect x="260" y="42" width="60" height="28" rx="5" fill="#48bb78" opacity="0.7"/>
        <text x="290" y="61" textAnchor="middle" fill="white" fontSize="11">送信者</text>
        <rect x="390" y="42" width="70" height="28" rx="5" fill="#48bb78" opacity="0.7"/>
        <text x="425" y="61" textAnchor="middle" fill="white" fontSize="11">受信者</text>
        <path d="M 322 56 L 388 56" stroke="#48bb78" strokeWidth="2" markerEnd="url(#akey)"/>
        <text x="355" y="46" textAnchor="middle" fill="#276749" fontSize="10">公開鍵🔓で暗号化</text>
        <text x="355" y="58" textAnchor="middle" fill="#276749" fontSize="10">秘密鍵🔒で復号</text>
        <text x="360" y="100" textAnchor="middle" fill="#4a5568" fontSize="11">✓ 鍵配送問題を解決</text>
        <text x="360" y="118" textAnchor="middle" fill="#c53030" fontSize="11">✗ 低速・少量データ向き</text>
        <text x="360" y="148" textAnchor="middle" fill="#718096" fontSize="10">例: RSA, ECC</text>
        <defs>
          <marker id="akey" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
          </marker>
        </defs>
      </svg>
    </div>
  )) as React.FC,
  'digital-signature': (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">デジタル署名の仕組み</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        {/* 署名作成 */}
        <text x="10" y="20" fill="#2da3d9" fontWeight="bold" fontSize="12">【署名作成：送信者側】</text>
        <rect x="10" y="28" width="80" height="28" rx="5" fill="#2da3d9" opacity="0.6"/>
        <text x="50" y="47" textAnchor="middle" fill="white" fontSize="11">元データ</text>
        <path d="M 92 42 L 112 42" stroke="#718096" strokeWidth="1.5" markerEnd="url(#asig)"/>
        <rect x="114" y="28" width="80" height="28" rx="5" fill="#282867" opacity="0.6"/>
        <text x="154" y="47" textAnchor="middle" fill="white" fontSize="11">ハッシュ化</text>
        <path d="M 196 42 L 216 42" stroke="#718096" strokeWidth="1.5" markerEnd="url(#asig)"/>
        <rect x="218" y="28" width="100" height="28" rx="5" fill="#ed8936" opacity="0.6"/>
        <text x="268" y="42" textAnchor="middle" fill="white" fontSize="11">秘密鍵で</text>
        <text x="268" y="54" textAnchor="middle" fill="white" fontSize="11">暗号化→署名</text>
        {/* 検証 */}
        <text x="10" y="100" fill="#48bb78" fontWeight="bold" fontSize="12">【署名検証：受信者側】</text>
        <rect x="10" y="108" width="80" height="28" rx="5" fill="#48bb78" opacity="0.6"/>
        <text x="50" y="127" textAnchor="middle" fill="white" fontSize="11">受信データ</text>
        <path d="M 92 122 L 112 122" stroke="#718096" strokeWidth="1.5" markerEnd="url(#asig)"/>
        <rect x="114" y="108" width="80" height="28" rx="5" fill="#282867" opacity="0.6"/>
        <text x="154" y="127" textAnchor="middle" fill="white" fontSize="11">ハッシュ化</text>
        <rect x="330" y="108" width="100" height="28" rx="5" fill="#ed8936" opacity="0.6"/>
        <text x="380" y="122" textAnchor="middle" fill="white" fontSize="11">公開鍵で</text>
        <text x="380" y="134" textAnchor="middle" fill="white" fontSize="11">署名を復号</text>
        <path d="M 200" stroke="#718096"/>
        <text x="240" y="160" textAnchor="middle" fill="#4a5568" fontSize="12">ハッシュ値が一致 → 改ざんなし・送信者確認 ✓</text>
        <defs>
          <marker id="asig" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
          </marker>
        </defs>
      </svg>
    </div>
  )) as React.FC,
  'security-measures': (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">DMZとファイアウォールの構成</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        <rect x="10" y="60" width="80" height="60" rx="8" fill="#2da3d9" opacity="0.7"/>
        <text x="50" y="87" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">インター</text>
        <text x="50" y="103" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">ネット</text>
        <rect x="130" y="70" width="20" height="40" rx="4" fill="#fc8181" opacity="0.9"/>
        <text x="140" y="115" textAnchor="middle" fill="#c53030" fontSize="10" fontWeight="bold">FW</text>
        <rect x="185" y="40" width="100" height="100" rx="8" fill="#ed8936" opacity="0.12" stroke="#ed8936" strokeWidth="2" strokeDasharray="6"/>
        <text x="235" y="58" textAnchor="middle" fill="#ed8936" fontWeight="bold" fontSize="12">DMZ</text>
        <rect x="198" y="65" width="78" height="50" rx="6" fill="#ed8936" opacity="0.6"/>
        <text x="237" y="88" textAnchor="middle" fill="white" fontSize="11">Webサーバ</text>
        <text x="237" y="104" textAnchor="middle" fill="white" fontSize="10">メールサーバ</text>
        <rect x="330" y="70" width="20" height="40" rx="4" fill="#fc8181" opacity="0.9"/>
        <text x="340" y="115" textAnchor="middle" fill="#c53030" fontSize="10" fontWeight="bold">FW</text>
        <rect x="380" y="50" width="90" height="80" rx="8" fill="#48bb78" opacity="0.15" stroke="#48bb78" strokeWidth="2"/>
        <text x="425" y="75" textAnchor="middle" fill="#276749" fontWeight="bold" fontSize="12">内部LAN</text>
        <text x="425" y="95" textAnchor="middle" fill="#4a5568" fontSize="11">PC・サーバ</text>
        <text x="425" y="110" textAnchor="middle" fill="#4a5568" fontSize="11">重要データ</text>
        <path d="M 92 90 L 128 90" stroke="#718096" strokeWidth="2" markerEnd="url(#afw)"/>
        <path d="M 152 90 L 183 90" stroke="#718096" strokeWidth="2" markerEnd="url(#afw)"/>
        <path d="M 287 90 L 328 90" stroke="#718096" strokeWidth="2" markerEnd="url(#afw)"/>
        <path d="M 352 90 L 378 90" stroke="#718096" strokeWidth="2" markerEnd="url(#afw)"/>
        <defs>
          <marker id="afw" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
          </marker>
        </defs>
        <text x="240" y="165" textAnchor="middle" fill="#718096" fontSize="11">外部公開サーバをDMZに置き、内部LANを保護</text>
      </svg>
    </div>
  )) as React.FC,
  paging: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">仮想記憶とページング</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        <rect x="10" y="10" width="130" height="160" rx="8" fill="#2da3d9" opacity="0.08" stroke="#2da3d9" strokeWidth="2"/>
        <text x="75" y="30" textAnchor="middle" fill="#2da3d9" fontWeight="bold" fontSize="12">仮想アドレス空間</text>
        {['ページ0','ページ1','ページ2','ページ3','ページ4'].map((p,i)=>(
          <g key={p}>
            <rect x="20" y={40+i*26} width="110" height="22" rx="4" fill="#2da3d9" opacity={0.3+i*0.1}/>
            <text x="75" y={56+i*26} textAnchor="middle" fill="white" fontSize="11">{p}</text>
          </g>
        ))}
        <rect x="200" y="10" width="130" height="120" rx="8" fill="#48bb78" opacity="0.08" stroke="#48bb78" strokeWidth="2"/>
        <text x="265" y="30" textAnchor="middle" fill="#48bb78" fontWeight="bold" fontSize="12">物理メモリ（RAM）</text>
        {[{label:'ページ0',c:'#48bb78'},{label:'ページ2',c:'#48bb78'},{label:'ページ4',c:'#48bb78'},{label:'(空き)',c:'#e2e8f0'}].map((p,i)=>(
          <g key={i}>
            <rect x="210" y={40+i*22} width="110" height="18" rx="3" fill={p.c} opacity={p.label==='(空き)'?0.5:0.6}/>
            <text x="265" y={54+i*22} textAnchor="middle" fill="white" fontSize="10">{p.label}</text>
          </g>
        ))}
        <rect x="380" y="10" width="90" height="90" rx="8" fill="#ed8936" opacity="0.08" stroke="#ed8936" strokeWidth="2"/>
        <text x="425" y="30" textAnchor="middle" fill="#ed8936" fontWeight="bold" fontSize="11">スワップ領域</text>
        {[{label:'ページ1'},{label:'ページ3'}].map((p,i)=>(
          <g key={i}>
            <rect x="388" y={40+i*26} width="74" height="22" rx="4" fill="#ed8936" opacity="0.5"/>
            <text x="425" y={56+i*26} textAnchor="middle" fill="white" fontSize="10">{p.label}</text>
          </g>
        ))}
        <path d="M 142 80 L 198 80" stroke="#2da3d9" strokeWidth="1.5" markerEnd="url(#apg)"/>
        <path d="M 332 60 L 378 55" stroke="#ed8936" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#apg)"/>
        <text x="240" y="165" textAnchor="middle" fill="#718096" fontSize="11">使用頻度の低いページをディスクに退避してメモリを節約</text>
        <defs>
          <marker id="apg" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#718096"/>
          </marker>
        </defs>
      </svg>
    </div>
  )) as React.FC,
  cloud: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">クラウドサービスの責任範囲</h4>
      <div style={{ overflowX:'auto' }}>
        <table style={{ borderCollapse:'collapse', width:'100%', fontSize:13, minWidth:400 }}>
          <thead>
            <tr>
              <th style={{ padding:'8px 12px', background:'#2d3748', color:'white', textAlign:'left' }}>レイヤー</th>
              <th style={{ padding:'8px 12px', background:'#2da3d9', color:'white', textAlign:'center' }}>IaaS</th>
              <th style={{ padding:'8px 12px', background:'#48bb78', color:'white', textAlign:'center' }}>PaaS</th>
              <th style={{ padding:'8px 12px', background:'#ed8936', color:'white', textAlign:'center' }}>SaaS</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['アプリケーション','利用者','利用者','提供者'],
              ['ランタイム・MW','利用者','提供者','提供者'],
              ['OS','利用者','提供者','提供者'],
              ['仮想化・サーバ','提供者','提供者','提供者'],
              ['ネットワーク','提供者','提供者','提供者'],
            ].map(([layer,...rest])=>(
              <tr key={layer}>
                <td style={{ padding:'7px 12px', fontWeight:700, borderBottom:'1px solid #e2e8f0' }}>{layer}</td>
                {rest.map((v,i)=>(
                  <td key={i} style={{ padding:'7px 12px', textAlign:'center', borderBottom:'1px solid #e2e8f0',
                    background: v==='利用者' ? '#fef3c7' : '#dcfce7', color: v==='利用者' ? '#92400e' : '#166534', fontWeight:600 }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )) as React.FC,
  virtualization: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">仮想マシン vs コンテナ</h4>
      <svg viewBox="0 0 480 200" className="diagram-svg">
        {/* VM */}
        <rect x="10" y="10" width="210" height="180" rx="8" fill="#2da3d9" opacity="0.07" stroke="#2da3d9" strokeWidth="2"/>
        <text x="115" y="30" textAnchor="middle" fill="#2da3d9" fontWeight="bold" fontSize="13">仮想マシン（VM）</text>
        {['アプリA','ゲストOS','アプリB','ゲストOS'].map((l,i)=>(
          <rect key={i} x="20" y={40+i*30} width="85" height="25" rx="4" fill={i%2===0?'#2da3d9':'#282867'} opacity="0.6"/>
        ))}
        {['アプリA','ゲストOS','アプリB','ゲストOS'].map((l,i)=>(
          <text key={i} x="62" y={57+i*30} textAnchor="middle" fill="white" fontSize="11">{l}</text>
        ))}
        <rect x="20" y="165" width="180" height="18" rx="4" fill="#2d3748" opacity="0.7"/>
        <text x="110" y="178" textAnchor="middle" fill="white" fontSize="11">ハイパーバイザー + 物理HW</text>
        {/* Container */}
        <rect x="260" y="10" width="210" height="180" rx="8" fill="#48bb78" opacity="0.07" stroke="#48bb78" strokeWidth="2"/>
        <text x="365" y="30" textAnchor="middle" fill="#48bb78" fontWeight="bold" fontSize="13">コンテナ</text>
        {['アプリA','アプリB','アプリC'].map((l,i)=>(
          <rect key={i} x={270+i*60} y="40" width="55" height="60" rx="4" fill="#48bb78" opacity="0.6"/>
        ))}
        {['アプリA','アプリB','アプリC'].map((l,i)=>(
          <text key={i} x={297+i*60} y="75" textAnchor="middle" fill="white" fontSize="11">{l}</text>
        ))}
        <rect x="270" y="110" width="190" height="20" rx="4" fill="#38a169" opacity="0.7"/>
        <text x="365" y="124" textAnchor="middle" fill="white" fontSize="11">コンテナランタイム（Docker等）</text>
        <rect x="270" y="138" width="190" height="20" rx="4" fill="#276749" opacity="0.7"/>
        <text x="365" y="152" textAnchor="middle" fill="white" fontSize="11">ホストOS（共有カーネル）</text>
        <rect x="270" y="162" width="190" height="20" rx="4" fill="#2d3748" opacity="0.7"/>
        <text x="365" y="176" textAnchor="middle" fill="white" fontSize="11">物理ハードウェア</text>
      </svg>
    </div>
  )) as React.FC,
  'er-diagram': (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">ER図の例（社員と部署）</h4>
      <svg viewBox="0 0 480 160" className="diagram-svg">
        <rect x="20" y="40" width="140" height="80" rx="8" fill="#2da3d9" opacity="0.15" stroke="#2da3d9" strokeWidth="2"/>
        <text x="90" y="65" textAnchor="middle" fill="#2da3d9" fontWeight="bold" fontSize="13">社員</text>
        <text x="90" y="83" textAnchor="middle" fill="#4a5568" fontSize="11">社員ID (PK)</text>
        <text x="90" y="98" textAnchor="middle" fill="#4a5568" fontSize="11">氏名, 年齢</text>
        <text x="90" y="113" textAnchor="middle" fill="#e53e3e" fontSize="11">部署ID (FK)</text>
        <rect x="320" y="40" width="140" height="80" rx="8" fill="#48bb78" opacity="0.15" stroke="#48bb78" strokeWidth="2"/>
        <text x="390" y="65" textAnchor="middle" fill="#48bb78" fontWeight="bold" fontSize="13">部署</text>
        <text x="390" y="83" textAnchor="middle" fill="#4a5568" fontSize="11">部署ID (PK)</text>
        <text x="390" y="98" textAnchor="middle" fill="#4a5568" fontSize="11">部署名</text>
        <line x1="162" y1="80" x2="318" y2="80" stroke="#718096" strokeWidth="2"/>
        <text x="190" y="72" fill="#4a5568" fontSize="12" fontWeight="bold">多</text>
        <text x="295" y="72" fill="#4a5568" fontSize="12" fontWeight="bold">1</text>
        <text x="240" y="72" textAnchor="middle" fill="#718096" fontSize="11">所属する</text>
        <text x="240" y="140" textAnchor="middle" fill="#718096" fontSize="11">多対1：複数の社員が1つの部署に所属</text>
      </svg>
    </div>
  )) as React.FC,
  nosql: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">NoSQLの種類と用途</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { type: 'キーバリュー型', example: 'Redis, DynamoDB', use: 'セッション・キャッシュ', color: '#2da3d9' },
          { type: 'ドキュメント型', example: 'MongoDB, Firestore', use: 'WebアプリのデータAPI', color: '#48bb78' },
          { type: 'カラム型', example: 'Cassandra, HBase', use: 'ビッグデータ・IoT分析', color: '#ed8936' },
          { type: 'グラフ型', example: 'Neo4j', use: 'SNS関係・推薦エンジン', color: '#282867' },
        ].map(n => (
          <div key={n.type} style={{ border: `2px solid ${n.color}`, borderRadius: 8, padding: '10px 12px', background: `${n.color}10` }}>
            <div style={{ color: n.color, fontWeight: 800, fontSize: 13 }}>{n.type}</div>
            <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{n.example}</div>
            <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>→ {n.use}</div>
          </div>
        ))}
      </div>
    </div>
  )) as React.FC,
  uml: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">主なUML図の種類</h4>
      <table className="truth-table">
        <thead><tr><th>図の名前</th><th>表現するもの</th><th>使いどき</th></tr></thead>
        <tbody>
          {[
            ['ユースケース図','ユーザーとシステムの対話','要件定義・機能一覧'],
            ['クラス図','クラスの構造と関係','設計・実装前'],
            ['シーケンス図','時系列のメッセージ交換','API設計・処理フロー'],
            ['アクティビティ図','処理の流れ（フロー）','業務フロー・ロジック'],
            ['状態遷移図','オブジェクトの状態変化','状態機械の設計'],
          ].map(([name,desc,use])=>(
            <tr key={name}>
              <td style={{fontWeight:700,color:'#2da3d9'}}>{name}</td>
              <td style={{fontSize:12}}>{desc}</td>
              <td style={{fontSize:11,color:'#718096'}}>{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )) as React.FC,
  itsm: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">ITILのサービスライフサイクル</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        {[
          {x:190,y:10,label:'サービス戦略',color:'#2da3d9'},
          {x:340,y:60,label:'サービス設計',color:'#282867'},
          {x:280,y:130,label:'サービス移行',color:'#48bb78'},
          {x:100,y:130,label:'サービス運用',color:'#ed8936'},
          {x:40,y:60,label:'継続的改善',color:'#fc8181'},
        ].map((s,i,arr)=>{
          const next = arr[(i+1)%arr.length];
          return (
            <g key={s.label}>
              <rect x={s.x} y={s.y} width={110} height={36} rx={6} fill={s.color} opacity={0.75}/>
              <text x={s.x+55} y={s.y+22} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">{s.label}</text>
            </g>
          );
        })}
        <text x="240" y="100" textAnchor="middle" fill="#2da3d9" fontSize="14" fontWeight="bold">ITIL</text>
        <text x="240" y="118" textAnchor="middle" fill="#718096" fontSize="11">サービスライフサイクル</text>
      </svg>
    </div>
  )) as React.FC,
  ea: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">エンタープライズアーキテクチャ（EA）の4層</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'ビジネスアーキテクチャ', desc: '業務プロセス・組織・業務ルール', color: '#2da3d9' },
          { label: 'データアーキテクチャ', desc: 'データの構造・関係・流れ', color: '#282867' },
          { label: 'アプリケーションアーキテクチャ', desc: 'システム・アプリの全体像と関係', color: '#48bb78' },
          { label: 'テクノロジアーキテクチャ', desc: 'インフラ・HW・OS・NW の技術基盤', color: '#ed8936' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${l.color}15`, border: `2px solid ${l.color}`, borderRadius: 8, padding: '8px 14px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#4a5568', minWidth: 200 }}>{l.label}</span>
            <span style={{ fontSize: 12, color: '#718096' }}>{l.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )) as React.FC,
  graph: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">BFS vs DFS の探索順序の違い</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        {/* Graph structure */}
        {[[240,20],[120,80],[360,80],[60,150],[180,150],[300,150],[420,150]].map(([cx,cy],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r={22} fill={i===0?'#2da3d9':'#e2e8f0'} stroke="#718096" strokeWidth={1.5}/>
            <text x={cx} y={cy+5} textAnchor="middle" fill={i===0?'white':'#4a5568'} fontSize={13} fontWeight="bold">{i+1}</text>
          </g>
        ))}
        {[[240,20,120,80],[240,20,360,80],[120,80,60,150],[120,80,180,150],[360,80,300,150],[360,80,420,150]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#718096" strokeWidth={1.5}/>
        ))}
        <text x="240" y="170" textAnchor="middle" fill="#718096" fontSize="11">BFS順: 1→2→3→4→5→6→7　DFS順: 1→2→4→5→3→6→7</text>
      </svg>
    </div>
  )) as React.FC,
  'design-pattern': (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">GoFデザインパターンの分類</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { cat: '生成パターン', patterns: ['Singleton','Factory Method','Abstract Factory','Builder','Prototype'], color: '#2da3d9' },
          { cat: '構造パターン', patterns: ['Adapter','Decorator','Facade','Composite','Proxy','Bridge','Flyweight'], color: '#48bb78' },
          { cat: '振る舞いパターン', patterns: ['Observer','Strategy','Template Method','Command','Iterator','State'], color: '#ed8936' },
        ].map(g => (
          <div key={g.cat} style={{ border: `2px solid ${g.color}`, borderRadius: 8, padding: '10px 10px', background: `${g.color}08` }}>
            <div style={{ color: g.color, fontWeight: 800, fontSize: 12, marginBottom: 6 }}>{g.cat}</div>
            {g.patterns.map(p => <div key={p} style={{ fontSize: 11, color: '#4a5568', padding: '1px 0' }}>• {p}</div>)}
          </div>
        ))}
      </div>
    </div>
  )) as React.FC,
  'array-list': (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">配列 vs 連結リストの構造</h4>
      <svg viewBox="0 0 480 180" className="diagram-svg">
        {/* Array */}
        <text x="10" y="20" fill="#2da3d9" fontWeight="bold" fontSize="13">配列（連続メモリ）</text>
        {[10,20,30,40,50].map((v,i) => (
          <g key={i}>
            <rect x={10+i*80} y={30} width={70} height={44} rx={4} fill="#2da3d9" opacity={0.7}/>
            <text x={45+i*80} y={48} textAnchor="middle" fill="white" fontSize={10}>idx[{i}]</text>
            <text x={45+i*80} y={65} textAnchor="middle" fill="white" fontSize={16} fontWeight="bold">{v}</text>
          </g>
        ))}
        <text x="10" y="90" fill="#718096" fontSize="11">アクセス O(1) ／ 挿入削除 O(n)</text>
        {/* Linked List */}
        <text x="10" y="115" fill="#48bb78" fontWeight="bold" fontSize="13">連結リスト（非連続メモリ）</text>
        {[10,20,30,40,50].map((v,i) => (
          <g key={i}>
            <rect x={10+i*90} y={125} width={60} height={36} rx={4} fill="#48bb78" opacity={0.7}/>
            <text x={40+i*90} y={140} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">{v}</text>
            <text x={40+i*90} y={155} textAnchor="middle" fill="white" fontSize={9}>→next</text>
            {i < 4 && <path d={`M ${72+i*90} 143 L ${85+i*90} 143`} stroke="#276749" strokeWidth={2} markerEnd="url(#aal)"/>}
          </g>
        ))}
        <text x="10" y="175" fill="#718096" fontSize="11">アクセス O(n) ／ 挿入削除 O(1)（位置既知時）</text>
        <defs>
          <marker id="aal" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
            <polygon points="0 0, 6 2.5, 0 5" fill="#276749"/>
          </marker>
        </defs>
      </svg>
    </div>
  )) as React.FC,
  search: (() => (
    <div className="diagram-container">
      <h4 className="diagram-title">二分探索のトレース（配列から23を探す）</h4>
      <svg viewBox="0 0 480 170" className="diagram-svg">
        {[2,5,8,12,16,23,38,56].map((v,i) => (
          <g key={i}>
            <rect x={10+i*58} y={10} width={50} height={36} rx={4}
              fill={i===5?'#48bb78':i===3||i===6?'#ed8936':'#2da3d9'} opacity={0.6}/>
            <text x={35+i*58} y={24} textAnchor="middle" fill="white" fontSize={10}>idx{i}</text>
            <text x={35+i*58} y={40} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{v}</text>
          </g>
        ))}
        {/* Step 1 */}
        <text x={10} y={65} fill="#4a5568" fontSize={12} fontWeight="bold">第1回:</text>
        <text x={60} y={65} fill="#4a5568" fontSize={12}>左=0, 右=7 → 中央=3 → A[3]=12 &lt; 23 → 左=4</text>
        <rect x={10+3*58} y={8} width={50} height={40} rx={4} fill="none" stroke="#ed8936" strokeWidth={2.5}/>
        {/* Step 2 */}
        <text x={10} y={85} fill="#4a5568" fontSize={12} fontWeight="bold">第2回:</text>
        <text x={60} y={85} fill="#4a5568" fontSize={12}>左=4, 右=7 → 中央=5 → A[5]=23 = 23 → 発見！</text>
        <rect x={10+5*58} y={8} width={50} height={40} rx={4} fill="none" stroke="#48bb78" strokeWidth={2.5}/>
        <text x={240} y={115} textAnchor="middle" fill="#48bb78" fontSize={13} fontWeight="bold">✓ 8要素をわずか2回で発見！</text>
        <text x={240} y={133} textAnchor="middle" fill="#718096" fontSize={11}>線形探索なら最大8回必要</text>
        <text x={240} y={155} textAnchor="middle" fill="#718096" fontSize={11}>n要素 → 最大 log₂n 回（n=1024なら10回）</text>
      </svg>
    </div>
  )) as React.FC,
  complement: ComplementDiagram,
  floatingpoint: FloatingPointDiagram,
  datasize: DataSizeDiagram,
};

const Diagram: React.FC<DiagramProps> = ({ type }) => {
  const Component = diagrams[type];
  if (!Component) return null;
  return <Component />;
};

export default Diagram;
