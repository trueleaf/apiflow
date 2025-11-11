import { openDB, IDBPDatabase } from 'idb';
import { AgentMessage } from '@src/types/ai';
import { config } from '@src/config/config';
import { logger } from '@/helper';
import { cacheKey } from '../cacheKey';

type SessionInfo = {
  sessionId: string;
  lastMessageTime: string;
  messageCount: number;
};

class AgentCache {
  private dbName = config.cacheConfig.agentMessageCache.dbName;
  private storeName = config.cacheConfig.agentMessageCache.storeName;
  private version = config.cacheConfig.agentMessageCache.version;
  private db: IDBPDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
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
      logger.error('初始化Agent对话数据库失败', { error });
    }
  }

  private async ensureDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('无法初始化Agent对话数据库');
    }
    return this.db;
  }

  async addMessage(message: AgentMessage): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const messageCopy = JSON.parse(JSON.stringify(message));
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.add(messageCopy);
      await tx.done;
      return true;
    } catch (error) {
      logger.error('添加Agent消息失败', { error });
      return false;
    }
  }
  async updateMessage(message: AgentMessage): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const messageCopy = JSON.parse(JSON.stringify(message));
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.put(messageCopy);
      await tx.done;
      return true;
    } catch (error) {
      logger.error('更新Agent消息失败', { error });
      return false;
    }
  }

  async getMessagesBySessionId(sessionId: string): Promise<AgentMessage[]> {
    try {
      const db = await this.ensureDB();
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

  async deleteMessagesBySessionId(sessionId: string): Promise<boolean> {
    try {
      const db = await this.ensureDB();
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

  async clearAllMessages(): Promise<boolean> {
    try {
      const db = await this.ensureDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      await tx.store.clear();
      await tx.done;
      return true;
    } catch (error) {
      logger.error('清空所有消息失败', { error });
      return false;
    }
  }

  async getSessionList(): Promise<SessionInfo[]> {
    try {
      const db = await this.ensureDB();
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

  getLastSessionId(): string | null {
    try {
      return localStorage.getItem(cacheKey.ai.lastSessionId);
    } catch (error) {
      logger.error('获取最后会话ID失败', { error });
      return null;
    }
  }

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

export const agentCache = new AgentCache();
