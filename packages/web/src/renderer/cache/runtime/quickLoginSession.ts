import type { QuickLoginCredential } from '@src/types/security/quickLogin'

const credentialKey = 'runtime/quickLoginCredential'
const dismissedKey = 'runtime/quickLoginDismissed'

export const getQuickLoginCredential = (): QuickLoginCredential | null => {
  try {
    const raw = sessionStorage.getItem(credentialKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { loginName?: string; password?: string }
    if (!parsed.loginName || !parsed.password) return null
    return { loginName: parsed.loginName, password: parsed.password }
  } catch {
    sessionStorage.removeItem(credentialKey)
    return null
  }
}
export const setQuickLoginCredential = (credential: QuickLoginCredential) => {
  sessionStorage.setItem(credentialKey, JSON.stringify(credential))
}
export const clearQuickLoginCredential = () => {
  sessionStorage.removeItem(credentialKey)
}
export const getQuickLoginTipDismissed = (): boolean => {
  try {
    return sessionStorage.getItem(dismissedKey) === '1'
  } catch {
    return false
  }
}
export const setQuickLoginTipDismissed = (dismissed: boolean) => {
  if (dismissed) {
    sessionStorage.setItem(dismissedKey, '1')
    return
  }
  sessionStorage.removeItem(dismissedKey)
}
export const clearQuickLoginTipDismissed = () => {
  sessionStorage.removeItem(dismissedKey)
}
