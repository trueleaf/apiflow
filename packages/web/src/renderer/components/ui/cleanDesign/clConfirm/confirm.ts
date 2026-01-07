import { createVNode, render } from 'vue'
import type { ConfirmOptions, ConfirmResult } from '@src/types/components/components'
import ClConfirmComponent from './ClConfirm.vue'

type ConfirmInstanceInternal = {
  id: string
  container: HTMLDivElement
  close: () => void
  promise: Promise<ConfirmResult>
  resolve: (value: ConfirmResult) => void
  reject: () => void
}

const instances: ConfirmInstanceInternal[] = []
let seed = 0
const baseZIndex = 2000
const getZIndex = (index: number) => baseZIndex + index * 2
const showConfirm = (options: ConfirmOptions): Promise<ConfirmResult> => {
  const id = `confirm-${seed++}`
  const container = document.createElement('div')
  document.body.appendChild(container)
  return new Promise<ConfirmResult>((resolve) => {
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
      resolve({ confirmed: true, checked })
      close()
    }
    const handleCancel = () => {
      resolve({ confirmed: false, checked: false })
      close()
    }
    const currentIndex = instances.length
    const zIndex = getZIndex(currentIndex)
    const vnode = createVNode(ClConfirmComponent, {
      visible: true,
      zIndex,
      ...options,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      onClose: close,
    })
    render(vnode, container)
    instances.push({
      id,
      container,
      close,
      promise: Promise.resolve({ confirmed: false, checked: false }),
      resolve,
      reject: () => {},
    })
  })
}
const closeAll = () => {
  instances.forEach(instance => instance.close())
}

export { showConfirm, closeAll }
