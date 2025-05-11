export const PAGE_PATH = `splitter group 1 of group 1 of window "ChatGPT"`;

// Subpath constants following Claude's pattern
const PROMPT_SUBPATH = `value of text area 1 of scroll area 3 of group 2`;
const BUTTON_GROUP_SUBPATH = `group 2`;
const BUTTONS_SUBPATH = `buttons`;
const ALL_ELEMENTS_SUBPATH = `entire contents`;

export const EXPECTED_VOICE_START_BUTTON = "음성 대화 시작";
export const EXPECTED_VOICE_READ_BUTTON = "음성 받아쓰기";
export const EXPECTED_WEB_SEARCH_BUTTON = "웹 검색하기";
export const EXPECTED_SEND_BUTTON = "메시지 보내기(⏎)";
export const EXPECTED_MESSAGES_ROLE = "AXStaticText";

export class ChatGptUIPath {
    private readonly page: string;

    constructor() {
        this.page = PAGE_PATH;
    }

    basePage(): string {
        return this.page;
    }

    prompt(): string {
        return `${PROMPT_SUBPATH} of ${this.page}`;
    }

    buttonGroup(): string {
        return `${BUTTON_GROUP_SUBPATH} of ${this.page}`;
    }

    buttons(): string {
        return `${BUTTONS_SUBPATH} of ${this.buttonGroup()}`;
    }

    allElements(): string {
        return `${ALL_ELEMENTS_SUBPATH} of ${this.page}`;
    }
}
