import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface ChatGPTArgs {
  operation: "ask" | "get_previous_response";
  prompt?: string;
  conversation_id?: string;
}

export const CHATGPT_TOOL: Tool = {
  name: "chatgpt",
  description: "Interact with the ChatGPT desktop app on macOS",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform: 'ask', `get_previous_response`",
        enum: ["ask", "get_previous_response"]
      },
      prompt: {
        type: "string",
        description: "The prompt to send to ChatGPT (required for ask operation)"
      }
    },
    required: ["operation"]
  }
};

export function isChatGPTArgs(args: unknown): args is ChatGPTArgs {
  if (typeof args !== "object" || args === null) return false;
  
  const { operation, prompt, conversation_id } = args as any;
  
  if (!operation || !["ask", "get_previous_response"].includes(operation)) {
    return false;
  }
  
  if (operation === "ask" && !prompt) return false;
  
  if (prompt && typeof prompt !== "string") return false;
  if (conversation_id && typeof conversation_id !== "string") return false;
  
  return true;
} 