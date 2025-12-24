<template>
  <div class="search-results">
    <Loading :loading="loading">
      <!-- 搜索结果标题 -->
      <div v-if="!loading && results.length > 0" class="results-header">
        <h2 class="results-title">{{ $t('搜索结果') }}</h2>
      </div>
      <!-- 空状态 -->
      <div v-if="!loading && results.length === 0" class="empty-state">
        <el-empty :description="$t('暂无搜索结果')">
         
        </el-empty>
      </div>
      <!-- 结果列表 -->
      <div v-if="!loading && results.length > 0" class="results-list">
        <div v-for="group in results" :key="group.projectId" class="result-group">
          <div class="group-header">
            <span class="group-title">{{ group.projectName }}</span>
            <span class="group-count">{{ $t('共{count}个', { count: group.totalCount }) }}</span>
          </div>
          <div class="group-content">
            <SearchResultItem
              v-for="item in getDisplayedNodes(group)"
              :key="item.nodeId"
              :item="item"
              @click="handleItemClick(item)"
            />
          </div>
          <div v-if="group.hasMore && !isExpanded(group.projectId)" class="load-more">
            <el-button text type="primary" @click="handleLoadMore(group.projectId)">
              {{ $t('查看更多') }} ({{ $t('共{count}个', { count: group.totalCount }) }})
            </el-button>
          </div>
        </div>
      </div>
    </Loading>
  </div>
</template>
<script lang="ts" setup>
import type { GroupedSearchResults, SearchResultItem as ResultItem } from '@src/types/advancedSearch';
import SearchResultItem from './SearchResultItem.vue';
import Loading from '@/components/common/loading/ClLoading.vue';
defineProps<{
  results: GroupedSearchResults[];
  loading: boolean;
}>();
const emit = defineEmits<{
  (e: 'jumpToNode', item: ResultItem): void;
  (e: 'loadMore', projectId: string): void;
}>();
const expandedProjects = ref<Set<string>>(new Set());
const getDisplayedNodes = (group: GroupedSearchResults) => {
  return group.nodes;
};
const isExpanded = (projectId: string) => {
  return expandedProjects.value.has(projectId);
};
const handleItemClick = (item: ResultItem) => {
  emit('jumpToNode', item);
};
const handleLoadMore = (projectId: string) => {
  expandedProjects.value.add(projectId);
  emit('loadMore', projectId);
};
</script>
<style scoped lang="scss">
.search-results {
  margin-top: 16px;
}
.results-header {
  margin-bottom: 16px;
}
.results-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}
.empty-state {
  padding: 40px 0;
}
.results-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.result-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--el-border-color);
}
.group-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.group-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.group-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.load-more {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}
</style>
