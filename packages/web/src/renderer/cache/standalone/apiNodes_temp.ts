import type { ApidocType, ApiNode } from "@src/types";
import { nanoid } from "nanoid";
import { getStandaloneDB } from "../db";

export class ApiNodesCache {
  private bannerCache = new Map<
    string,
    { data: ApiNode[]; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存过期时间
  
  private get db() {
    return getStandaloneDB();
  }
  /*
  |--------------------------------------------------------------------------
  | 节点操作相关逻辑
  |--------------------------------------------------------------------------
  */
  // 获取所有节点
  async getNodeList(): Promise<ApiNode[]> {
    try {
      const allDocs = await this.db.getAll("httpNodeList");
      return allDocs.filter((doc) => doc && !doc.isDeleted);
    } catch (error) {
      console.error("Failed to get docs list:", error);
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
      // 尝试使用索引查询
      const docs: ApiNode[] = await this.db.getAllFromIndex("httpNodeList", "projectId", projectId);
      const filteredDocs = docs.filter((doc) => !doc.isDeleted);
      this.bannerCache.set(projectId, {
        data: filteredDocs,
        timestamp: Date.now(),
      });
      return filteredDocs;
    } catch (error) {
      console.warn("Index query failed, falling back to full query:", error);
      // 修复：使用手动过滤而不是递归调用
      try {
        const allDocs = await this.db.getAll("httpNodeList");
        const projectDocs = allDocs.filter((doc) => doc.projectId === projectId && !doc.isDeleted);
        this.bannerCache.set(projectId, {
          data: projectDocs,
          timestamp: Date.now(),
        });
        return projectDocs;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }
    }
  }
  // 根据节点id获取节点信息
  async getNodeById(nodeId: string): Promise<ApiNode | null> {
    
    try {
      const doc = await this.db.get("httpNodeList", nodeId);
      return doc && !doc.isDeleted ? doc : null;
    } catch (error) {
      console.error("Failed to get doc by id:", error);
      return null;
    }
  }
  // 添加一个节点
  async addNode(node: ApiNode): Promise<boolean> {
    
    try {
      await this.db.put("httpNodeList", node, node._id);
      await this.updateProjectNodeNum(node.projectId);
      this.clearBannerCache(node.projectId);
      return true;
    } catch (error) {
      console.error("Failed to add doc:", error);
      return false;
    }
  }
  // 新增或修改一个节点
  async updateNode(node: ApiNode): Promise<boolean> {
    
    try {
      // 先检查文档是否存在
      const existingDoc = await this.db.get("httpNodeList", node._id);
      if (!existingDoc) return false;
      await this.db.put("httpNodeList", node, node._id);
      this.clearBannerCache(node.projectId);
      return true;
    } catch (error) {
      console.error("Failed to update doc:", error);
      return false;
    }
  }
  // 更新节点名称
  async updateNodeName(nodeId: string, name: string): Promise<boolean> {
    
    try {
      const existingDoc = await this.db.get("httpNodeList", nodeId);
      if (!existingDoc) return false;
      existingDoc.info.name = name;
      await this.db.put("httpNodeList", existingDoc, nodeId);
      this.clearBannerCache(existingDoc.projectId);
      return true;
    } catch (error) {
      console.error("Failed to update doc name:", error);
      return false;
    }
  }
  // 删除一个节点
  async deleteNode(nodeId: string): Promise<boolean> {
    
    try {
      const existingDoc = await this.db.get("httpNodeList", nodeId);
      if (!existingDoc) return false;
      const updatedDoc = {
        ...existingDoc,
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      };
      await this.db.put("httpNodeList", updatedDoc, nodeId);
      await this.updateProjectNodeNum(existingDoc.projectId);
      this.clearBannerCache(existingDoc.projectId);
      return true;
    } catch (error) {
      console.error("Failed to delete doc:", error);
      return false;
    }
  }
  // 批量删除节点
  async deleteNodes(nodeIds: string[]): Promise<boolean> {
    
    if (nodeIds.length === 0) return true;

    // 使用事务确保批量操作的原子性
    const tx = this.db.transaction("httpNodeList", "readwrite");
    const store = tx.objectStore("httpNodeList");
    
    try {
      let projectId: string | null = null;
      const updatedTimestamp = new Date().toISOString();

      // 在事务中批量处理所有删除操作
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

      // 等待事务完成
      await tx.done;

      // 更新项目文档数量和清除缓存
      if (projectId) {
        await this.updateProjectNodeNum(projectId);
        this.clearBannerCache(projectId);
      }
      
      return true;
    } catch (error) {
      console.error("Failed to delete docs:", error);
      // 事务会自动回滚，无需手动处理
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
      const allDocs = await this.db.getAllFromIndex("httpNodeList", "projectId", projectId);
      return allDocs
        .filter((doc) => doc.isDeleted).sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    } catch (error) {
      console.error("Failed to get deleted docs list:", error);
      return [];
    }
  }
  // 恢复已删除的文档
  async restoreNode(nodeId: string): Promise<string[]> {
    
    try {
      const existingDoc = await this.db.get("httpNodeList", nodeId);
      const result: string[] = [nodeId];
      if (!existingDoc) return [];
      existingDoc.isDeleted = false;
      await this.db.put("httpNodeList", existingDoc, nodeId);
      // 递归恢复父级文档
      let currentPid = existingDoc.pid;
      while (currentPid) {
        const parentDoc = await this.db.get("httpNodeList", currentPid);
        if (!parentDoc) break;
        if (parentDoc.isDeleted) {
          parentDoc.isDeleted = false;
          await this.db.put("httpNodeList", parentDoc, currentPid);
          result.push(currentPid);
        }
        currentPid = parentDoc.pid;
      }
      
      this.clearBannerCache(existingDoc.projectId);
      return result;
    } catch (error) {
      console.error("Failed to restore doc:", error);
      return [];
    }
  }
  /*
  |--------------------------------------------------------------------------
  | 项目导入
  |    replaceAllNodes代表覆盖导入
  |    appendNodes代表追加导入
  |--------------------------------------------------------------------------
  */
  // 覆盖替换所有接口文档
  async replaceAllNodes(nodes: ApiNode[], projectId: string): Promise<boolean> {
    
    // 使用事务确保替换操作的原子性
    const tx = this.db.transaction("httpNodeList", "readwrite");
    const store = tx.objectStore("httpNodeList");
    try {
      let existingDocs: ApiNode[];
      try {
        const index = store.index("projectId");
        existingDocs = await index.getAll(projectId);
      } catch (error) {
        const allDocs = await store.getAll();
        existingDocs = allDocs.filter((doc) => doc.projectId === projectId);
      }
      const updatedTimestamp = new Date().toISOString();
      // 2. 在事务中批量软删除现有文档
      for (const doc of existingDocs) {
        await store.put({
          ...doc,
          isDeleted: true,
          updatedAt: updatedTimestamp,
        }, doc._id);
      }
      // 3. 处理文档ID和关系映射
      const { processedDocs } = this.prepareDocsWithNewIds(nodes, projectId);
      // 4. 在事务中批量保存处理后的文档
      for (const doc of processedDocs) {
        await store.put(doc, doc._id);
      }
      // 等待事务完成
      await tx.done;
      // 更新项目文档数量和清除缓存
      await this.updateProjectNodeNum(projectId);
      this.clearBannerCache(projectId);
      return true;
    } catch (error) {
      console.error("Failed to replace docs:", error);
      // 事务会自动回滚，无需手动处理
      return false;
    }
  }
  // 批量追加接口文档
  async appendNodes(nodes: ApiNode[], projectId: string): Promise<string[]> {
    
    const successIds: string[] = [];

    try {
      const { processedDocs } = this.prepareDocsWithNewIds(nodes, projectId);
      const savePromises = processedDocs.map(async (doc) => {
        await this.db!.put("httpNodeList", doc, doc._id);
        return doc._id;
      });
      const savedIds = await Promise.all(savePromises);
      successIds.push(...savedIds);
      await this.updateProjectNodeNum(projectId);
      this.clearBannerCache(projectId);
      return successIds;
    } catch (error) {
      console.error("Failed to append docs:", error);
      return successIds;
    }
  }
  /*
  |--------------------------------------------------------------------------
  | 项目相关
  |--------------------------------------------------------------------------
  */
  // 更新项目内节点数量(不包含文件夹)
  private async updateProjectNodeNum(projectId: string): Promise<void> {
    
    try {
      // 使用索引查询优化性能，只获取当前项目的文档
      const projectDocs = await this.db.getAllFromIndex("httpNodeList", "projectId", projectId);
      const docNum = projectDocs.filter(
        (doc) =>
          !doc.isDeleted &&
          doc.info.type !== "folder"
      ).length;
      const project = await this.db.get("projects", projectId);
      if (project) {
        await this.db.put("projects", { ...project, docNum }, projectId);
      }
    } catch (error) {
      console.error("Failed to update project doc number:", error);
    }
  }
  /*
  |--------------------------------------------------------------------------
  | 节点树形菜单区域
  |--------------------------------------------------------------------------
  */
  // 以树形方式获取文件夹
  async getApiNodesAsTree(projectId: string, filterType?: ApidocType) {
    const projectNodes = await this.getNodesByProjectId(projectId);
    const { convertNodesToBannerNodes } = await import("@/helper/index");
    const folderNodes = projectNodes.filter(node => {
      if (!filterType) {
        return true;
      }
      return node.info.type === 'folder';
    });
    return convertNodesToBannerNodes(folderNodes);
  }
  /*
  |--------------------------------------------------------------------------
  | 工具方法
  |--------------------------------------------------------------------------
  */
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
  // 清除banner缓存
  private clearBannerCache(projectId: string): void {
    this.bannerCache.delete(projectId);
  }
}
