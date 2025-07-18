import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';
import { tool, jsonSchema } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context, mode } = await req.json();

  console.log('[API] /api/chat POST', { mode, messagesLen: messages?.length, contextLen: context?.length });

  // build system prompt from context files
  let systemMessage: string | undefined;
  if (Array.isArray(context) && context.length > 0) {
    const sections = context.map((f: any, idx: number) => {
      // stringify with length guard to prevent huge prompts
      let serialized: string;
      try {
        serialized = JSON.stringify(f.content);
        if (serialized.length > 8000) {
          serialized = serialized.slice(0, 8000) + '... [truncated]';
        }
      } catch {
        serialized = '[unserializable]';
      }
      return `Context File ${idx + 1} (${f.type}): ${f.name} [id: ${f.id}]\n${serialized}`;
    });
    systemMessage = sections.join('\n\n');
  }

  const isAgent = mode === 'Agent';

  // Prepend agent instructions when in Agent mode
  if (isAgent) {
    const preamble = [
      'You are an AI assistant with the ability to modify user files by calling tools.',
      '1. To append text to a DOC, use the "edit_doc" tool. Only append, never delete. Provide {"docId","text"}.',
      '2. To write a value into a spreadsheet CELL, use the "edit_sheet" tool with {"sheetId","cell","value"}.',
      'When calling a tool you MUST copy the exact numeric id shown in the context list. Do NOT shorten or rename it.',
      'Allowed cell addresses are in A1 notation (e.g., "A1", "C3").',
      'Only call ONE edit tool per user request and target a file that is part of the provided context.',
      'If the user does not ask for a change, or the request is ambiguous, ask a clarifying question instead of calling a tool.'
    ].join(' ');

    systemMessage = systemMessage ? `${preamble}\n\n${systemMessage}` : preamble;
  }

  // Define the edit_doc tool (client-side execution)
  const editDocTool = tool({
    description:
      'Append text to a document in the user\'s workspace. Only valid for docs, never for sheets.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        docId: { type: 'string', description: 'ID of the document to edit. Must match the id field from the context array.' },
        text: { type: 'string', description: 'Text that should be appended to the end of the document.' },
      },
      required: ['docId', 'text'],
    }),
    // No execute() so it will be client-side handled
  });

  const editSheetTool = tool({
    description: 'Set the value of a cell in a spreadsheet. Only valid for sheets provided in context.',
    parameters: jsonSchema({
      type: 'object',
      properties: {
        sheetId: { type: 'string', description: 'ID of the sheet to edit. Must match id field from context.' },
        cell: { type: 'string', description: 'Cell coordinate in A1 notation, e.g., "B3".' },
        value: { type: 'string', description: 'Value to write into the cell.' },
      },
      required: ['sheetId', 'cell', 'value'],
    }),
  });

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemMessage,
    messages,
    tools: isAgent ? { edit_doc: editDocTool, edit_sheet: editSheetTool } : undefined,
    maxSteps: isAgent ? 5 : 1,
    toolCallStreaming: true,
  });

  console.log('[API] streamText initialized, isAgent:', isAgent);

  return result.toDataStreamResponse({
    getErrorMessage(error) {
      console.error('[API] streamText error', error);
      if (error instanceof Error) return error.message;
      return typeof error === 'string' ? error : JSON.stringify(error);
    },
  });
} 