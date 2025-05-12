import { ask, getResponse } from '../../../src/chatgpt/service';
import { getStatus, send } from '../../../src/chatgpt/applescript';

describe('ChatGPT Service Integration', () => {
    // UI 자동화를 포함하므로 충분한 타임아웃 설정 (600초)
    jest.setTimeout(600000);

    test('ask returns a non-empty response for a simple prompt', async () => {
        const controller = new AbortController();
        const prompt = 'Hello, ChatGPT!';
        const response = await ask(controller.signal, prompt);
        expect(typeof response).toBe('string');
        expect(response.trim().length).toBeGreaterThan(0);
    });

    test('getResponse retrieves ChatGPT responses properly', async () => {
        const controller = new AbortController();
        const prompt = 'Tell me a short joke';
        
        // First ensure we're in ready state
        const status = await getStatus();
        expect(['ready', 'running']).toContain(status);
        
        // Send a message if we're ready
        if (status === 'ready') {
            await send(prompt);
        }
        
        // Get the response
        const response = await getResponse(controller.signal);
        expect(typeof response).toBe('string');
        expect(response.trim().length).toBeGreaterThan(0);
    });
}); 