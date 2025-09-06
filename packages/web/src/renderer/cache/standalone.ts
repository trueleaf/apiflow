
import type { ApidocProjectInfo, ApidocProperty, ApidocVariable, ApiNode } from '@src/types';
import type { ApidocProjectRules } from "@src/types/apidoc/base-info";
import { StandaloneHttpNodeCache } from "./standalone/docs";
import { ProjectCache } from "./standalone/projects";
import { CommonHeaderCache } from "./standalone/commonHeaders";
import { RuleCache } from "./standalone/rules";
import { VariableCache } from "./standalone/variable";
import { IDBPDatabase, openDB } from "idb";
import { config } from "@src/config/config.ts";

export class StandaloneCache {
  public db: IDBPDatabase | null = null;
  
  // 组合各 cache
  standaloneHttpNodeList: StandaloneHttpNodeCache;
  projects: ProjectCache;
  commonHeaders: CommonHeaderCache;
  rules: RuleCache;
  variables: VariableCache;

  constructor() {
    this.standaloneHttpNodeList = new StandaloneHttpNodeCache(null);
    this.projects = new ProjectCache(null);
    this.commonHeaders = new CommonHeaderCache(null);
    this.rules = new RuleCache(null);
    this.variables = new VariableCache(null);
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
            const docsStore = db.createObjectStore("docs");
            // 添加 projectId 索引以优化按项目查询
            docsStore.createIndex("projectId", "projectId", { unique: false });
          }
          if (!db.objectStoreNames.contains("commonHeaders")) {
            db.createObjectStore("commonHeaders");
          }
          if (!db.objectStoreNames.contains("rules")) {
            db.createObjectStore("rules");
          }
          if (!db.objectStoreNames.contains("variables")) {
            const variablesStore = db.createObjectStore("variables");
            // 添加 projectId 索引以优化按项目查询变量
            variablesStore.createIndex("projectId", "projectId", { unique: false });
          }
        },
      }
    );
    this.standaloneHttpNodeList = new StandaloneHttpNodeCache(this.db);
    this.projects = new ProjectCache(this.db);
    this.commonHeaders = new CommonHeaderCache(this.db);
    this.rules = new RuleCache(this.db);
    this.variables = new VariableCache(this.db);
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
    const docsList = await this.standaloneHttpNodeList.getDocsList();
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
  async getDocsByProjectId(projectId: string): Promise<ApiNode[]> {
    return this.standaloneHttpNodeList.getDocsByProjectId(projectId);
  }
  async getDocById(docId: string): Promise<ApiNode | null> {
    return this.standaloneHttpNodeList.getDocById(docId);
  }
  async deleteDocsByProjectId(projectId: string): Promise<boolean> {
    return this.standaloneHttpNodeList.deleteDocsByProjectId(projectId);
  }
  async getApiNodesAsTree(projectId: string) {
    return this.standaloneHttpNodeList.getApiNodesAsTree(projectId);
  }

  // 文档相关
  async getDocsList(): Promise<ApiNode[]> {
    return this.standaloneHttpNodeList.getDocsList();
  }
  async addDoc(doc: ApiNode): Promise<boolean> {
    return this.standaloneHttpNodeList.addDoc(doc);
  }
  async updateDoc(doc: ApiNode): Promise<boolean> {
    return this.standaloneHttpNodeList.updateDoc(doc);
  }
  async updateDocName(docId: string, name: string): Promise<boolean> {
    return this.standaloneHttpNodeList.updateDocName(docId, name);
  }
  async deleteDoc(docId: string): Promise<boolean> {
    return this.standaloneHttpNodeList.deleteDoc(docId);
  }
  async deleteDocs(docIds: string[]): Promise<boolean> {
    return this.standaloneHttpNodeList.deleteDocs(docIds);
  }
  async restoreDoc(docId: string): Promise<string[]> {
    return this.standaloneHttpNodeList.restoreDoc(docId);
  }
  async getDeletedDocsList(projectId: string) {
    return this.standaloneHttpNodeList.getDeletedDocsList(projectId);
  }
  async replaceAllDocs(docs: ApiNode[], projectId: string): Promise<boolean> {
    return this.standaloneHttpNodeList.replaceAllDocs(docs, projectId);
  }
  async appendDocs(docs: ApiNode[], projectId: string): Promise<string[]> {
    return this.standaloneHttpNodeList.appendDocs(docs, projectId);
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

  // 变量相关
  async addVariable(variable: Omit<ApidocVariable, '_id'> & { _id?: string }) {
    return this.variables.add(variable);
  }
  async updateVariable(variableId: string, updates: Partial<ApidocVariable>) {
    return this.variables.update(variableId, updates);
  }
  async deleteVariables(ids: string[]) {
    return this.variables.delete(ids);
  }
  async getAllVariables(projectId: string) {
    return this.variables.getAll(projectId);
  }
  async getVariableById(variableId: string) {
    return this.variables.getById(variableId);
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<boolean> {
    try {
      if (!this.db) throw new Error("Database not initialized");
      
      // 获取所有数据
      const docsList = await this.standaloneHttpNodeList.getDocsList();
      const projectList = await this.projects.getProjectList();
      
      // 保留已删除的数据
      const deletedDocs = docsList.filter(doc => doc.isDeleted);
      const deletedProjects = projectList.filter(project => project.isDeleted);
      
      // 清空所有数据
      const stores = ['docs', 'projects', 'commonHeaders', 'rules', 'variables'];
      for (const storeName of stores) {
        const tx = this.db.transaction(storeName, 'readwrite');
        await tx.objectStore(storeName).clear();
        await tx.done;
      }
      
      // 恢复已删除的数据
      for (const doc of deletedDocs) {
        await this.standaloneHttpNodeList.addDoc(doc);
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