import { runAppleScript } from 'run-applescript';

export async function checkChatGPTAccess(): Promise<boolean> {
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

export async function sendInputToChatGPT(prompt: string): Promise<void> {
  const inputScript = `
    tell application "ChatGPT"
      tell application "System Events"
        tell process "ChatGPT"
          try
            -- Find and set text area
            set textArea to text area 1 of scroll area 3 of group 2 of splitter group 1 of group 1 of window "ChatGPT"
            set value of textArea to "${prompt.replace(/"/g, '\\"')}"
            
            -- Find and click send message button
            set targetGroup to group 2 of splitter group 1 of group 1 of window "ChatGPT"
            set allButtons to buttons of targetGroup
            set sendButton to null
            
            repeat with currentButton in allButtons
              if help of currentButton is "메시지 보내기(⏎)" then
                set sendButton to currentButton
                exit repeat
              end if
            end repeat
            
            if sendButton is not null then
              click sendButton
            end if
          end try
        end tell
      end tell
    end tell
  `;
  
  await runAppleScript(inputScript);
}

export async function extractResponseFromChatGPT(): Promise<string> {
  const extractTextScript = `
    tell application "ChatGPT"
      tell application "System Events"
        tell process "ChatGPT"
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
  
  return await runAppleScript(extractTextScript);
}

export async function saveClipboard(): Promise<string> {
  const saveClipboardScript = `
    set originalClipboard to the clipboard
    return originalClipboard
  `;
  return await runAppleScript(saveClipboardScript);
}

export async function restoreClipboard(content: string): Promise<void> {
  const escapedContent = content.replace(/"/g, '\\"');
  await runAppleScript(`set the clipboard to "${escapedContent}"`);
}

export async function getChatGPTStatus(): Promise<'ready' | 'thinking' | 'error'> {
  const statusScript = `
    tell application "ChatGPT"
      tell application "System Events"
        tell process "ChatGPT"
          try
            -- Check if group 2 exists
            if exists group 2 of splitter group 1 of group 1 of window "ChatGPT" then
              set targetGroup to group 2 of splitter group 1 of group 1 of window "ChatGPT"
              set allButtons to buttons of targetGroup
              set foundReadyButton to false
              
              -- Check all buttons
              repeat with currentButton in allButtons
                try
                  -- Check button's help property
                  set buttonHelp to help of currentButton
                  -- If help property is "음성 대화 시작", "음성 받아쓰기", or "메시지 보내기(⏎)", then ready
                  if buttonHelp is "음성 대화 시작" or buttonHelp is "음성 받아쓰기" or buttonHelp is "메시지 보내기(⏎)" then
                    set foundReadyButton to true
                    exit repeat
                  end if
                end try
              end repeat
              
              if foundReadyButton then
                return "ready"
              else
                return "thinking"
              end if
            else
              return "error"
            end if
          on error errMsg
            return "error"
          end try
        end tell
      end tell
    end tell
  `;
  
  try {
    const status = await runAppleScript(statusScript);
    return status as 'ready' | 'thinking' | 'error';
  } catch (error) {
    console.error("Failed to check ChatGPT status:", error);
    return 'error';
  }
}

export async function enableWebSearch(): Promise<void> {
  const enableWebSearchScript = `
    tell application "ChatGPT"
      tell application "System Events"
        tell process "ChatGPT"
          try
            -- Find web search button
            if exists group 2 of splitter group 1 of group 1 of window "ChatGPT" then
              set targetGroup to group 2 of splitter group 1 of group 1 of window "ChatGPT"
              set allButtons to buttons of targetGroup
              set webSearchButton to null
              
              -- Find web search button
              repeat with currentButton in allButtons
                if help of currentButton contains "웹 검색하기" then
                  set webSearchButton to currentButton
                  exit repeat
                end if
              end repeat
              
              if webSearchButton is not null then
                -- Check button width (30 means disabled)
                set buttonSize to size of webSearchButton
                set buttonWidth to item 1 of buttonSize
                
                if buttonWidth = 30 then
                  -- Click only if disabled
                  click webSearchButton
                  delay 0.5
                end if
              end if
            end if
          end try
        end tell
      end tell
    end tell
  `;
  
  await runAppleScript(enableWebSearchScript);
} 