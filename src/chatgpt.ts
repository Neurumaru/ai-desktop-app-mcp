import { checkChatGPTAccess, sendInputToChatGPT, extractResponseFromChatGPT, saveClipboard, restoreClipboard, getChatGPTStatus, enableWebSearch } from './applescript';
import { acquireLock, releaseLock } from './lock';

const WAIT_TIMEOUT = 120 * 1000; // 120 seconds
const CHECK_INTERVAL = 1000; // 1 second

export async function askChatGPT(prompt: string): Promise<string> {
  if (!(await acquireLock())) {
    throw new Error("Another process is accessing ChatGPT. Please try again later.");
  }
  
  let originalClipboard = "";
  
  try {
    // Initial setup
    try {
      await checkChatGPTAccess();
      
      // Check ChatGPT status
      const initialStatus = await getChatGPTStatus();
      if (initialStatus === 'thinking') {
        console.warn("ChatGPT is processing a previous response, but will continue trying.");
      }
      
      // Enable web search
      await enableWebSearch();
      
      originalClipboard = await saveClipboard();
      
      await sendInputToChatGPT(prompt);
    } catch (setupError) {
      console.error("Setup error:", setupError);
      console.warn("Continuing despite setup error...");
    }
    
    // Wait for response
    const startTime = Date.now();
    let response = "";
    let lastError: unknown = null;
    
    while (Date.now() - startTime < WAIT_TIMEOUT) {
      try {
        const status = await getChatGPTStatus();
        
        if (status === 'ready') {
          response = await extractResponseFromChatGPT();
          if (response) break;
        }
      } catch (loopError) {
        lastError = loopError;
        console.error("Error while checking status:", loopError);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
    
    if (!response) {
      throw new Error(lastError 
        ? `Response timeout exceeded. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
        : "Response timeout exceeded.");
    }
    
    if (originalClipboard) {
      try {
        await restoreClipboard(originalClipboard);
      } catch (clipboardError) {
        console.error("Error restoring clipboard:", clipboardError);
      }
    }
    
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
  let lastError: unknown = null;
  
  while (Date.now() - startTime < WAIT_TIMEOUT) {
    try {
      const status = await getChatGPTStatus();
      
      if (status === 'ready') {
        response = await extractResponseFromChatGPT();
        if (response) break;
      }
    } catch (error) {
      lastError = error;
      console.error("Error while checking status:", error);
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  if (!response) {
    throw new Error(lastError 
      ? `Response timeout exceeded. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
      : "Response timeout exceeded.");
  }
  
  return response;
} 