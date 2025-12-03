import { defineStore } from "pinia"
import { ref } from "vue";
import { projectWorkbenchCache } from '@/cache/projectWorkbench/projectWorkbenchCache.ts';
import { appState } from '@/cache/appState/appStateCache';
import { request } from '@/api/api';
import { ApidocProjectBaseInfoState, CommonResponse } from "@src/types";
import { useVariable } from './variablesStore';
import { projectCache } from '@/cache/project/projectCache';
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache';
import { useRuntime } from '../runtime/runtimeStore';

export const useProjectWorkbench = defineStore('projectWorkbench', () => {
  const projectId = ref('');
  const projectName = ref('');
  const layout = ref<'vertical' | 'horizontal'>('horizontal');
  const responseHeight = ref<number>(350);
  //改变项目id
  const changeProjectId = (id: string): void => {
    projectId.value = id;
  }
  //改变项目名称
  const changeProjectName = (name: string): void => {
    projectName.value = name;
  }
  //改变布局方式
  const changeLayout = (layoutOption: 'horizontal' | 'vertical'): void => {
    layout.value = layoutOption;
    projectWorkbenchCache.setProjectWorkbenchLayout(layoutOption)
  }
  //初始化布局
  const initLayout = (): void => {
    layout.value = projectWorkbenchCache.getProjectWorkbenchLayout();
  }
  //更新响应区域高度 CSS 变量
  const updateResponseHeightCssVar = (height: number): void => {
    document.documentElement.style.setProperty('--apiflow-response-height', `${height}px`);
  }
  //改变响应区域高度
  const changeResponseHeight = (height: number): void => {
    responseHeight.value = height;
    appState.setResponseHeight(height);
    updateResponseHeightCssVar(height);
  }
  //初始化响应区域高度
  const initResponseHeight = (): void => {
    responseHeight.value = appState.getResponseHeight();
    updateResponseHeightCssVar(responseHeight.value);
  }
  //初始化项目基本信息
  const initProjectBaseInfo = async (payload: { projectId: string }): Promise<void> => {
    const runtimeStore = useRuntime();
    const isOffline = runtimeStore.networkMode === 'offline';
    changeProjectId(payload.projectId);
    const { replaceVariables } = useVariable();
    if (isOffline) {
      const projectInfo = await projectCache.getProjectInfo(payload.projectId);
      if (projectInfo) {
        changeProjectName(projectInfo.projectName);
        changeProjectId(projectInfo._id);
      }
      const response = await nodeVariableCache.getVariableByProjectId(payload.projectId);
      if (response.code === 0) {
        replaceVariables(response.data);
        return Promise.resolve();
      }
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      const params = {
        _id: payload.projectId,
      }
      request.get<CommonResponse<ApidocProjectBaseInfoState>, CommonResponse<ApidocProjectBaseInfoState>>('/api/project/project_full_info', { params }).then((res) => {
        changeProjectId(res.data._id);
        changeProjectName(res.data.projectName);
        replaceVariables(res.data.variables)
        resolve()
      }).catch((err) => {
        console.error(err);
        reject(err);
      })
    });
  }
  return {
    projectId,
    projectName,
    layout,
    responseHeight,
    changeProjectId,
    changeProjectName,
    changeLayout,
    initLayout,
    changeResponseHeight,
    initResponseHeight,
    initProjectBaseInfo,
  }
})
