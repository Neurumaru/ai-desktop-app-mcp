#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { runAppleScript } from 'run-applescript';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import * as os from 'os';

// 락 파일 경로 설정
const LOCK_FILE_PATH = path.join(os.tmpdir(), 'chatgpt-mcp-lock');
const LOCK_TIMEOUT_MS = 120 * 1000; // 120초

// 락 획득 함수
async function acquireLock(): Promise<boolean> {
  try {
    // 락 파일이 존재하는지 확인
    if (existsSync(LOCK_FILE_PATH)) {
      // 락 파일이 존재하면 생성 시간 확인
      const stats = await fs.stat(LOCK_FILE_PATH);
      const lockAge = Date.now() - stats.mtimeMs;
      
      // 락이 타임아웃 시간보다 오래됐으면 강제로 해제
      if (lockAge > LOCK_TIMEOUT_MS) {
        console.log(`락 파일이 ${lockAge}ms 동안 유지되어 강제로 해제합니다.`);
        await releaseLock();
      } else {
        // 아직 유효한 락이 있으므로 획득 실패
        return false;
      }
    }
    
    // 락 파일 생성
    await fs.writeFile(LOCK_FILE_PATH, String(process.pid), 'utf-8');
    return true;
  } catch (error) {
    console.error('락 획득 실패:', error);
    return false;
  }
}

// 락 해제 함수
async function releaseLock(): Promise<void> {
  try {
    // 락 파일이 존재하는지 확인
    if (existsSync(LOCK_FILE_PATH)) {
      await fs.unlink(LOCK_FILE_PATH);
    }
  } catch (error) {
    console.error('락 해제 실패:', error);
  }
}

// Define the ChatGPT tool
const CHATGPT_TOOL: Tool = {
  name: "chatgpt",
  description: "Interact with the ChatGPT desktop app on macOS",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        description: "Operation to perform: 'ask'",
        enum: ["ask"]
      },
      prompt: {
        type: "string",
        description: "The prompt to send to ChatGPT (required for ask operation)"
      },
      conversation_id: {
        type: "string",
        description: "Optional conversation ID to continue a specific conversation"
      }
    },
    required: ["operation"]
  }
};

const server = new Server(
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

// Check if ChatGPT app is installed and running
async function checkChatGPTAccess(): Promise<boolean> {
  try {
    const isRunning = await runAppleScript(`
      tell application "System Events"
        return application process "ChatGPT" exists
      end tell
    `);

    if (isRunning !== "true") {
      console.log("ChatGPT app is not running, attempting to launch...");
      try {
        await runAppleScript(`
          tell application "ChatGPT" to activate
          delay 2
        `);
      } catch (activateError) {
        console.error("Error activating ChatGPT app:", activateError);
        throw new Error("Could not activate ChatGPT app. Please start it manually.");
      }
    }
    
    return true;
  } catch (error) {
    console.error("ChatGPT access check failed:", error);
    throw new Error(
      `Cannot access ChatGPT app. Please make sure ChatGPT is installed and properly configured. Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Function to send a prompt to ChatGPT
async function askChatGPT(prompt: string, conversationId?: string): Promise<string> {
  // 락 획득 시도
  if (!(await acquireLock())) {
    throw new Error("다른 프로세스가 ChatGPT에 접근 중입니다. 잠시 후 다시 시도해주세요.");
  }
  
  try {
    await checkChatGPTAccess();
    
    const saveClipboardScript = `
      set originalClipboard to the clipboard
      return originalClipboard
    `;
    const originalClipboard = await runAppleScript(saveClipboardScript);
    const escapedOriginalClipboard = originalClipboard.replace(/"/g, '\\"');
    
    const inputScript = `
      tell application "ChatGPT"
        activate
        delay 1
        tell application "System Events"
          -- Select the ChatGPT window
          tell process "ChatGPT"
            ${conversationId ? `
              try
                click button "${conversationId}" of group 1 of group 1 of window 1
                delay 1
              end try
            ` : ''}
            delay 0.2
            
            -- Select all text in the input field and delete it
            key code 0 using {command down}
            delay 0.2
            key code 51
            delay 0.2
            
            -- Copy the prompt to the clipboard
            set the clipboard to "${prompt.replace(/"/g, '\\"')}"
            delay 0.2

            -- Paste clipboard content and press Enter to send the message
            key code 9 using {command down}
            delay 0.2
            key code 36
          end tell
        end tell
      end tell
    `;
    
    const extractTextScript = `
      tell application "ChatGPT"
        tell application "System Events"
          tell process "ChatGPT"
            -- Extract text from the ChatGPT window
            set frontWin to front window
            set allUIElements to entire contents of frontWin
            set conversationText to {}
            repeat with e in allUIElements
              try
                if (role of e) is "AXStaticText" then
                  set end of conversationText to (description of e)
                end if
              end try
            end repeat
            
            -- If no readable text is found, return an error message
            if (count of conversationText) = 0 then
              return "No readable text found in the ChatGPT window."
            else
              set AppleScript's text item delimiters to linefeed
              return conversationText as text
            end if
          end tell
        end tell
      end tell
    `;
    
    await runAppleScript(inputScript);
    
    let lastResponse = "";
    let currentResponse = "";
    let unchanged = 0;
    const maxTime = 120; 
    const interval = 15; 
    const maxIterations = Math.floor(maxTime / interval);
    
    for (let i = 0; i < maxIterations; i++) {
      currentResponse = await runAppleScript(extractTextScript);
      
      if (currentResponse === lastResponse) {
        unchanged++;
        if (unchanged >= 2 && i >= 1) {
          break;
        }
      } else {
        unchanged = 0;
        lastResponse = currentResponse;
      }
      
      if (i < maxIterations - 1) {
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      }
    }
    
    await runAppleScript(`set the clipboard to "${escapedOriginalClipboard}"`);
    
    return currentResponse;
  } catch (error) {
    throw new Error(
      `Failed to get response from ChatGPT: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    // 작업 완료 후 락 해제
    await releaseLock();
  }
}

function isChatGPTArgs(args: unknown): args is {
  operation: "ask";
  prompt?: string;
  conversation_id?: string;
} {
  if (typeof args !== "object" || args === null) return false;
  
  const { operation, prompt, conversation_id } = args as any;
  
  if (!operation || !["ask"].includes(operation)) {
    return false;
  }
  
  // Validate required fields based on operation
  if (operation === "ask" && !prompt) return false;
  
  // Validate field types if present
  if (prompt && typeof prompt !== "string") return false;
  if (conversation_id && typeof conversation_id !== "string") return false;
  
  return true;
}

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

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ChatGPT MCP Server running on stdio");