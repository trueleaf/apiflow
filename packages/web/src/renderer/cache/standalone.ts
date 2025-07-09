import { config } from "@src/config/config.ts";
import { IDBPDatabase, openDB } from "idb";
import type { Standalone } from "@src/types/standalone";
import type { ApidocProjectInfo, ApidocDetail } from "@src/types/global";

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
   * 获取单机版数据
   */
  async getStandaloneData(): Promise<Standalone | null> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readonly');
      const store = tx.objectStore('standaloneCache');
      const data = await store.get('standaloneData');
      return data || null;
    } catch (err) {
      console.error('Failed to get standalone data:', err);
      return null;
    }
  }

  /**
   * 设置单机版数据
   */
  async setStandaloneData(data: Standalone): Promise<boolean> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readwrite');
      const store = tx.objectStore('standaloneCache');
      await store.put(data, 'standaloneData');
      await tx.done;
      return true;
    } catch (err) {
      console.error('Failed to set standalone data:', err);
      return false;
    }
  }

  /**
   * 清除单机版数据
   */
  async clearStandaloneData(): Promise<boolean> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readwrite');
      const store = tx.objectStore('standaloneCache');
      await store.delete('standaloneData');
      await tx.done;
      return true;
    } catch (err) {
      console.error('Failed to clear standalone data:', err);
      return false;
    }
  }

  /**
   * 获取项目列表
   */
  async getProjectList(): Promise<ApidocProjectInfo[]> {
    try {
      const data = await this.getStandaloneData();
      return data?.projectList || [];
    } catch (err) {
      console.error('Failed to get project list:', err);
      return [];
    }
  }

  /**
   * 设置项目列表
   */
  async setProjectList(projectList: ApidocProjectInfo[]): Promise<boolean> {
    try {
      const data = await this.getStandaloneData();
      const newData: Standalone = {
        projectList,
        docsList: data?.docsList || []
      };
      return await this.setStandaloneData(newData);
    } catch (err) {
      console.error('Failed to set project list:', err);
      return false;
    }
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
      const projectList = await this.getProjectList();
      const newProjectList = projectList.filter(p => p._id !== projectId);
      return await this.setProjectList(newProjectList);
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
      const data = await this.getStandaloneData();
      return data?.docsList || [];
    } catch (err) {
      console.error('Failed to get docs list:', err);
      return [];
    }
  }

  /**
   * 设置文档列表
   */
  async setDocsList(docsList: ApidocDetail[]): Promise<boolean> {
    try {
      const data = await this.getStandaloneData();
      const newData: Standalone = {
        projectList: data?.projectList || [],
        docsList
      };
      return await this.setStandaloneData(newData);
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
      const docsList = await this.getDocsList();
      const newDocsList = docsList.filter(d => d._id !== docId);
      return await this.setDocsList(newDocsList);
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
      return docsList.filter(doc => doc.projectId === projectId);
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
      const docsList = await this.getDocsList();
      const newDocsList = docsList.filter(doc => doc.projectId !== projectId);
      return await this.setDocsList(newDocsList);
    } catch (err) {
      console.error('Failed to delete docs by project id:', err);
      return false;
    }
  }
}

export const standaloneCache = new StandaloneCache();