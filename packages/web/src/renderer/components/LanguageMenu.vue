<template>
  <!-- 语言切换下拉菜单 -->
  <div
    v-if="visible"
    class="language-dropdown-menu"
    :style="menuStyle"
    @click.stop
    role="menu"
    aria-label="语言选择菜单"
  >
    <div
      v-for="language in languages"
      :key="language.code"
      class="language-menu-item"
      :class="{ active: currentLanguage === language.code }"
      @click="handleLanguageSelect(language.code)"
      role="menuitem"
      :aria-selected="currentLanguage === language.code"
      tabindex="0"
      @keydown.enter="handleLanguageSelect(language.code)"
      @keydown.space.prevent="handleLanguageSelect(language.code)"
    >
      <span class="language-flag">{{ language.flag }}</span>
      <span class="language-name">{{ language.name }}</span>
      <span v-if="currentLanguage === language.code" class="language-check">✓</span>
    </div>
  </div>

  <!-- 点击外部区域关闭菜单的遮罩 -->
  <div
    v-if="visible"
    class="language-menu-overlay"
    @click="handleClose"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { changeLanguage } from '@src/renderer/i18n/i18n'
import { Language } from '@src/types/global'

// Props 定义
interface Props {
  visible: boolean
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  currentLanguage: Language
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  currentLanguage: 'zh-cn'
})

// Events 定义
interface Emits {
  languageSelect: [language: Language]
  close: []
}

const emit = defineEmits<Emits>()

// 支持的语言列表
const languages = [
  { code: 'zh-cn' as Language, name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-tw' as Language, name: '繁體中文', flag: '🇹🇼' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
]

// 计算菜单样式 - 绝对定位到按钮下方
const menuStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${props.position.x}px`,
  top: `${props.position.y + 2}px`, // 添加2px间距
  zIndex: '9999'
}))

// 处理语言选择
const handleLanguageSelect = (language: Language) => {
  changeLanguage(language)
  emit('languageSelect', language)
  emit('close')
}

// 处理菜单关闭
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* VSCode 风格的语言切换下拉菜单样式 */
.language-dropdown-menu {
  background: var(--white);
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  box-shadow: 
    0 8px 24px rgba(140, 149, 159, 0.2),
    0 0 1px rgba(140, 149, 159, 0.05);
  min-width: 160px;
  padding: 6px 0;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  backdrop-filter: blur(10px);
}


.language-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  color: #24292f;
  position: relative;
  margin: 0 4px;
  border-radius: 4px;
}

.language-menu-item:hover {
  background-color: #f6f8fa;
}

.language-menu-item.active {
  background-color: #dbeafe;
  color: #1e40af;
  font-weight: 500;
}

.language-menu-item.active::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background-color: #3b82f6;
  border-radius: 2px;
}

.language-menu-item.active:hover {
  background-color: #bfdbfe;
}

.language-flag {
  font-size: 16px;
  margin-right: 10px;
  display: inline-block;
  width: 20px;
  text-align: center;
}

.language-name {
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
}

.language-check {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 600;
  margin-left: 8px;
}

.language-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: transparent;
}
</style>
