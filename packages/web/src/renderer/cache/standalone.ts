import { config } from "@src/config/config.ts";
import { IDBPDatabase, openDB } from "idb";
import type { ApidocProjectInfo, ApidocDetail, ApidocProperty } from "@src/types/global";
import type { ApidocProjectRules } from "@src/types/apidoc/base-info";

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
        await this.deleteProjectRules(projectId);
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
   * 更新项目文档数量
   */
  private async updateProjectDocNum(projectId: string): Promise<boolean> {
    try {
      const docsList = await this.getDocsList();
      const projectDocs = docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted);
      const docNum = projectDocs.length;

      const projectList = await this.getAllProjects();
      const projectIndex = projectList.findIndex(p => p._id === projectId);
      if (projectIndex === -1) return false;

      projectList[projectIndex] = {
        ...projectList[projectIndex],
        docNum
      };

      return await this.setProjectList(projectList);
    } catch (err) {
      console.error('Failed to update project doc num:', err);
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
      const success = await this.setDocsList(docsList);
      if (success) {
        await this.updateProjectDocNum(doc.projectId);
      }
      return success;
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
      
      const projectId = allDocs[index].projectId;
      
      // Soft delete by setting isDeleted flag
      allDocs[index] = {
        ...allDocs[index],
        isDeleted: true
      };
      
      const success = await this.setDocsList(allDocs);
      if (success) {
        await this.updateProjectDocNum(projectId);
      }
      return success;
    } catch (err) {
      console.error('Failed to delete doc:', err);
      return false;
    }
  }

  /**
   * 批量删除文档
   * @param docIds 要删除的文档ID数组
   * @returns 是否全部删除成功
   */
  async deleteDocs(docIds: string[]): Promise<boolean> {
    try {
      const docList = await this.getDocsList();
      let hasChanges = false;
      const affectedProjects = new Set<string>();

      docIds.forEach(docId => {
        const index = docList.findIndex(d => d._id === docId);
        if (index !== -1) {
          // Soft delete by setting isDeleted flag
          docList[index] = {
            ...docList[index],
            isDeleted: true
          };
          hasChanges = true;
          affectedProjects.add(docList[index].projectId);
        }
      });

      // 如果没有任何文档被修改，返回 true（因为所有请求的删除都已经完成）
      if (!hasChanges) {
        return true;
      }

      const success = await this.setDocsList(docList);
      if (success) {
        // 更新所有受影响项目的文档数量
        for (const projectId of affectedProjects) {
          await this.updateProjectDocNum(projectId);
        }
      }
      return success;
    } catch (err) {
      console.error('Failed to delete docs:', err);
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
   * 根据文档ID获取单个文档
   */
  async getDocById(docId: string): Promise<ApidocDetail | null> {
    try {
      const docsList = await this.getDocsList();
      return docsList.find(doc => doc._id === docId && !doc.isDeleted) || null;
    } catch (err) {
      console.error('Failed to get doc by id:', err);
      return null;
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
   * 获取所有项目规则
   */
  private async getAllProjectRules(): Promise<Record<string, ApidocProjectRules>> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readonly');
      const store = tx.objectStore('standaloneCache');
      const data = await store.get('projectRules');
      return data || {};
    } catch (err) {
      console.error('Failed to get all project rules:', err);
      return {};
    }
  }

  /**
   * 设置所有项目规则
   */
  private async setAllProjectRules(rules: Record<string, ApidocProjectRules>): Promise<boolean> {
    try {
      if (!this.standaloneCacheDb) {
        await this.initStandaloneCache();
      }
      const tx = this.standaloneCacheDb!.transaction('standaloneCache', 'readwrite');
      const store = tx.objectStore('standaloneCache');
      await store.put(rules, 'projectRules');
      await tx.done;
      return true;
    } catch (err) {
      console.error('Failed to set all project rules:', err);
      return false;
    }
  }

  /**
   * 获取项目规则
   */
  async getProjectRules(projectId: string): Promise<ApidocProjectRules | null> {
    try {
      const allRules = await this.getAllProjectRules();
      return allRules[projectId] || null;
    } catch (err) {
      console.error('Failed to get project rules:', err);
      return null;
    }
  }

  /**
   * 设置项目规则
   */
  async setProjectRules(projectId: string, rules: ApidocProjectRules): Promise<boolean> {
    try {
      const allRules = await this.getAllProjectRules();
      allRules[projectId] = rules;
      return await this.setAllProjectRules(allRules);
    } catch (err) {
      console.error('Failed to set project rules:', err);
      return false;
    }
  }

  /**
   * 删除项目规则
   */
  async deleteProjectRules(projectId: string): Promise<boolean> {
    try {
      const allRules = await this.getAllProjectRules();
      delete allRules[projectId];
      return await this.setAllProjectRules(allRules);
    } catch (err) {
      console.error('Failed to delete project rules:', err);
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

  /**
   * 根据项目ID获取树形banner数据
   */
  async getDocTree(projectId: string) {
    try {
      const docsList = await this.getDocsList();
      const projectDocs = docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted);
      // 动态引入 convertDocsToBanner，避免循环依赖
      const { convertDocsToBanner } = await import('@/helper/index');
      return convertDocsToBanner(projectDocs);
    } catch (err) {
      console.error('Failed to get banner tree by project id:', err);
      return [];
    }
  }

  /**
   * 根据项目ID获取树形目录（仅文件夹）
   */
  async getFolderTree(projectId: string) {
    try {
      const docsList = await this.getDocsList();
      // 仅保留属于该项目且未被删除且为文件夹的文档
      const folderDocs = docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted && doc.isFolder);
      // 动态引入 convertDocsToBanner，避免循环依赖
      const { convertDocsToBanner } = await import('@/helper/index');
      return convertDocsToBanner(folderDocs);
    } catch (err) {
      console.error('Failed to get folder tree by project id:', err);
      return [];
    }
  }
}

export const standaloneCache = new StandaloneCache();