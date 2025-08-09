import { IDBPDatabase } from "idb";
import type { ApidocVariable, Response } from "@src/types/global";
import { nanoid } from "nanoid";

export class VariableCache {
  constructor(private db: IDBPDatabase | null = null) {}

  /**
   * 新增变量
   */
  async add(variable: Omit<ApidocVariable, '_id'> & { _id?: string }): Promise<Response<ApidocVariable>> {
    try {
      if (!this.db) {
        return { code: 1, msg: "Database not initialized", data: null as any };
      }

      // 检查变量名称在同一项目下是否重复
      try {
        const checkTx = this.db.transaction("variables", "readonly");
        const checkStore = checkTx.objectStore("variables");
        let projectVariables: ApidocVariable[] = [];
        
        try {
          const index = checkStore.index("projectId");
          projectVariables = await index.getAll(variable.projectId);
        } catch (indexError) {
          // 如果索引不存在，回退到全量查询
          const allVariables = await checkStore.getAll();
          projectVariables = allVariables.filter(v => v.projectId === variable.projectId);
        }
        
        await checkTx.done;
        
        const nameExists = projectVariables.some(v => v.name === variable.name);
        if (nameExists) {
          return { code: 1, msg: "变量名称已存在", data: null as any };
        }
      } catch (checkError) {
        console.error("检查变量名称重复失败:", checkError);
        // 如果检查失败，继续执行添加操作
      }

      const id = nanoid()
      const variableWithId: ApidocVariable = {
        ...variable,
        _id: id
      };
      
      const addTx = this.db.transaction("variables", "readwrite");
      const addStore = addTx.objectStore("variables");
      await addStore.put(variableWithId, id);
      await addTx.done;
      return { code: 0, msg: "success", data: variableWithId };
    } catch (error) {
      console.error("添加变量失败:", error);
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "添加变量失败",
        data: null as any
      };
    }
  }

  /**
   * 修改变量
   */
  async update(id: string, updates: Partial<ApidocVariable>): Promise<Response<ApidocVariable>> {
    try {
      if (!this.db) {
        return { code: 1, msg: "Database not initialized", data: null as any };
      }

      if (!id) {
        return { code: 1, msg: "变量ID不能为空", data: null as any };
      }

      // 先获取现有变量
      const readTx = this.db.transaction("variables", "readonly");
      const readStore = readTx.objectStore("variables");
      const existingVariable = await readStore.get(id);
      await readTx.done;

      if (!existingVariable) {
        return { code: 1, msg: "变量不存在", data: null as any };
      }

      // 如果更新了变量名称，检查在同一项目下是否重复
      if (updates.name && updates.name !== existingVariable.name) {
        try {
          // 使用索引查询同项目下的所有变量
          const checkTx = this.db.transaction("variables", "readonly");
          const checkStore = checkTx.objectStore("variables");
          let projectVariables: ApidocVariable[] = [];
          
          try {
            const index = checkStore.index("projectId");
            projectVariables = await index.getAll(existingVariable.projectId);
          } catch (indexError) {
            // 如果索引不存在，回退到全量查询
            const allVariables = await checkStore.getAll();
            projectVariables = allVariables.filter(v => v.projectId === existingVariable.projectId);
          }
          
          await checkTx.done;
          
          const nameExists = projectVariables.some(v => v.name === updates.name && v._id !== id);
          if (nameExists) {
            return { code: 1, msg: "变量名称已存在", data: null as any };
          }
        } catch (checkError) {
          console.error("检查变量名称重复失败:", checkError);
          // 如果检查失败，继续执行更新操作
        }
      }

      // 执行更新操作
      const updateTx = this.db.transaction("variables", "readwrite");
      const updateStore = updateTx.objectStore("variables");
      
      const updatedVariable: ApidocVariable = {
        ...existingVariable,
        ...updates,
        _id: id
      };

      await updateStore.put(updatedVariable, id);
      await updateTx.done;
      return { code: 0, msg: "success", data: updatedVariable };
    } catch (error) {
      console.error("更新变量失败:", error);
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "更新变量失败",
        data: null as any
      };
    }
  }

  /**
   * 批量删除变量
   */
  async delete(ids: string[]): Promise<Response<void>> {
    try {
      if (!this.db) {
        return { code: 1, msg: "Database not initialized", data: null as any };
      }

      const tx = this.db.transaction("variables", "readwrite");
      const store = tx.objectStore("variables");

      for (const id of ids) {
        if (id) {
          // 检查变量是否存在，存在则删除，不存在则跳过
          const variable = await store.get(id);
          if (variable) {
            await store.delete(id);
          }
        }
      }

      await tx.done;

      return { code: 0, msg: "success", data: null as any };
    } catch (error) {
      console.error("删除变量失败:", error);
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "删除变量失败",
        data: null as any
      };
    }
  }

  /**
   * 查询所有变量
   * @param projectId 项目ID
   * @returns 变量数组
   */
  async getAll(projectId: string): Promise<Response<ApidocVariable[]>> {
    try {
      if (!this.db) {
        return { code: 1, msg: "Database not initialized", data: [] };
      }

      const tx = this.db.transaction("variables", "readonly");
      const store = tx.objectStore("variables");

      try {
        // 尝试使用 projectId 索引查询
        const index = store.index("projectId");
        const variables: ApidocVariable[] = await index.getAll(projectId);
        return { code: 0, msg: "success", data: variables };
      } catch (error) {
        // 如果索引不存在，回退到全量查询
        const allVariables: ApidocVariable[] = await store.getAll();
        const projectVariables = allVariables.filter(v => v.projectId === projectId);
        return { code: 0, msg: "success", data: projectVariables };
      }
    } catch (error) {
      console.error("获取变量列表失败:", error);
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "获取变量列表失败",
        data: []
      };
    }
  }

  /**
   * 根据变量ID获取单个变量
   */
  async getById(variableId: string): Promise<Response<ApidocVariable | null>> {
    try {
      if (!this.db) {
        return { code: 1, msg: "Database not initialized", data: null };
      }

      if (!variableId) {
        return { code: 1, msg: "变量ID不能为空", data: null };
      }

      const tx = this.db.transaction("variables", "readonly");
      const store = tx.objectStore("variables");
      const variable = await store.get(variableId);

      return { code: 0, msg: "success", data: variable || null };
    } catch (error) {
      console.error("获取变量失败:", error);
      return {
        code: 1,
        msg: error instanceof Error ? error.message : "获取变量失败",
        data: null
      };
    }
  }
}