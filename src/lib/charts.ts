/* eslint-disable @typescript-eslint/no-explicit-any */

type PlotlyData = any[];
type PlotlyLayout = Record<string, any>;

const COLORS = {
  primary: '#c2703e',
  secondary: '#5a9e6f',
  tertiary: '#7b8eb5',
  gold: '#d4a853',
  purple: '#8b6aae',
  red: '#c25b5b',
  fillPrimary: 'rgba(194, 112, 62, 0.15)',
  fillSecondary: 'rgba(90, 158, 111, 0.15)',
  fillTertiary: 'rgba(123, 142, 181, 0.15)',
  bg: '#fefcf9',
  grid: '#e8e2d9',
  text: '#2d2a26',
  textLight: '#8a8279',
};

const baseLayout: PlotlyLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { family: '-apple-system, sans-serif', size: 12, color: COLORS.text },
  margin: { t: 40, r: 30, b: 50, l: 60 },
  showlegend: true,
  legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { size: 11 } },
  xaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, linecolor: COLORS.grid },
  yaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, linecolor: COLORS.grid },
};

interface ChartConfig {
  data: PlotlyData;
  layout: PlotlyLayout;
}

function makeLayout(overrides: PlotlyLayout): PlotlyLayout {
  return { ...baseLayout, ...overrides, xaxis: { ...baseLayout.xaxis, ...overrides.xaxis }, yaxis: { ...baseLayout.yaxis, ...overrides.yaxis } };
}

