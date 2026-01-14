<template>
  <div
    v-if="visible"
    class="user-dropdown-menu"
    data-test-id="user-menu"
    :style="menuStyle"
    @click.stop
    role="menu"
  >
    <div
      class="user-menu-item"
      data-test-id="user-menu-logout-btn"
      role="menuitem"
      tabindex="0"
      @click="handleLogout"
      @keydown.enter="handleLogout"
      @keydown.space.prevent="handleLogout"
    >
      <LogOut class="user-menu-icon" :size="14" />
      <span class="user-menu-text">{{ t('退出登录') }}</span>
    </div>
  </div>

  <div
    v-if="visible"
    class="user-menu-overlay"
    data-test-id="user-menu-overlay"
    @click="handleClose"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LogOut } from 'lucide-vue-next'
import type { AnchorRect } from '@src/types/common'

const props = withDefaults(defineProps<{
  visible: boolean
  position: AnchorRect
}>(), {
  visible: false,
  position: () => ({ x: 0, y: 0, width: 0, height: 0 })
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'logout'): void
}>()

const { t } = useI18n()

const menuStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${props.position.x}px`,
  top: `${props.position.y + 2}px`,
  zIndex: '9999'
}))

const handleLogout = () => {
  emit('logout')
  emit('close')
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.user-dropdown-menu {
  background: var(--bg-primary);
  border: 1px solid var(--border-gray-400);
  border-radius: 8px;
  box-shadow:
    0 8px 24px var(--shadow-xl),
    0 0 1px var(--shadow-sm);
  min-width: 160px;
  padding: 6px 0;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  backdrop-filter: blur(10px);
}

.user-menu-icon {
  margin-right: 8px;
  flex: 0 0 auto;
}

.user-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  color: var(--text-primary);
  position: relative;
  margin: 0 4px;
  border-radius: 4px;
}

.user-menu-item:hover {
  background-color: var(--bg-gray-100);
}

.user-menu-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
}

.user-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--zIndex-language);
  background: transparent;
}
</style>
