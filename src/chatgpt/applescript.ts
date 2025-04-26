import { Status } from "./types";
import { runAppleScript } from "run-applescript";

const PAGE = `splitter group 1 of group 1 of window "ChatGPT"`;
const PROMPT = `value of text area 1 of scroll area 3 of group 2 of ${PAGE}`;
const BUTTON_GROUP = `group 2 of ${PAGE}`;
const BUTTONS = `buttons of ${BUTTON_GROUP}`;
const ALL_ELEMENTS = `entire contents of ${PAGE}`;

const EXPECTED_VOICE_START_BUTTON = "음성 대화 시작";
const EXPECTED_VOICE_READ_BUTTON = "음성 받아쓰기";
const EXPECTED_WEB_SEARCH_BUTTON = "웹 검색하기";
const EXPECTED_SEND_BUTTON = "메시지 보내기(⏎)";
const EXPECTED_MESSAGES_ROLE = "AXStaticText";

/**
 * ChatGPT 앱을 실행시킵니다.
 * @returns Promise<boolean> - 실행 성공 시 true 반환
 */
export async function launch(): Promise<boolean> {
    try {
        await runAppleScript(`
        tell application "ChatGPT" to activate
        `);
        return true;
    } catch (error) {
        throw new Error(
            "Could not activate ChatGPT app. Please start it manually.",
        );
    }
}

/**
 * ChatGPT 앱의 상태 (inactive, ready, running, error)를 확인합니다.
 * @returns Promise<Status> - 앱의 현재 상태
 */
export async function getStatus(): Promise<Status> {
    try {
        return (await runAppleScript(`
    tell application "ChatGPT"
        tell application "System Events"
            if not (application process "ChatGPT" exists) then
                return "inactive"
            end if
        
            tell process "ChatGPT"
                if not (exists ${BUTTON_GROUP}) then
                    return "error"
                end if

                repeat with currentButton in ${BUTTONS}
                    try
                        set helpText to help of currentButton
                        if helpText is "${EXPECTED_VOICE_START_BUTTON}" then
                            return "ready"
                        else if helpText is "${EXPECTED_VOICE_READ_BUTTON}" then
                            return "ready"
                        end if
                    end try
                end repeat
                return "running"
            end tell
        end tell
    end tell
    `)) as Status;
    } catch (error) {
        throw new Error("Could not get status. Please try again.");
    }
}

/**
 * ChatGPT에 입력을 보내는 함수
 * @param prompt - 보낼 입력 문자열
 * @returns Promise<void> - 입력 성공 시 비동기적으로 완료됨
 */
export async function send(prompt: string): Promise<void> {
    try {
        await runAppleScript(`
    tell application "ChatGPT"
        tell application "System Events"
            tell process "ChatGPT"
                set ${PROMPT} to "${prompt.replace(/"/g, '\"')}"
                
                set sendButton to null
                repeat with currentButton in ${BUTTONS}
                    if help of currentButton is "${EXPECTED_SEND_BUTTON}" then
                        set sendButton to currentButton
                        exit repeat
                    end if
                end repeat
                if sendButton is not null then
                    click sendButton
                end if
            end tell
        end tell
    end tell
    `);
    } catch (error) {
        throw new Error("Could not send. Please try again.");
    }
}

/**
 * ChatGPT에서 응답을 추출하는 함수
 * @returns Promise<string> - 응답 문자열
 */
export async function getResponse(): Promise<string> {
    try {
        return await runAppleScript(`
    tell application "ChatGPT"
        tell application "System Events"
            tell process "ChatGPT"
                set allElements to ${ALL_ELEMENTS}
                set conversationTexts to {}
                repeat with element in allElements
                    try
                        if (role of element) is "${EXPECTED_MESSAGES_ROLE}" then
                            set end of conversationTexts to (description of element)
                        end if
                    end try
                end repeat
                
                if (count of conversationTexts) = 0 then
                    return "No readable text found in the ChatGPT window."
                else
                    set AppleScript's text item delimiters to linefeed
                    return conversationTexts as text
                end if
            end tell
        end tell
    end tell
  `);
    } catch (error) {
        throw new Error("Could not get response. Please try again.");
    }
}

/**
 * 웹 검색 기능을 활성화하는 함수
 * @returns Promise<void> - 활성화 성공 시 비동기적으로 완료됨
 */
export async function enableWebSearch(): Promise<void> {
    try {
        await runAppleScript(`
    tell application "ChatGPT"
        tell application "System Events"
            tell process "ChatGPT"
                -- Find web search button
                if exists ${BUTTON_GROUP} then
                    set webSearchButton to null
                    
                    -- Find web search button
                    repeat with currentButton in ${BUTTONS}
                        if help of currentButton contains "${EXPECTED_WEB_SEARCH_BUTTON}" then
                            set webSearchButton to currentButton
                            exit repeat
                        end if
                    end repeat
                
                    if webSearchButton is not null then
                        -- Check button width (30 means disabled)
                        set buttonSize to size of webSearchButton
                        set buttonWidth to item 1 of buttonSize
                        
                        -- Click only if disabled
                        if buttonWidth = 30 then
                            click webSearchButton
                            delay 0.5
                        end if
                    end if
                end if
            end tell
        end tell
    end tell
  `);
    } catch (error) {
        throw new Error("Could not enable web search. Please try again.");
    }
}