const charts: Record<number, ChartConfig> = {
  // Q1: 总效用 & 边际效用曲线
  1: {
    data: [
      {
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        y: [0, 10, 18, 24, 28, 30, 30, 28, 24],
        name: '总效用 TU',
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: COLORS.primary, width: 2.5 },
        marker: { size: 5 },
      },
      {
        x: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        y: [0, 10, 8, 6, 4, 2, 0, -2, -4],
        name: '边际效用 MU',
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: COLORS.secondary, width: 2.5 },
        marker: { size: 5 },
        fill: 'tozeroy',
        fillcolor: COLORS.fillSecondary,
      },
    ],
    layout: makeLayout({
      title: { text: '总效用与边际效用', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '消费量（杯）' } },
      yaxis: { title: { text: '效用' }, zeroline: true },
      annotations: [
        { x: 6, y: 0, text: '饱和点', showarrow: true, arrowhead: 2, ax: 30, ay: -30, font: { size: 10, color: COLORS.textLight } },
      ],
    }),
  },

  // Q2: 无差异曲线 + 预算约束
  2: {
    data: [
      {
        x: [1, 2, 3, 5, 8, 12],
        y: [12, 8, 5, 3, 2, 1],
        name: 'IC₁ (白领)',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 2.5, shape: 'spline' },
      },
      {
        x: [1, 2, 4, 7, 11],
        y: [7, 4, 2.5, 1.5, 1],
        name: 'IC₂ (退休老人)',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.tertiary, width: 2.5, shape: 'spline', dash: 'dash' },
      },
      {
        x: [0, 15],
        y: [10, 0],
        name: '预算约束线',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.red, width: 2 },
      },
      {
        x: [3.75],
        y: [7.5],
        name: '白领最优选择',
        type: 'scatter',
        mode: 'markers',
        marker: { size: 10, color: COLORS.primary, symbol: 'star' },
      },
      {
        x: [1.8],
        y: [3.6],
        name: '老人最优选择',
        type: 'scatter',
        mode: 'markers',
        marker: { size: 10, color: COLORS.tertiary, symbol: 'star' },
      },
    ],
    layout: makeLayout({
      title: { text: '无差异曲线与预算约束', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '咖啡（杯/月）' }, range: [0, 14] },
      yaxis: { title: { text: '其他消费' }, range: [0, 14] },
    }),
  },

  // Q3: 需求弹性对比
  3: {
    data: [
      {
        x: [60, 50, 40, 30, 20, 10],
        y: [5, 10, 15, 20, 25, 30],
        name: '瑞幸需求（富有弹性）',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 2.5 },
        fill: 'tozeroy',
        fillcolor: COLORS.fillPrimary,
      },
      {
        x: [25, 23, 21, 19, 17, 15],
        y: [5, 10, 15, 20, 25, 30],
        name: '星巴克需求（缺乏弹性）',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.secondary, width: 2.5 },
      },
    ],
    layout: makeLayout({
      title: { text: '需求价格弹性对比', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '需求量（万杯/天）' } },
      yaxis: { title: { text: '价格（元）' } },
      annotations: [
        { x: 35, y: 18, text: '瑞幸：弹性大<br>降价→总收益↑', showarrow: false, font: { size: 10, color: COLORS.primary } },
        { x: 20, y: 12, text: '星巴克：弹性小', showarrow: false, font: { size: 10, color: COLORS.secondary } },
      ],
    }),
  },

  // Q4: 总收益 vs 价格
  4: {
    data: [
      {
        x: [5, 10, 15, 20, 25, 30, 35],
        y: [50, 80, 90, 80, 60, 40, 20],
        name: '总收益 TR',
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: COLORS.primary, width: 2.5 },
        marker: { size: 5 },
        fill: 'tozeroy',
        fillcolor: COLORS.fillPrimary,
      },
    ],
    layout: makeLayout({
      title: { text: '总收益与价格的关系', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '价格（元）' } },
      yaxis: { title: { text: '总收益 TR' } },
      annotations: [
        { x: 15, y: 92, text: '弹性=1', showarrow: true, arrowhead: 2, ax: 30, ay: -20, font: { size: 10, color: COLORS.textLight } },
        { x: 8, y: 60, text: '弹性>1<br>降价增收', showarrow: false, font: { size: 10, color: COLORS.secondary } },
        { x: 28, y: 50, text: '弹性<1<br>涨价增收', showarrow: false, font: { size: 10, color: COLORS.red } },
      ],
    }),
  },

  // Q5: 成本曲线
  5: {
    data: [
      {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [3, 5, 6, 7, 8.5, 10, 12, 15, 19, 24],
        name: 'FC 固定成本',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.textLight, width: 1.5, dash: 'dot' },
      },
      {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 5, 9, 14, 20, 27, 35, 44, 54, 65],
        name: 'TC 总成本',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 2.5 },
      },
      {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.6],
        name: 'AC 平均成本',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.secondary, width: 2.5 },
      },
      {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 4, 5, 5.5, 6, 7, 8, 9, 10, 11],
        name: 'MC 边际成本',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.red, width: 2.5 },
      },
    ],
    layout: makeLayout({
      title: { text: '瑞幸 vs 星巴克 成本结构', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '产量 Q' } },
      yaxis: { title: { text: '成本（元）' } },
      annotations: [
        { x: 5, y: 3.5, text: 'MC 穿过 AC 最低点', showarrow: true, arrowhead: 2, ax: 50, ay: 20, font: { size: 10, color: COLORS.textLight } },
      ],
    }),
  },

  // Q7: 规模经济 LRAC
  7: {
    data: [
      {
        x: [100, 200, 400, 600, 800, 1000, 1200, 1500, 2000],
        y: [25, 18, 13, 10, 9, 8.5, 8.5, 9, 11],
        name: 'LRAC 长期平均成本',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 3 },
        fill: 'tozeroy',
        fillcolor: COLORS.fillPrimary,
      },
      {
        x: [100, 200, 400, 600],
        y: [25, 18, 13, 10],
        name: '规模经济阶段',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.secondary, width: 0 },
        fill: 'tozeroy',
        fillcolor: COLORS.fillSecondary,
        showlegend: false,
      },
    ],
    layout: makeLayout({
      title: { text: '长期平均成本曲线（规模经济）', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '产量（门店数）' } },
      yaxis: { title: { text: '平均成本（元/杯）' } },
      annotations: [
        { x: 300, y: 14, text: '← 规模经济', showarrow: false, font: { size: 11, color: COLORS.secondary } },
        { x: 1100, y: 7.5, text: '规模报酬不变', showarrow: false, font: { size: 10, color: COLORS.textLight } },
        { x: 1800, y: 12, text: '规模不经济 →', showarrow: false, font: { size: 11, color: COLORS.red } },
      ],
    }),
  },

  // Q11: 价格歧视
  11: {
    data: [
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [35, 30, 25, 20, 15, 10, 5],
        name: '需求曲线 D',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 2.5 },
      },
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [5, 5, 5, 5, 5, 5, 5],
        name: '边际成本 MC',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.secondary, width: 2, dash: 'dash' },
      },
      {
        x: [0, 0, 15, 15, 0],
        y: [5, 35, 35, 5, 5],
        name: '消费者剩余',
        type: 'scatter',
        mode: 'lines',
        line: { color: 'rgba(0,0,0,0)', width: 0 },
        fill: 'toself',
        fillcolor: COLORS.fillPrimary,
      },
      {
        x: [0, 0, 15, 15, 0],
        y: [5, 20, 20, 5, 5],
        name: '一级歧视被攫取',
        type: 'scatter',
        mode: 'lines',
        line: { color: 'rgba(0,0,0,0)', width: 0 },
        fill: 'toself',
        fillcolor: COLORS.fillSecondary,
      },
    ],
    layout: makeLayout({
      title: { text: '价格歧视与消费者剩余', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '数量 Q' } },
      yaxis: { title: { text: '价格 P（元）' } },
      annotations: [
        { x: 7, y: 22, text: '消费者剩余', showarrow: false, font: { size: 11, color: COLORS.primary } },
        { x: 7, y: 10, text: '一级歧视攫取的剩余', showarrow: false, font: { size: 10, color: COLORS.secondary } },
      ],
    }),
  },

  // Q15: 博弈收益矩阵（用表格标记点模拟）
  15: {
    data: [
      {
        x: [1, 2, 1, 2],
        y: [2, 2, 1, 1],
        text: ['高利润, 高利润<br>(10, 10)', '低利润, 高利润<br>(3, 15)', '高利润, 低利润<br>(15, 3)', '低利润, 低利润<br>(5, 5)'],
        mode: 'markers+text',
        type: 'scatter',
        textposition: 'middle center',
        marker: { size: 60, color: [COLORS.fillSecondary, COLORS.fillTertiary, COLORS.fillTertiary, COLORS.fillPrimary], line: { width: 2, color: [COLORS.secondary, COLORS.tertiary, COLORS.tertiary, COLORS.primary] } },
        textfont: { size: 9, color: COLORS.text },
        showlegend: false,
      },
    ],
    layout: makeLayout({
      title: { text: '瑞幸 vs 星巴克 收益矩阵（单位：亿元）', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '星巴克策略' }, tickvals: [1, 2], ticktext: ['不降价', '降价'], range: [0.2, 2.8], showgrid: false },
      yaxis: { title: { text: '瑞幸策略' }, tickvals: [1, 2], ticktext: ['降价', '不降价'], range: [0.2, 2.8], showgrid: false },
      annotations: [
        { x: 1, y: 1.1, text: '(降价,降价) ← 纳什均衡', showarrow: true, arrowhead: 2, ax: 0, ay: 35, font: { size: 10, color: COLORS.red } },
      ],
    }),
  },

  // Q17: 期望效用曲线
  17: {
    data: [
      {
        x: [0, 2000, 5000, 8000, 10000, 15000, 20000],
        y: [0, 40, 65, 82, 90, 100, 105],
        name: '风险规避者',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 2.5, shape: 'spline' },
      },
      {
        x: [0, 2000, 5000, 8000, 10000, 15000, 20000],
        y: [0, 10, 25, 40, 50, 75, 100],
        name: '风险中性者',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.textLight, width: 1.5, dash: 'dash' },
      },
      {
        x: [0, 2000, 5000, 8000, 10000, 15000, 20000],
        y: [0, 2, 8, 18, 30, 60, 100],
        name: '风险爱好者',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.secondary, width: 2.5, shape: 'spline' },
      },
    ],
    layout: makeLayout({
      title: { text: '期望效用函数（不同风险偏好）', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '财富（元）' } },
      yaxis: { title: { text: '效用 U(W)' } },
    }),
  },

  // Q18: 前景理论价值函数
  18: {
    data: [
      {
        x: [-100, -50, -20, 0, 20, 50, 100],
        y: [-80, -40, -22, 0, 13, 25, 35],
        name: '价值函数 v(x)',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 3, shape: 'spline' },
      },
      {
        x: [-100, -50, -20, 0, 20, 50, 100],
        y: [-100, -50, -20, 0, 20, 50, 100],
        name: '参考线（线性）',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.textLight, width: 1, dash: 'dot' },
      },
    ],
    layout: makeLayout({
      title: { text: '前景理论：价值函数', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '收益/损失' }, zeroline: true },
      yaxis: { title: { text: '主观价值 v(x)' }, zeroline: true },
      annotations: [
        { x: -60, y: -65, text: '损失区域（更陡）<br>= 损失厌恶', showarrow: false, font: { size: 10, color: COLORS.red } },
        { x: 60, y: 20, text: '收益区域（更平）<br>= 边际递减', showarrow: false, font: { size: 10, color: COLORS.secondary } },
      ],
    }),
  },

  // Q21: 正外部性
  21: {
    data: [
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [35, 30, 25, 20, 15, 10, 5],
        name: '社会边际收益 SMB',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.secondary, width: 2.5, dash: 'dash' },
      },
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [30, 25, 20, 15, 10, 5, 0],
        name: '私人边际收益 PMB（需求）',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 2.5 },
      },
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [5, 5, 5, 5, 5, 5, 5],
        name: '边际成本 MC（供给）',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.tertiary, width: 2 },
      },
      {
        x: [10, 10, 20, 20, 10],
        y: [5, 20, 20, 5, 5],
        name: '正外部性损失',
        type: 'scatter',
        mode: 'lines',
        line: { color: 'rgba(0,0,0,0)', width: 0 },
        fill: 'toself',
        fillcolor: COLORS.fillSecondary,
      },
    ],
    layout: makeLayout({
      title: { text: '正外部性与市场失灵', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '数量 Q（门店数）' } },
      yaxis: { title: { text: '价格 P（元）' } },
      annotations: [
        { x: 8, y: 12, text: '市场均衡', showarrow: true, arrowhead: 2, ax: -30, ay: 20, font: { size: 10, color: COLORS.primary } },
        { x: 15, y: 12, text: '社会最优', showarrow: true, arrowhead: 2, ax: 30, ay: 20, font: { size: 10, color: COLORS.secondary } },
        { x: 15, y: 8, text: '未被内部化的<br>社会收益', showarrow: false, font: { size: 9, color: COLORS.secondary } },
      ],
    }),
  },

  // Q22: 负外部性 + 庇古税
  22: {
    data: [
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [30, 25, 20, 15, 10, 5, 0],
        name: '私人边际成本 PMC（供给）',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.primary, width: 2.5 },
      },
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [40, 35, 30, 25, 20, 15, 10],
        name: '社会边际成本 SMC',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.red, width: 2.5, dash: 'dash' },
      },
      {
        x: [0, 5, 10, 15, 20, 25, 30],
        y: [35, 30, 25, 20, 15, 10, 5],
        name: '需求 D',
        type: 'scatter',
        mode: 'lines',
        line: { color: COLORS.secondary, width: 2.5 },
      },
      {
        x: [10, 10, 17, 17, 10],
        y: [20, 25, 30, 25, 20],
        name: '无谓损失 DWL',
        type: 'scatter',
        mode: 'lines',
        line: { color: 'rgba(0,0,0,0)', width: 0 },
        fill: 'toself',
        fillcolor: 'rgba(194, 91, 91, 0.15)',
      },
    ],
    layout: makeLayout({
      title: { text: '负外部性与庇古税', font: { size: 14, color: COLORS.text } },
      xaxis: { title: { text: '产量 Q（万杯）' } },
      yaxis: { title: { text: '价格 P（元）' } },
      annotations: [
        { x: 17, y: 18, text: '市场均衡<br>(无干预)', showarrow: true, arrowhead: 2, ax: 40, ay: 20, font: { size: 10, color: COLORS.primary } },
        { x: 10, y: 28, text: '社会最优<br>(庇古税后)', showarrow: true, arrowhead: 2, ax: -40, ay: -20, font: { size: 10, color: COLORS.secondary } },
        { x: 14, y: 24, text: '无谓损失', showarrow: false, font: { size: 10, color: COLORS.red } },
      ],
    }),
  },
};

export function getChartConfig(questionId: number): ChartConfig | null {
  return charts[questionId] ?? null;
}

export function hasChart(questionId: number): boolean {
  return questionId in charts;
}
