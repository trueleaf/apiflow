import { ElMessage } from 'element-plus'
import type { MessageOptions as ElMessageOptions, MessageHandler } from 'element-plus'
import type { VNode } from 'vue'

type MessageType = 'success' | 'warning' | 'info' | 'error'

interface MessageOptions extends Partial<ElMessageOptions> {
  message: string | VNode
  grouping?: boolean
}

class Message {
  private readonly defaultOptions = {
    grouping: true,
  }
  /**
   * 调用 ElMessage 显示消息
   */
  private call(type: MessageType, options: string | MessageOptions): MessageHandler {
    const mergedOptions = typeof options === 'string'
      ? { ...this.defaultOptions, message: options, type }
      : { ...this.defaultOptions, ...options, type }
    return ElMessage(mergedOptions as ElMessageOptions)
  }
  /**
   * 显示成功消息
   */
  success(options: string | MessageOptions): MessageHandler {
    return this.call('success', options)
  }
  /**
   * 显示错误消息
   */
  error(options: string | MessageOptions): MessageHandler {
    return this.call('error', options)
  }
  /**
   * 显示警告消息
   */
  warning(options: string | MessageOptions): MessageHandler {
    return this.call('warning', options)
  }
  /**
   * 显示信息消息
   */
  info(options: string | MessageOptions): MessageHandler {
    return this.call('info', options)
  }
  /**
   * 关闭所有消息
   */
  closeAll(): void {
    ElMessage.closeAll()
  }
}

export const message = new Message()
