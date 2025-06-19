import type { ApidocHttpRequestMethod } from "../global";

/*
|--------------------------------------------------------------------------
| mock相关
|--------------------------------------------------------------------------
*/
export type ApidocMockMapInfo = {
  id: string, //接口id
  projectId: string, //项目id
  url: string, //请求地址
  customMockUrl: string, //自定义mock地址
  method: ApidocHttpRequestMethod, //请求方法
  isCustom?: boolean, //是否为用户自定义mock数据
}
export type ApidocMockState = {
  /**
     * mock服务器监听端口
     */
  mockServerPort: number,
  /**
     * 地址映射，用于
     */
  urlMap: ApidocMockMapInfo[],
  /**
     * 服务器状态
     */
  serverState: 'disconnection' | 'connecting' | 'connection' | 'error' | 'closing',
};