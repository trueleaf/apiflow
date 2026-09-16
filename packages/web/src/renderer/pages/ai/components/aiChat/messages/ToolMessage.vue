<template>
  <article class="ai-tool-message" :class="`is-${message.state}`">
    <button class="ai-tool-summary" type="button" :aria-expanded="expanded" @click="expanded = !expanded">
      <component :is="statusIcon" :size="14" />
      <span>{{ te(message.title) ? t(message.title) : message.title }}</span>
      <code>{{ message.toolName }}</code>
      <small>{{ stateLabel }}</small>
      <ChevronDown v-if="expanded" :size="13" />
      <ChevronRight v-else :size="13" />
    </button>
    <div v-if="expanded" class="ai-tool-details">
      <div v-if="message.target"><strong>{{ t('目标') }}</strong><code>{{ message.target }}</code></div>
      <div><strong>{{ t('来源') }}</strong><span>{{ message.source }}</span></div>
      <div v-if="message.input"><strong>{{ t('参数') }}</strong><pre>{{ formatValue(message.input) }}</pre></div>
      <div v-else-if="message.streamText"><strong>{{ t('参数') }}</strong><pre>{{ message.streamText }}</pre></div>
      <div v-if="message.output !== undefined"><strong>{{ t('结果') }}</strong><pre>{{ formatValue(message.output) }}</pre></div>
      <div v-if="message.error"><strong>{{ t('错误') }}</strong><p>{{ te(message.error) ? t(message.error) : message.error }}</p></div>
      <div v-if="message.changeSetId"><strong>ChangeSet</strong><code>{{ message.changeSetId }}</code></div>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CheckCircle2, ChevronDown, ChevronRight, CircleSlash2, LoaderCircle, MessageCircleReply, XCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
const props = defineProps<{ message: Extract<PanelUIMessage, { kind: 'tool' }> }>()
const { t, te } = useI18n()
const expanded = ref(props.message.state === 'created' || props.message.state === 'running' || props.message.state === 'error')
const statusIcon = computed(() => props.message.state === 'success' ? CheckCircle2 : props.message.state === 'denied' ? CircleSlash2 : props.message.state === 'responded' ? MessageCircleReply : props.message.state === 'error' ? XCircle : LoaderCircle)
const stateLabel = computed(() => ({ created: t('已创建'), running: t('运行中'), success: t('已完成'), denied: t('已拒绝'), responded: t('已响应'), error: t('运行失败') })[props.message.state])
const formatValue = (value: unknown): string => typeof value === 'string' ? value : JSON.stringify(value, null, 2)
watch(() => props.message.state, state => { if (state === 'success') expanded.value = false; if (state === 'error') expanded.value = true })
</script>
<style scoped>
.ai-tool-message { width: 100%; border: 1px solid var(--ai-tool-border); border-radius: 7px; background: var(--gray-100); color: var(--gray-700); font-size: 12px; }
.ai-tool-summary { display: grid; width: 100%; grid-template-columns: auto minmax(0, 1fr) auto auto auto; align-items: center; gap: 7px; padding: 8px 10px; border: 0; background: transparent; color: inherit; cursor: pointer; text-align: left; }
.ai-tool-summary span { overflow: hidden; color: var(--gray-800); font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.ai-tool-summary code { color: var(--gray-600); }
.ai-tool-summary small { color: var(--gray-600); }
.ai-tool-details { display: grid; gap: 8px; padding: 0 10px 10px 31px; }
.ai-tool-details strong { display: block; margin-bottom: 3px; }
.ai-tool-details pre { max-height: 180px; margin: 0; padding: 7px; overflow: auto; border-radius: 5px; background: var(--gray-200); white-space: pre-wrap; }
.ai-tool-details p { margin: 0; color: var(--el-color-danger); }
.is-success svg { color: var(--el-color-success); }
.is-denied svg, .is-error svg { color: var(--el-color-danger); }
.is-responded svg { color: var(--el-color-warning); }
.is-created .ai-tool-summary > svg:first-child, .is-running .ai-tool-summary > svg:first-child { animation: ai-tool-spin 800ms linear infinite; color: var(--theme-color); }
@keyframes ai-tool-spin { to { transform: rotate(360deg); } }
</style>
