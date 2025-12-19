<template>
  <div class="markdown-toolbar">
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('bold') }"
      :title="`${t('加粗')} (Ctrl+B)`"
      @click="editor.chain().focus().toggleBold().run()"
    >
      <Bold :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('italic') }"
      :title="`${t('斜体')} (Ctrl+I)`"
      @click="editor.chain().focus().toggleItalic().run()"
    >
      <Italic :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('strike') }"
      :title="`${t('删除线')} (Ctrl+Shift+X)`"
      @click="editor.chain().focus().toggleStrike().run()"
    >
      <Strikethrough :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('code') }"
      :title="`${t('行内代码')} (Ctrl+E)`"
      @click="editor.chain().focus().toggleCode().run()"
    >
      <Code :size="16" />
    </button>
    
    <span class="toolbar-divider"></span>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      :title="t('一级标题')"
      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
    >
      <Heading1 :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      :title="t('二级标题')"
      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      <Heading2 :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
      :title="t('三级标题')"
      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
    >
      <Heading3 :size="16" />
    </button>
    
    <span class="toolbar-divider"></span>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('bulletList') }"
      :title="t('无序列表')"
      @click="editor.chain().focus().toggleBulletList().run()"
    >
      <List :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('orderedList') }"
      :title="t('有序列表')"
      @click="editor.chain().focus().toggleOrderedList().run()"
    >
      <ListOrdered :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('taskList') }"
      :title="t('任务列表')"
      @click="editor.chain().focus().toggleTaskList().run()"
    >
      <ListTodo :size="16" />
    </button>
    
    <span class="toolbar-divider"></span>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('codeBlock') }"
      :title="t('代码块')"
      @click="editor.chain().focus().toggleCodeBlock().run()"
    >
      <CodeSquare :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('blockquote') }"
      :title="t('引用块')"
      @click="editor.chain().focus().toggleBlockquote().run()"
    >
      <Quote :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :title="t('水平分割线')"
      @click="editor.chain().focus().setHorizontalRule().run()"
    >
      <Minus :size="16" />
    </button>
    
    <span class="toolbar-divider"></span>
    
    <button
      type="button"
      class="toolbar-btn"
      :class="{ 'is-active': editor.isActive('link') }"
      :title="`${t('链接')} (Ctrl+K)`"
      data-testid="markdown-toolbar-link-btn"
      @click="handleLink"
    >
      <Link2 :size="16" />
    </button>
    
    <button
      type="button"
      class="toolbar-btn"
      :title="t('清除格式')"
      @click="editor.chain().focus().clearNodes().unsetAllMarks().run()"
    >
      <RemoveFormatting :size="16" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { Editor } from '@tiptap/vue-3'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  CodeSquare,
  Quote,
  Minus,
  Link2,
  RemoveFormatting
} from 'lucide-vue-next'

const props = defineProps<{
  editor: Editor
}>()

const { t } = useI18n()

const handleLink = () => {
  const previousUrl = props.editor.getAttributes('link').href
  const url = window.prompt(t('请输入链接地址'), previousUrl)
  
  if (url === null) {
    return
  }
  
  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  
  props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<style scoped>
.markdown-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 50px;
  padding: 8px;
  background: var(--el-fill-color-blank);
  border-bottom: 1px solid var(--el-border-color);
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--el-text-color-primary);
  transition: all 0.2s;
  padding: 0;
}

.toolbar-btn:hover {
  background: var(--el-fill-color-light);
}

.toolbar-btn.is-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.toolbar-btn:active {
  transform: scale(0.95);
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--el-border-color);
  margin: 0 4px;
}
</style>
