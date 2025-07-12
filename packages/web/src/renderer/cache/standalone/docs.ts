import { IDBPDatabase } from "idb";
import type { ApidocDetail } from "@src/types/global";

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

  async addDoc(doc: ApidocDetail): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    await store.put(doc, doc._id);
    await tx.done;
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
    return true;
  }

  async deleteDocs(docIds: string[]): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    
    for (const docId of docIds) {
      const existingDoc = await store.get(docId);
      if (existingDoc) {
        await store.put({
          ...existingDoc,
          isDeleted: true,
          updatedAt: new Date().toISOString()
        }, docId);
      }
    }
    
    await tx.done;
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
} 