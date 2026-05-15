'use client';

import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-40 rounded-xl" style={{ background: 'var(--surface-warm)' }}>
      <span className="text-xs" style={{ color: 'var(--text-light)' }}>加载图表...</span>
    </div>
  ),
});

export function InlinePlot({ data, layout }: { data: any[]; layout: Record<string, any> }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Plot
        data={data}
        layout={{
          ...layout,
          autosize: true,
          height: 340,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { family: '-apple-system, sans-serif', size: 12, color: '#2d2a26' },
          margin: { t: 40, r: 30, b: 50, l: 60 },
          showlegend: layout?.showlegend ?? true,
          legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { size: 11 } },
          xaxis: { gridcolor: '#e8e2d9', zerolinecolor: '#e8e2d9', linecolor: '#e8e2d9', ...(layout?.xaxis || {}) },
          yaxis: { gridcolor: '#e8e2d9', zerolinecolor: '#e8e2d9', linecolor: '#e8e2d9', ...(layout?.yaxis || {}) },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
      />
    </div>
  );
}

export interface ContentBlock {
  type: 'text' | 'plotly';
  content: string;
  chartData?: { data: any[]; layout: Record<string, any> };
}

const PLOTLY_REGEX = /```plotly\s*\n([\s\S]*?)```/g;

export function parseResponse(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(PLOTLY_REGEX.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    try {
      const json = JSON.parse(match[1].trim());
      if (json.data && Array.isArray(json.data)) {
        blocks.push({
          type: 'plotly',
          content: match[0],
          chartData: { data: json.data, layout: json.layout || {} },
        });
      } else {
        blocks.push({ type: 'text', content: match[0] });
      }
    } catch {
      blocks.push({ type: 'text', content: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    blocks.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', content: text }];
}
