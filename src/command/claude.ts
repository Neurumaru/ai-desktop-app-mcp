import { Command } from 'commander';
import {
  launch as claudeLaunch,
  setConversation as claudeSetConversation,
  getConversationId as claudeGetCurrentConversationId,
  getConversations as claudeGetConversations,
  newChat as claudeNewChat,
  getStatusNewChat as claudeGetStatusNewChat,
  getStatusConversation as claudeGetStatusConversation,
  sendNewChat as claudeSendNewChat,
  sendConversation as claudeSendConversation,
  getResponse as claudeGetResponse,
} from '../claude/applescript';

export function registerClaudeCommands(program: Command) {
  const claudeCommand = program
    .command('claude')
    .description('Claude 관련 명령어');

  claudeCommand
    .command('get-conversations')
    .description('Claude의 대화 목록을 가져옵니다.')
    .action(async () => {
      try {
        console.log('Claude 대화 목록 가져오기 중...');
        const conversations = await claudeGetConversations();
        console.log('✅ Claude 대화 목록 가져오기 성공:');
        console.log('---');
        console.log(conversations.join('\n'));
        console.log('---');
        process.exit(0);
      } catch (error) {
        console.error('❌ Claude 대화 목록 가져오기 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('launch')
    .description('Claude 앱을 실행합니다.')
    .action(async () => {
      try {
        console.log('Claude 앱 실행 중...');
        const success = await claudeLaunch();
        if (success) {
          console.log('✅ Claude 앱 실행 성공.');
        } else {
          console.log('⚠️ Claude 앱 실행 완료 (결과 불확실).');
        }
        process.exit(0);
      } catch (error) {
        console.error('❌ Claude 앱 실행 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('set-conversation <id>')
    .description('지정된 ID의 대화로 전환합니다.')
    .action(async (id: string) => {
      try {
        console.log(`'${id}' 대화로 전환 중...`);
        await claudeSetConversation(id);
        console.log(`✅ '${id}' 대화로 전환 성공.`);
        process.exit(0);
      } catch (error) {
        console.error(`❌ '${id}' 대화로 전환 중 오류 발생:`, error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('get-current-conversation-id')
    .description('현재 활성화된 대화의 ID를 가져옵니다.')
    .action(async () => {
      try {
        console.log('현재 대화 ID 가져오기 중...');
        const conversationId = await claudeGetCurrentConversationId();
        console.log('✅ 현재 대화 ID:', conversationId);
        process.exit(0);
      } catch (error) {
        console.error('❌ 현재 대화 ID 가져오기 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('new-chat')
    .description('새 대화를 시작합니다.')
    .action(async () => {
      try {
        console.log('새 대화 시작 중...');
        await claudeNewChat();
        console.log('✅ 새 대화 시작 성공.');
        process.exit(0);
      } catch (error) {
        console.error('❌ 새 대화 시작 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('get-status-new-chat')
    .description('현재 Claude의 상태 (ready/running/error)를 가져옵니다.')
    .action(async () => {
      try {
        console.log('Claude 상태 확인 중...');
        const status = await claudeGetStatusNewChat();
        console.log('✅ Claude 상태:', status);
        process.exit(0);
      } catch (error) {
        console.error('❌ Claude 상태 확인 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('get-status-conversation')
    .description('현재 Claude의 상태 (ready/running/error)를 가져옵니다.')
    .action(async () => {
      try {
        console.log('Claude 상태 확인 중...');
        const status = await claudeGetStatusConversation();
        console.log('✅ Claude 상태:', status);
        process.exit(0);
      } catch (error) {
        console.error('❌ Claude 상태 확인 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('send-new-chat <prompt>')
    .description('현재 상태(새 대화 또는 기존 대화)에 맞춰 메시지를 전송합니다.')
    .action(async (prompt: string) => {
      try {
        console.log(`메시지 전송 중: "${prompt}"`);
        await claudeSendNewChat(prompt);
        console.log('✅ 메시지 전송 성공.');
        process.exit(0);
      } catch (error) {
        console.error('❌ 메시지 전송 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('send-conversation <prompt>')
    .description('현재 대화에 메시지를 전송합니다.')
    .action(async (prompt: string) => {
      try {
        console.log(`메시지 전송 중: "${prompt}"`);
        await claudeSendConversation(prompt);
        console.log('✅ 메시지 전송 성공.');
        process.exit(0);
      } catch (error) {
        console.error('❌ 메시지 전송 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  claudeCommand
    .command('get-response')
    .description('현재 대화의 마지막 응답 텍스트를 가져옵니다.')
    .action(async () => {
      try {
        console.log('응답 가져오기 중...');
        const response = await claudeGetResponse();
        console.log('✅ 응답 가져오기 성공:');
        console.log('---');
        console.log(response);
        console.log('---');
        process.exit(0);
      } catch (error) {
        console.error('❌ 응답 가져오기 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
} 