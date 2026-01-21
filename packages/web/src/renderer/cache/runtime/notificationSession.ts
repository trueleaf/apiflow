const NOTIFICATION_DISMISSED_KEY = 'runtime/notification_dismissed_map'
//获取通知关闭状态映射
const getDismissedMap = (): Record<string, boolean> => {
  try {
    const raw = sessionStorage.getItem(NOTIFICATION_DISMISSED_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}
//保存通知关闭状态映射
const saveDismissedMap = (map: Record<string, boolean>) => {
  sessionStorage.setItem(NOTIFICATION_DISMISSED_KEY, JSON.stringify(map))
}
//检查通知是否已关闭
export const isNotificationDismissed = (notificationId: string): boolean => {
  const map = getDismissedMap()
  return Boolean(map[notificationId])
}
//设置通知关闭状态
export const setNotificationDismissed = (notificationId: string, dismissed: boolean) => {
  const map = getDismissedMap()
  if (dismissed) {
    map[notificationId] = true
  } else {
    delete map[notificationId]
  }
  saveDismissedMap(map)
}
//清除特定通知的关闭状态
export const clearNotificationDismissed = (notificationId: string) => {
  const map = getDismissedMap()
  delete map[notificationId]
  saveDismissedMap(map)
}
//清除所有通知的关闭状态
export const clearAllNotificationDismissed = () => {
  sessionStorage.removeItem(NOTIFICATION_DISMISSED_KEY)
}
