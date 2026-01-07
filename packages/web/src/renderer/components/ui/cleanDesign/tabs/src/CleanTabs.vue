<template>
  <div
    :class="[
      'clean-tabs',
      customClass,
      {
        'clean-tabs--card': type === 'card',
        'clean-tabs--small': size === 'small'
      }
    ]"
  >
    <div class="clean-tabs__header">
      <div
        v-for="(pane, index) in tabPanes"
        :key="pane.name || index"
        :class="[
          'clean-tabs__item',
          {
            'is-active': activeTabName === pane.name,
            'is-disabled': pane.disabled
          }
        ]"
        @click="handleTabClick(pane.name, pane)"
      >
        <slot v-if="$slots[`label-${pane.name}`]" :name="`label-${pane.name}`" :pane="pane" :index="index" />
        <template v-else>{{ pane.label }}</template>
      </div>
    </div>
    <div :class="['clean-tabs__content', { 'has-content': hasContent }]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import '../style/index.css'
import type { TabPane, TabsContext } from '../types'

const props = withDefaults(defineProps<{
  modelValue?: string
  class?: string
  type?: 'card' | ''
  size?: 'normal' | 'small'
}>(), {
  modelValue: '',
  class: '',
  type: '',
  size: 'normal'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'tab-click': [pane: TabPane, event: Event]
  'tab-change': [name: string]
}>()

const customClass = computed(() => props.class)
const tabPanes = ref<TabPane[]>([])
const activeTabName = ref(props.modelValue || '')
const hasContent = ref(false)

const registerPane = (pane: TabPane) => {
  tabPanes.value.push(pane)
  if (!activeTabName.value && tabPanes.value.length === 1) {
    activeTabName.value = pane.name
    emit('update:modelValue', pane.name)
  }
}
const updateHasContent = (hasSlotContent: boolean) => {
  hasContent.value = hasSlotContent
}
const unregisterPane = (uid: number) => {
  const index = tabPanes.value.findIndex((pane: TabPane) => pane.uid === uid)
  if (index !== -1) {
    tabPanes.value.splice(index, 1)
  }
}
const updatePane = (uid: number, updates: Partial<Pick<TabPane, 'label' | 'disabled'>>) => {
  const pane = tabPanes.value.find((p: TabPane) => p.uid === uid)
  if (pane) {
    Object.assign(pane, updates)
  }
}
const handleTabClick = (paneName: string, pane: TabPane) => {
  if (pane.disabled) return
  if (activeTabName.value !== paneName) {
    activeTabName.value = paneName
    emit('update:modelValue', paneName)
    emit('tab-change', paneName)
  }
  emit('tab-click', pane, new Event('click'))
}

watch(() => props.modelValue, (newValue) => {
  if (newValue !== activeTabName.value) {
    activeTabName.value = newValue || ''
  }
}, { immediate: true })

const tabsContext: TabsContext = {
  registerPane,
  unregisterPane,
  updatePane,
  activeTabName: computed(() => activeTabName.value),
  updateHasContent
}

provide('cleanTabsContext', tabsContext)
</script>
