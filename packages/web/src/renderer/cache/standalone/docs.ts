import { IDBPDatabase } from "idb";
import type { ApidocDetail } from "@src/types/global";

export class DocCache {
  constructor(private db: IDBPDatabase | null = null) {}

  async getDocsList(): Promise<ApidocDetail[]> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readonly");
    const store = tx.objectStore("docs");
    const keys = await store.getAllKeys();
    const docs: ApidocDetail[] = [];
    
    for (const key of keys) {
      const doc = await store.get(key);
      if (doc && !doc.isDeleted) {
        docs.push(doc);
      }
    }
    
    return docs;
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

  async deleteDoc(docId: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");
    const tx = this.db.transaction("docs", "readwrite");
    const store = tx.objectStore("docs");
    const existingDoc = await store.get(docId);
    
    if (!existingDoc) return false;
    
    const updatedDoc = {
      ...existingDoc,
      isDeleted: true
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
          isDeleted: true
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
} 