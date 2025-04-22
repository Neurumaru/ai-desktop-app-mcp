// dynamic import wrapper for runAppleScript to avoid ESM static import issues
async function runAppleScriptWrapper(script: string): Promise<string> {
    // Use dynamic import for run-applescript
    const { runAppleScript } = await import("run-applescript");
    try {
        // console.debug("Executing AppleScript:\n", script); // Optional: Log script for debugging
        const result = await runAppleScript(script);
        // console.debug("AppleScript Result:", result); // Optional: Log result
        return result;
    } catch (error: any) {
        console.error("AppleScript execution failed:", error);
        console.error("Failed Script:\n", script); // Log the script that failed
        // Rethrow or return a specific error indicator string
        throw new Error(
            `AppleScript execution failed: ${error.message || error}`,
        );
    }
}

export const scriptRunner = { runAppleScript: runAppleScriptWrapper };

/**
 * 클립보드를 저장하는 함수
 * @returns Promise<string> - 저장된 클립보드 내용
 */
export async function saveClipboard(): Promise<string> {
    const saveClipboardScript = `
      set originalClipboard to the clipboard
      return originalClipboard
    `;
    return await scriptRunner.runAppleScript(saveClipboardScript);
}

/**
 * 클립보드를 복원하는 함수
 * @param content - 복원할 클립보드 내용
 * @returns Promise<void> - 복원 성공 시 비동기적으로 완료됨
 */
export async function restoreClipboard(content: string): Promise<void> {
    const escapedContent = content.replace(/"/g, '\"');
    await scriptRunner.runAppleScript(
        `set the clipboard to "${escapedContent}"`,
    );
}
