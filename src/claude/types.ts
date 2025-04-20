import { Tool } from "@modelcontextprotocol/sdk/types.js";

export type Status = 'inactive' | 'ready' | 'running' | 'error';

export const ASK_CLAUDE_TOOL: Tool = {
  name: "ask_claude",
  description: "Ask Claude a question",
  inputSchema: {
    type: "object",
    properties: {
      conversationId: {
        type: "string",
        description: "The conversation ID to send the prompt to (If not provided, a new conversation will be created)"
      },
      prompt: {
        type: "string",
        description: "The prompt to send to Claude"
      }
    },
    required: ["prompt"]
  },
}

export const GET_PREVIOUS_CLAUDE_TOOL: Tool = {
  name: "get_previous_claude",
  description: "Get the previous response from Claude",
  inputSchema: {
    type: "object",
    properties: {
      conversationId: {
        type: "string",
        description: "The conversation ID to get the previous response from"
      }
    },
    required: ["conversationId"]
  },
}

export const GET_CONVERSATIONS_CLAUDE_TOOL: Tool = {
  name: "get_conversations_claude",
  description: "Get all conversations from Claude",
  inputSchema: { type: "object" },
}
