<template>
  <div class="matched-document-list">
    <div 
      v-for="(doc, index) in documents" 
      :key="doc._id" 
      class="doc-item"
      :class="{ 'has-border': index > 0 }"
      @click="handleDocClick(doc)"
    >
      <div class="doc-header d-flex a-center">
        <el-tag :type="getMethodTagType(doc.method)" size="small" class="method-tag">
          {{ doc.method }}
        </el-tag>
        <div class="doc-url ml-2 flex-1 text-ellipsis">
          <SearchHighlight :text="doc.url" :keyword="keyword" />
        </div>
      </div>
      <div class="doc-info mt-1 gray-600 f-sm">
        <div v-if="isFieldMatched(doc, MatchedFieldType.DocumentName)" class="info-item">
          <span>{{ $t("文档名") }}:</span>
          <SearchHighlight :text="doc.name" :keyword="keyword" />
        </div>
        <div v-if="isFieldMatched(doc, MatchedFieldType.Creator)" class="info-item">
          <span>{{ $t("创建者") }}:</span>
          <SearchHighlight :text="doc.creator" :keyword="keyword" />
        </div>
        <div v-if="isFieldMatched(doc, MatchedFieldType.Maintainer)" class="info-item">
          <span>{{ $t("修改人") }}:</span>
          <SearchHighlight :text="doc.maintainer" :keyword="keyword" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MatchedDocument } from '@src/types';
import { MatchedFieldType } from '@src/types';
import SearchHighlight from '@/components/common/searchHighlight/SearchHighlight.vue';
const props = defineProps<{
  documents: MatchedDocument[];
  keyword: string;
  projectId: string;
}>();
const emit = defineEmits<{
  docClick: [docId: string, projectId: string]
}>();
//获取请求方法标签类型
const getMethodTagType = (method: string): 'success' | 'info' | 'warning' | 'danger' | 'primary' => {
  const methodUpper = method.toUpperCase();
  switch (methodUpper) {
    case 'GET':
      return 'success';
    case 'POST':
      return 'primary';
    case 'PUT':
      return 'warning';
    case 'DELETE':
      return 'danger';
    default:
      return 'info';
  }
};
//判断字段是否匹配
const isFieldMatched = (doc: MatchedDocument, field: MatchedFieldType): boolean => {
  return doc.matchedFields.includes(field);
};
//处理文档点击
const handleDocClick = (doc: MatchedDocument) => {
  emit('docClick', doc._id, props.projectId);
};
</script>

<style lang='scss' scoped>
.matched-document-list {
  .doc-item {
    padding: 8px 0;
    cursor: pointer;
    transition: background-color 0.2s;
    &.has-border {
      border-top: 1px solid var(--gray-100);
    }
    &:hover {
      background-color: var(--gray-50);
      border-radius: 4px;
      padding-left: 8px;
      padding-right: 8px;
    }
    .method-tag {
      font-weight: 600;
      min-width: 50px;
      text-align: center;
    }
    .doc-url {
      color: var(--primary-color);
      font-family: monospace;
    }
    .doc-info {
      margin-left: 60px;
      .info-item {
        margin-top: 4px;
        span {
          margin-right: 4px;
        }
      }
    }
  }
}
</style>
