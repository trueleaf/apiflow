import { computed } from 'vue'
import type { ApidocProperty } from '@src/types'
import { useWebSocket } from '@/store/websocketNode/websocketNodeStore';
import { nanoid } from 'nanoid/non-secure';

/**
 * 将请求url后面查询参数转换为params
 */
const convertQueryToParams = (requestPath: string): void => {
  const websocketStore = useWebSocket()
  const stringParams = requestPath.split('?')[1] || '';
  if (!stringParams) return;

  const objectParams: Record<string, string> = {};
  stringParams.split('&').forEach(pair => {
    const [encodedKey, encodedValue] = pair.split(/=(.*)/s);
    if (encodedKey) {
      objectParams[encodedKey] = encodedValue || '';
    }
  });
  
  const newParams: ApidocProperty<'string'>[] = [];
  Object.keys(objectParams).forEach(field => {
    const property: ApidocProperty<'string'> = {
      _id: nanoid(),
      key: field,
      value: objectParams[field] || '',
      description: '',
      required: true,
      type: 'string',
      select: true,
    };
    newParams.push(property);
  });
  
  const uniqueData: ApidocProperty<'string'>[] = [];
  const originParams = websocketStore.websocket.item.queryParams;
  newParams.forEach(item => {
    const matchedItem = originParams.find(v => v.key === item.key);
    if (originParams.every(v => v.key !== item.key)) {
      uniqueData.push(item);
    }
    if (matchedItem) {
      matchedItem.value = item.value;
    }
  });
  
  // 添加新的唯一参数到查询参数列表
  if (uniqueData.length > 0) {
    websocketStore.websocket.item.queryParams.unshift(...uniqueData);
  }
};

/**
 * 格式化url
 */
export const handleFormatUrl = (protocol: 'ws' | 'wss'): void => {
  const websocketStore = useWebSocket()
  // 创建局部 computed，不记录 undo 操作
  const connectionUrl = computed({
    get: () => websocketStore.websocket.item.url.path,
    set: (value: string) => {
      websocketStore.changeWebSocketPath(value);
    },
  });

  const currentPath = connectionUrl.value;
  convertQueryToParams(currentPath);
  
  // 如果URL不为空且不以ws://或wss://开头，且不是以变量开头，则添加协议前缀
  let formatPath = currentPath;
  if (formatPath.trim() !== '' && !formatPath.startsWith('ws://') && !formatPath.startsWith('wss://') && !formatPath.startsWith('{{')) {
    formatPath = `${protocol}://${formatPath}`;
  }
  
  // 移除查询参数部分（因为已经转换为params）
  const queryReg = /(\?.*$)/;
  formatPath = formatPath.replace(queryReg, '');
  
  // 通过局部 computed.set 更新，不触发 undo 记录
  connectionUrl.value = formatPath;
};
