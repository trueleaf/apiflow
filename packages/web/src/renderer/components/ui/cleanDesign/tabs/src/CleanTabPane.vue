<template>
  <div
    v-if="isActive"
    class="clean-tab-pane"
    :id="`clean-tab-pane-${name}`"
    role="tabpanel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject, computed, getCurrentInstance, onMounted, onBeforeUnmount, useSlots } from 'vue'
import type { TabsContext } from '../types'

const props = withDefaults(defineProps<{
  name: string
  label?: string
  disabled?: boolean
}>(), {
  label: '',
  disabled: false
})

const instance = getCurrentInstance()
const uid = instance?.uid || 0
const slots = useSlots()
const tabsContext = inject<TabsContext>('cleanTabsContext')

const isActive = computed(() => {
  return tabsContext?.activeTabName.value === props.name
})

onMounted(() => {
  if (tabsContext) {
    tabsContext.registerPane({
      uid,
      name: props.name,
      label: props.label || props.name,
      disabled: props.disabled
    })
    const hasSlotContent = !!slots.default
    tabsContext.updateHasContent(hasSlotContent)
  }
})
onBeforeUnmount(() => {
  if (tabsContext) {
    tabsContext.unregisterPane(uid)
    tabsContext.updateHasContent(false)
  }
})
</script>
