import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callZhipu(messages: Message[], model: string, enableSearch: boolean): Promise<string> {
  const apiKey = process.env.ZHIPU_API_KEY?.trim();
  if (!apiKey) throw new Error('ZHIPU_API_KEY not configured');

  const body: Record<string, unknown> = { model, messages, max_tokens: 1500, temperature: 0.8 };

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
