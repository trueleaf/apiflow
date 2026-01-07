import { createApp, h, Component } from 'vue'
import ClConfirmComponent from './ClConfirm.vue'
import type { ConfirmType } from '@src/types/components/components'

export type ClConfirmOptions = {
  content: string
  title?: string
  type?: ConfirmType
  confirmButtonText?: string
  cancelButtonText?: string
  showCheckbox?: boolean
  checkboxText?: string
  distinguishCancelAndClose?: boolean
}

type ResolveValue = { value: 'confirm' | 'cancel' | 'close'; checked: boolean }

export const ClConfirm = (options: ClConfirmOptions): Promise<ResolveValue> => {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let visible = true
    let app: ReturnType<typeof createApp> | null = null

    const destroy = () => {
      if (app) {
        app.unmount()
        app = null
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }

    const handleConfirm = (checked: boolean) => {
      visible = false
      destroy()
      resolve({ value: 'confirm', checked })
    }

    const handleCancel = () => {
      visible = false
      destroy()
      reject('cancel')
    }

    const handleClose = () => {
      visible = false
      destroy()
      if (options.distinguishCancelAndClose) {
        reject('close')
      } else {
        reject('cancel')
      }
    }

    app = createApp({
      setup() {
        return () => h(ClConfirmComponent as Component, {
          visible: visible,
          title: options.title,
          content: options.content,
          type: options.type || 'info',
          confirmButtonText: options.confirmButtonText,
          cancelButtonText: options.cancelButtonText,
          showCheckbox: options.showCheckbox,
          checkboxText: options.checkboxText,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          'onUpdate:visible': (val: boolean) => {
            if (!val) {
              handleClose()
            }
          }
        })
      }
    })

    app.mount(container)
  })
}
