import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createMcpProtocolServer } from './mcpProtocol';
import { listMcpTools, callMcpTool } from '@/mcp/toolRegistry';
import { readMcpResource } from '@/mcp/resourceRegistry';
import type { McpAccessPolicy } from '@src/types/mcp';

// 使用标准 Web 传输处理本地 MCP 请求
export const handleMcpHttp = async (payload: { body: string; headers: Record<string, string>; port: number; accessPolicy: McpAccessPolicy }) => {
  const server = createMcpProtocolServer({
    accessPolicy: payload.accessPolicy,
    listTools: async () => listMcpTools(),
    callTool: (name, args) => callMcpTool({ name, arguments: args }),
    readResource: uri => readMcpResource(uri),
  });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    const response = await transport.handleRequest(new Request(`http://127.0.0.1:${payload.port}/mcp`, { method: 'POST', headers: payload.headers, body: payload.body }));
    return { status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() };
  } finally { await server.close(); }
};
