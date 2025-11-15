import type { ApidocProjectInfo } from '@src/types';
import { cacheKey } from '../cacheKey';
import { openDB, type IDBPDatabase } from 'idb';
import { config } from '@src/config/config';

export class ProjectCache {
  private db: IDBPDatabase | null = null;
  private storeName = config.cacheConfig.projectCache.storeName;
  constructor() {
    this.initDB();
  }
  private async initDB() {
    this.db = await this.openDB();
  }
  private async getDB() {
    if (!this.db) {
      this.db = await this.openDB();
    }
    return this.db;
  }
  private async openDB(): Promise<IDBPDatabase> {
    if (this.db) {
      return this.db;
    }
    this.db = await openDB(
      config.cacheConfig.projectCache.dbName,
      config.cacheConfig.projectCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(config.cacheConfig.projectCache.storeName)) {
            db.createObjectStore(config.cacheConfig.projectCache.storeName);
          }
        },
      }
    );
    return this.db;
  }

  async getProjectList(): Promise<ApidocProjectInfo[]> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
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
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);

    const keys = await store.getAllKeys();
    for (const key of keys) {
      await store.delete(key);
    }

    for (const project of projectList) {
      await store.put(project, project._id);
    }

    await tx.done;
    return true;
  }
  async getProjectInfo(projectId: string): Promise<ApidocProjectInfo | null> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const project = await store.get(projectId);
    return project && !project.isDeleted ? project : null;
  }
  async addProject(project: ApidocProjectInfo): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    await store.put(project, project._id);
    await tx.done;
    return true;
  }
  async updateProject(projectId: string, project: Partial<ApidocProjectInfo>): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
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
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const existingProject = await store.get(projectId);

    if (!existingProject) return false;

    const updatedProject = {
      ...existingProject,
      isDeleted: true,
      deletedAt: Date.now()
    };

    await store.put(updatedProject, projectId);
    await tx.done;
    return true;
  }
  async getDeletedProjectList(): Promise<ApidocProjectInfo[]> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readonly");
    const store = tx.objectStore(this.storeName);
    const keys = await store.getAllKeys();
    const projects: ApidocProjectInfo[] = [];

    for (const key of keys) {
      const project = await store.get(key);
      if (project && project.isDeleted) {
        projects.push(project);
      }
    }

    projects.sort((a, b) => {
      const aTime = a.deletedAt || 0;
      const bTime = b.deletedAt || 0;
      return bTime - aTime;
    });

    return projects;
  }
  async recoverProject(projectId: string): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const existingProject = await store.get(projectId);

    if (!existingProject || !existingProject.isDeleted) return false;

    const updatedProject = {
      ...existingProject,
      isDeleted: false,
      deletedAt: undefined
    };

    await store.put(updatedProject, projectId);
    await tx.done;
    return true;
  }
  async permanentlyDeleteProject(projectId: string): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    const existingProject = await store.get(projectId);

    if (!existingProject) return false;

    await store.delete(projectId);
    await tx.done;
    return true;
  }
  async clearDeletedProjects(): Promise<boolean> {
    try {
      const deletedProjects = await this.getDeletedProjectList();
      const db = await this.getDB();
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);

      for (const project of deletedProjects) {
        await store.delete(project._id);
      }

      await tx.done;
      return true;
    } catch (error) {
      console.error('清空已删除项目失败:', error);
      return false;
    }
  }
  // 缓存项目分享密码
  setProjectSharePassword(shareId: string, password: string) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.projectCache.share.password) || '{}');
      localData[shareId] = password;
      localStorage.setItem(cacheKey.projectCache.share.password, JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      const data: Record<string, string> = {};
      data[shareId] = password;
      localStorage.setItem(cacheKey.projectCache.share.password, JSON.stringify(data));
    }
  }
  // 获取缓存的项目分享密码
  getProjectSharePassword(shareId: string): string | null {
    try {
      const localData: Record<string, string> = JSON.parse(localStorage.getItem(cacheKey.projectCache.share.password) || '{}');
      if (!localData[shareId]) {
        return null;
      }
      return localData[shareId];
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.projectCache.share.password, '{}');
      return null;
    }
  }
  // 清除项目分享密码缓存
  clearProjectSharePassword(shareId: string) {
    try {
      const localData = JSON.parse(localStorage.getItem(cacheKey.projectCache.share.password) || '{}');
      delete localData[shareId];
      localStorage.setItem(cacheKey.projectCache.share.password, JSON.stringify(localData));
    } catch (error) {
      console.error(error);
      localStorage.setItem(cacheKey.projectCache.share.password, '{}');
    }
  }
}

// 导出单例
export const projectCache = new ProjectCache();
