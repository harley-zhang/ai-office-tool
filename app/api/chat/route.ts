import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  let systemMessage: string | undefined = undefined;
  if (Array.isArray(context) && context.length > 0) {
    systemMessage = context
      .map((f: any, idx: number) => `Context File ${idx + 1}: ${f.name}\n${JSON.stringify(f.content)}`)
      .join('\n\n');
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemMessage,
    messages,
  });

  return result.toDataStreamResponse();
} 