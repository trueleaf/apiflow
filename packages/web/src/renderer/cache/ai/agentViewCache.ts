import { openDB, IDBPDatabase } from 'idb';
import { AgentViewMessage } from '@src/types/ai';
import { config } from '@src/config/config';
import { logger } from '@/helper/logger';
import { cacheKey } from '../cacheKey';
type SessionInfo = {
  sessionId: string;
  lastMessageTime: string;
  messageCount: number;
};
// AgentView消息缓存类
class AgentViewCache {
  private dbName = config.cacheConfig.agentViewMessageCache.dbName;
  private storeName = config.cacheConfig.agentViewMessageCache.storeName;
  private version = config.cacheConfig.agentViewMessageCache.version;
  private db: IDBPDatabase | null = null;
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化AgentView对话数据库失败', { error });
    });
  }
  // 初始化数据库
  private async initDB(): Promise<void> {
    if (this.db) {
      return;
    }
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('messages')) {
            const store = db.createObjectStore('messages', { keyPath: 'id' });
            store.createIndex('sessionId', 'sessionId', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        }
      });
    } catch (error) {
      logger.error('初始化AgentView对话数据库失败', { error });
      this.db = null;
    }
  }
  // 获取数据库连接
  private async getDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('无法初始化AgentView对话数据库');
    }
    return this.db;
  }
  // 添加消息
  async addMessage(message: AgentViewMessage): Promise<boolean> {
    try {
      const db = await this.getDB();
      const messageCopy = JSON.parse(JSON.stringify(message));
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.add(messageCopy);
      await tx.done;
      return true;
    } catch (error) {
      logger.error('添加AgentView消息失败', { error });
      return false;
    }
  }
  // 更新消息
  async updateMessage(message: AgentViewMessage): Promise<boolean> {
    try {
      const db = await this.getDB();
      const messageCopy = JSON.parse(JSON.stringify(message));
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.put(messageCopy);
      await tx.done;
      return true;
    } catch (error) {
      logger.error('更新AgentView消息失败', { error });
      return false;
    }
  }
  // 根据会话ID获取消息列表
  async getMessagesBySessionId(sessionId: string): Promise<AgentViewMessage[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const index = tx.store.index('sessionId');
      const records = await index.getAll(sessionId);
      const sortedRecords = records.sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      return sortedRecords;
    } catch (error) {
      logger.error('获取会话消息列表失败', { error });
      return [];
    }
  }
  // 根据会话ID删除消息
  async deleteMessagesBySessionId(sessionId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx1 = db.transaction(this.storeName, 'readonly');
      const index = tx1.store.index('sessionId');
      const records = await index.getAll(sessionId);
      const tx2 = db.transaction(this.storeName, 'readwrite');
      for (const record of records) {
        await tx2.store.delete(record.id);
      }
      await tx2.done;
      return true;
    } catch (error) {
      logger.error('删除会话消息失败', { error });
      return false;
    }
  }
  // 清空所有消息
  async clearAllMessages(): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.clear();
      await tx.done;
      return true;
    } catch (error) {
      logger.error('清空所有消息失败', { error });
      return false;
    }
  }
  // 获取会话列表
  async getSessionList(): Promise<SessionInfo[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const allMessages = await tx.store.getAll();
      const sessionMap = new Map<string, SessionInfo>();
      for (const message of allMessages) {
        const existing = sessionMap.get(message.sessionId);
        if (!existing) {
          sessionMap.set(message.sessionId, {
            sessionId: message.sessionId,
            lastMessageTime: message.timestamp,
            messageCount: 1
          });
        } else {
          existing.messageCount += 1;
          if (new Date(message.timestamp).getTime() > new Date(existing.lastMessageTime).getTime()) {
            existing.lastMessageTime = message.timestamp;
          }
        }
      }
      const sessionList = Array.from(sessionMap.values());
      sessionList.sort((a, b) => {
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      return sessionList.filter(session => session.messageCount > 0);
    } catch (error) {
      logger.error('获取会话列表失败', { error });
      return [];
    }
  }
  // 获取最后会话ID
  getLastSessionId(): string | null {
    try {
      return localStorage.getItem(cacheKey.ai.lastSessionId);
    } catch (error) {
      logger.error('获取最后会话ID失败', { error });
      return null;
    }
  }
  // 设置最后会话ID
  setLastSessionId(sessionId: string): boolean {
    try {
      localStorage.setItem(cacheKey.ai.lastSessionId, sessionId);
      return true;
    } catch (error) {
      logger.error('设置最后会话ID失败', { error });
      return false;
    }
  }
}
export const agentViewCache = new AgentViewCache();
