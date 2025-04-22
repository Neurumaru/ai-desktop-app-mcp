import { Status } from "./types";
import { scriptRunner } from "../common/applescript";

const CLAUDE_UI_ELEMENT = `UI element 2 of group 1 of group 1 of group 1 of group 1 of window "Claude"`;

// const CONVERSATIONS_GROUPS_FREE = `groups of list 1 of group 3 of group 1 of group 2 of group 1 of ${CLAUDE_UI_ELEMENT}`;
// const CONVERSATIONS_OTHER_GROUPS_FREE = `groups of list 1 of group 3 of group 1 of group 2 of ${CLAUDE_UI_ELEMENT}`;
const CONVERSATIONS_GROUPS_PRO = `groups of list 1 of group 4 of group 1 of group 2 of group 1 of ${CLAUDE_UI_ELEMENT}`;
const CONVERSATIONS_OTHER_GROUPS_PRO = `groups of list 1 of group 4 of group 1 of group 2 of ${CLAUDE_UI_ELEMENT}`;

const CONVERSATIONS_UI_ELEMENT = `UI element 1 of group 1`;
const CONVERSATIONS_TITLE = `value of static text 1 of ${CONVERSATIONS_UI_ELEMENT}`;

const CONVERSATION_TITLE = `value of static text 1 of group 1 of pop up button 1 of group 1 of group 3 of group 1 of ${CLAUDE_UI_ELEMENT}`;

const NEW_CHAT_BUTTON = `UI element 1 of group 1 of group 1 of group 2 of group 1 of ${CLAUDE_UI_ELEMENT}`;

const NEW_CHAT_PAGE = `group 1 of group 2 of group 3 of group 1 of ${CLAUDE_UI_ELEMENT}`;
const NEW_CHAT_PROMPT = `value of text area 1 of group 1 of group 1 of ${NEW_CHAT_PAGE}`;
const NEW_CHAT_SEND_BUTTON = `button 1 of group 4 of group 1 of group 2 of group 3 of group 1 of ${CLAUDE_UI_ELEMENT}`;

const CONVERSATION_PAGE = `group 1 of group 2 of group 3 of group 1 of ${CLAUDE_UI_ELEMENT}`;
const CONVERSATION_LAST_GROUP = `group (count of groups of ${CONVERSATION_PAGE}) of ${CONVERSATION_PAGE}`;
const CONVERSATION_PROMPT = `value of text area 1 of group 1 of group 1 of group 1 of group 1 of ${CONVERSATION_LAST_GROUP}`;
const CONVERSATION_SEND_BUTTON = `button 1 of group 4 of group 1 of group 1 of ${CONVERSATION_LAST_GROUP}`;
const CONVERSATION_STOP_BUTTON = `button 1 of group 1 of group 1 of ${CONVERSATION_LAST_GROUP}`;
const CONVERSATION_SEND_BUTTON_WHEN_OVER = `button 1 of group 4 of group 2 of group 1 of ${CONVERSATION_LAST_GROUP}`;
const CONVERSATION_STOP_BUTTON_WHEN_OVER = `button 1 of group 2 of group 1 of ${CONVERSATION_LAST_GROUP}`;
const CONVERSATION_ELEMENTS = ` entire contents of ${CONVERSATION_PAGE}`;

const EXPECTED_SEND_BUTTON_DESCRIPTION = "메시지 보내기";
const EXPECTED_MESSAGES_ROLE = "AXStaticText";

/**
 * Claude 앱을 실행시킵니다.
 * @returns Promise<boolean> - 실행 성공 시 true 반환
 */
export async function launch(): Promise<boolean> {
    try {
        await scriptRunner.runAppleScript(`
            tell application "Claude" to activate
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                end tell
            end tell
        `);
        return true;
    } catch (error) {
        throw new Error(
            "Could not activate Claude app. Please start it manually.",
        );
    }
}

/**
 * 대화를 선택합니다.
 * @param conversationId - 선택할 대화의 ID
 * @returns Promise<void> - 성공 시 비동기적으로 완료됨
 */
export async function setConversation(conversationId: string): Promise<void> {
    try {
        await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    repeat with g in ${CONVERSATIONS_GROUPS_PRO}
                        if ${CONVERSATIONS_TITLE} of g is "${conversationId}" then
                            click ${CONVERSATIONS_UI_ELEMENT} of g
                            exit repeat
                        end if
                    end repeat
                    delay 1
                end tell
            end tell
        end tell
    `);
    } catch (error) {
        throw new Error("Could not set conversation. Please try again.");
    }
}

/**
 * 현재 선택된 대화의 ID를 가져옵니다.
 * @returns Promise<string> - 대화 ID
 */
export async function getConversationId(): Promise<string> {
    try {
        const result = await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    return ${CONVERSATION_TITLE}
                end tell
            end tell
        end tell
        `);
        return result;
    } catch (error) {
        throw new Error("Could not get conversation id. Please try again.");
    }
}

/**
 * 모든 대화 ID를 가져옵니다.
 * @returns Promise<string[]> - 대화 ID 배열
 */
