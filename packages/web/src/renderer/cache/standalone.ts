
import type { ApidocProjectInfo, ApidocProperty, ApidocVariable, ApiNode, ApidocProjectRules } from '@src/types';
import { ApiNodesCache } from "./standalone/apiNodes";
import { ProjectCache } from "./project/projects";
import { CommonHeaderCache } from "./project/commonHeaders";
import { StandaloneRuleCache } from "./standalone/rules";
import { VariableCache } from "./variable/variable";
import { IDBPDatabase, openDB } from "idb";
import { config } from "@src/config/config.ts";

export class StandaloneCache {
  public db: IDBPDatabase | null = null;
  
  // 组合各 cache
  standaloneHttpNodeList: ApiNodesCache;
  standaloneProjects: ProjectCache;
  standaloneCommonHeaders: CommonHeaderCache;
  standaloneRules: StandaloneRuleCache;
  standaloneVariables: VariableCache;

  constructor() {
    this.standaloneHttpNodeList = new ApiNodesCache(null);
    this.standaloneProjects = new ProjectCache(null);
    this.standaloneCommonHeaders = new CommonHeaderCache(null);
    this.standaloneRules = new StandaloneRuleCache(null);
    this.standaloneVariables = new VariableCache(null);
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
          if (!db.objectStoreNames.contains("httpNodeList")) {
            const httpNodeListStore = db.createObjectStore("httpNodeList");
            // 添加 projectId 索引以优化按项目查询
            httpNodeListStore.createIndex("projectId", "projectId", { unique: false });
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
    this.standaloneHttpNodeList = new ApiNodesCache(this.db);
    this.standaloneProjects = new ProjectCache(this.db);
    this.standaloneCommonHeaders = new CommonHeaderCache(this.db);
    this.standaloneRules = new StandaloneRuleCache(this.db);
    this.standaloneVariables = new VariableCache(this.db);
  }

  // 项目相关
  async getProjectList() {
    return this.standaloneProjects.getProjectList();
  }
  async setProjectList(list: ApidocProjectInfo[]): Promise<boolean> {
    return this.standaloneProjects.setProjectList(list);
  }
  async getProjectInfo(projectId: string): Promise<ApidocProjectInfo | null> {
    return this.standaloneProjects.getProjectInfo(projectId);
  }
  async addProject(project: ApidocProjectInfo): Promise<boolean> {
    return this.standaloneProjects.addProject(project);
  }
  async updateProject(projectId: string, project: Partial<ApidocProjectInfo>): Promise<boolean> {
    return this.standaloneProjects.updateProject(projectId, project);
  }
  async deleteProject(projectId: string): Promise<boolean> {
    return this.standaloneProjects.deleteProject(projectId);
  }
  async updateProjectDocNum(projectId: string): Promise<boolean> {
    const nodesList = await this.standaloneHttpNodeList.getNodeList();
    const projectNodes = nodesList.filter(node => node.projectId === projectId && !node.isDeleted);
    const docNum = projectNodes.length;
    const projectList = await this.standaloneProjects.getProjectList();
    const projectIndex = projectList.findIndex(p => p._id === projectId);
    if (projectIndex === -1) return false;
    projectList[projectIndex] = {
      ...projectList[projectIndex],
      docNum
    };
    return await this.standaloneProjects.setProjectList(projectList);
  }
  async getNodesByProjectId(projectId: string): Promise<ApiNode[]> {
    return this.standaloneHttpNodeList.getNodesByProjectId(projectId);
  }
  async getNodeById(nodeId: string): Promise<ApiNode | null> {
    return this.standaloneHttpNodeList.getNodeById(nodeId);
  }
  async deleteNodesByProjectId(projectId: string): Promise<boolean> {
    return this.standaloneHttpNodeList.deleteNodesByProjectId(projectId);
  }
  async getApiNodesAsTree(projectId: string) {
    return this.standaloneHttpNodeList.getApiNodesAsTree(projectId);
  }

  // 文档相关
  async getNodeList(): Promise<ApiNode[]> {
    return this.standaloneHttpNodeList.getNodeList();
  }
  async addNode(node: ApiNode): Promise<boolean> {
    return this.standaloneHttpNodeList.addNode(node);
  }
  async updateNode(node: ApiNode): Promise<boolean> {
    return this.standaloneHttpNodeList.updateNode(node);
  }
  async updateNodeName(nodeId: string, name: string): Promise<boolean> {
    return this.standaloneHttpNodeList.updateNodeName(nodeId, name);
  }
  async deleteNode(nodeId: string): Promise<boolean> {
    return this.standaloneHttpNodeList.deleteNode(nodeId);
  }
  async deleteNodes(nodeIds: string[]): Promise<boolean> {
    return this.standaloneHttpNodeList.deleteNodes(nodeIds);
  }
  async restoreNode(nodeId: string): Promise<string[]> {
    return this.standaloneHttpNodeList.restoreNode(nodeId);
  }
  async getDeletedNodesList(projectId: string) {
    return this.standaloneHttpNodeList.getDeletedNodesList(projectId);
  }
  async replaceAllNodes(nodes: ApiNode[], projectId: string): Promise<boolean> {
    return this.standaloneHttpNodeList.replaceAllNodes(nodes, projectId);
  }
  async appendNodes(nodes: ApiNode[], projectId: string): Promise<string[]> {
    return this.standaloneHttpNodeList.appendNodes(nodes, projectId);
  }
  // 公共请求头相关
  async getCommonHeaders(): Promise<ApidocProperty<'string'>[]> {
    return this.standaloneCommonHeaders.getCommonHeaders();
  }
  async setCommonHeaders(commonHeaders: ApidocProperty<'string'>[]): Promise<boolean> {
    return this.standaloneCommonHeaders.setCommonHeaders(commonHeaders);
  }

  // 规则相关
  async getAllProjectRules(): Promise<Record<string, ApidocProjectRules>> {
    return this.standaloneRules.getAllProjectRules();
  }
  async setAllProjectRules(rules: Record<string, ApidocProjectRules>): Promise<boolean> {
    return this.standaloneRules.setAllProjectRules(rules);
  }
  async getProjectRules(projectId: string): Promise<ApidocProjectRules | null> {
    return this.standaloneRules.getProjectRules(projectId);
  }
  async setProjectRules(projectId: string, rules: ApidocProjectRules): Promise<boolean> {
    return this.standaloneRules.setProjectRules(projectId, rules);
  }
  async deleteProjectRules(projectId: string): Promise<boolean> {
    return this.standaloneRules.deleteProjectRules(projectId);
  }

  // 变量相关
  async addVariable(variable: Omit<ApidocVariable, '_id'> & { _id?: string }) {
    return this.standaloneVariables.addVariable(variable);
  }
  async updateVariable(variableId: string, updates: Partial<ApidocVariable>) {
    return this.standaloneVariables.updateVariableById(variableId, updates);
  }
  async deleteVariables(ids: string[]) {
    return this.standaloneVariables.deleteVariableByIds(ids);
  }
  async getAllVariables(projectId: string) {
    return this.standaloneVariables.getVariableByProjectId(projectId);
  }
  async getVariableById(variableId: string) {
    return this.standaloneVariables.getVariableById(variableId);
  }
}

export const standaloneCache = new StandaloneCache();