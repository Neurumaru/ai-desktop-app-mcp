import { ask, getResponse } from './service';
import { ASK_CHATGPT_TOOL, GET_PREVIOUS_CHATGPT_TOOL } from './types';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

const TIMEOUT = 300000; // 5 minutes

export const tools: Tool[] = [ASK_CHATGPT_TOOL, GET_PREVIOUS_CHATGPT_TOOL];

export async function handleTool(name: string, args: any) {
  const controller = new AbortController();
  const signal = controller.signal;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT);

  try {
    if (name === ASK_CHATGPT_TOOL.name) {
      if (!args.prompt) {
        throw new Error('Prompt is required for ask operation');
      }
      return {
        content: [{ 
          type: 'text', 
          text: await ask(args.prompt, signal) 
            || 'No response received from ChatGPT.' 
        }],
        isError: false,
      };
    } else if (name === GET_PREVIOUS_CHATGPT_TOOL.name) {
      return {
        content: [{ 
          type: 'text', 
          text: await getResponse(signal) 
            || 'No response received from ChatGPT.' 
        }],
        isError: false,
      };
    }
    return {
      content: [{ 
        type: 'text', 
        text: `Unknown tool: ${name}` 
      }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error during ${name}: ${error.message}` 
      }],
      isError: true,
    };
  } finally {
    clearTimeout(timeoutId);
  }
} 