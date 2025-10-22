import type { ApidocProjectInfo } from '@src/types';
import { getStandaloneDB } from "../db";

export class ProjectCache {
  private get db() {
    return getStandaloneDB();
  }

  async getProjectList(): Promise<ApidocProjectInfo[]> {
    const tx = this.db.transaction("projects", "readonly");
    const store = tx.objectStore("projects");
    const keys = await store.getAllKeys();
    const projects: ApidocProjectInfo[] = [];
    
    for (const key of keys) {
      const project = await store.get(key);
      if (project && !project.isDeleted) {
        projects.push(project);
      }
    }
    
    return projects;
  }

  async setProjectList(projectList: ApidocProjectInfo[]): Promise<boolean> {
    const tx = this.db.transaction("projects", "readwrite");
    const store = tx.objectStore("projects");
    
    // 清空现有数据
    const keys = await store.getAllKeys();
    for (const key of keys) {
      await store.delete(key);
    }
    
    // 存储新的项目列表
    for (const project of projectList) {
      await store.put(project, project._id);
    }
    
    await tx.done;
    return true;
  }

  async getProjectInfo(projectId: string): Promise<ApidocProjectInfo | null> {
    const tx = this.db.transaction("projects", "readonly");
    const store = tx.objectStore("projects");
    const project = await store.get(projectId);
    return project && !project.isDeleted ? project : null;
  }

  async addProject(project: ApidocProjectInfo): Promise<boolean> {
    const tx = this.db.transaction("projects", "readwrite");
    const store = tx.objectStore("projects");
    await store.put(project, project._id);
    await tx.done;
    return true;
  }

  async updateProject(projectId: string, project: Partial<ApidocProjectInfo>): Promise<boolean> {
    const tx = this.db.transaction("projects", "readwrite");
    const store = tx.objectStore("projects");
    const existingProject = await store.get(projectId);
    
    if (!existingProject) return false;
    
    const updatedProject = {
      ...existingProject,
      ...project
    };
    
    await store.put(updatedProject, projectId);
    await tx.done;
    return true;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const tx = this.db.transaction("projects", "readwrite");
    const store = tx.objectStore("projects");
    const existingProject = await store.get(projectId);
    
    if (!existingProject) return false;
    
    const updatedProject = {
      ...existingProject,
      isDeleted: true
    };
    
    await store.put(updatedProject, projectId);
    await tx.done;
    return true;
  }
  // 缓存项目分享密码
  setProjectSharePassword(shareId: string, password: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('projectCache/share/password') || '{}');
      localData[shareId] = password;
      localStorage.setItem('projectCache/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[shareId] = password;
      localStorage.setItem('projectCache/share/password', JSON.stringify(data));
    }
  }
  // 获取缓存的项目分享密码
  getProjectSharePassword(shareId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem('projectCache/share/password') || '{}');
      if (!localData[shareId]) {
        return null;
      }
      return localData[shareId];
    } catch (error) {
      console.error(error);
      localStorage.setItem('projectCache/share/password', '{}');
      return null;
    }
  }
  // 清除项目分享密码缓存
  clearProjectSharePassword(shareId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem('projectCache/share/password') || '{}');
      delete localData[shareId];
      localStorage.setItem('projectCache/share/password', JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem('projectCache/share/password', '{}');
    }
  }
}

// 导出单例
export const projectCache = new ProjectCache();
