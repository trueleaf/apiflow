<template><article ref="answerRef" class="ai-answer-message" :aria-busy="message.streaming"><VueMarkdownRender class="ai-markdown" :source="message.text || '…'" :options="markdownOptions" :plugins="[secureAIMarkdown]" /><div v-if="!message.streaming && message.text" class="ai-answer-actions"><button type="button" :title="t('复制')" @click="copyAnswer"><Copy :size="13" />{{ copied ? t('已复制') : t('复制') }}</button><button v-if="retryable" type="button" :title="t('重试')" @click="$emit('retry')"><RotateCcw :size="13" />{{ t('重试') }}</button></div></article></template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import VueMarkdownRender from 'vue-markdown-render'
import { secureAIMarkdown } from '@/helper/aiMarkdown'
import { Copy, RotateCcw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'assistant' }>; retryable: boolean }>()
defineEmits<{ retry: [] }>()
const { t } = useI18n()
const copied = ref(false)
const answerRef = ref<HTMLElement | null>(null)
const markdownOptions = { html: false, breaks: true, linkify: true }
const copyAnswer = async (): Promise<void> => { await navigator.clipboard.writeText(props.message.text); copied.value = true }
// 限制 Markdown 链接协议并设置安全属性
const secureMarkdownLinks = async (): Promise<void> => {
  await nextTick()
  for (const link of answerRef.value?.querySelectorAll<HTMLAnchorElement>('.ai-markdown a') ?? []) {
    const href = link.getAttribute('href') ?? ''
    let safe = false
    try { safe = ['http:', 'https:', 'mailto:'].includes(new URL(href, window.location.href).protocol) } catch { safe = false }
    if (!safe) link.removeAttribute('href')
    else { link.target = '_blank'; link.rel = 'noopener noreferrer' }
  }
}
watch(() => props.message.text, () => { void secureMarkdownLinks() }, { immediate: true })
</script>
<style scoped>
.ai-answer-message { width: 100%; color: var(--gray-900); font-size: 14px; line-height: 24px; overflow-wrap: anywhere; }
.ai-markdown :deep(a) { color: var(--theme-color); }
.ai-markdown :deep(> :first-child) { margin-top: 0; }
.ai-markdown :deep(> :last-child) { margin-bottom: 0; }
.ai-markdown :deep(pre) { overflow: auto; padding: 10px; border: 1px solid var(--gray-300); border-radius: 7px; background: var(--gray-100); }
.ai-markdown :deep(code) { font-size: 0.92em; }
.ai-markdown :deep(table) { display: block; max-width: 100%; overflow: auto; border-collapse: collapse; }
.ai-markdown :deep(td), .ai-markdown :deep(th) { padding: 5px 7px; border: 1px solid var(--gray-300); }
.ai-markdown :deep(a:not([href])) { color: var(--gray-600); text-decoration: line-through; cursor: not-allowed; }
.ai-answer-actions { display: flex; gap: 5px; margin-top: 7px; }
.ai-answer-actions button { display: inline-flex; align-items: center; gap: 4px; padding: 3px 6px; border: 0; border-radius: 5px; background: transparent; color: var(--gray-600); cursor: pointer; }
.ai-answer-actions button:hover { background: var(--gray-100); color: var(--gray-800); }
</style>
