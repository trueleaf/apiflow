import { initializePlatform } from './platform/bootstrap';
import type { DesktopMockRequest } from '@src/types/desktop';
import type { ApidocVariable } from '@src/types/httpNode/types';

void initializePlatform().then(async () => {
  const { invoke } = await import('@tauri-apps/api/core');
  const { onDesktopEvent } = await import('./platform/tauri/events');
  const { handleMcpHttp } = await import('./platform/tauri/mcpTransport');
  const { resolveMockResponse, resolveMockSse } = await import('./platform/tauri/mockResponse');
  const { getCompiledTemplate } = await import('@src/shared/template');
  onDesktopEvent<{ id: string } & (
    { operation: 'mcp:http'; payload: Parameters<typeof handleMcpHttp>[0] }
    | { operation: 'mock:response'; payload: DesktopMockRequest }
    | { operation: 'mock:sse'; payload: Parameters<typeof resolveMockSse>[0] }
    | { operation: 'mock:template'; payload: { template: string; variables: ApidocVariable[] } }
  )>('desktop:executor:request', async request => {
    try {
      let result: unknown;
      if (request.operation === 'mcp:http') result = await handleMcpHttp(request.payload);
      else if (request.operation === 'mock:response') result = await resolveMockResponse(request.payload);
      else if (request.operation === 'mock:sse') result = await resolveMockSse(request.payload);
      else if (request.operation === 'mock:template') result = String(await getCompiledTemplate(request.payload.template, request.payload.variables));
      else throw new Error('UNKNOWN_EXECUTOR_OPERATION');
      await invoke('executor_reply', { id: request.id, result });
    } catch (error) {
      await invoke('executor_reply', { id: request.id, error: error instanceof Error ? error.message : String(error) });
    }
  });
  await invoke('executor_ready');
}).catch(error => window.reportError(error));
