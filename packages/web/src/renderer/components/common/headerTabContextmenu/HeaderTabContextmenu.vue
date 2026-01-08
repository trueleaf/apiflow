<template>
  <div v-if="visible" class="header-tab-contextmenu-overlay" data-test-id="header-tab-contextmenu-overlay" @click="handleClose"></div>
  <SContextmenu v-if="visible" data-test-id="header-tab-contextmenu" :left="position.x" :top="position.y">
    <SContextmenuItem data-test-id="header-tab-contextmenu-close" :label="t('关闭')" @click="handleAction('close')"></SContextmenuItem>
    <SContextmenuItem type="divider"></SContextmenuItem>
    <SContextmenuItem data-test-id="header-tab-contextmenu-close-left" :label="t('关闭左侧')" :disabled="!hasLeft" @click="handleAction('closeLeft')"></SContextmenuItem>
    <SContextmenuItem data-test-id="header-tab-contextmenu-close-right" :label="t('关闭右侧')" :disabled="!hasRight" @click="handleAction('closeRight')"></SContextmenuItem>
    <SContextmenuItem data-test-id="header-tab-contextmenu-close-other" :label="t('关闭其他')" :disabled="!hasOther" @click="handleAction('closeOther')"></SContextmenuItem>
    <SContextmenuItem data-test-id="header-tab-contextmenu-close-all" :label="t('全部关闭')" :disabled="!hasAny" @click="handleAction('closeAll')"></SContextmenuItem>
  </SContextmenu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AnchorRect } from '@src/types/common'
import type { AppWorkbenchHeaderTabContextAction } from '@src/types/appWorkbench/appWorkbenchType'
import SContextmenu from '@/components/common/contextmenu/ClContextmenu.vue'
import SContextmenuItem from '@/components/common/contextmenu/ClContextmenuItem.vue'

withDefaults(defineProps<{
  visible: boolean
  position: AnchorRect
  hasLeft: boolean
  hasRight: boolean
  hasOther: boolean
  hasAny: boolean
}>(), {
  visible: false,
  position: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  hasLeft: false,
  hasRight: false,
  hasOther: false,
  hasAny: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'action', action: AppWorkbenchHeaderTabContextAction): void
}>()

const { t } = useI18n()
const handleClose = () => emit('close')
const handleAction = (action: AppWorkbenchHeaderTabContextAction) => {
  emit('action', action)
  emit('close')
}
</script>

<style scoped>
.header-tab-contextmenu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zIndex-header);
  background: transparent;
}
</style>
