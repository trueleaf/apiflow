import { test, expect } from '@playwright/test';
import type { ApiNode, HttpNode, FolderNode } from '@src/types/httpNode/httpNode';
import type { ApidocType } from '@src/types/httpNode/types';
import type { WebSocketNode } from '@src/types/websocketNode';
import type { HttpMockNode, WebSocketMockNode } from '@src/types/mockNode';

type IsTypeEqual<T1, T2> = (
  (<T>() => T extends T1 ? 1 : 2) extends (<T>() => T extends T2 ? 1 : 2) ? true : false
);

test.describe('WorkbenchNodeTypeContract', () => {
  // 工作台节点联合类型与节点基础类型保持一致
  test('ApiNode 与 HTTP/WebSocket/Mock/Folder 节点类型契约稳定', async () => {
    // 编译期校验：ApiNode 联合类型应可承载五类节点
    const nodeSamples: ApiNode[] = [
      {} as unknown as HttpNode,
      {} as unknown as WebSocketNode,
      {} as unknown as HttpMockNode,
      {} as unknown as WebSocketMockNode,
      {} as unknown as FolderNode,
    ];
    expect(nodeSamples).toHaveLength(5);
    // 编译期校验：节点 info.type 应与 ApidocType 同源
    const nodeTypeSamples: Array<ApiNode['info']['type']> = [
      'folder',
      'http',
      'httpMock',
      'websocket',
      'websocketMock',
    ];
    expect(nodeTypeSamples).toHaveLength(5);
    const nodeTypeSourceAssert: IsTypeEqual<ApiNode['info']['type'], ApidocType> = true;
    expect(nodeTypeSourceAssert).toBeTruthy();
  });
});
