import { test, expect } from '@playwright/test';
import type { CanApiflowParseType, ResponseInfo } from '@src/types/request';
import type { HttpHistory, HttpHistoryStore } from '@src/types/history/httpHistory';
import type { HttpNode } from '@src/types/httpNode/httpNode';

type IsTypeEqual<T1, T2> = (
  (<T>() => T extends T1 ? 1 : 2) extends (<T>() => T extends T2 ? 1 : 2) ? true : false
);

test.describe('RequestHistoryTypeContract', () => {
  // 请求响应类型与历史记录类型在类型层保持契约一致
  test('请求解析类型与历史结构关键字段保持稳定', async () => {
    // 编译期校验：响应解析类型应覆盖关键渲染分支
    const parseTypes: Array<CanApiflowParseType> = [
      'textEventStream',
      'cachedBodyIsTooLarge',
      'forceDownload',
      'archive',
      'unknown',
    ];
    expect(parseTypes).toHaveLength(5);
    // 编译期校验：历史记录中的 node 字段必须与 HttpNode 类型一致
    const historyNodeTypeAssert: IsTypeEqual<HttpHistory['node'], HttpNode> = true;
    expect(historyNodeTypeAssert).toBeTruthy();
    // 编译期校验：历史存储结构 value 必须是 HttpHistory 数组
    const historyStoreTypeAssert: IsTypeEqual<HttpHistoryStore[string][number], HttpHistory> = true;
    expect(historyStoreTypeAssert).toBeTruthy();
    // 编译期校验：响应结构里的解析类型字段与 CanApiflowParseType 保持同源
    const responseParseTypeAssert: IsTypeEqual<ResponseInfo['responseData']['canApiflowParseType'], CanApiflowParseType> = true;
    expect(responseParseTypeAssert).toBeTruthy();
  });
});
