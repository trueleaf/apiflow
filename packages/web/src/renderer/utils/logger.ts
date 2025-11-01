/**
 * 日志工具类 - 支持国际化的console封装
 *
 * 使用方式:
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * // 基本使用
 * logger.log('获取AI配置失败');
 * logger.warn('localStorage超出限制');
 * logger.error('WebSocket连接失败');
 *
 * // 带参数
 * logger.warn('localStorage超出限制', { size: 100 });
 *
 * // 带错误对象
 * logger.error('获取AI配置失败', { error });
 * ```
 */

import { i18n } from '@/i18n';

/**
 * 日志参数类型
 */
interface LogParams {
  [key: string]: any;
  error?: Error | any;
}

/**
 * Logger类 - 提供国际化日志功能
 */
class Logger {
  /**
   * 获取vue-i18n的翻译函数
   */
  private get t() {
    return i18n.global.t;
  }

  /**
   * 检查翻译key是否存在
   */
  private hasTranslation(key: string): boolean {
    try {
      const translated = this.t(key);
      // 如果翻译结果等于key本身,说明没有找到翻译
      return translated !== key;
    } catch {
      return false;
    }
  }

  /**
   * 格式化消息参数
   * 将 {key} 占位符替换为实际值
   */
  private formatMessage(message: string, params?: LogParams): string {
    if (!params) return message;

    let formatted = message;
    Object.keys(params).forEach(key => {
      if (key !== 'error') {
        const placeholder = `{${key}}`;
        if (formatted.includes(placeholder)) {
          formatted = formatted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), String(params[key]));
        }
      }
    });

    return formatted;
  }

  /**
   * 翻译消息
   * @param message 原始消息(中文)
   * @param params 消息参数
   * @returns 翻译后的消息
   */
  private translate(message: string, params?: LogParams): string {
    // 直接使用中文消息作为key在log命名空间下查找
    const logKey = `log.${message}`;
    if (this.hasTranslation(logKey)) {
      return this.t(logKey, params || {});
    }

    // 如果没找到翻译,返回格式化后的原始消息
    return this.formatMessage(message, params);
  }

  /**
   * 构建完整的日志输出
   */
  private buildLogOutput(translatedMessage: string, params?: LogParams): any[] {
    const output: any[] = [translatedMessage];

    if (params?.error) {
      output.push('\n', params.error);
    }

    return output;
  }

  /**
   * 普通日志
   */
  log(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.log(...output);
  }

  /**
   * 信息日志
   */
  info(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.info(...output);
  }

  /**
   * 警告日志
   */
  warn(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.warn(...output);
  }

  /**
   * 错误日志
   */
  error(message: string, params?: LogParams): void {
    const translated = this.translate(message, params);
    const output = this.buildLogOutput(translated, params);
    console.error(...output);
  }

  /**
   * 调试日志 - 仅在开发环境输出
   */
  debug(message: string, params?: LogParams): void {
    if (process.env.NODE_ENV === 'development') {
      const translated = this.translate(message, params);
      const output = this.buildLogOutput(translated, params);
      console.log('[DEBUG]', ...output);
    }
  }
}

/**
 * 导出单例
 */
export const logger = new Logger();

/**
 * 默认导出
 */
export default logger;
