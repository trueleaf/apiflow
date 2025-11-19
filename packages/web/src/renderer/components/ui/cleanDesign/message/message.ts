import { createVNode, render } from 'vue'
import type { MessageOptions, MessageResult } from '@src/types/components/components'
import MessageComponent from './Message.vue'

interface MessageInstanceInternal {
  id: string
  container: HTMLDivElement
  close: () => void
  promise: Promise<MessageResult>
  resolve: (value: MessageResult) => void
  reject: () => void
}

const instances: MessageInstanceInternal[] = []
let seed = 0
const baseZIndex = 2000
const getZIndex = (index: number) => baseZIndex + index * 2
const showMessage = (options: MessageOptions): Promise<MessageResult> => {
  const id = `message-${seed++}`
  const container = document.createElement('div')
  document.body.appendChild(container)
  return new Promise<MessageResult>((resolve, reject) => {
    let closed = false
    const close = () => {
      if (closed) return
      closed = true
      const index = instances.findIndex(item => item.id === id)
      if (index !== -1) {
        instances.splice(index, 1)
      }
      render(null, container)
      document.body.removeChild(container)
    }
    const handleConfirm = (checked: boolean) => {
      resolve({ checked })
      close()
    }
    const handleCancel = () => {
      reject()
      close()
    }
    const handleClose = () => {
      close()
    }
    const currentIndex = instances.length
    const zIndex = getZIndex(currentIndex)
    const vnode = createVNode(MessageComponent, {
      visible: true,
      title: options.title,
      message: options.message,
      type: options.type,
      showCheckbox: options.showCheckbox,
      checkboxText: options.checkboxText,
      confirmButtonText: options.confirmButtonText,
      cancelButtonText: options.cancelButtonText,
      showCancel: options.showCancel,
      zIndex,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      onClose: handleClose,
    })
    render(vnode, container)
    const instance: MessageInstanceInternal = {
      id,
      container,
      close,
      promise: Promise.resolve({ checked: false }),
      resolve,
      reject,
    }
    instances.push(instance)
  })
}
const closeAll = () => {
  instances.forEach(instance => instance.close())
}
export { showMessage, closeAll }
