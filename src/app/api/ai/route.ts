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

const EVAL_SYSTEM = `你是一位经验丰富的微观经济学教授。学生正在通过"瑞幸咖啡 vs 星巴克"案例学习微观经济学。

你的任务：
1. 评估学生的回答是否正确运用了对应的经济学概念。
2. 指出回答中的优点和不足。
3. 用大白话解释，避免过度学术化。

评分：给出 1-5 分（1=完全不理解，5=完全掌握）。
格式：
**评分：X/5**

**优点：** ...

**不足：** ...

**建议方向：** 用 1-2 句话提示学生思考方向，但不直接给答案。`;

const CHAT_SYSTEM = `你是一位耐心友善的微观经济学导师，正在辅导学生学习"瑞幸 vs 星巴克"案例。

准则：
1. 用大白话解释经济学概念，多用生活化的比喻。
2. 当学生回答正确时给予肯定，回答有偏差时温和引导。
3. 可以直接讲解概念、给出分析思路和答案。
4. 回复简洁有力，不超过 300 字。`;

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
