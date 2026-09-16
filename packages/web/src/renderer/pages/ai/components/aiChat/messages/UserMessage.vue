<template><article class="ai-user-message"><span>{{ message.text }}</span><button v-if="editable" type="button" :title="t('编辑')" @click="$emit('edit')"><Pencil :size="13" /></button></article></template>
<script setup lang="ts">
import { Pencil } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { PanelUIMessage } from '@src/types/ai'
defineProps<{ message: Extract<PanelUIMessage, { kind: 'user' }>; editable: boolean }>()
defineEmits<{ edit: [] }>()
const { t } = useI18n()
</script>
<style scoped>
.ai-user-message { display: flex; align-items: flex-start; gap: 7px; align-self: flex-end; max-width: 86%; padding: 9px 12px; border-radius: 10px; background: var(--gray-200); color: var(--gray-900); line-height: 1.55; overflow-wrap: anywhere; white-space: pre-wrap; }
.ai-user-message span { min-width: 0; }
.ai-user-message button { display: inline-flex; padding: 2px; border: 0; background: transparent; color: var(--gray-600); cursor: pointer; }
</style>
