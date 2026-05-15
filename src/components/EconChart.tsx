'use client';

import dynamic from 'next/dynamic';
import { getChartConfig, hasChart } from '@/lib/charts';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-48 rounded-xl" style={{ background: 'var(--surface-warm)' }}>
      <span className="text-xs" style={{ color: 'var(--text-light)' }}>加载图表...</span>
    </div>
  ),
});

export default function EconChart({ questionId }: { questionId: number }) {
  if (!hasChart(questionId)) return null;

  const config = getChartConfig(questionId);
  if (!config) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-5 h-[2px] rounded" style={{ background: 'var(--accent)' }} />
        <span className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--accent)' }}>参考图表</span>
      </div>
      <div className="rounded-xl p-4 overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Plot
          data={config.data as any}
          layout={{
            ...config.layout,
            autosize: true,
            height: 360,
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
