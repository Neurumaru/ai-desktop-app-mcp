export interface IConversationsUIPath {
    groups(): string;
    buttonOfGroup(): string;
    titleOfGroup(): string;
}

export interface ISidebarUIPathBuilder {
    newChatButton(): string;
}

export interface IConversationUIPathBuilder {
    title(): string;
    prompt(): string;
    sendButton(): string;
    stopButton(): string;
    chats(): string;
}

export interface INewChatUIPathBuilder {
    prompt(): string;
    sendButton(): string;
}