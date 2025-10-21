/**
 * IPC 类型系统统一导出
 */

export { IPC_EVENTS } from './events';
export type { IPCEventName } from './events';
export type { IPCEventMap, IPCRequest, IPCResponse } from './payloads';
export {
  typedSend,
  typedInvoke,
  typedOn,
  typedOnce,
  typedRemoveListener,
  typedMainOn,
  typedMainHandle,
  typedMainRemoveHandler,
  createTypedIpcRenderer,
  createTypedIpcMain,
} from './helpers';
