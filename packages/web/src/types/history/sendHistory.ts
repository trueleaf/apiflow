/**
 * 发送历史列表项（轻量级，用于Banner列表展示）
 */
export type SendHistoryItem = {
  /**
   * 历史记录ID
   */
  _id: string;
  /**
   * 节点ID
   */
  nodeId: string;
  /**
   * 接口名称
   */
  nodeName: string;
  /**
   * 节点类型
   */
  nodeType: 'http' | 'websocket';
  /**
   * HTTP方法（http类型）
   */
  method?: string;
  /**
   * 协议（websocket类型）
   */
  protocol?: string;
  /**
   * 请求URL
   */
  url: string;
  /**
   * 调用时间戳
   */
  timestamp: number;
  /**
   * 操作者名称
   */
  operatorName: string;
};

/**
 * 发送历史缓存数据类型（存储到IndexedDB）
 */
export type SendHistoryCacheData = SendHistoryItem;

/**
 * 添加发送历史的参数类型
 */
export type AddSendHistoryParams = Omit<SendHistoryItem, '_id' | 'timestamp'>;

/**
 * 发送历史Store状态类型
 */
export type SendHistoryState = {
  /**
   * 历史列表
   */
  sendHistoryList: SendHistoryItem[];
  /**
   * 加载状态
   */
  loading: boolean;
  /**
   * 是否有更多数据
   */
  hasMore: boolean;
  /**
   * 每页数量
   */
  pageSize: number;
  /**
   * 当前偏移量
   */
  currentOffset: number;
};
