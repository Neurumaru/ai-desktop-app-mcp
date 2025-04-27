import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ask, getResponse, getConversations } from "./service";
import {
    ASK_CLAUDE_TOOL,
    GET_PREVIOUS_CLAUDE_TOOL,
    GET_CONVERSATIONS_CLAUDE_TOOL,
} from "./types";

const TIMEOUT = 300000; // 5 minutes

export const tools: Tool[] = [
    ASK_CLAUDE_TOOL,
    GET_PREVIOUS_CLAUDE_TOOL,
    GET_CONVERSATIONS_CLAUDE_TOOL,
];

export async function handleTool(name: string, args: any) {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, TIMEOUT);

    try {
        if (name === ASK_CLAUDE_TOOL.name) {
            if (!args.prompt) {
                throw new Error("Prompt is required for ask operation");
            }

            return {
                content: [
                    {
                        type: "text",
                        text:
                            JSON.stringify(
                                await ask(
                                    signal,
                                    args.conversationId,
                                    args.prompt,
                                ),
                            ) || "No response received from Claude.",
                    },
                ],
                isError: false,
            };
        } else if (name === GET_PREVIOUS_CLAUDE_TOOL.name) {
            if (!args.conversationId) {
                throw new Error(
                    "Conversation ID is required for get previous response operation",
                );
            }

            return {
                content: [
                    {
                        type: "text",
                        text:
                            JSON.stringify({
                                response: await getResponse(
                                    signal,
                                    args.conversationId,
                                ),
                                conversationId: args.conversationId,
                            }) || "No response received from Claude.",
                    },
                ],
                isError: false,
            };
        } else if (name === GET_CONVERSATIONS_CLAUDE_TOOL.name) {
            return {
                content: [
                    {
                        type: "text",
                        text:
                            JSON.stringify({
                                conversations: await getConversations(),
                            }) || "No response received from Claude.",
                    },
                ],
                isError: false,
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Unknown tool: ${name}`,
                },
            ],
            isError: true,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error during ${name}: ${error}`,
                },
            ],
            isError: true,
        };
    } finally {
        clearTimeout(timeoutId);
    }
}
