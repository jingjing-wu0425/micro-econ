import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callZhipu(messages: Message[], model: string, enableSearch: boolean): Promise<string> {
  const apiKey = process.env.ZHIPU_API_KEY?.trim();
  if (!apiKey) throw new Error('ZHIPU_API_KEY not configured');

  const body: Record<string, unknown> = { model, messages, max_tokens: 800, temperature: 0.7 };

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

const EVAL_SYSTEM = `你是一位智慧、温暖的微观经济学导师，擅长苏格拉底式教学和第一性原理分析。学生正在通过"瑞幸咖啡 vs 星巴克"案例学习微观经济学。

你的回复风格：
- 像一位有趣的导师在咖啡馆里和学生聊天，不是在批改试卷
- 先肯定学生思考中的亮点，哪怕只有一点点
- 用大白话和生活化的比喻解释概念
- 善用苏格拉底式追问，引导学生自己发现答案

你的回复结构（不要写小标题，自然过渡）：
1. 肯定学生的思考中值得表扬的部分
2. 用第一性原理，从最基本的概念出发，帮学生梳理思路——就像把一个复杂的机器拆成零件，先理解每个零件，再看它们怎么组合
3. 补充学生没想到的角度或概念，用生活化的例子帮助理解
4. 提出 1-2 个启发式追问，引导学生更深入地思考
5. 在结尾自然地引入下一个问题的思考方向，让学生感到"原来学了这些，下一步该想这个了"

不要用"评分"、"优点"、"不足"这种冰冷格式。自然地表达就好。`;

const CHAT_SYSTEM = `你是一位有趣、耐心的微观经济学导师，正在咖啡馆里和学生讨论"瑞幸 vs 星巴克"案例。

准则：
1. 用大白话解释经济学概念，多用生活化的比喻和故事。
2. 当学生回答正确时热情肯定，回答有偏差时温和引导。
3. 可以直接讲解概念、给出分析思路和答案。
4. 善用苏格拉底式追问，引导学生自己发现答案。
5. 回复有温度，像一个关心学生的导师。
6. 回复简洁有力，不超过 300 字。`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, mode } = body as {
      messages: Message[];
      model?: string;
      mode?: 'evaluate' | 'chat';
    };

    const activeModel = model ?? process.env.AI_MODEL ?? 'glm-4-flash';
    const systemPrompt = mode === 'evaluate' ? EVAL_SYSTEM : CHAT_SYSTEM;
    const enableSearch = mode === 'chat';

    const fullMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await callZhipu(fullMessages, activeModel, enableSearch);

    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
