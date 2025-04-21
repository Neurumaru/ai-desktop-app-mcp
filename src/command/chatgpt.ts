import { Command } from 'commander';
import {
    getStatus as getChatGPTStatus,
    send as sendChatGPT,
    getResponse as getChatGPTResponse,
    enableWebSearch as enableChatGPTWebSearch,
    launch as launchChatGPT,
} from '../chatgpt/applescript';
import { 
    ask as ask, 
    getResponse as getResponseService } from '../chatgpt/service';

export function registerChatGPTCommands(program: Command) {
    const chatgptCommand = program
        .command('chatgpt')
        .description('ChatGPT 관련 명령어');

    const scriptCommand = chatgptCommand
        .command('script')
        .description('스크립트 관련 명령어');

    const serviceCommand = chatgptCommand
        .command('service')
        .description('서비스 관련 명령어');

    scriptCommand
        .command('status')
        .description('ChatGPT 앱의 실행 상태를 확인합니다.')
        .action(async () => {
            try {
                console.log('ChatGPT 앱 상태 확인 중...');
                console.time('상태 확인 완료 시간');
                const status = await getChatGPTStatus();
                console.timeEnd('상태 확인 완료 시간');

                if (status === 'inactive') {
                    console.log('❌ ChatGPT 앱이 실행되고 있지 않습니다.');
                    process.exit(1);
                } else if (status === 'error') {
                    console.log('❌ ChatGPT 앱이 오류 상태입니다.');
                    process.exit(1);
                } else if (status === 'running') {
                    console.log('✅ ChatGPT 채팅이 실행 중입니다.');
                    process.exit(0);
                } else if (status === 'ready') {
                    console.log('✅ ChatGPT 채팅이 준비되었습니다.');
                    process.exit(0);
                } else {
                    console.log('❌ 알 수 없는 상태입니다.');
                    process.exit(1);
                }
            } catch (error) {
                console.error('상태 확인 중 오류 발생:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    scriptCommand
        .command('launch')
        .description('ChatGPT 앱을 실행시킵니다.')
        .action(async () => {
            try {
                console.log('ChatGPT 앱 실행 시도 중...');
                console.time('실행 시도 완료 시간');
                await launchChatGPT();
                console.timeEnd('실행 시도 완료 시간');
                console.log('✅ ChatGPT 앱 실행에 성공했습니다.');
                process.exit(0);
            } catch (error) {
                console.error('ChatGPT 앱 실행 중 오류 발생:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    scriptCommand
        .command('send')
        .description('ChatGPT에 입력을 전송합니다.')
        .requiredOption('-p, --prompt <text>', '전송할 텍스트')
        .action(async (options) => {
            try {
                console.log(`'${options.prompt}' 입력 전송 중...`);
                console.time('입력 전송 완료 시간');
                await sendChatGPT(options.prompt);
                console.timeEnd('입력 전송 완료 시간');
                console.log('✅ 입력 전송에 성공했습니다.');
                process.exit(0);
            } catch (error) {
                console.error('입력 전송 중 오류 발생:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    scriptCommand
        .command('get-response')
        .description('ChatGPT에서 응답을 추출합니다.')
        .action(async () => {
            try {
                console.log('ChatGPT 응답 추출 중...');
                console.time('응답 추출 완료 시간');
                const response = await getChatGPTResponse();
                console.timeEnd('응답 추출 완료 시간');
                console.log('✅ 응답 추출 성공:');
                console.log('---');
                console.log(response);
                console.log('---');
                process.exit(0);
            } catch (error) {
                console.error('응답 추출 중 오류 발생:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    scriptCommand
        .command('enable-web-search')
        .description('ChatGPT의 웹 검색 기능을 활성화합니다.')
        .action(async () => {
            try {
                console.log('웹 검색 기능 활성화 중...');
                console.time('웹 검색 활성화 완료 시간');
                await enableChatGPTWebSearch();
                console.timeEnd('웹 검색 활성화 완료 시간');
                console.log('✅ 웹 검색 기능 활성화에 성공했습니다.');
                process.exit(0);
            } catch (error) {
                console.error('웹 검색 활성화 중 오류 발생:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    serviceCommand
        .command('ask')
        .description('ChatGPT에 질문을 전송합니다.')
        .requiredOption('-p, --prompt <text>', '전송할 텍스트')
        .action(async (options) => {
            try {
                const signal = AbortSignal.timeout(300000);
                signal.addEventListener('abort', () => {
                    console.log('Timeout: 300초 초과');
                    process.exit(1);
                });
                console.log(`'${options.prompt}' 입력 전송 중...`);
                const response = await ask(signal, options.prompt);
                console.log('✅ 입력 전송에 성공했습니다.');
                console.log(response);
                process.exit(0);
            } catch (error) {
                console.error('입력 전송 중 오류 발생:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });

    serviceCommand
        .command('get-previous-response')
        .description('ChatGPT에서 이전 응답을 추출합니다.')
        .action(async () => {
            try {
                const signal = AbortSignal.timeout(300000);
                signal.addEventListener('abort', () => {
                    console.log('Timeout: 300초 초과');
                    process.exit(1);
                });
                const response = await getResponseService(signal);
                console.log('✅ 이전 응답 추출에 성공했습니다.');
                console.log(response);
                process.exit(0);
            } catch (error) {
                console.error('이전 응답 추출 중 오류 발생:', error instanceof Error ? error.message : String(error));
                process.exit(1);
            }
        });
}