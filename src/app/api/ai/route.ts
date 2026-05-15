import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callZhipu(messages: Message[], model: string, enableSearch: boolean): Promise<string> {
  const apiKey = process.env.ZHIPU_API_KEY?.trim();
  if (!apiKey) throw new Error('ZHIPU_API_KEY not configured');

  const body: Record<string, unknown> = { model, messages, max_tokens: 2000, temperature: 0.8 };

  if (enableSearch) {
    body.tools = [{ type: 'web_search', web_search: { enable: true } }];
  }

  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zhipu API error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

const SYSTEM_PROMPT = `你是一位在知乎上拥有百万关注的经济学答主，擅长用"先抛问题、再拆逻辑、最后升华"的方式分析商业现象。

你正在和读者一起分析"瑞幸咖啡如何死而复生并反攻星巴克"这个案例，帮他理解背后的微观经济学原理。

语气风格：
- 知乎体：有见地、有逻辑、有故事感，不是教科书式的"定义+例子"
- 开头先抛一个反直觉的观点或问题，抓住注意力
- 用"为什么？"、"你想想看"、"有意思的是"这类连接词推动思考
- 可以用数据、行业八卦、真实商业故事来佐证
- 敢下判断，有自己的观点，不要骑墙
- 适当用 Markdown 加粗关键概念

回复结构（自然融合，不写小标题）：
1. 先点评用户的回答——哪里想对了，哪里没想透
2. 用第一性原理把核心概念拆开讲清楚，从最底层的逻辑出发
3. 补充用户没考虑到的维度，用真实的商业案例或数据说明
4. 抛出 1-2 个更深层的追问，让用户继续想下去
5. 结尾用 1-2 句话自然过渡到下一个相关话题

回复长度：800-1200 字，要讲透，不要蜻蜓点水。

## 绘图工具

你可以在回复中嵌入交互式经济学图表来辅助说明。当你认为某个概念用图表展示会更直观时（比如供需曲线、成本曲线、弹性对比、博弈矩阵等），在回复中插入 Plotly.js 格式的 JSON 配置块：

用法：在正文中用 \`\`\`plotly 和 \`\`\` 包裹一个 JSON 对象，包含 data 和 layout 字段。

示例：
\`\`\`plotly
{
  "data": [
    {"x": [0,1,2,3,4,5], "y": [10,8,6,4,2,0], "name": "需求曲线", "type": "scatter", "mode": "lines", "line": {"color": "#c2703e", "width": 2.5}},
    {"x": [0,1,2,3,4,5], "y": [0,2,4,6,8,10], "name": "供给曲线", "type": "scatter", "mode": "lines", "line": {"color": "#5a9e6f", "width": 2.5}}
  ],
  "layout": {
    "title": {"text": "供需均衡", "font": {"size": 14}},
    "xaxis": {"title": {"text": "数量 Q"}},
    "yaxis": {"title": {"text": "价格 P（元）"}}
  }
}
\`\`\`

绘图规则：
- 仅在确实需要图表辅助理解时才画，不是每条回复都必须画
- 坐标轴和标题用中文
- 线条颜色建议：主曲线 #c2703e（棕色），对比曲线 #5a9e6f（绿色），辅助线 #7b8eb5（蓝灰色）
- 可以用 fill: "tozeroy" 或 fill: "toself" 来标注面积（如消费者剩余、无谓损失）
- x/y 数据用数组，不要用函数
- 图表应精确反映所讨论的经济学概念，数据和形状要有意义
- 你可以在图表前后用文字解释图表的含义

当用户继续追问时：
- 更直接地回答问题，可以给出完整的分析
- 用搜索结果补充最新的行业数据和案例
- 保持知乎体，但更对话化`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model } = body as {
      messages: Message[];
      model?: string;
    };

    const activeModel = model ?? process.env.AI_MODEL ?? 'glm-4-flash';
    const enableSearch = true;

    const fullMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await callZhipu(fullMessages, activeModel, enableSearch);

    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
