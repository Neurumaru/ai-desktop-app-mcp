# AI Desktop App MCP Tool

> ⚠️ **Warning**: This tool currently only works with the Korean version of ChatGPT and Claude desktop app. The button names and UI elements are hardcoded in Korean.

This is a Model Context Protocol (MCP) tool that allows Cursor to interact with the ChatGPT and Claude desktop app on macOS.

## Features

- Ask ChatGPT and Claude from Cursor
- View Claude conversation history
- Get ChatGPT and Claude previous response

## Installation

### Prerequisites

- macOS with M4 chip
- [ChatGPT desktop app](https://chatgpt.com/download) installed
    - ChatGPT Plus subscription  
      (A subscription may not be required, but testing was done only with an active subscription.)
- [Claude desktop app](https://claude.ai/desktop) installed
    - Claude Pro subscription  
      (A subscription may not be required, but testing was done only with an active subscription.)
- [Bun](https://bun.sh/) installed

### Installation Steps

1. Clone this repository:

```bash
git clone https://github.com/syedazharmbnr1/claude-chatgpt-mcp.git
cd claude-chatgpt-mcp
```

2. Install dependencies:

```bash
bun install
```

3. Make sure the script is executable:

```bash
chmod +x index.ts
```

4. Update your Cursor MCP configuration:

Edit your MCP Server configuration file (Cursor Settings > MCP > Add new global MCP Server):

```json
"ai-desktop-app-mcp": {
  "command": "/Users/YOURUSERNAME/.bun/bin/bun",
  "args": ["run", "/path/to/ai-desktop-app-mcp/index.ts"]
}
```

Make sure to replace `YOURUSERNAME` with your actual macOS username and adjust the path to where you cloned this repository.

5. Restart Cursor

6. Grant permissions:
    - Go to System Preferences > Privacy & Security > Accessibility
    - Give Cursor access to Accessibility features
    - You may see permission prompts when the tool is first used

## Usage

Once installed, you can use the ChatGPT tool directly from Claude by asking questions like:

- "Can you ask ChatGPT what the capital of France is?"
- "Show me my recent ChatGPT conversations"
- "Ask ChatGPT to explain quantum computing"

## License

MIT License
