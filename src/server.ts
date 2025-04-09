import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { askChatGPT } from './chatgpt';
import { CHATGPT_TOOL, isChatGPTArgs } from './types';

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
  tools: [CHATGPT_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "chatgpt") {
      if (!isChatGPTArgs(args)) {
        throw new Error("Invalid arguments for ChatGPT tool");
      }

      switch (args.operation) {
        case "ask": {
          if (!args.prompt) {
            throw new Error("Prompt is required for ask operation");
          }
          
          const response = await askChatGPT(args.prompt, args.conversation_id);
          
          return {
            content: [{ 
              type: "text", 
              text: response || "No response received from ChatGPT."
            }],
            isError: false
          };
        }

        default:
          throw new Error(`Unknown operation: ${args.operation}`);
      }
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