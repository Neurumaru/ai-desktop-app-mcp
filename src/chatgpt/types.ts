import { Tool } from "@modelcontextprotocol/sdk/types.js";

export type Status = 'inactive' | 'ready' | 'running' | 'error';

export const ASK_CHATGPT_TOOL: Tool = {
  name: "ask_chatgpt",
  description: "Ask ChatGPT a question",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The prompt to send to ChatGPT"
      }
    },
    required: ["prompt"]
  },
}

export const GET_PREVIOUS_CHATGPT_TOOL: Tool = {
  name: "get_previous_response",
  description: "Get the previous response from ChatGPT",
  inputSchema: { type: "object" },
}