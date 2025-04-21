import { lock, LockOptions } from 'proper-lockfile';
import * as os from 'os';
import * as path from 'path';
import { 
    launch as launchScript, 
    newChat as newChatScript, 
    setConversation as setConversationScript, 
    sendNewChat as sendNewChatScript, 
    getResponse as getResponseScript, 
    getStatusNewChat as getStatusNewChatScript, 
    getStatusConversation as getStatusConversationScript, 
    sendConversation as sendConversationScript, 
    getConversationId as getConversationIdScript, 
    getConversations as getConversationsScript 
} from './applescript';
import { cancellableDelay } from '../common/utils';
import { Status } from './types';

const DELAY = 500;
const INTERVAL = 10000;

const lockfilePath = path.join(os.tmpdir(), 'claude-interaction.lock');
const lockOptions: LockOptions = {
    retries: {
        retries: 5,
        factor: 3,
        minTimeout: 100,
        maxTimeout: 2000,
        randomize: true,
    },
    realpath: false,
    stale: 60000,
};

export async function transaction(func: () => Promise<void>) {
    let release: (() => Promise<void>) | undefined;
    try {
        release = await lock(lockfilePath, lockOptions);
        await func();
    } catch (error: any) {
        if (error.code === 'ELOCKED') {
            throw new Error(`Failed to acquire lock on ${lockfilePath}, another process might be interacting with Claude. Original error: ${error.message}`);
        } else if (error instanceof Error) {
            throw new Error(`Claude interaction failed: ${error.message}`);
        }
    } finally {
        if (release) {
            await release();
        }
    }
}

export async function ask(signal: AbortSignal, conversationId: string, prompt: string): Promise<{response: string, conversationId: string}> {
    await transaction(async () => {
        if (await getStatus() === "inactive") {
            await launchScript();
            await cancellableDelay(signal, DELAY, 'Timeout: Waiting for Claude to be ready');
        }
    });

    if (conversationId) {
        return askConversation(signal, conversationId, prompt);
    } else {
        return askNewChat(signal, prompt);
    }
}

export async function askNewChat(signal: AbortSignal, prompt: string): Promise<{conversationId: string, response: string}> {
    let conversationId = "제목 없음";
    let response = "";
    await transaction(async () => {
        await newChatScript();
        await cancellableDelay(signal, DELAY, 'Timeout: Waiting for Claude to be ready');
        await sendNewChatScript(prompt);
        await cancellableDelay(signal, DELAY, 'Timeout: Waiting for Claude to be ready');

        while (await getStatus() !== "ready") {
            if (signal.aborted) {
                throw new Error('Timeout: Waiting for response from Claude on new chat');
            }
            await cancellableDelay(signal, INTERVAL, "Timeout: Waiting for response from Claude on new chat");
        }
        response = await getResponseScript();
        conversationId = await getConversationIdScript();
    });
    return {conversationId, response};
}

export async function askConversation(signal: AbortSignal, conversationId: string, prompt: string): Promise<{conversationId: string, response: string}> {
    let response = "";
    await transaction(async () => {
        await setConversationScript(conversationId);
        await cancellableDelay(signal, DELAY, 'Timeout: Waiting for Claude to be ready');
        await sendConversationScript(prompt);
        await cancellableDelay(signal, DELAY, 'Timeout: Waiting for Claude to be ready');
    });
    let loop = true;
    while (loop) {
        if (signal.aborted) {
            throw new Error('Timeout: Waiting for response from Claude on conversation');
        }
        await transaction(async () => {
            await setConversationScript(conversationId);
            await cancellableDelay(signal, DELAY, 'Timeout: Waiting for Claude to be ready');
            const status = await getStatus();
            if (status !== "ready") {
                return;
            }
            response = await getResponseScript();
            loop = false;
        });
        await cancellableDelay(signal, INTERVAL, "Timeout: Waiting for response from Claude on conversation");
    }
    return {conversationId, response};
}

export async function getConversations(): Promise<string[]> {
    return await getConversationsScript();
}

export async function getResponse(signal: AbortSignal, conversationId: string): Promise<string> {
    let response = "";

    while (true) {
        if (signal.aborted) {
            throw new Error('Timeout: Waiting for response from Claude on conversation');
        }

        let loop = true;
        await transaction(async () => {
            await setConversationScript(conversationId);
            await cancellableDelay(signal, DELAY, 'Timeout: Waiting for Claude to be ready');
            if (await getStatus() !== "ready") {
                return;
            }
            response = await getResponseScript();
            loop = false;
        });
        if (!loop) {
            break;
        }

        await cancellableDelay(signal, INTERVAL, "Timeout: Waiting for response from Claude on conversation");
    }
    return response;
}

export async function getStatus(): Promise<Status> {
    try {
        if (await getStatusNewChatScript() === "ready") {
            return "ready";
        }
        return await getStatusConversationScript();
    } catch (error) {
        throw new Error("Could not get status. Please try again.");
    }
}