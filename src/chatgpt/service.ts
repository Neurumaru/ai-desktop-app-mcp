import { getStatus, send, getResponse as getResponseAS, enableWebSearch, launch } from './applescript';
import { saveClipboard, restoreClipboard } from '../common/applescript';
import { cancellableDelay } from '../common/utils';

const LAUNCH_DELAY = 2000;
const CHECK_INTERVAL = 1000;

export async function askChatGPT(prompt: string, signal: AbortSignal): Promise<string> {
  let status = await getStatus();
  if (status === 'inactive') {
    await launch();
    await cancellableDelay(LAUNCH_DELAY, 'Timeout: Waiting for ChatGPT to be ready', signal);
    status = await getStatus();
  }
  if (status === 'inactive' || status === 'error') {
    throw new Error('ChatGPT is not running.');
  }
  while (status === 'running') {
    if (signal.aborted) throw new Error('Timeout: Waiting for ChatGPT to be ready');
    await cancellableDelay(CHECK_INTERVAL, 'Timeout: Waiting for ChatGPT to be ready', signal);
    status = await getStatus();
  }
      
  await enableWebSearch();
  
  await send(prompt);
  return await getResponse(signal);
}

export async function getResponse(signal: AbortSignal): Promise<string> {
  let lastError: unknown = null;

  while (!signal.aborted) { 
    try {
      const status = await getStatus(); 
      if (status === 'running') {
        continue;
      } else if (status === 'error') {
        throw new Error(`ChatGPT is in an error`);
      } else if (status === 'inactive') {
        throw new Error(`ChatGPT is not running`);
      }
      return await getResponseAS();
    } catch (error) {
      lastError = error;
    }
    await cancellableDelay(CHECK_INTERVAL, 'Timeout: Waiting for ChatGPT to be ready', signal);
  }
  throw new Error('Timeout: Waiting for ChatGPT to be ready: ' + lastError);
} 