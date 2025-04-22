#!/usr/bin/env bun
/**
 * CLI 도구 메인 진입점
 * 사용법:
 * bun run runscript [command] [subcommand]
 *
 * 예시:
 * bun run runscript chatgpt status
 * bun run runscript claude get-conversations
 * bun run runscript save-clipboard
 */

import { Command } from "commander";
import { registerChatGPTCommands } from "./chatgpt";
import { registerClaudeCommands } from "./claude";
import { registerClipboardCommands } from "./clipboard";

const program = new Command();

program
    .name("runscript") // 프로그램 이름을 runscript로 변경 (bun run runscript)
    .description("CLI 도구 모음")
    .version("1.0.0");

// 각 기능별 명령어 등록
registerChatGPTCommands(program);
registerClaudeCommands(program);
registerClipboardCommands(program);

// 명령어를 찾지 못했을 때 도움말 표시
program.on("command:*", ([cmd]) => {
    // 서브 커맨드 인식 개선
    const availableCommands = program.commands.map((c) => c.name());
    console.error(`오류: 알 수 없는 명령어 '${cmd}' 입니다.`);
    console.log();
    console.log("사용 가능한 명령어 목록:");
    availableCommands.forEach((c) => console.log(`  ${c}`));
    console.log();
    console.log("도움말을 보려면 다음을 실행하세요:");
    console.log("  bun run runscript --help");
    console.log("  bun run runscript <명령어> --help"); // 서브 커맨드 도움말 안내 추가
    process.exit(1);
});

// 명령줄 인수 파싱 및 실행
async function main() {
    // 인수가 없을 경우 도움말 표시
    if (process.argv.length <= 2) {
        program.help();
    } else {
        await program.parseAsync(process.argv);
    }
}

// 직접 실행시 main 함수 호출
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error("치명적 오류:", error);
        process.exit(1);
    });
}

export { main };
