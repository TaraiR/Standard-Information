'use client';

import { useMemo, useState } from 'react';
import StepPlayer from './StepPlayer';
import { Segment } from './ui';
import { LAYERS, MODEL_LABEL, MODEL_NOTE, runRest, userLayers, type Model } from './traces/cloud';

const MODELS: Model[] = ['onprem', 'iaas', 'paas', 'saas'];

function ModelPart() {
  const steps = useMemo(() => [
    { m: -1, message: 'システムは下から「ネットワーク・設備 → サーバ → 仮想化 → OS → ミドルウェア → データ → アプリケーション」の層で成り立っています。誰がどこまで管理するかで、クラウドのサービスモデルが分かれます。' },
    ...MODELS.map((m, i) => ({ m: i, message: `${MODEL_LABEL[m]}: ${MODEL_NOTE[m]}` })),
    { m: 4, message: 'SaaS → PaaS → IaaS → オンプレミスの順に、利用者が自分で管理する範囲が広くなります。管理範囲が広いほど自由度は高く、手間も増えます。' },
  ], []);
  return (
    <StepPlayer
      title="IaaS・PaaS・SaaS の違い（利用者が管理する範囲）"
      steps={steps}
      renderVisual={s => (
        <div className="viz-table-wrap">
          <table className="viz-grid" style={{ width: '100%' }}>
            <thead>
              <tr><th />{MODELS.map((m, i) => <th key={m} className={s.m === i ? 'is-now' : undefined}>{MODEL_LABEL[m]}</th>)}</tr>
            </thead>
            <tbody>
              {LAYERS.map(layer => (
                <tr key={layer}>
                  <th style={{ textAlign: 'right' }}>{layer}</th>
                  {MODELS.map((m, i) => {
                    const shown = s.m >= i || s.m === 4;
                    const mine = userLayers(m).includes(layer);
                    return (
                      <td key={m} className={!shown ? undefined : mine ? (s.m === i ? 'tone-focus is-now' : 'tone-range') : 'tone-muted'}>
                        {shown ? (mine ? '利用者' : '事業者') : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      getMessage={s => s.message}
      legend={[{ tone: 'range', label: '利用者が管理' }, { tone: 'muted', label: 'クラウド事業者が提供・管理' }]}
      footnote="セキュリティも同じように分担します（責任共有モデル）。SaaS でも、データとアクセス権の管理は利用者の責任です。"
    />
  );
}

const METHOD_TONE: Record<string, string> = { GET: 'range', POST: 'done', PUT: 'focus', DELETE: 'focus' };

function RestPart() {
  const steps = useMemo(() => runRest(), []);
  return (
    <StepPlayer
      title="REST API の操作（本の管理 API）"
      steps={steps}
      renderVisual={s => (
        <div className="viz-panels">
          <div className="viz-panel">
            <h5>リクエストとレスポンス</h5>
            {s.call ? (
              <dl className="viz-kv">
                <dt>送信</dt>
                <dd className="is-changed">{s.call.method} {s.call.path}{s.call.body ? `　「${s.call.body}」` : ''}</dd>
                <dt>状態</dt>
                <dd className={s.status.startsWith('2') ? 'is-hl' : 'is-changed'}>{s.status}</dd>
                <dt>返答</dt>
                <dd>{s.response}</dd>
              </dl>
            ) : <span className="viz-hint">（まだ送っていません）</span>}
          </div>
          <div className="viz-panel">
            <h5>サーバ上のデータ（/books）</h5>
            <dl className="viz-kv">
              {s.books.map(b => (
                <div key={b.id} style={{ display: 'contents' }}>
                  <dt>{b.id}</dt>
                  <dd className={b.id === s.changed ? 'is-changed' : undefined}>{b.title}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
      getMessage={s => s.message}
      getVars={s => [{ label: 'メソッド', value: s.call?.method ?? '—', tone: (s.call ? METHOD_TONE[s.call.method] : 'plain') as 'range' }]}
      footnote="GET = 取得、POST = 作成、PUT = 更新、DELETE = 削除。URL が「何を」、メソッドが「どうするか」を表します。"
    />
  );
}

const TABS = [{ value: 'model', label: 'IaaS・PaaS・SaaS' }, { value: 'rest', label: 'REST API' }] as const;

export default function CloudVisual() {
  const [tab, setTab] = useState<'model' | 'rest'>('model');
  return (
    <div className="viz-group">
      <Segment label="教材の切り替え" options={TABS} value={tab} onChange={setTab} />
      {tab === 'model' ? <ModelPart /> : <RestPart />}
    </div>
  );
}
