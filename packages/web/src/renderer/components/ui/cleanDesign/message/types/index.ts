export type MessageType = 'info' | 'success' | 'warning' | 'error'

export interface MessageOptions {
  title?: string
  message: string
  type?: MessageType
  showCheckbox?: boolean
  checkboxText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  showCancel?: boolean
  duration?: number
  onConfirm?: (checked: boolean) => void
  onCancel?: () => void
  onClose?: () => void
}

export interface MessageProps {
  visible: boolean
  title?: string
  message: string
  type?: MessageType
  showCheckbox?: boolean
  checkboxText?: string
  confirmButtonText?: string
  cancelButtonText?: string
  showCancel?: boolean
  zIndex?: number
  onConfirm?: (checked: boolean) => void
  onCancel?: () => void
  onClose?: () => void
}

export interface MessageEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', checked: boolean): void
  (e: 'cancel'): void
  (e: 'close'): void
}

export interface MessageResult {
  checked: boolean
}

export interface MessageInstance {
  close: () => void
}
