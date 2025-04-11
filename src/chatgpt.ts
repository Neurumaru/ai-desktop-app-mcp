import { checkChatGPTAccess, sendInputToChatGPT, extractResponseFromChatGPT, saveClipboard, restoreClipboard, getChatGPTStatus, enableWebSearch } from './applescript';
import { acquireLock, releaseLock } from './lock';

const WAIT_TIMEOUT = 120 * 1000; // 120 seconds
const CHECK_INTERVAL = 1000; // 1 second

export async function askChatGPT(prompt: string): Promise<string> {
  if (!(await acquireLock())) {
    throw new Error("Another process is accessing ChatGPT. Please try again later.");
  }
  
  try {
    await checkChatGPTAccess();
    
    // Check ChatGPT status
    const initialStatus = await getChatGPTStatus();
    if (initialStatus === 'error') {
      throw new Error("Cannot check ChatGPT status.");
    }
    if (initialStatus === 'thinking') {
      throw new Error("ChatGPT is still processing the previous response. Please try again later.");
    }
    
    // Enable web search
    await enableWebSearch();
    
    const originalClipboard = await saveClipboard();
    
    await sendInputToChatGPT(prompt);
    
    // Wait for response
    const startTime = Date.now();
    let response = "";
    
    while (Date.now() - startTime < WAIT_TIMEOUT) {
      const status = await getChatGPTStatus();
      
      if (status === 'error') {
        throw new Error("Cannot check ChatGPT status.");
      }
      
      if (status === 'ready') {
        response = await extractResponseFromChatGPT();
        break;
      }
      
      // Wait if thinking
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
    
    if (!response) {
      throw new Error("Response timeout exceeded.");
    }
    
    await restoreClipboard(originalClipboard);
    
    return response;
  } catch (error) {
    throw new Error(
      `Failed to get response from ChatGPT: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    await releaseLock();
  }
}

export async function getChat(): Promise<string> {
  const startTime = Date.now();
  let response = "";
  
  while (Date.now() - startTime < WAIT_TIMEOUT) {
    const status = await getChatGPTStatus();
    
    if (status === 'error') {
      throw new Error("Cannot check ChatGPT status.");
    }
    
    if (status === 'ready') {
      response = await extractResponseFromChatGPT();
      break;
    }
    
    // Wait if thinking
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  if (!response) {
    throw new Error("Response timeout exceeded.");
  }
  
  return response;
} 