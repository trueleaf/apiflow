export type ShortcutContext = {
  route: string
  tabType: string
}

export type ShortcutConfig = {
  id: string
  name: string
  defaultKeys: string
  userSetKeys: string
  context: ShortcutContext
  handler: (event: KeyboardEvent) => void
}

export type ShortcutGroup = {
  name: string
  icon?: unknown
  shortcuts: ShortcutConfig[]
}

export type ShortcutConflict = {
  existingShortcut: ShortcutConfig
  keys: string
}

export type UserShortcutSettings = {
  [shortcutId: string]: string
}
