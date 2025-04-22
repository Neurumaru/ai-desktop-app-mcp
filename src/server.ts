import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as chatgptRouter from "./chatgpt";
import * as claudeRouter from "./claude";

export const server = new Server(
    {
        name: "ChatGPT MCP Tool",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [...chatgptRouter.tools, ...claudeRouter.tools],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        throw new Error("No arguments provided");
    }
    if (chatgptRouter.tools.some((tool) => tool.name === name)) {
        return chatgptRouter.handleTool(name, args);
    } else if (claudeRouter.tools.some((tool) => tool.name === name)) {
        return claudeRouter.handleTool(name, args);
    }
    return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
    };
});
