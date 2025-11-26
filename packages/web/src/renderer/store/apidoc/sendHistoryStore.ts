import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sendHistoryCache } from '@/cache/sendHistory/sendHistoryCache';
import type { SendHistoryItem } from '@src/types/history/sendHistory';
import { logger } from '@/helper';
import { useRuntime } from '@/store/runtime/runtimeStore';

export const useSendHistory = defineStore('sendHistory', () => {
  const runtimeStore = useRuntime();
  const sendHistoryList = ref<SendHistoryItem[]>([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const hasLoadedMore = ref(false);
  const pageSize = 30;
  const currentOffset = ref(0);
  const searchKeyword = ref('');

  // 注册回调，当添加新记录时刷新列表
  sendHistoryCache.setOnAddCallback(() => {
    refresh();
  });

  // 加载发送历史列表
  const loadSendHistory = async (): Promise<void> => {
    try {
      loading.value = true;
      currentOffset.value = 0;
      searchKeyword.value = '';
      hasLoadedMore.value = false;
      const list = await sendHistoryCache.getMergedSendHistoryList(pageSize, 0, runtimeStore.networkMode);
      sendHistoryList.value = list;
      hasMore.value = list.length >= pageSize;
    } catch (error) {
      logger.error('加载发送历史失败', { error });
      sendHistoryList.value = [];
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  };

  // 加载更多（滚动加载）
  const loadMore = async (): Promise<void> => {
    if (loading.value || !hasMore.value) {
      return;
    }
    try {
      loading.value = true;
      const newOffset = currentOffset.value + pageSize;
      let list: SendHistoryItem[];
      if (searchKeyword.value) {
        // 搜索模式下不支持分页加载更多
        return;
      } else {
        list = await sendHistoryCache.getMergedSendHistoryList(pageSize, newOffset, runtimeStore.networkMode);
      }
      if (list.length > 0) {
        sendHistoryList.value.push(...list);
        currentOffset.value = newOffset;
        hasLoadedMore.value = true;
      }
      hasMore.value = list.length >= pageSize;
    } catch (error) {
      logger.error('加载更多发送历史失败', { error });
    } finally {
      loading.value = false;
    }
  };

  // 刷新列表
  const refresh = async (): Promise<void> => {
    if (searchKeyword.value) {
      await search(searchKeyword.value);
    } else {
      await loadSendHistory();
    }
  };

  // 搜索历史
  const search = async (keyword: string): Promise<void> => {
    try {
      loading.value = true;
      searchKeyword.value = keyword;
      currentOffset.value = 0;
      if (!keyword) {
        await loadSendHistory();
        return;
      }
      const list = await sendHistoryCache.searchSendHistory(keyword, pageSize * 3, runtimeStore.networkMode);
      sendHistoryList.value = list;
      hasMore.value = false; // 搜索结果不支持分页
    } catch (error) {
      logger.error('搜索发送历史失败', { error });
      sendHistoryList.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 清空列表
  const clearSendHistoryList = (): void => {
    sendHistoryList.value = [];
    currentOffset.value = 0;
    hasMore.value = true;
    hasLoadedMore.value = false;
    searchKeyword.value = '';
  };
  // 清理已删除接口的历史记录
  const cleanDeletedHistory = async (deletedIds: string[]): Promise<boolean> => {
    try {
      const success = await sendHistoryCache.deleteHistoriesByIds(deletedIds);
      if (success) {
        await refresh();
      }
      return success;
    } catch (error) {
      logger.error('清理已删除接口历史失败', { error });
      return false;
    }
  };

  return {
    sendHistoryList,
    loading,
    hasMore,
    hasLoadedMore,
    searchKeyword,
    loadSendHistory,
    loadMore,
    refresh,
    search,
    clearSendHistoryList,
    cleanDeletedHistory
  };
});
