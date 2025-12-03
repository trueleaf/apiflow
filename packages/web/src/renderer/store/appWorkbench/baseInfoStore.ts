import { request } from '@/api/api';
import {
  ApidocProjectBaseInfoState,
  CommonResponse
} from "@src/types";
import { defineStore } from "pinia"
import { useVariable } from '../projectWorkbench/variablesStore';
import { projectCache } from '@/cache/project/projectCache';
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache';
import { useRuntime } from '../runtime/runtimeStore';
import { useProjectWorkbench } from '../projectWorkbench/projectWorkbenchStore';

type ChangeProjectBaseInfo = {
  _id: string;
  projectName: string,
}
export const useApidocBaseInfo = defineStore('apidocBaseInfo', () => {
  const runtimeStore = useRuntime();
  const isOffline = () => runtimeStore.networkMode === 'offline';
  /*
  |--------------------------------------------------------------------------
  | 方法
  |--------------------------------------------------------------------------
  */
  //改变项目基本信息
  const changeProjectBaseInfo = (payload: ChangeProjectBaseInfo): void => {
    const projectWorkbenchStore = useProjectWorkbench();
    projectWorkbenchStore.changeProjectId(payload._id);
    projectWorkbenchStore.changeProjectName(payload.projectName);
  }
  
  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  //初始化项目基本信息
  const initProjectBaseInfo = async (payload: { projectId: string }): Promise<void> => {
    const projectWorkbenchStore = useProjectWorkbench();
    // 无论在线/离线模式都先设置 projectId
    projectWorkbenchStore.changeProjectId(payload.projectId);

    const { replaceVariables } = useVariable();
    if (isOffline()){
      const projectInfo = await projectCache.getProjectInfo(payload.projectId);
      if(projectInfo){
        projectWorkbenchStore.changeProjectName(projectInfo.projectName);
        projectWorkbenchStore.changeProjectId(projectInfo._id);
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
        changeProjectBaseInfo(res.data);
        replaceVariables(res.data.variables)
        resolve()
      }).catch((err) => {
        console.error(err);
        reject(err);
      })
    });
  }
  return {
    initProjectBaseInfo,
  }
})
