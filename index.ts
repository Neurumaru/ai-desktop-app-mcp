#!/usr/bin/env bun
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from './src/server';

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ChatGPT MCP Server running on stdio");