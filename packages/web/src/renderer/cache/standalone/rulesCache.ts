import type { ApidocProjectRules } from "@src/types";
import { getStandaloneDB } from "../db";

export class StandaloneRuleCache {
  private get db() {
    return getStandaloneDB();
  }

  async getAllProjectRules(): Promise<Record<string, ApidocProjectRules>> {
    const tx = this.db.transaction("rules", "readonly");
    const store = tx.objectStore("rules");
    const keys = await store.getAllKeys();
    const rules: Record<string, ApidocProjectRules> = {};
    
    for (const key of keys) {
      const rule = await store.get(key);
      if (rule && !rule.isDeleted) {
        rules[key as string] = rule;
      }
    }
    
    return rules;
  }

  async setAllProjectRules(rules: Record<string, ApidocProjectRules>): Promise<boolean> {
    const tx = this.db.transaction("rules", "readwrite");
    const store = tx.objectStore("rules");
    
    // 清空现有数据
    const keys = await store.getAllKeys();
    for (const key of keys) {
      await store.delete(key);
    }
    
    // 存储新的规则
    for (const [projectId, rule] of Object.entries(rules)) {
      await store.put(rule, projectId);
    }
    
    await tx.done;
    return true;
  }

  async getProjectRules(projectId: string): Promise<ApidocProjectRules | null> {
    const tx = this.db.transaction("rules", "readonly");
    const store = tx.objectStore("rules");
    const rule = await store.get(projectId);
    return rule && !rule.isDeleted ? rule : null;
  }

  async setProjectRules(projectId: string, rules: ApidocProjectRules): Promise<boolean> {
    const tx = this.db.transaction("rules", "readwrite");
    const store = tx.objectStore("rules");
    await store.put({ ...rules, isDeleted: false }, projectId);
    await tx.done;
    return true;
  }

  async updateProjectRules(projectId: string, rules: Partial<ApidocProjectRules>): Promise<boolean> {
    const tx = this.db.transaction("rules", "readwrite");
    const store = tx.objectStore("rules");
    const existingRules = await store.get(projectId);
    
    if (!existingRules) return false;
    
    const updatedRules = {
      ...existingRules,
      ...rules
    };
    
    await store.put(updatedRules, projectId);
    await tx.done;
    return true;
  }

  async deleteProjectRules(projectId: string): Promise<boolean> {
    const tx = this.db.transaction("rules", "readwrite");
    const store = tx.objectStore("rules");
    const existingRules = await store.get(projectId);
    
    if (!existingRules) return false;
    
    const updatedRules = {
      ...existingRules,
      isDeleted: true
    };
    
    await store.put(updatedRules, projectId);
    await tx.done;
    return true;
  }
} 
// 导出单例
export const standaloneRuleCache = new StandaloneRuleCache();
