import mitt from 'mitt'
import type { ApidocCodeInfo, ApidocTab } from '@src/types';

/**
 * 全局事件订阅发布
 */
const emitter = mitt<{
  'apidoc/hook/jumpToEdit': ApidocCodeInfo;
  'apidoc/tabs/addOrDeleteTab': void,
  'apidoc/deleteDocs': void,
  'tabs/saveTabSuccess': void,
  'tabs/cancelSaveTab': void,
  'tabs/deleteTab': ApidocTab,
  'websocket/editor/removePreEditor': void;
  'websocket/editor/removeAfterEditor': void;
}>()

export const event = emitter;
export { message } from './message'
export { parseAiStream, type DeepSeekStreamDelta } from './aiStreamParser'
