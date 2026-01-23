import { WebContentsView } from 'electron';
import { isContentViewReady } from '../lifecycle/contentViewLifecycle.ts';

// 缓存的消息类型
type QueuedMessage = {
  channel: string;
  args: unknown[];
  timestamp: number;
};
// contentView 和 topBarView 的引用
let contentViewRef: WebContentsView | null = null;
let topBarViewRef: WebContentsView | null = null;
// 消息队列（用于重要消息的缓冲）
let contentViewMessageQueue: QueuedMessage[] = [];
// 队列最大长度（防止内存泄漏）
const MAX_QUEUE_SIZE = 100;
// 消息过期时间（5分钟）
const MESSAGE_EXPIRE_TIME = 5 * 60 * 1000;
// 初始化安全 IPC 发送模块
export const initSafeIpcSend = (contentView: WebContentsView, topBarView: WebContentsView) => {
  contentViewRef = contentView;
  topBarViewRef = topBarView;
  contentViewMessageQueue = [];
};
// 检查 WebContentsView 是否可用
const isWebContentsAvailable = (view: WebContentsView | null): boolean => {
  if (!view) return false;
  if (!view.webContents) return false;
  if (view.webContents.isDestroyed()) return false;
  return true;
};
// 安全发送到 contentView（页面未就绪时静默丢弃）
export const safeContentViewSend = (channel: string, ...args: unknown[]): boolean => {
  if (!isWebContentsAvailable(contentViewRef)) return false;
  if (!isContentViewReady()) return false;
  contentViewRef!.webContents.send(channel, ...args);
  return true;
};
// 带队列的安全发送到 contentView（页面未就绪时缓存）
export const queuedContentViewSend = (channel: string, ...args: unknown[]): void => {
  if (isWebContentsAvailable(contentViewRef) && isContentViewReady()) {
    contentViewRef!.webContents.send(channel, ...args);
    return;
  }
  // 页面未就绪，加入队列
  if (contentViewMessageQueue.length >= MAX_QUEUE_SIZE) {
    // 移除最旧的消息
    contentViewMessageQueue.shift();
  }
  contentViewMessageQueue.push({
    channel,
    args,
    timestamp: Date.now(),
  });
};
// 刷新消息队列（页面加载完成后调用）
export const flushContentViewMessageQueue = (): number => {
  if (!isWebContentsAvailable(contentViewRef)) return 0;
  const now = Date.now();
  // 过滤掉过期的消息
  const validMessages = contentViewMessageQueue.filter(
    msg => now - msg.timestamp < MESSAGE_EXPIRE_TIME
  );
  let sentCount = 0;
  for (const msg of validMessages) {
    try {
      contentViewRef!.webContents.send(msg.channel, ...msg.args);
      sentCount++;
    } catch {
      // 忽略发送失败的消息
    }
  }
  contentViewMessageQueue = [];
  return sentCount;
};
// 安全发送到 topBarView
export const safeTopBarViewSend = (channel: string, ...args: unknown[]): boolean => {
  if (!isWebContentsAvailable(topBarViewRef)) return false;
  topBarViewRef!.webContents.send(channel, ...args);
  return true;
};
// 安全发送到 contentView（仅检查销毁状态，用于 contentViewInstance 场景）
export const safeContentViewInstanceSend = (channel: string, ...args: unknown[]): boolean => {
  if (!isWebContentsAvailable(contentViewRef)) return false;
  // 不检查加载状态，仅检查是否销毁（用于 Mock 日志等非关键消息）
  contentViewRef!.webContents.send(channel, ...args);
  return true;
};
// 获取队列长度（调试用）
export const getQueueLength = (): number => contentViewMessageQueue.length;
// 清空队列
export const clearMessageQueue = (): void => {
  contentViewMessageQueue = [];
};
// 销毁安全 IPC 发送模块
export const destroySafeIpcSend = () => {
  contentViewRef = null;
  topBarViewRef = null;
  contentViewMessageQueue = [];
};
