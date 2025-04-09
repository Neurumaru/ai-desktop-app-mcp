import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as os from 'os';
import * as path from 'path';

const LOCK_FILE_PATH = path.join(os.tmpdir(), 'chatgpt-mcp-lock');
const LOCK_TIMEOUT_MS = 120 * 1000; // 120 seconds

export async function acquireLock(): Promise<boolean> {
  try {
    if (existsSync(LOCK_FILE_PATH)) {
      const stats = await fs.stat(LOCK_FILE_PATH);
      const lockAge = Date.now() - stats.mtimeMs;
      
      if (lockAge > LOCK_TIMEOUT_MS) {
        console.log(`Lock file has been held for ${lockAge}ms, forcing release.`);
        await releaseLock();
      } else {
        return false;
      }
    }
    
    await fs.writeFile(LOCK_FILE_PATH, String(process.pid), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to acquire lock:', error);
    return false;
  }
}

export async function releaseLock(): Promise<void> {
  try {
    if (existsSync(LOCK_FILE_PATH)) {
      await fs.unlink(LOCK_FILE_PATH);
    }
  } catch (error) {
    console.error('Failed to release lock:', error);
  }
} 