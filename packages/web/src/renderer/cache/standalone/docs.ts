import { IDBPDatabase } from "idb";
import type { ApidocDetail } from "@src/types/global";
import { nanoid } from "nanoid";

export class DocCache {
  constructor(private db: IDBPDatabase | null = null) {}

  async getDocsList(): Promise<ApidocDetail[]> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readonly");
    const store = tx.objectStore("docs");
    const allDocs = await store.getAll();
    return allDocs.filter(doc => doc && !doc.isDeleted);
  }

  async getDocsByProjectId(projectId: string) {
    const docsList = await this.getDocsList();
    return docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted);
  }

  async getDocById(docId: string): Promise<ApidocDetail | null> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readonly");
    const store = tx.objectStore("docs");
    const doc = await store.get(docId);
    return doc && !doc.isDeleted ? doc : null;
  }

  async getDocTree(projectId: string) {
    const docsList = await this.getDocsList();
    const projectDocs = docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted);
    const { convertDocsToBanner } = await import("@/helper/index");
    return convertDocsToBanner(projectDocs);
  }

  async getFolderTree(projectId: string) {
    const docsList = await this.getDocsList();
    const projectDocs = docsList.filter(doc => doc.projectId === projectId && !doc.isDeleted);
    const { convertDocsToFolder } = await import("@/helper/index");
    return convertDocsToFolder(projectDocs);
  }

  private async updateProjectDocNum(projectId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction(["docs", "projects"], "readwrite");
    const docsStore = tx.objectStore("docs");
    const projectsStore = tx.objectStore("projects");

    const allDocs = await docsStore.getAll();
    const docNum = allDocs.filter(doc => 
      doc.projectId === projectId && 
      !doc.isDeleted && 
      !doc.isFolder // Exclude folders from the count
    ).length;
    
    const project = await projectsStore.get(projectId);
    if (project) {
      await projectsStore.put({ ...project, docNum }, projectId);
    }
    
    await tx.done;
  }

  async addDoc(doc: ApidocDetail): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    await store.put(doc, doc._id);
    await tx.done;
    await this.updateProjectDocNum(doc.projectId);
    return true;
  }

  async updateDoc(doc: ApidocDetail): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    const existingDoc = await store.get(doc._id);
    if (!existingDoc) return false;
    await store.put(doc, doc._id);
    await tx.done;
    return true;
  }
  async updateDocName(docId: string, name: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    const existingDoc = await store.get(docId);
    if (!existingDoc) return false;
    existingDoc.info.name = name;
    await store.put(existingDoc, docId);
    await tx.done;
    return true;
  }

  async deleteDoc(docId: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    const existingDoc = await store.get(docId);
    
    if (!existingDoc) return false;
    
    const updatedDoc = {
      ...existingDoc,
      isDeleted: true,
      updatedAt: new Date().toISOString()
    };
    
    await store.put(updatedDoc, docId);
    await tx.done;
    await this.updateProjectDocNum(existingDoc.projectId);
    return true;
  }

  async deleteDocs(docIds: string[]): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    
    let projectId: string | null = null;
    for (const docId of docIds) {
      const existingDoc = await store.get(docId);
      if (existingDoc) {
        projectId = existingDoc.projectId;
        await store.put({
          ...existingDoc,
          isDeleted: true,
          updatedAt: new Date().toISOString()
        }, docId);
      }
    }
    
    await tx.done;
    if (projectId) {
      await this.updateProjectDocNum(projectId);
    }
    return true;
  }

  async deleteDocsByProjectId(projectId: string): Promise<boolean> {
    const projectDocs = await this.getDocsByProjectId(projectId);
    if (projectDocs.length === 0) return true;
    return await this.deleteDocs(projectDocs.map(doc => doc._id));
  }

  async getDeletedDocsList(projectId: string) {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readonly");
    const store = tx.objectStore("docs");
    const allDocs: ApidocDetail[] = await store.getAll();
    
    return allDocs
      .filter(doc => doc.projectId === projectId && doc.isDeleted)
      .map(doc => ({
        name: doc.info.name,
        type: doc.info.type,
        deletePerson: doc.info.deletePerson,
        isFolder: doc.isFolder,
        host: doc.item.url.host,
        path: doc.item.url.path,
        method: doc.item.method,
        updatedAt: doc.updatedAt || new Date().toISOString(),
        _id: doc._id,
        pid: doc.pid
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  async restoreDoc(docId: string): Promise<string[]> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    const existingDoc = await store.get(docId);
    const result: string[] = [docId];
    if (!existingDoc) return [];
    existingDoc.isDeleted = false;
    await store.put(existingDoc, docId);
    let currentPid = existingDoc.pid;
    while (currentPid) {
      const parentDoc = await store.get(currentPid);
      if (!parentDoc) break;
      if (parentDoc.isDeleted) {
        parentDoc.isDeleted = false;
        await store.put(parentDoc, currentPid);
        result.push(currentPid);
      }
      currentPid = parentDoc.pid;
    }
    await tx.done;
    return result;
  }

  /**
   * 覆盖替换所有接口文档
   * @param docs 要替换的文档列表
   * @param projectId 项目ID
   * @returns 是否成功
   */
  async replaceAllDocs(docs: ApidocDetail[], projectId: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");

    try {
      // 1. 软删除项目下所有现有文档
      const existingDocs = await store.getAll();
      await Promise.all(
        existingDocs
          .filter(doc => doc.projectId === projectId)
          .map(doc => store.put({
            ...doc,
            isDeleted: true,
            updatedAt: new Date().toISOString()
          }, doc._id))
      );

      // 2. 处理文档ID和关系映射
      const { processedDocs } = this.prepareDocsWithNewIds(docs, projectId);

      // 3. 批量保存处理后的文档
      await Promise.all(processedDocs.map(doc => store.put(doc, doc._id)));

      await tx.done;
      await this.updateProjectDocNum(projectId);
      return true;
    } catch (error) {
      console.error('Failed to replace docs:', error);
      return false;
    }
  }

  /**
   * 创建ID映射并更新文档关系
   * @param docs 要处理的文档列表
   * @param projectId 项目ID
   * @returns 处理后的文档列表和ID映射
   */
  private prepareDocsWithNewIds(docs: ApidocDetail[], projectId: string): {
    processedDocs: ApidocDetail[];
    idMapping: Map<string, string>;
  } {
    const idMapping = new Map<string, string>();
    const processedDocs: ApidocDetail[] = [];

    // 第一步：为所有文档生成新的ID并创建映射
    for (const doc of docs) {
      const oldId = doc._id;
      const newId = nanoid();
      idMapping.set(oldId, newId);

      // 创建文档副本并更新基本信息
      const processedDoc: ApidocDetail = {
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

  /**
   * 批量追加接口文档
   * @param docs 要追加的文档列表
   * @param projectId 项目ID
   * @returns 成功追加的文档ID列表
   */
  async appendDocs(docs: ApidocDetail[], projectId: string): Promise<string[]> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    const successIds: string[] = [];

    try {
      // 处理文档ID和关系映射
      const { processedDocs } = this.prepareDocsWithNewIds(docs, projectId);

      // 批量保存处理后的文档
      for (const doc of processedDocs) {
        await store.put(doc, doc._id);
        successIds.push(doc._id);
      }

      await tx.done;
      await this.updateProjectDocNum(projectId);
      return successIds;
    } catch (error) {
      console.error('Failed to append docs:', error);
      return successIds;
    }
  }
} 