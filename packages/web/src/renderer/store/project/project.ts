import { request } from '@/api/api';
import { standaloneCache } from '@/cache/standalone';
import { useRuntime } from '@/store/runtime/runtime';
import type { ApidocProjectInfo, ApidocProjectListInfo, CommonResponse } from '@src/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useProjectStore = defineStore('project', () => {
  const runtimeStore = useRuntime();
  const projectList = ref<ApidocProjectInfo[]>([]);
  const isStandalone = computed(() => runtimeStore.networkMode === 'offline');

  const getProjectList = async (): Promise<ApidocProjectInfo[]> => {
    try {
      if (isStandalone.value) {
        const list = await standaloneCache.getProjectList();
        projectList.value = list;
        return list;
      }
      const res = await request.get<CommonResponse<ApidocProjectListInfo>, CommonResponse<ApidocProjectListInfo>>('/api/project/project_list');
      projectList.value = res.data.list;
      return res.data.list;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return {
    projectList,
    getProjectList,
  };
});