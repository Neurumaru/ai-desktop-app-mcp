import { 
    IConversationsUIPath,
    ISidebarUIPathBuilder,
    IConversationUIPathBuilder,
    INewChatUIPathBuilder,
} from "./interface";

export const PATH = `UI element 2 of group 1 of group 1 of group 1 of group 1 of window "Claude"`;
export const ALTERNATIVE_PATH = `group 1 of UI element 2 of group 1 of group 1 of group 1 of group 1 of window "Claude"`;

// Conversations
const CONVERSATIONS_GROUPS_NOPJT_SUBPATH = `groups of list 1 of group 3 of group 1 of group 2`;
const CONVERSATIONS_GROUPS_PJT_SUBPATH = `groups of list 1 of group 4 of group 1 of group 2`;
const CONVERSATIONS_BUTTON_OF_GROUP_SUBPATH = `UI element 1 of group 1`;
const CONVERSATIONS_TITLE_OF_BUTTON_SUBPATH = `value of static text 1`;

// Sidebar
const NEW_CHAT_BUTTON_SUBPATH = `UI element 1 of group 1 of group 1 of group 2`;

// New Chat
const NEW_CHAT_PAGE_SUBPATH = `group 1 of group 2 of group 3`;
const NEW_CHAT_PAGE_LIMITED_SUBPATH = `group 2 of group 2 of group 3`;
const NEW_CHAT_PROMPT_OF_PAGE_SUBPATH = `value of text area 1 of group 1 of group 1`;
const NEW_CHAT_SEND_BUTTON_OF_PAGE_SUBPATH = `button 1 of group 4`;

// Conversation
const CONVERSATION_TITLE_SUBPATH = `value of static text 1 of group 1 of pop up button 1 of group 1 of group 3`;
const CONVERSATION_PAGE_SUBPATH = `group 1 of group 2 of group 3`;
const CONVERSATION_INPUT_PAGE_OF_LAST_GROUP_SUBPATH = `group 1 of group 1`;
const CONVERSATION_INPUT_PAGE_LIMITED_OF_LAST_GROUP_SUBPATH = `group 2 of group 1`;
const CONVERSATION_PROMPT_OF_INPUT_PAGE_SUBPATH = `value of text area 1 of group 1 of group 1`;
const CONVERSATION_SEND_BUTTON_OF_INPUT_PAGE_SUBPATH = `button 1 of group 4`;
const CONVERSATION_STOP_BUTTON_OF_INPUT_PAGE_SUBPATH = `button 1`;

export class Claude {
    public readonly conversations: ClaudeConversations;
    public readonly sidebar: ClaudeSidebar;
    public readonly newChat: ClaudeNewChat;
    public readonly conversation: ClaudeConversation;

    constructor(path: string, project: boolean, is_limited: boolean) {
        this.conversations = new ClaudeConversations(path, project);
        this.sidebar = new ClaudeSidebar(path);
        this.newChat = new ClaudeNewChat(path, is_limited);
        this.conversation = new ClaudeConversation(path, is_limited);
    }
}

export class ClaudeConversations implements IConversationsUIPath {
    private readonly path: string;
    private readonly project: boolean;

    constructor(path: string, project: boolean) {
        this.path = path;
        this.project = project;
    }

    groups(): string {
        return `${this.project ? CONVERSATIONS_GROUPS_PJT_SUBPATH : CONVERSATIONS_GROUPS_NOPJT_SUBPATH} of ${this.path}`;
    }

    buttonOfGroup(): string {
        return CONVERSATIONS_BUTTON_OF_GROUP_SUBPATH;
    }

    titleOfGroup(): string {
        return `${CONVERSATIONS_TITLE_OF_BUTTON_SUBPATH} of ${this.buttonOfGroup()}`;
    }
}

export class ClaudeSidebar implements ISidebarUIPathBuilder {
    private readonly path: string;
        
    constructor(path: string) {
        this.path = path;
    }
    
    newChatButton(): string {
        return `${NEW_CHAT_BUTTON_SUBPATH} of ${this.path}`;
    }
}

export class ClaudeNewChat implements INewChatUIPathBuilder {
    private readonly path: string;
    private readonly is_limited: boolean;

    constructor(path: string, is_limited: boolean) {
        this.path = path;
        this.is_limited = is_limited;
    }

    private page(): string {
        if (this.is_limited) {
            return `${NEW_CHAT_PAGE_LIMITED_SUBPATH} of ${this.path}`;
        }
        return `${NEW_CHAT_PAGE_SUBPATH} of ${this.path}`;
    }

    prompt(): string {
        return `${NEW_CHAT_PROMPT_OF_PAGE_SUBPATH} of ${this.page()}`;
    }

    sendButton(): string {
        return `${NEW_CHAT_SEND_BUTTON_OF_PAGE_SUBPATH} of ${this.page()}`;
    }
}

export class ClaudeConversation implements IConversationUIPathBuilder {
    private readonly path: string;      
    private readonly is_limited: boolean;
    constructor(path: string, is_limited: boolean) {
        this.path = path;
        this.is_limited = is_limited;
    }

    title(): string {
        return `${CONVERSATION_TITLE_SUBPATH} of ${this.path}`;
    }
    
    private inputPage(): string {
        const page = `${CONVERSATION_PAGE_SUBPATH} of ${this.path}`;
        const count = `count of groups of ${page}`;
        const lastGroup = `group (${count}) of ${page}`;
        if (this.is_limited) {
            return `${CONVERSATION_INPUT_PAGE_LIMITED_OF_LAST_GROUP_SUBPATH} of ${lastGroup}`;
        }
        return `${CONVERSATION_INPUT_PAGE_OF_LAST_GROUP_SUBPATH} of ${lastGroup}`;
    }

    prompt(): string {
        return `${CONVERSATION_PROMPT_OF_INPUT_PAGE_SUBPATH} of ${this.inputPage()}`;
    }

    sendButton(): string {
        return `${CONVERSATION_SEND_BUTTON_OF_INPUT_PAGE_SUBPATH} of ${this.inputPage()}`;
    }

    stopButton(): string {
        return `${CONVERSATION_STOP_BUTTON_OF_INPUT_PAGE_SUBPATH} of ${this.inputPage()}`;
    }

    chats(): string {
        return `entire contents of ${CONVERSATION_PAGE_SUBPATH} of ${this.path}`;
    }
}       