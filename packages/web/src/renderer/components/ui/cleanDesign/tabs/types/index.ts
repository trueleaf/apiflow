import { ComputedRef, VNode, Slots } from 'vue'

export interface TabPane {
  uid: number
  name: string
  label: string
  disabled?: boolean
}

export interface TabsContext {
  registerPane: (pane: TabPane) => void
  unregisterPane: (uid: number) => void
  activeTabName: ComputedRef<string>
}

export interface CleanTabsProps {
  modelValue?: string
  class?: string
  type?: 'card' | ''
}

export interface CleanTabsEmits {
  'update:modelValue': (value: string) => void
  'tab-click': (pane: TabPane, event: Event) => void
  'tab-change': (name: string) => void
}

export interface CleanTabPaneProps {
  name: string
  label?: string
  disabled?: boolean
}

export interface CleanTabsSlots extends Slots {
  default?: () => VNode[]
  [key: string]: ((props?: any) => VNode[]) | undefined
}