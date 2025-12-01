<template>
  <div class="search-result-item" @click="handleClick">
    <div class="result-header">
      <div class="node-info">
        <component :is="getNodeIcon(item.nodeType)" class="node-icon" :size="16" />
        <span class="node-type-label">{{ getNodeTypeLabel(item.nodeType) }}</span>
        <span class="node-name">{{ item.nodeName }}</span>
        <span v-if="item.method" class="method-tag" :class="`method-${item.method.toLowerCase()}`">{{ item.method }}</span>
      </div>
      <el-tag size="small" type="info" class="project-tag">{{ item.projectName }}</el-tag>
    </div>
    <div class="result-body">
      <div class="match-info">
        <span class="match-label">{{ $t('匹配') }}:</span>
        <span class="match-fields">
          <template v-for="(match, index) in item.matches" :key="index">
            <span class="field-tag">{{ match.fieldLabel }}</span>
            <span v-if="index < item.matches.length - 1" class="separator">|</span>
          </template>
        </span>
      </div>
      <div v-for="(match, index) in displayedMatches" :key="index" class="match-item">
        <span class="field-label">{{ match.fieldLabel }}:</span>
        <ClEmphasize
          :value="match.value"
          :keyword="match.keyword"
          :active-color="'#f60'"
          :background="true"
          class="match-value"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { SearchResultItem } from '@src/types/advancedSearch';
import ClEmphasize from '@/components/common/emphasize/ClEmphasize.vue';
import { FileText, Globe, Server, Folder } from 'lucide-vue-next';
const props = defineProps<{
  item: SearchResultItem;
}>();
const emit = defineEmits<{
  (e: 'click'): void;
}>();
const displayedMatches = computed(() => {
  return props.item.matches.slice(0, 3);
});
const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'http':
      return FileText;
    case 'websocket':
      return Globe;
    case 'httpMock':
      return Server;
    case 'folder':
      return Folder;
    default:
      return FileText;
  }
};
const getNodeTypeLabel = (nodeType: string) => {
  switch (nodeType) {
    case 'http':
      return 'HTTP';
    case 'websocket':
      return 'WebSocket';
    case 'httpMock':
      return 'HTTP Mock';
    case 'folder':
      return '目录';
    default:
      return nodeType;
  }
};
const handleClick = () => {
  emit('click');
};
</script>
<style scoped lang="scss">
.search-result-item {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--el-bg-color);
  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.node-icon {
  flex-shrink: 0;
  color: var(--el-color-primary);
}
.node-type-label {
  flex-shrink: 0;
  font-weight: 600;
  font-size: 12px;
  color: var(--el-color-primary);
}
.node-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.method-tag {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  &.method-get {
    background-color: #61affe;
  }
  &.method-post {
    background-color: #49cc90;
  }
  &.method-put {
    background-color: #fca130;
  }
  &.method-delete {
    background-color: #f93e3e;
  }
  &.method-patch {
    background-color: #50e3c2;
  }
}
.project-tag {
  flex-shrink: 0;
}
.result-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.match-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.match-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}
.match-fields {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.field-tag {
  color: var(--el-color-primary);
  font-size: 12px;
}
.separator {
  color: var(--el-text-color-placeholder);
}
.match-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
}
.field-label {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}
.match-value {
  flex: 1;
  min-width: 0;
  word-break: break-all;
  color: var(--el-text-color-regular);
}
</style>
