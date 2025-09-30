import { request } from '@/api/api';
import { standaloneCache } from '@/cache/standalone';
import { useRuntime } from '@/store/runtime/runtime';
import type { ApidocProjectInfo, ApidocProjectListInfo, CommonResponse } from '@src/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

type ProjectListState = {
  list: ApidocProjectInfo[];
  starProjectIds: string[];
  recentVisitProjectIds: string[];
};

export const useProjectStore = defineStore('project', () => {
  const runtimeStore = useRuntime();
  const projectList = ref<ApidocProjectInfo[]>([]);
  const projectLoading = ref(false);
  const starProjectIds = ref<string[]>([]);
  const recentVisitProjectIds = ref<string[]>([]);
  const isStandalone = computed(() => runtimeStore.networkMode === 'offline');

  const updateState = (payload: ProjectListState): void => {
    projectList.value = payload.list;
    starProjectIds.value = payload.starProjectIds;
    recentVisitProjectIds.value = payload.recentVisitProjectIds;
  };

  const getProjectList = async (): Promise<void> => {
    if (projectLoading.value) {
      return;
    }
    projectLoading.value = true;
    try {
      if (isStandalone.value) {
        const list = await standaloneCache.getProjectList();
        updateState({
          list,
          starProjectIds: list.filter((item) => item.isStared).map((item) => item._id),
          recentVisitProjectIds: list.map((item) => item._id),
        });
        return;
      }
      const res = await request.get<CommonResponse<ApidocProjectListInfo>, CommonResponse<ApidocProjectListInfo>>('/api/project/project_list');
      updateState({
        list: res.data.list,
        starProjectIds: res.data.starProjects,
        recentVisitProjectIds: res.data.recentVisitProjects,
      });
    } catch (err) {
      console.error(err);
    } finally {
      projectLoading.value = false;
    }
  };

  return {
    projectList,
    projectLoading,
    starProjectIds,
    recentVisitProjectIds,
    isStandalone,
    getProjectList,
  };
});