<template>
  <div class="message-item message-text-response">
    <div class="message-avatar">
      <Bot :size="20" />
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="markdown-content">
          <VueMarkdownRender :source="message.content" :options="markdownOptions" :plugins="[customTagsPlugin]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'
import type MarkdownIt from 'markdown-it'
import type { TextResponseMessage } from '@src/types/ai'

defineProps<{
  message: TextResponseMessage
}>()

const markdownOptions = {
  html: true,
  breaks: true,
  linkify: true
}

// AI 响应中允许的自定义标签白名单
const allowedTags = ['todo_plan', 'current_step', 'thinking', 'result', 'context', 'instruction']
// 处理自定义标签，将白名单标签转换为带样式类的 div，非白名单标签转义
const processCustomTags = (html: string, escapeHtml: (str: string) => string): string => {
  return html.replace(/<\/?(\w+)([^>]*)>/g, (match, tagName, attrs) => {
    const lowerTag = tagName.toLowerCase()
    if (allowedTags.includes(lowerTag)) {
      const isClosing = match.startsWith('</')
      return isClosing ? '</div>' : `<div class="ai-tag ai-tag-${lowerTag}">`
    }
    return escapeHtml(match)
  })
}
// markdown-it 插件：处理自定义 HTML 标签
const customTagsPlugin = (md: MarkdownIt) => {
  md.renderer.rules.html_block = (tokens, idx) => {
    return processCustomTags(tokens[idx].content, md.utils.escapeHtml)
  }
  md.renderer.rules.html_inline = (tokens, idx) => {
    return processCustomTags(tokens[idx].content, md.utils.escapeHtml)
  }
}
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 8px;
  animation: messageSlideIn 0.3s ease-out;
}
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.message-text-response {
  justify-content: flex-start;
}
.message-text-response .message-content {
  max-width: 80%;
}
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ai-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ai-text-secondary);
}
.message-bubble {
  padding: 5px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
}
.message-text-response .message-bubble {
  background: var(--ai-bubble-ai-bg);
  color: var(--ai-bubble-ai-text);
  border-top-left-radius: 4px;
}
.markdown-content {
  position: relative;
  line-height: 1.6;
  font-size: 13px;
}
.markdown-content :deep(*) {
  max-width: 100%;
}
.markdown-content :deep(h1),
.markdown-content h1 {
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: 600;
  line-height: 1.25;
  font-size: 1.2em;
  border-bottom: 1px solid var(--ai-hr-border);
  padding-bottom: 6px;
}
.markdown-content :deep(h2),
.markdown-content h2 {
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: 600;
  line-height: 1.25;
  font-size: 1.15em;
  border-bottom: 1px solid var(--ai-hr-border);
  padding-bottom: 4px;
}
.markdown-content :deep(h3),
.markdown-content h3 {
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: 600;
  line-height: 1.25;
  font-size: 1.1em;
}
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6),
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: 600;
  line-height: 1.25;
  font-size: 1em;
}
.markdown-content :deep(p),
.markdown-content p {
  margin-top: 0;
  margin-bottom: 10px;
}
.markdown-content :deep(p:last-child),
.markdown-content p:last-child {
  margin-bottom: 0;
}
.markdown-content :deep(ul),
.markdown-content :deep(ol),
.markdown-content ul,
.markdown-content ol {
  margin-top: 0;
  margin-bottom: 10px;
  padding-left: 24px;
}
.markdown-content :deep(li),
.markdown-content li {
  margin-bottom: 4px;
}
.markdown-content :deep(code),
.markdown-content code {
  background: var(--ai-code-bg);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
.markdown-content :deep(pre),
.markdown-content pre {
  background: var(--ai-code-block-bg);
  color: var(--ai-code-block-text);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin-top: 0;
  margin-bottom: 10px;
}
.markdown-content :deep(pre code),
.markdown-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
}
.markdown-content :deep(blockquote),
.markdown-content blockquote {
  margin: 10px 0;
  padding-left: 16px;
  border-left: 4px solid var(--ai-blockquote-border);
  color: var(--ai-blockquote-text);
}
.markdown-content :deep(a),
.markdown-content a {
  color: var(--theme-color);
  text-decoration: none;
}
.markdown-content :deep(a:hover),
.markdown-content a:hover {
  text-decoration: underline;
}
.markdown-content :deep(strong),
.markdown-content strong {
  font-weight: 600;
}
.markdown-content :deep(em),
.markdown-content em {
  font-style: italic;
}
.markdown-content :deep(table),
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
  font-size: 13px;
}
.markdown-content :deep(table th),
.markdown-content :deep(table td),
.markdown-content table th,
.markdown-content table td {
  border: 1px solid var(--ai-table-border);
  padding: 8px 12px;
  text-align: left;
}
.markdown-content :deep(table th),
.markdown-content table th {
  background: var(--ai-table-header-bg);
  font-weight: 600;
}
.markdown-content :deep(hr),
.markdown-content hr {
  border: none;
  border-top: 1px solid var(--ai-hr-border);
  margin: 14px 0;
}
.markdown-content :deep(img),
.markdown-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px 0;
}
.markdown-content :deep(.ai-tag),
.markdown-content .ai-tag {
  border-radius: 6px;
  padding: 10px 12px;
  margin: 8px 0;
  font-size: 12px;
}
.markdown-content :deep(.ai-tag-todo_plan),
.markdown-content .ai-tag-todo_plan {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
}
.markdown-content :deep(.ai-tag-current_step),
.markdown-content .ai-tag-current_step {
  background: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #22c55e;
}
.markdown-content :deep(.ai-tag-thinking),
.markdown-content .ai-tag-thinking {
  background: rgba(168, 85, 247, 0.1);
  border-left: 3px solid #a855f7;
}
.markdown-content :deep(.ai-tag-result),
.markdown-content .ai-tag-result {
  background: rgba(249, 115, 22, 0.1);
  border-left: 3px solid #f97316;
}
.markdown-content :deep(.ai-tag-context),
.markdown-content .ai-tag-context {
  background: rgba(107, 114, 128, 0.1);
  border-left: 3px solid #6b7280;
}
.markdown-content :deep(.ai-tag-instruction),
.markdown-content .ai-tag-instruction {
  background: rgba(236, 72, 153, 0.1);
  border-left: 3px solid #ec4899;
}
</style>
