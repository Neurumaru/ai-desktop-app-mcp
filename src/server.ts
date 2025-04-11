import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { askChatGPT, getChat } from './chatgpt';
import { ASK_CHATGPT_TOOL, GET_PREVIOUS_CHATGPT_TOOL } from './types';

export const server = new Server(
  {
    name: "ChatGPT MCP Tool",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [ASK_CHATGPT_TOOL, GET_PREVIOUS_CHATGPT_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "ask_chatgpt") {
      if (!args.prompt) {
        throw new Error("Prompt is required for ask operation");
      }

      const response = await askChatGPT(String(args.prompt));

      return {
        content: [{ 
          type: "text", 
          text: response || "No response received from ChatGPT."
        }],
        isError: false
      };
    } else if (name === "get_previous_response") {
      const response = await getChat();
      return {
        content: [{ type: "text", text: response }],
        isError: false
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}); 