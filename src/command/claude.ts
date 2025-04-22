import { Command } from "commander";
import {
    launch as launchScript,
    setConversation as setConversationScript,
    getConversationId as getConversationIdScript,
    getConversations as getConversationsScript,
    newChat as newChatScript,
    getStatusNewChat as getStatusNewChatScript,
    getStatusConversation as getStatusConversationScript,
    sendNewChat as sendNewChatScript,
    sendConversation as sendConversationScript,
    getResponse as getResponseScript,
} from "../claude/applescript";
import {
    ask as askService,
    getResponse as getResponseService,
    getConversations as getConversationsService,
} from "../claude/service";

export function registerClaudeCommands(program: Command) {
    const claudeCommand = program
        .command("claude")
        .description("Claude 관련 명령어");

    const scriptCommand = claudeCommand
        .command("script")
        .description("스크립트 관련 명령어");

    const serviceCommand = claudeCommand
        .command("service")
        .description("서비스 관련 명령어");

    scriptCommand
        .command("get-conversations")
        .description("Claude의 대화 목록을 가져옵니다.")
        .action(async () => {
            try {
                console.log("Claude 대화 목록 가져오기 중...");
                const conversations = await getConversationsScript();
                console.log("✅ Claude 대화 목록 가져오기 성공:");
                console.log("---");
                console.log(conversations.join("\n"));
                console.log("---");
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ Claude 대화 목록 가져오기 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("launch")
        .description("Claude 앱을 실행합니다.")
        .action(async () => {
            try {
                console.log("Claude 앱 실행 중...");
                const success = await launchScript();
                if (success) {
                    console.log("✅ Claude 앱 실행 성공.");
                } else {
                    console.log("⚠️ Claude 앱 실행 완료 (결과 불확실).");
                }
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ Claude 앱 실행 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("set-conversation <id>")
        .description("지정된 ID의 대화로 전환합니다.")
        .action(async (id: string) => {
            try {
                console.log(`'${id}' 대화로 전환 중...`);
                await setConversationScript(id);
                console.log(`✅ '${id}' 대화로 전환 성공.`);
                process.exit(0);
            } catch (error) {
                console.error(
                    `❌ '${id}' 대화로 전환 중 오류 발생:`,
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("get-current-conversation-id")
        .description("현재 활성화된 대화의 ID를 가져옵니다.")
        .action(async () => {
            try {
                console.log("현재 대화 ID 가져오기 중...");
                const conversationId = await getConversationIdScript();
                console.log("✅ 현재 대화 ID:", conversationId);
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 현재 대화 ID 가져오기 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("new-chat")
        .description("새 대화를 시작합니다.")
        .action(async () => {
            try {
                console.log("새 대화 시작 중...");
                await newChatScript();
                console.log("✅ 새 대화 시작 성공.");
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 새 대화 시작 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("get-status-new-chat")
        .description("현재 Claude의 상태 (ready/running/error)를 가져옵니다.")
        .action(async () => {
            try {
                console.log("Claude 상태 확인 중...");
                const status = await getStatusNewChatScript();
                console.log("✅ Claude 상태:", status);
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ Claude 상태 확인 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("get-status-conversation")
        .description("현재 Claude의 상태 (ready/running/error)를 가져옵니다.")
        .action(async () => {
            try {
                console.log("Claude 상태 확인 중...");
                const status = await getStatusConversationScript();
                console.log("✅ Claude 상태:", status);
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ Claude 상태 확인 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("send-new-chat <prompt>")
        .description(
            "현재 상태(새 대화 또는 기존 대화)에 맞춰 메시지를 전송합니다.",
        )
        .action(async (prompt: string) => {
            try {
                console.log(`메시지 전송 중: "${prompt}"`);
                await sendNewChatScript(prompt);
                console.log("✅ 메시지 전송 성공.");
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 메시지 전송 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("send-conversation <prompt>")
        .description("현재 대화에 메시지를 전송합니다.")
        .action(async (prompt: string) => {
            try {
                console.log(`메시지 전송 중: "${prompt}"`);
                await sendConversationScript(prompt);
                console.log("✅ 메시지 전송 성공.");
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 메시지 전송 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    scriptCommand
        .command("get-response")
        .description("현재 대화의 마지막 응답 텍스트를 가져옵니다.")
        .action(async () => {
            try {
                console.log("응답 가져오기 중...");
                const response = await getResponseScript();
                console.log("✅ 응답 가져오기 성공:");
                console.log("---");
                console.log(response);
                console.log("---");
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 응답 가져오기 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    serviceCommand
        .command("ask")
        .description("Claude에 질문을 전송합니다.")
        .requiredOption("-p, --prompt <text>", "전송할 텍스트")
        .option("-c, --conversation <id>", "대화 ID")
        .action(async (options) => {
            try {
                const signal = AbortSignal.timeout(300000);
                signal.addEventListener("abort", () => {
                    console.log("Timeout: 300초 초과");
                    process.exit(1);
                });
                console.log(`'${options.prompt}' 입력 전송 중...`);
                const response = await askService(
                    signal,
                    options.conversation,
                    options.prompt,
                );
                console.log("✅ 입력 전송에 성공했습니다.");
                console.log(response);
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 질문 전송 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    serviceCommand
        .command("get-conversations")
        .description("Claude의 대화 목록을 가져옵니다.")
        .action(async () => {
            try {
                const conversations = await getConversationsService();
                console.log(conversations);
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 대화 목록 가져오기 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });

    serviceCommand
        .command("get-response")
        .description("Claude의 응답을 가져옵니다.")
        .requiredOption("-c, --conversation <id>", "대화 ID")
        .action(async (options) => {
            try {
                const signal = AbortSignal.timeout(300000);
                signal.addEventListener("abort", () => {
                    console.log("Timeout: 300초 초과");
                    process.exit(1);
                });
                const response = await getResponseService(
                    signal,
                    options.conversation,
                );
                console.log(response);
                process.exit(0);
            } catch (error) {
                console.error(
                    "❌ 응답 가져오기 중 오류 발생:",
                    error instanceof Error ? error.message : String(error),
                );
                process.exit(1);
            }
        });
}
