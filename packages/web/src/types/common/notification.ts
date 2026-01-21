import type { Component } from 'vue'

export type BannerNotificationType = 'quick-login' | 'bind-email'

export type BannerNotificationData = {
  extraMessage?: string
  extraActionText?: string
  extraOnAction?: () => void
}

export type BannerNotification = {
  id: string
  type: BannerNotificationType
  message: string
  icon?: Component
  actionText?: string
  onAction?: () => void
  closeable: boolean
  variant?: 'info' | 'warning' | 'success' | 'error'
  data?: BannerNotificationData
}
