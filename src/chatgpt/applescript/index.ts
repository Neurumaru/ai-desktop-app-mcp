import type { Status } from "../types";
import { AppleScript } from "../../common/applescript";
import {
    ChatGptUIPath,
    EXPECTED_VOICE_START_BUTTON,
    EXPECTED_WEB_SEARCH_BUTTON,
    EXPECTED_SEND_BUTTON,
    EXPECTED_MESSAGES_ROLE,
} from "./path";

const script = new AppleScript("ChatGPT");
const ui = new ChatGptUIPath();

/**
 * Launches ChatGPT application and enables accessibility.
 */
export async function launch(): Promise<void> {
    await script.launch();
    await script.enableAccessibility();
}

/**
 * Gets the current status of ChatGPT (inactive, ready, running, error).
 */
export async function getStatus(): Promise<Status> {
    // Check if application window exists
    try {
        if (!(await script.exists(ui.basePage()))) {
            return "inactive";
        }
    } catch {
        return "inactive";
    }
    // Check if buttons group exists
    try {
        if (!(await script.exists(ui.buttonGroup()))) {
            return "error";
        }
    } catch {
        return "error";
    }
    // Check for ready state via voice buttons
    try {
        const readyButtons = await script.queryAll(
            "help of current",
            ui.buttons(),
            `help of current is "${EXPECTED_VOICE_START_BUTTON}" or help of current is "${EXPECTED_SEND_BUTTON}"`
        );
        if (readyButtons.includes(EXPECTED_VOICE_START_BUTTON)
                || readyButtons.includes(EXPECTED_SEND_BUTTON)) {
            return "ready";
        }
    } catch {
        // ignore errors during check
    }
    return "running";
}

/**
 * Sends a prompt to ChatGPT.
 */
export async function send(prompt: string): Promise<void> {
    // Launch (activate ChatGPT & enable accessibility)
    await launch();
    // Backup current clipboard
    const originalClipboard = await script.getClipboard();
    // Set clipboard to the prompt text
    await script.setClipboard(prompt);
    // 붙여넣기 메뉴 항목 클릭
    await script.click(ui.pasteMenu());
    // Restore original clipboard
    await script.setClipboard(originalClipboard);
    // Click original send button in UI
    const helps = await script.queryAll(
        "help of current",
        ui.buttons(),
        "true"
    );
    const idx = helps.findIndex((h) => h === EXPECTED_SEND_BUTTON);
    if (idx < 0) {
        throw new Error("Send button not found");
    }
    const element = `item ${idx + 1} of ${ui.buttons()}`;
    await script.click(element);
}

/**
 * Retrieves the last response from ChatGPT.
 */
export async function getResponse(): Promise<string> {
    await script.enableAccessibility();
    // Retrieve all static text elements and extract their values
    const values = await script.queryAll(
        "description of current",
        ui.allElements(),
        `role of current is "${EXPECTED_MESSAGES_ROLE}"`
    );
    return values.join("\n");
}

/**
 * Enables web search button in ChatGPT if currently disabled.
 */
export async function enableWebSearch(): Promise<void> {
    await script.enableAccessibility();
    // Ensure button group exists
    try {
        if (!(await script.exists(ui.buttonGroup()))) {
            return;
        }
    } catch {
        return;
    }
    // Find web search button index by help text
    const helps = await script.queryAll(
        "help of current",
        ui.buttons(),
        "true"
    );
    const idx = helps.findIndex((h) =>
        h.includes(EXPECTED_WEB_SEARCH_BUTTON)
    );
    if (idx < 0) {
        return;
    }
    // Check button width to determine disabled state
    const sizeResult = await script.fetch(
        `size of item ${idx + 1} of ${ui.buttons()}`
    );
    const width = parseInt(sizeResult.split(",")[0], 10);
    if (width === 30) {
        await script.click(`item ${idx + 1} of ${ui.buttons()}`);
        // Delay briefly to allow state change
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
}
