import { request } from '@/api/api';
import { projectCache } from '@/cache/project/projectCache';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { useRuntime } from '@/store/runtime/runtimeStore';
import { generateEmptyProject } from '@/helper';
import { nanoid } from 'nanoid';
import type { ApidocProjectInfo, ApidocProjectListInfo, CommonResponse, ApiNode } from '@src/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useProjectManagerStore = defineStore('projectManager', () => {
  const runtimeStore = useRuntime();
  const projectList = ref<ApidocProjectInfo[]>([]);
  const deletedProjects = ref<ApidocProjectInfo[]>([]);
  const isStandalone = computed(() => runtimeStore.networkMode === 'offline');
  // 获取项目列表
  const getProjectList = async (): Promise<ApidocProjectInfo[]> => {
    try {
      if (isStandalone.value) {
        const list = await projectCache.getProjectList();
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
  // 新增项目
  const addProject = async (projectName: string, members?: { users: { userId: string; userName: string; permission: string }[]; groups: { groupId: string; groupName: string }[] }): Promise<{ projectId: string; projectName: string } | null> => {
    try {
      if (isStandalone.value) {
        const projectId = nanoid();
        const project = generateEmptyProject(projectId);
        project.projectName = projectName;
        await projectCache.addProject(project);
        await getProjectList();
        return { projectId, projectName };
      }
      const params = {
        projectName,
        remark: '',
        users: members?.users || [],
        groups: members?.groups || [],
      };
      const res = await request.post<CommonResponse<string>, CommonResponse<string>>('/api/project/add_project', params);
      await getProjectList();
      return { projectId: res.data, projectName };
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  // 更新项目
  const updateProject = async (projectId: string, projectName: string): Promise<boolean> => {
    try {
      if (isStandalone.value) {
        await projectCache.updateProject(projectId, { projectName });
        await getProjectList();
        return true;
      }
      await request.put('/api/project/edit_project', { _id: projectId, projectName });
      await getProjectList();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  // 删除项目（软删除），返回备份数据用于撤回
  const deleteProject = async (projectId: string): Promise<{ project: ApidocProjectInfo; apiNodes: ApiNode[] } | null> => {
    try {
      if (isStandalone.value) {
        const list = await projectCache.getProjectList();
        const project = list.find((p) => p._id === projectId);
        if (!project) return null;
        const apiNodes = await apiNodesCache.getAllNodes();
        const projectApiNodes = apiNodes.filter((node) => node.projectId === projectId);
        const backupData = {
          project: JSON.parse(JSON.stringify(project)) as ApidocProjectInfo,
          apiNodes: projectApiNodes.length > 0 ? (JSON.parse(JSON.stringify(projectApiNodes)) as ApiNode[]) : [],
        };
        await projectCache.deleteProject(projectId);
        await getProjectList();
        return backupData;
      }
      await request.delete('/api/project/delete_project', { data: { ids: [projectId] } });
      await getProjectList();
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  // 恢复项目（从备份数据恢复，用于撤回删除）
  const restoreProjectFromBackup = async (backupData: { project: ApidocProjectInfo; apiNodes: ApiNode[] }): Promise<boolean> => {
    try {
      const projectId = backupData.project._id;
      const restoredProject = JSON.parse(JSON.stringify(backupData.project)) as ApidocProjectInfo;
      restoredProject.isDeleted = false;
      const updateResult = await projectCache.updateProject(projectId, restoredProject);
      if (!updateResult) {
        await projectCache.addProject(restoredProject);
      }
      const savedNodes = backupData.apiNodes;
      if (savedNodes && savedNodes.length > 0) {
        const restorePromises = savedNodes.map((node) => {
          const clonedNode = JSON.parse(JSON.stringify(node)) as ApiNode;
          clonedNode.isDeleted = false;
          return apiNodesCache.addNode(clonedNode);
        });
        await Promise.all(restorePromises);
      }
      await getProjectList();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  // 获取已删除项目列表
  const getDeletedProjects = async (): Promise<ApidocProjectInfo[]> => {
    try {
      const projects = await projectCache.getDeletedProjectList();
      deletedProjects.value = projects;
      return projects;
    } catch (err) {
      console.error(err);
      return [];
    }
  };
  // 恢复已删除项目（从回收站恢复）
  const recoverProject = async (projectId: string): Promise<boolean> => {
    try {
      const success = await projectCache.recoverProject(projectId);
      if (success) {
        const apiNodes = await apiNodesCache.getAllNodes();
        const projectApiNodes = apiNodes.filter((node) => node.projectId === projectId && node.isDeleted);
        if (projectApiNodes.length > 0) {
          for (const node of projectApiNodes) {
            const updatedNode = { ...node, isDeleted: false };
            await apiNodesCache.replaceNode(updatedNode);
          }
        }
        await getDeletedProjects();
        await getProjectList();
      }
      return success;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  // 批量恢复已删除项目
  const batchRecoverProjects = async (projectIds: string[]): Promise<{ successCount: number; failCount: number }> => {
    let successCount = 0;
    let failCount = 0;
    for (const projectId of projectIds) {
      try {
        const success = await projectCache.recoverProject(projectId);
        if (success) {
          const apiNodes = await apiNodesCache.getAllNodes();
          const projectApiNodes = apiNodes.filter((node) => node.projectId === projectId && node.isDeleted);
          if (projectApiNodes.length > 0) {
            for (const node of projectApiNodes) {
              const updatedNode = { ...node, isDeleted: false };
              await apiNodesCache.replaceNode(updatedNode);
            }
          }
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    await getDeletedProjects();
    await getProjectList();
    return { successCount, failCount };
  };
  // 收藏项目
  const starProject = async (projectId: string): Promise<boolean> => {
    try {
      if (isStandalone.value) {
        const list = await projectCache.getProjectList();
        const project = list.find((p) => p._id === projectId);
        if (project) {
          project.isStared = true;
          await projectCache.setProjectList(list);
          projectList.value = list;
        }
        return true;
      }
      await request.put('/api/project/star', { projectId });
      const project = projectList.value.find((p) => p._id === projectId);
      if (project) {
        project.isStared = true;
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  // 取消收藏项目
  const unstarProject = async (projectId: string): Promise<boolean> => {
    try {
      if (isStandalone.value) {
        const list = await projectCache.getProjectList();
        const project = list.find((p) => p._id === projectId);
        if (project) {
          project.isStared = false;
          await projectCache.setProjectList(list);
          projectList.value = list;
        }
        return true;
      }
      await request.put('/api/project/unstar', { projectId });
      const project = projectList.value.find((p) => p._id === projectId);
      if (project) {
        project.isStared = false;
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  // 记录项目访问
  const recordVisited = async (projectId: string): Promise<void> => {
    try {
      if (!isStandalone.value) {
        await request.put('/api/project/visited', { projectId });
      }
    } catch (err) {
      console.error(err);
    }
  };
  return {
    projectList,
    deletedProjects,
    getProjectList,
    addProject,
    updateProject,
    deleteProject,
    restoreProjectFromBackup,
    getDeletedProjects,
    recoverProject,
    batchRecoverProjects,
    starProject,
    unstarProject,
    recordVisited,
  };
});
