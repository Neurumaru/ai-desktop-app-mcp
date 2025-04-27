import { ask, getConversations, getResponse, getStatus } from "../../../src/claude/service";

jest.setTimeout(600000);

describe("Claude Service Integration Test", () => {
    it("should get conversations", async () => {
        const conversations = await getConversations();
        expect(conversations).toBeDefined();
        expect(conversations.length).toBeGreaterThan(0);
    });
    
    it("should get status", async () => {
        const status = await getStatus();
        expect(status).toBeDefined();
        expect(status).toBe("ready");
    });
    
    it("should ask a new chat", async () => {
        const signal = AbortSignal.timeout(100000);
        const response = await ask(signal, "", "Hello, how are you?");
        expect(response).toBeDefined();
        expect(response.conversationId).toBeDefined();
        expect(response.response).toBeDefined();
        expect(response.conversationId).not.toBe("제목 없음");
    });

    it("should ask a conversation", async () => {
        const signal = AbortSignal.timeout(100000);
        const response = await ask(signal, "test", "Hello, how are you?");
        expect(response).toBeDefined();
        expect(response.conversationId).toBeDefined();
        expect(response.response).toBeDefined();
    });

    it("should get conversations", async () => {
        const conversations = await getConversations();
        expect(conversations).toBeDefined();
        expect(conversations.length).toBeGreaterThan(0);
    });
}); 