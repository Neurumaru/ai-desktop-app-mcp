import { runAppleScript } from "run-applescript";

export class AppleScript {
    private process: string;

    constructor(process: string) {
        this.process = process;
    }

    async launch(): Promise<void> {
        try {
            await runAppleScript(`
            tell application "${this.process}" to activate
            `);
        } catch (error) {
            throw new Error("Could not launch application");
        }
    }

    async click(element: string): Promise<void> {
        try {
            await runAppleScript(`
            tell application "System Events"
                tell process "${this.process}"
                    click ${element}
                end tell
            end tell
            `);
        } catch (error) {
            throw new Error("Could not click element");
        }
    }

    async query(select: string, from: string, where: string): Promise<string> {
        try {
            const result = await runAppleScript(`
            tell application "System Events"
                tell process "${this.process}"
                    repeat with current in ${from}
                        if ${where} then
                            return ${select}
                        end if
                    end repeat

                    return ""
                end tell
            end tell
            `);
            return result;
        } catch (error) {
            throw new Error("Could not query element");
        }
    }

    async queryAll(select: string, from: string, where: string): Promise<string[]> {
        try {
            const result = await runAppleScript(`
            tell application "System Events"
                tell process "${this.process}"
                    set allElements to ${from}
                    set qeuryResult to {}
                    repeat with current in allElements
                        if ${where} then
                            set end of qeuryResult to ${select}
                        end if
                    end repeat
                    set AppleScript's text item delimiters to linefeed
                    return qeuryResult as text
                end tell
            end tell
            `);
            return result.split("\n");
        } catch (error) {
            throw new Error("Could not query element");
        }
    }

    async list(from: string): Promise<string[]> {
        try {
            const result = await runAppleScript(`
            tell application "System Events"
                tell process "${this.process}"
                    return ${from}
                end tell
            end tell
            `, {humanReadableOutput: false});
            return result.split(`of application process "${this.process}" of application "System Events", `);
        } catch (error) {
            throw new Error("Could not list element");
        }
    }

    async fetch(element: string): Promise<string> {
        try {
            const result = await runAppleScript(`
            tell application "System Events"
                tell process "${this.process}"
                    return ${element}
                end tell
            end tell
            `);
            return result;
        } catch (error) {
            throw new Error("Could not fetch element");
        }
    }

    async exists(element: string): Promise<boolean> {
        try {
            const result = await runAppleScript(`
            tell application "System Events"
                tell process "${this.process}"
                    if (exists ${element}) then
                        return "true"
                    else
                        return "false"
                    end if
                end tell
            end tell
            `);
            return result == "true";
        } catch (error) {
            throw new Error("Could not check if element exists");
        }
    }

    async set(element: string, value: string): Promise<void> {
        try {
            await runAppleScript(`
            tell application "System Events"
                tell process "${this.process}"
                    set ${element} to ${value}
                end tell
            end tell
            `);
        } catch (error) {
            throw new Error("Could not set element");
        }
    }

    async enableAccessibility(): Promise<void> {
        try {
            await this.set(`value of attribute "AXManualAccessibility"`, "true");
        } catch (error) {
            throw new Error("Could not enable accessibility");
        }
    }
}