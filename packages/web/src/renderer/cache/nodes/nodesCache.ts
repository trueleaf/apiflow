import type { ApidocType, ApiNode } from "@src/types";
import { nanoid } from "nanoid";
import { openDB, type IDBPDatabase } from 'idb';
import { config } from '@src/config/config';
import { logger, convertNodesToBannerNodes } from '@/helper';
export class ApiNodesCache {
  private bannerCache = new Map<
    string,
    { data: ApiNode[]; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private apiNodesDB: IDBPDatabase | null = null;
  private projectDB: IDBPDatabase | null = null;
  private storeName = config.cacheConfig.apiNodesCache.storeName;
  private projectStoreName = config.cacheConfig.projectCache.storeName;
  constructor() {
    this.initDB().catch(error => {
      logger.error('初始化节点缓存数据库失败', { error });
    });
  }
  private async initDB() {
    if (this.apiNodesDB && this.projectDB) {
      return;
    }
    try {
      this.apiNodesDB = await this.openApiNodesDB();
      this.projectDB = await this.openProjectDB();
    } catch (error) {
      logger.error('初始化节点缓存数据库失败', { error });
      this.apiNodesDB = null;
      this.projectDB = null;
    }
  }
  private async getDB() {
    if (!this.apiNodesDB) {
      await this.initDB();
    }
    if (!this.apiNodesDB) {
      throw new Error('接口文档数据库初始化失败');
    }
    return this.apiNodesDB;
  }
  private async getProjectDB() {
    if (!this.projectDB) {
      await this.initDB();
    }
    if (!this.projectDB) {
      throw new Error('项目数据库初始化失败');
    }
    return this.projectDB;
  }
  private async openApiNodesDB(): Promise<IDBPDatabase> {
    if (this.apiNodesDB) {
      return this.apiNodesDB;
    }
    this.apiNodesDB = await openDB(
      config.cacheConfig.apiNodesCache.dbName,
      config.cacheConfig.apiNodesCache.version,
      {
        upgrade(db) {
          if (!db.objectStoreNames.contains(config.cacheConfig.apiNodesCache.storeName)) {
            const httpNodeListStore = db.createObjectStore(config.cacheConfig.apiNodesCache.storeName);
            httpNodeListStore.createIndex(
              config.cacheConfig.apiNodesCache.projectIdIndex,
              config.cacheConfig.apiNodesCache.projectIdIndex,
              { unique: false }
            );
          }
        },
      }
    );
    return this.apiNodesDB;
  }
  private async openProjectDB(): Promise<IDBPDatabase> {
    if (this.projectDB) {
      return this.projectDB;
    }
    this.projectDB = await openDB(
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
    return this.projectDB;
  }
  // 获取所有节点
  async getAllNodes(): Promise<ApiNode[]> {
    try {
      const db = await this.getDB();
      const allDocs = await db.getAll(this.storeName);
      return allDocs.filter((doc) => doc && !doc.isDeleted);
    } catch (error) {
      logger.error('获取节点列表失败', { error });
      return [];
    }
  }
  // 获取项目下面所有节点
  async getNodesByProjectId(projectId: string): Promise<ApiNode[]> {
    const cached = this.bannerCache.get(projectId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    try {
      const db = await this.getDB();
      const docs: ApiNode[] = await db.getAllFromIndex(this.storeName, config.cacheConfig.apiNodesCache.projectIdIndex, projectId);
      const filteredDocs = docs.filter((doc) => !doc.isDeleted);
      this.bannerCache.set(projectId, {
        data: filteredDocs,
        timestamp: Date.now(),
      });
      return filteredDocs;
    } catch (error) {
      logger.error('按索引获取节点列表失败', { error });
      return [];
    }
  }
  // 根据节点id获取节点信息
  async getNodeById(nodeId: string): Promise<ApiNode | null> {
    try {
      const db = await this.getDB();
      const doc = await db.get(this.storeName, nodeId);
      if (doc && !doc.isDeleted) {
        return doc;
      }
      return null;
    } catch (error) {
      logger.error('根据ID获取节点失败', { error });
      return null;
    }
  }
  // 添加一个节点
  async addNode(node: ApiNode): Promise<boolean> {
    try {
      const db = await this.getDB();
      await db.put(this.storeName, node, node._id);
      await this.updateProjectNodeNum(node.projectId);
      this.bannerCache.delete(node.projectId);
      return true;
    } catch (error) {
      logger.error('新增节点失败', { error });
      return false;
    }
  }
  // 新增或修改一个节点
  async replaceNode(node: ApiNode): Promise<boolean> {
    try {
      const db = await this.getDB();
      const existingDoc = await db.get(this.storeName, node._id);
      if (!existingDoc) return false;
      await db.put(this.storeName, node, node._id);
      this.bannerCache.delete(node.projectId);
      return true;
    } catch (error) {
      logger.error('更新节点失败', { error });
      return false;
    }
  }
  // 更新节点名称
  async updateNodeName(nodeId: string, name: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const existingDoc = await db.get(this.storeName, nodeId);
      if (!existingDoc) return false;
      existingDoc.info.name = name;
      await db.put(this.storeName, existingDoc, nodeId);
      this.bannerCache.delete(existingDoc.projectId);
      return true;
    } catch (error) {
      logger.error('更新节点名称失败', { error });
      return false;
    }
  }
  // 根据节点ID更新节点的部分字段
  async updateNodeById(nodeId: string, updates: Partial<ApiNode>): Promise<boolean> {
    try {
      const db = await this.getDB();
      const existingDoc = await db.get(this.storeName, nodeId);
      if (!existingDoc) return false;
      const updatedDoc = {
        ...existingDoc,
        ...updates,
        _id: nodeId,
        updatedAt: new Date().toISOString(),
      };
      await db.put(this.storeName, updatedDoc, nodeId);
      this.bannerCache.delete(existingDoc.projectId);
      return true;
    } catch (error) {
      logger.error('按ID更新节点失败', { error });
      return false;
    }
  }
  // 删除一个节点
  async deleteNode(nodeId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const existingDoc = await db.get(this.storeName, nodeId);
      if (!existingDoc) return false;
      const updatedDoc = {
        ...existingDoc,
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      };
      await db.put(this.storeName, updatedDoc, nodeId);
      await this.updateProjectNodeNum(existingDoc.projectId);
      this.bannerCache.delete(existingDoc.projectId);
      return true;
    } catch (error) {
      logger.error('删除节点失败', { error });
      return false;
    }
  }
  // 批量删除节点
  async deleteNodes(nodeIds: string[]): Promise<boolean> {
    if (nodeIds.length === 0) return true;
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    try {
      let projectId: string | null = null;
      const updatedTimestamp = new Date().toISOString();
      for (const nodeId of nodeIds) {
        const existingDoc = await store.get(nodeId);
        if (existingDoc) {
          projectId = existingDoc.projectId;
          await store.put({
            ...existingDoc,
            isDeleted: true,
            updatedAt: updatedTimestamp,
          }, nodeId);
        }
      }
      await tx.done;
      if (projectId) {
        await this.updateProjectNodeNum(projectId);
        this.bannerCache.delete(projectId);
      }
      return true;
    } catch (error) {
      logger.error('批量删除节点失败', { error });
      return false;
    }
  }
  // 删除整个项目的节点
  async deleteNodesByProjectId(projectId: string): Promise<boolean> {
    const projectNodes = await this.getNodesByProjectId(projectId);
    if (projectNodes.length === 0) return true;
    return await this.deleteNodes(projectNodes.map((node) => node._id));
  }
  // 获取已删除节点列表
  async getDeletedNodesList(projectId: string) {
    try {
      const db = await this.getDB();
      const allDocs = await db.getAllFromIndex(this.storeName, config.cacheConfig.apiNodesCache.projectIdIndex, projectId);
      return allDocs
        .filter((doc) => doc.isDeleted).sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    } catch (error) {
      logger.error('获取已删除节点列表失败', { error });
      return [];
    }
  }
  // 恢复已删除的文档
  async restoreNode(nodeId: string): Promise<string[]> {
    try {
      const db = await this.getDB();
      const existingDoc = await db.get(this.storeName, nodeId);
      const result: string[] = [nodeId];
      if (!existingDoc) return [];
      existingDoc.isDeleted = false;
      await db.put(this.storeName, existingDoc, nodeId);
      let currentPid = existingDoc.pid;
      while (currentPid) {
        const parentDoc = await db.get(this.storeName, currentPid);
        if (!parentDoc) break;
        if (parentDoc.isDeleted) {
          parentDoc.isDeleted = false;
          await db.put(this.storeName, parentDoc, currentPid);
          result.push(currentPid);
        }
        currentPid = parentDoc.pid;
      }
      this.bannerCache.delete(existingDoc.projectId);
      return result;
    } catch (error) {
      logger.error('恢复节点失败', { error });
      return [];
    }
  }
  // 覆盖替换所有接口文档
  async replaceAllNodes(nodes: ApiNode[], projectId: string): Promise<boolean> {
    const db = await this.getDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const store = tx.objectStore(this.storeName);
    try {
      let existingDocs: ApiNode[];
      try {
        const index = store.index(config.cacheConfig.apiNodesCache.projectIdIndex);
        existingDocs = await index.getAll(projectId);
      } catch (error) {
        logger.error('按索引读取节点失败，使用全量数据', { error });
        const allDocs = await store.getAll();
        existingDocs = allDocs.filter((doc) => doc.projectId === projectId);
      }
      const updatedTimestamp = new Date().toISOString();
      for (const doc of existingDocs) {
        await store.put({
          ...doc,
          isDeleted: true,
          updatedAt: updatedTimestamp,
        }, doc._id);
      }
      const { processedDocs } = this.prepareDocsWithNewIds(nodes, projectId);
      for (const doc of processedDocs) {
        await store.put(doc, doc._id);
      }
      await tx.done;
      await this.updateProjectNodeNum(projectId);
      this.bannerCache.delete(projectId);
      return true;
    } catch (error) {
      logger.error('覆盖导入节点失败', { error });
      return false;
    }
  }
  // 批量追加接口文档
  async appendNodes(nodes: ApiNode[], projectId: string): Promise<string[]> {
    const successIds: string[] = [];
    try {
      const db = await this.getDB();
      const { processedDocs } = this.prepareDocsWithNewIds(nodes, projectId);
      const savePromises = processedDocs.map(async (doc) => {
        await db.put(this.storeName, doc, doc._id);
        return doc._id;
      });
      const savedIds = await Promise.all(savePromises);
      successIds.push(...savedIds);
      await this.updateProjectNodeNum(projectId);
      this.bannerCache.delete(projectId);
      return successIds;
    } catch (error) {
      logger.error('追加节点失败', { error });
      return successIds;
    }
  }
  // 更新项目内节点数量(不包含文件夹)
  private async updateProjectNodeNum(projectId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const projectDB = await this.getProjectDB();
      const projectDocs = await db.getAllFromIndex(this.storeName, config.cacheConfig.apiNodesCache.projectIdIndex, projectId);
      const docNum = projectDocs.filter(
        (doc) =>
          !doc.isDeleted &&
          doc.info.type !== "folder"
      ).length;
      const project = await projectDB.get(this.projectStoreName, projectId);
      if (project) {
        await projectDB.put(this.projectStoreName, { ...project, docNum }, projectId);
      }
    } catch (error) {
      logger.error('更新项目文档数量失败', { error });
    }
  }
  // 以树形方式获取文件夹
  async getApiNodesAsTree(projectId: string, filterType?: ApidocType) {
    const projectNodes = await this.getNodesByProjectId(projectId);
    const folderNodes = projectNodes.filter(node => {
      if (!filterType) {
        return true;
      }
      return node.info.type === 'folder';
    });
    return convertNodesToBannerNodes(folderNodes);
  }
  // getDocTree是getApiNodesAsTree的别名，用于兼容性
  async getDocTree(projectId: string) {
    return this.getApiNodesAsTree(projectId, 'folder');
  }
  // 创建ID映射并更新文档关系
  private prepareDocsWithNewIds(
    docs: ApiNode[],
    projectId: string
  ): {
    processedDocs: ApiNode[];
    idMapping: Map<string, string>;
  } {
    const idMapping = new Map<string, string>();
    const processedDocs: ApiNode[] = [];
    // 第一步：为所有文档生成新的ID并创建映射
    for (const doc of docs) {
      const oldId = doc._id;
      const newId = nanoid();
      idMapping.set(oldId, newId);
      // 创建文档副本并更新基本信息
      const processedDoc = {
        ...doc,
        _id: newId,
        projectId,
        // 暂时保留原始pid，稍后会更新
      };
      processedDocs.push(processedDoc);
    }
    // 第二步：更新所有父子关系
    for (const doc of processedDocs) {
      if (doc.pid) {
        // 如果父ID在映射中存在，使用新的父ID
        const newParentId = idMapping.get(doc.pid);
        if (newParentId) {
          doc.pid = newParentId;
        }
        // 如果父ID不在导入的文档中，保留原始pid（可能是挂载到现有节点）
      }
    }
    return { processedDocs, idMapping };
  }
}
// 导出单例
export const apiNodesCache = new ApiNodesCache();