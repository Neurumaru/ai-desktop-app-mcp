import { Command } from 'commander';
import { saveClipboard, restoreClipboard } from '../common/applescript';

export function registerClipboardCommands(program: Command) {
  program
    .command('save-clipboard')
    .description('현재 클립보드 내용을 가져옵니다.')
    .action(async () => {
      try {
        console.log('클립보드 내용 저장 중...');
        console.time('클립보드 저장 완료 시간');
        const content = await saveClipboard();
        console.timeEnd('클립보드 저장 완료 시간');
        console.log('✅ 클립보드 저장 성공:');
        console.log('---');
        console.log(content);
        console.log('---');
        process.exit(0);
      } catch (error) {
        console.error('클립보드 저장 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  program
    .command('restore-clipboard')
    .description('클립보드 내용을 복원합니다.')
    .requiredOption('-c, --content <text>', '복원할 클립보드 내용')
    .action(async (options) => {
      try {
        console.log('클립보드 복원 중...');
        console.time('클립보드 복원 완료 시간');
        await restoreClipboard(options.content);
        console.timeEnd('클립보드 복원 완료 시간');
        console.log('✅ 클립보드 복원에 성공했습니다.');
        process.exit(0);
      } catch (error) {
        console.error('클립보드 복원 중 오류 발생:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
} 