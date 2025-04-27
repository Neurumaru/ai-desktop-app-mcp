import { PATH, ALTERNATIVE_PATH, Claude as ClaudeUIPath } from "./path";
import type { Status } from "../types";
import { AppleScript } from "../../common/applescript";

export class ClaudeScript {
    private script: AppleScript;
    private ui: ClaudeUIPath[];

    constructor() {
        this.script = new AppleScript("Claude");
        this.ui = [
            [true, false],
            [true, true],
            [false, false],
            [false, true],
        ].flatMap(([project, isLimited]) => [
            new ClaudeUIPath(PATH, project, isLimited),
            new ClaudeUIPath(ALTERNATIVE_PATH, project, isLimited),
        ]);
    }

    async launch(): Promise<void> {
        await this.script.launch();
        await this.script.enableAccessibility();
    }

    async newChat(): Promise<void> {
        let lastError: any;
        for (const ui of this.ui) {
            try {
                await this.script.enableAccessibility();
                await this.script.click(ui.sidebar.newChatButton());
                return;
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    async setConversation(conversationId: string): Promise<void> {
        let lastError: any;
        for (const ui of this.ui) {
            try {
                await this.script.enableAccessibility();
                const titles = await this.script.queryAll(
                    `${ui.conversations.titleOfGroup()} of current`,
                    ui.conversations.groups(),
                    "true",
                );
                const idx = titles.findIndex((t) => t === conversationId);
                if (idx < 0) throw new Error(`Conversation '${conversationId}' not found`);
                await this.script.click(
                    `${ui.conversations.buttonOfGroup()} of item ${idx + 1} of ${ui.conversations.groups()}`,
                );
                return;
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    async getConversationId(): Promise<string> {
        let lastError: any;
        for (const ui of this.ui) {
            try {;
                await this.script.enableAccessibility();
                return await this.script.fetch(ui.conversation.title());
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    async getConversations(): Promise<string[]> {
        let lastError: any;
        for (const ui of this.ui) {
            try {
                await this.script.enableAccessibility();
                const titles = await this.script.queryAll(
                    `${ui.conversations.titleOfGroup()} of current`, 
                    ui.conversations.groups(), 
                    `true`
                );
                if (titles.length > 0) return titles;
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    async getStatusNewChat(): Promise<Status> {
        let lastError: any;
        for (const ui of this.ui) {
            try {
                if (await this.script.exists(ui.newChat.sendButton())) return "ready";
            } catch (error) {
                lastError = error;
            }
        }
        return "error";
    }

    async getStatusConversation(): Promise<Status> {
        let lastError: any;
        for (const ui of this.ui) {
            await this.script.enableAccessibility();
            try {
                if (await this.script.exists(ui.conversation.sendButton())) return "ready";
            } catch (error) {
                lastError = error;
            }
            try {
                if (await this.script.exists(ui.conversation.stopButton())) return "running";
            } catch (error) {
                lastError = error;
            }
        }
        return "error";
    }

    async sendNewChat(prompt: string): Promise<void> {
        let lastError: any;
        for (const ui of this.ui) {
            try {
                await this.script.enableAccessibility();
                await this.script.set(ui.newChat.prompt(), `"${prompt.replace(/"/g, '\\"')}"`);
                await this.script.click(ui.newChat.sendButton());
                return;
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    async sendConversation(prompt: string): Promise<void> {
        let lastError: any;
        for (const ui of this.ui) {
            try {
                await this.script.enableAccessibility();
                await this.script.set(ui.conversation.prompt(), `"${prompt.replace(/"/g, '\\"')}"`);
                await this.script.click(ui.conversation.sendButton());
                return;
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }

    async getResponse(): Promise<string> {
        let lastError: any;
        for (const ui of this.ui) {
            try {
                await this.script.enableAccessibility();
                const lines = await this.script.list(ui.conversation.chats());
                const staticLines = lines.filter(line => line.trim().startsWith("static text"));
                const values = staticLines.map(line => {
                    const m = line.trim().match(/^static text "(.+?)" of/);
                    return m ? m[1] : "";
                }).filter(line => line.trim() !== "");
                return values.join("\n");
            } catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }
}