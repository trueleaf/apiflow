import type { WebsocketSendMessageTemplate } from '@src/types/websocketNode';
import { logger } from '@/helper';

/**
 * WebSocket消息模板缓存管理类
 * 负责管理WebSocket消息模板的localStorage存储
 */
class WebSocketTemplateCache {
  private readonly STORAGE_KEY = 'websocket/messageTemplates';

    // 获取所有消息模板
  getAllTemplates(): WebsocketSendMessageTemplate[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      const templates = JSON.parse(data);
      return Array.isArray(templates) ? templates : [];
    } catch (error) {
      logger.error('获取消息模板失败', { error });
      localStorage.removeItem(this.STORAGE_KEY);
      return [];
    }
  }

    // 添加消息模板
  addTemplate(template: WebsocketSendMessageTemplate): void {
    try {
      const templates = this.getAllTemplates();
      templates.push(template);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      logger.error('保存消息模板失败', { error });
    }
  }

    // 根据ID删除消息模板
  deleteTemplate(id: string): boolean {
    try {
      const templates = this.getAllTemplates();
      const index = templates.findIndex(template => template.id === id);
      if (index === -1) {
        return false;
      }
      templates.splice(index, 1);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
      return true;
    } catch (error) {
      logger.error('删除消息模板失败', { error });
      return false;
    }
  }

    // 根据ID获取消息模板
  getTemplateById(id: string): WebsocketSendMessageTemplate | null {
    try {
      const templates = this.getAllTemplates();
      return templates.find(template => template.id === id) || null;
    } catch (error) {
      logger.error('获取消息模板失败', { error });
      return null;
    }
  }

    // 更新消息模板
  updateTemplate(id: string, updates: Partial<WebsocketSendMessageTemplate>): boolean {
    try {
      const templates = this.getAllTemplates();
      const index = templates.findIndex(template => template.id === id);
      if (index === -1) {
        return false;
      }
      templates[index] = {
        ...templates[index],
        ...updates,
        updatedAt: Date.now(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
      return true;
    } catch (error) {
      logger.error('更新消息模板失败', { error });
      return false;
    }
  }

    // 清空所有消息模板
  clearAllTemplates(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      logger.error('清空消息模板失败', { error });
    }
  }
}

export const websocketTemplateCache = new WebSocketTemplateCache();
