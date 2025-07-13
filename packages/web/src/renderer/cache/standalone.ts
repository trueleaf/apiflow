
import type { ApidocProjectInfo, ApidocDetail, ApidocProperty } from "@src/types/global";
import type { ApidocProjectRules } from "@src/types/apidoc/base-info";
import { DocCache } from "./standalone/docs";
import { ProjectCache } from "./standalone/projects";
import { CommonHeaderCache } from "./standalone/commonHeaders";
import { RuleCache } from "./standalone/rules";
import { IDBPDatabase, openDB } from "idb";
import { config } from "@src/config/config.ts";

export class StandaloneCache {
  public db: IDBPDatabase | null = null;
  
  // 组合各 cache
  docs: DocCache;
  projects: ProjectCache;
  commonHeaders: CommonHeaderCache;
  rules: RuleCache;

  constructor() {
    this.docs = new DocCache(null);
    this.projects = new ProjectCache(null);
    this.commonHeaders = new CommonHeaderCache(null);
    this.rules = new RuleCache(null);
  }

  async init() {
    if (this.db) return;
    this.db = await openDB(
      config.standaloneCache.dbName,
      config.standaloneCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains("projects")) {
            db.createObjectStore("projects");
          }
          if (!db.objectStoreNames.contains("docs")) {
            db.createObjectStore("docs");
          }
          if (!db.objectStoreNames.contains("commonHeaders")) {
            db.createObjectStore("commonHeaders");
          }
          if (!db.objectStoreNames.contains("rules")) {
            db.createObjectStore("rules");
          }
        },
      }
    );

    this.docs = new DocCache(this.db);
    this.projects = new ProjectCache(this.db);
    this.commonHeaders = new CommonHeaderCache(this.db);
    this.rules = new RuleCache(this.db);
  }

  // 项目相关
  async getProjectList() {
    return this.projects.getProjectList();
  }
  async setProjectList(list: ApidocProjectInfo[]): Promise<boolean> {
    return this.projects.setProjectList(list);
  }
  async getProjectInfo(projectId: string): Promise<ApidocProjectInfo | null> {
    return this.projects.getProjectInfo(projectId);
  }
  async addProject(project: ApidocProjectInfo): Promise<boolean> {
    return this.projects.addProject(project);
  }
  async updateProject(projectId: string, project: Partial<ApidocProjectInfo>): Promise<boolean> {
    return this.projects.updateProject(projectId, project);
  }
  async deleteProject(projectId: string): Promise<boolean> {
    return this.projects.deleteProject(projectId);
  }
  async updateProjectDocNum(projectId: string): Promise<boolean> {
    const docsList = await this.docs.getDocsList();
    const projectDocs = docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted);
    const docNum = projectDocs.length;
    const projectList = await this.projects.getProjectList();
    const projectIndex = projectList.findIndex(p => p._id === projectId);
    if (projectIndex === -1) return false;
    projectList[projectIndex] = {
      ...projectList[projectIndex],
      docNum
    };
    return await this.projects.setProjectList(projectList);
  }
  async getDocsByProjectId(projectId: string): Promise<ApidocDetail[]> {
    return this.docs.getDocsByProjectId(projectId);
  }
  async getDocById(docId: string): Promise<ApidocDetail | null> {
    return this.docs.getDocById(docId);
  }
  async deleteDocsByProjectId(projectId: string): Promise<boolean> {
    return this.docs.deleteDocsByProjectId(projectId);
  }
  async getDocTree(projectId: string) {
    return this.docs.getDocTree(projectId);
  }
  async getFolderTree(projectId: string) {
    return this.docs.getFolderTree(projectId);
  }

  // 文档相关
  async getDocsList(): Promise<ApidocDetail[]> {
    return this.docs.getDocsList();
  }
  async addDoc(doc: ApidocDetail): Promise<boolean> {
    return this.docs.addDoc(doc);
  }
  async updateDoc(doc: ApidocDetail): Promise<boolean> {
    return this.docs.updateDoc(doc);
  }
  async updateDocName(docId: string, name: string): Promise<boolean> {
    return this.docs.updateDocName(docId, name);
  }
  async deleteDoc(docId: string): Promise<boolean> {
    return this.docs.deleteDoc(docId);
  }
  async deleteDocs(docIds: string[]): Promise<boolean> {
    return this.docs.deleteDocs(docIds);
  }
  async restoreDoc(docId: string): Promise<string[]> {
    return this.docs.restoreDoc(docId);
  }
  async getDeletedDocsList(projectId: string) {
    return this.docs.getDeletedDocsList(projectId);
  }
  async replaceAllDocs(docs: ApidocDetail[], projectId: string): Promise<boolean> {
    return this.docs.replaceAllDocs(docs, projectId);
  }
  async appendDocs(docs: ApidocDetail[], projectId: string): Promise<string[]> {
    return this.docs.appendDocs(docs, projectId);
  }
  // 公共请求头相关
  async getCommonHeaders(): Promise<ApidocProperty<'string'>[]> {
    return this.commonHeaders.getCommonHeaders();
  }
  async setCommonHeaders(commonHeaders: ApidocProperty<'string'>[]): Promise<boolean> {
    return this.commonHeaders.setCommonHeaders(commonHeaders);
  }

  // 规则相关
  async getAllProjectRules(): Promise<Record<string, ApidocProjectRules>> {
    return this.rules.getAllProjectRules();
  }
  async setAllProjectRules(rules: Record<string, ApidocProjectRules>): Promise<boolean> {
    return this.rules.setAllProjectRules(rules);
  }
  async getProjectRules(projectId: string): Promise<ApidocProjectRules | null> {
    return this.rules.getProjectRules(projectId);
  }
  async setProjectRules(projectId: string, rules: ApidocProjectRules): Promise<boolean> {
    return this.rules.setProjectRules(projectId, rules);
  }
  async deleteProjectRules(projectId: string): Promise<boolean> {
    return this.rules.deleteProjectRules(projectId);
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<boolean> {
    try {
      if (!this.db) throw new Error("Database not initialized");
      
      // 获取所有数据
      const docsList = await this.docs.getDocsList();
      const projectList = await this.projects.getProjectList();
      
      // 保留已删除的数据
      const deletedDocs = docsList.filter(doc => doc.isDeleted);
      const deletedProjects = projectList.filter(project => project.isDeleted);
      
      // 清空所有数据
      const stores = ['docs', 'projects', 'commonHeaders', 'rules'];
      for (const storeName of stores) {
        const tx = this.db.transaction(storeName, 'readwrite');
        await tx.objectStore(storeName).clear();
        await tx.done;
      }
      
      // 恢复已删除的数据
      for (const doc of deletedDocs) {
        await this.docs.addDoc(doc);
      }
      await this.projects.setProjectList(deletedProjects);
      return true;
    } catch (err) {
      console.error('Failed to clear all data:', err);
      return false;
    }
  }
}

export const standaloneCache = new StandaloneCache();