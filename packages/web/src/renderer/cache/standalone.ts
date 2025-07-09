import { config } from "@src/config/config.ts";
import { IDBPDatabase, openDB } from "idb";
import type { ApidocProjectInfo, ApidocDetail, ApidocProperty } from "@src/types/global";

export class StandaloneCache {
  
  public standaloneCacheDb: IDBPDatabase | null = null;

  /**
   * 初始化 standaloneCache 数据库
   */
  async initStandaloneCache() {
    try {
      this.standaloneCacheDb = await openDB(
        config.standaloneCacheConfig.dbName,
        config.standaloneCacheConfig.version,
        {
          upgrade(db: IDBPDatabase) {
            if (!db.objectStoreNames.contains('standaloneCache')) {
              db.createObjectStore('standaloneCache');
            }
          },
          blocked(currentVersion: number, blockedVersion: number, event: Event) {
            console.log('blocked', currentVersion, blockedVersion, event);
          },
          blocking(currentVersion: number, blockedVersion: number, event: Event) {
            console.log('blocking', currentVersion, blockedVersion, event);
          },
          terminated() {
            console.log('terminated');
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * 获取项目列表
   */
  async getProjectList(): Promise<ApidocProjectInfo[]> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readonly');
      const store = tx.objectStore('standaloneCache');
      const data = await store.get('projectList');
      // Filter out deleted projects
      return (data || []).filter((project: ApidocProjectInfo) => !project.isDeleted);
    } catch (err) {
      console.error('Failed to get project list:', err);
      return [];
    }
  }

  /**
   * 获取所有项目（包括已删除的）
   */
  private async getAllProjects(): Promise<ApidocProjectInfo[]> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readonly');
      const store = tx.objectStore('standaloneCache');
      const data = await store.get('projectList');
      return data || [];
    } catch (err) {
      console.error('Failed to get all projects:', err);
      return [];
    }
  }

  /**
   * 设置项目列表
   */
  async setProjectList(projectList: ApidocProjectInfo[]): Promise<boolean> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readwrite');
      const store = tx.objectStore('standaloneCache');
      await store.put(projectList, 'projectList');
      await tx.done;
      return true;
    } catch (err) {
      console.error('Failed to set project list:', err);
      return false;
    }
  }

  /**
   * 根据项目ID获取项目信息
   */
  async getProjectInfo(projectId: string): Promise<ApidocProjectInfo | null> {
    const projectList = await this.getProjectList();
    return projectList.find(p => p._id === projectId) || null;
  }

  /**
   * 添加项目
   */
  async addProject(project: ApidocProjectInfo): Promise<boolean> {
    try {
      const projectList = await this.getProjectList();
      projectList.push(project);
      return await this.setProjectList(projectList);
    } catch (err) {
      console.error('Failed to add project:', err);
      return false;
    }
  }

  /**
   * 更新项目
   */
  async updateProject(projectId: string, project: Partial<ApidocProjectInfo>): Promise<boolean> {
    try {
      const projectList = await this.getProjectList();
      const index = projectList.findIndex(p => p._id === projectId);
      if (index === -1) return false;
      projectList[index] = {
        ...projectList[index],
        ...project
      };
      return await this.setProjectList(projectList);
    } catch (err) {
      console.error('Failed to update project:', err);
      return false;
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const allProjects = await this.getAllProjects(); // Get all projects including deleted ones
      const index = allProjects.findIndex(p => p._id === projectId);
      if (index === -1) return false;
      allProjects[index] = {
        ...allProjects[index],
        isDeleted: true
      };
      const success = await this.setProjectList(allProjects);
      if (success) {
        await this.deleteDocsByProjectId(projectId);
      }
      return success;
    } catch (err) {
      console.error('Failed to delete project:', err);
      return false;
    }
  }

  /**
   * 获取文档列表
   */
  async getDocsList(): Promise<ApidocDetail[]> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readonly');
      const store = tx.objectStore('standaloneCache');
      const data = await store.get('docsList');
      // Filter out deleted docs
      return (data || []).filter((doc: ApidocDetail) => !doc.isDeleted);
    } catch (err) {
      console.error('Failed to get docs list:', err);
      return [];
    }
  }

  /**
   * 获取所有文档（包括已删除的）
   */
  private async getAllDocs(): Promise<ApidocDetail[]> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readonly');
      const store = tx.objectStore('standaloneCache');
      const data = await store.get('docsList');
      return data || [];
    } catch (err) {
      console.error('Failed to get all docs:', err);
      return [];
    }
  }

  /**
   * 设置文档列表
   */
  async setDocsList(docsList: ApidocDetail[]): Promise<boolean> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readwrite');
      const store = tx.objectStore('standaloneCache');
      await store.put(docsList, 'docsList');
      await tx.done;
      return true;
    } catch (err) {
      console.error('Failed to set docs list:', err);
      return false;
    }
  }

  /**
   * 添加文档
   */
  async addDoc(doc: ApidocDetail): Promise<boolean> {
    try {
      const docsList = await this.getDocsList();
      docsList.push(doc);
      return await this.setDocsList(docsList);
    } catch (err) {
      console.error('Failed to add doc:', err);
      return false;
    }
  }

  /**
   * 更新文档
   */
  async updateDoc(doc: ApidocDetail): Promise<boolean> {
    try {
      const docsList = await this.getDocsList();
      const index = docsList.findIndex(d => d._id === doc._id);
      if (index === -1) return false;
      docsList[index] = doc;
      return await this.setDocsList(docsList);
    } catch (err) {
      console.error('Failed to update doc:', err);
      return false;
    }
  }

  /**
   * 删除文档
   */
  async deleteDoc(docId: string): Promise<boolean> {
    try {
      const allDocs = await this.getAllDocs();
      const index = allDocs.findIndex(d => d._id === docId);
      if (index === -1) return false;
      
      // Soft delete by setting isDeleted flag
      allDocs[index] = {
        ...allDocs[index],
        isDeleted: true
      };
      
      return await this.setDocsList(allDocs);
    } catch (err) {
      console.error('Failed to delete doc:', err);
      return false;
    }
  }

  /**
   * 根据项目ID获取文档列表
   */
  async getDocsByProjectId(projectId: string): Promise<ApidocDetail[]> {
    try {
      const docsList = await this.getDocsList();
      return docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted);
    } catch (err) {
      console.error('Failed to get docs by project id:', err);
      return [];
    }
  }

  /**
   * 根据项目ID删除所有相关文档
   */
  async deleteDocsByProjectId(projectId: string): Promise<boolean> {
    try {
      const allDocs = await this.getAllDocs();
      const updatedDocs = allDocs.map(doc => {
        if (doc.projectId === projectId) {
          return {
            ...doc,
            isDeleted: true
          };
        }
        return doc;
      });
      return await this.setDocsList(updatedDocs);
    } catch (err) {
      console.error('Failed to delete docs by project id:', err);
      return false;
    }
  }

  /**
   * 获取公共请求头列表
   */
  async getCommonHeaders(): Promise<ApidocProperty<'string'>[]> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readonly');
      const store = tx.objectStore('standaloneCache');
      const data = await store.get('commonHeaders');
      return data || [];
    } catch (err) {
      console.error('Failed to get common headers:', err);
      return [];
    }
  }

  /**
   * 设置公共请求头列表
   */
  async setCommonHeaders(commonHeaders: ApidocProperty<'string'>[]): Promise<boolean> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readwrite');
      const store = tx.objectStore('standaloneCache');
      await store.put(commonHeaders, 'commonHeaders');
      await tx.done;
      return true;
    } catch (err) {
      console.error('Failed to set common headers:', err);
      return false;
    }
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<boolean> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readwrite');
      const store = tx.objectStore('standaloneCache');
      await store.clear();
      await tx.done;
      return true;
    } catch (err) {
      console.error('Failed to clear all data:', err);
      return false;
    }
  }
}

export const standaloneCache = new StandaloneCache();