export async function getConversations(): Promise<string[]> {
    try {
        const result = await scriptRunner.runAppleScript(`
            tell application "Claude"
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    set conversationTitles to {}
                    
                    -- Get conversation titles
                    try
                        repeat with g in ${CONVERSATIONS_GROUPS_PRO}
                            try
                                set end of conversationTitles to ${CONVERSATIONS_TITLE} of g
                            on error
                                set end of conversationTitles to "Unknown"
                            end try
                        end repeat
                    on error
                        repeat with g in ${CONVERSATIONS_OTHER_GROUPS_PRO}
                            try
                                set end of conversationTitles to ${CONVERSATIONS_TITLE} of g
                            on error
                                set end of conversationTitles to "Unknown"
                            end try
                        end repeat
                    end try

                    -- Return conversation titles as a single string
                    set AppleScript's text item delimiters to linefeed
                    return conversationTitles as text
                end tell
            end tell
        end tell
        `);
        return result.split("\n");
    } catch (error) {
        console.error("Error getting conversations:", error);
        throw new Error("Could not get conversations. Please try again.");
    }
}

/**
 * 새로운 대화를 시작합니다.
 * @returns Promise<void> - 성공 시 비동기적으로 완료됨
 */
export async function newChat(): Promise<void> {
    try {
        await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    click ${NEW_CHAT_BUTTON}
                end tell
            end tell
        end tell
        `);
    } catch (error) {
        throw new Error("Could not new chat. Please try again.");
    }
}

/**
 * 새로운 대화 상태를 가져옵니다.
 * @returns Promise<Status> - 상태
 */
export async function getStatusNewChat(): Promise<Status> {
    try {
        const result = await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                if not (application process "Claude" exists) then
                    return "inactive"
                end if

                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    try
                        if (description of ${NEW_CHAT_SEND_BUTTON}) is "${EXPECTED_SEND_BUTTON_DESCRIPTION}" then
                            return "ready"
                        end if
                    on error
                        return "error"
                    end try
                end tell
            end tell
        end tell
        `);
        return result as Status;
    } catch (error) {
        throw new Error("Could not get status new chat. Please try again.");
    }
}

/**
 * 현재 대화 상태를 가져옵니다.
 * @returns Promise<Status> - 상태
 */
export async function getStatusConversation(): Promise<Status> {
    try {
        const result = await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                if not (application process "Claude" exists) then
                    return "inactive"
                end if

                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    try
                        if (description of ${CONVERSATION_SEND_BUTTON}) is "${EXPECTED_SEND_BUTTON_DESCRIPTION}" then
                            return "ready"
                        end if
                    end try
                    try
                        if (description of ${CONVERSATION_SEND_BUTTON_WHEN_OVER}) is "${EXPECTED_SEND_BUTTON_DESCRIPTION}" then
                            return "ready"
                        end if
                    end try
                    try
                        if (exists ${CONVERSATION_STOP_BUTTON}) then
                            return "running"
                        end if
                    end try
                    try
                        if (description of ${CONVERSATION_STOP_BUTTON_WHEN_OVER}) is "${EXPECTED_SEND_BUTTON_DESCRIPTION}" then
                            return "running"
                        end if
                    end try
                end tell
                return "error"
            end tell
        end tell
         `);
        return result as Status;
    } catch (error) {
        throw new Error("Could not get status conversation. Please try again.");
    }
}

/**
 * 새로운 대화에 메시지를 보냅니다.
 * @param prompt - 보낼 메시지
 * @returns Promise<void> - 성공 시 비동기적으로 완료됨
 */
export async function sendNewChat(prompt: string): Promise<void> {
    try {
        await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    set ${NEW_CHAT_PROMPT} to "${prompt.replace(/"/g, '\"')}"
                    click ${NEW_CHAT_SEND_BUTTON}
                end tell
            end tell
        end tell
        `);
    } catch (error) {
        throw new Error("Could not send new chat. Please try again.");
    }
}

/**
 * 현재 대화에 메시지를 보냅니다.
 * @param prompt - 보낼 메시지
 * @returns Promise<void> - 성공 시 비동기적으로 완료됨
 */
export async function sendConversation(prompt: string): Promise<void> {
    try {
        await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    set ${CONVERSATION_PROMPT} to "${prompt.replace(/"/g, '\"')}"
                    click ${CONVERSATION_SEND_BUTTON}
                end tell
            end tell
        end tell
    `);
    } catch (error) {
        throw new Error("Could not send conversation. Please try again.");
    }
}

/**
 * 현재 대화에서 응답을 가져옵니다.
 * @returns Promise<string> - 응답
 */
export async function getResponse(): Promise<string> {
    try {
        const result = await scriptRunner.runAppleScript(`
        tell application "Claude"
            tell application "System Events"
                tell process "Claude"
                    set value of attribute "AXManualAccessibility" to true
                    set allElements to ${CONVERSATION_ELEMENTS}
                    set conversationText to {}
                    repeat with e in allElements
                        try
                            if (role of e) is "${EXPECTED_MESSAGES_ROLE}" then
                                set end of conversationText to (value of e)
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
    `);
        return result;
    } catch (error) {
        throw new Error("Could not get response. Please try again.");
    }
}
