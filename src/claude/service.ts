import { lock, LockOptions } from 'proper-lockfile';
import * as os from 'os';
import * as path from 'path';
import { launch, newChat, setConversation, sendNewChat, getResponse as getResponseAS, getStatusNewChat, getStatusConversation, sendConversation, getConversationId, getConversations as getConversationsAS } from './applescript';
import { cancellableDelay } from '../common/utils';
import { Status } from './types';

const LAUNCH_DELAY = 2000;
const CHECK_INTERVAL = 1000;

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
            await launch();
            await cancellableDelay(LAUNCH_DELAY, 'Timeout: Waiting for Claude to be ready', signal);
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
        await newChat();
        await sendNewChat(prompt);

        while (await getStatus() !== "ready") {
            if (signal.aborted) {
                throw new Error('Timeout: Waiting for response from Claude on new chat');
            }
            await cancellableDelay(CHECK_INTERVAL, "Timeout: Waiting for response from Claude on new chat", signal);
        }
        response = await getResponseAS();
        conversationId = await getConversationId();
    });
    return {conversationId, response};
}

export async function askConversation(signal: AbortSignal, conversationId: string, prompt: string): Promise<{conversationId: string, response: string}> {
    let response = "";
    await transaction(async () => {
        await setConversation(conversationId);
        await sendConversation(prompt);
    });
    let loop = true;
    while (loop) {
        if (signal.aborted) {
            throw new Error('Timeout: Waiting for response from Claude on conversation');
        }
        await transaction(async () => {
            await setConversation(conversationId);
            const status = await getStatus();
            if (status !== "ready") {
                return;
            }
            response = await getResponseAS();
            loop = false;
        });
        await cancellableDelay(CHECK_INTERVAL, "Timeout: Waiting for response from Claude on conversation", signal);
    }
    return {conversationId, response};
}

export async function getConversations(): Promise<string[]> {
    return await getConversationsAS();
}

export async function getResponse(signal: AbortSignal, conversationId: string): Promise<string> {
    let response = "";

    let loop = true;
    while (loop) {
        if (signal.aborted) {
            throw new Error('Timeout: Waiting for response from Claude on conversation');
        }
        await transaction(async () => {
            await setConversation(conversationId);
            const status = await getStatus();
            if (status !== "ready") {
                return;
            }
            response = await getResponseAS();
            loop = false;
        });
        await cancellableDelay(CHECK_INTERVAL, "Timeout: Waiting for response from Claude on conversation", signal);
    }
    return response;
}

export async function getStatus(): Promise<Status> {
    try {
        if (await getStatusNewChat() === "ready") {
            return "ready";
        }
        return await getStatusConversation();
    } catch (error) {
        throw new Error("Could not get status. Please try again.");
    }
}