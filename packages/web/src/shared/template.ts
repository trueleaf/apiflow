import type { ApidocVariable } from '@src/types';
import Mock from 'mockjs';
import { faker } from '@faker-js/faker';

// 环境自适应的代码执行函数
const execCode = async (code: string, scope: Record<string, any>): Promise<{ code: number; data: any; msg: string }> => {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return (window as any).electronAPI.execCode(code, scope);
  } else {
    const { execCodeInContext } = await import('../main/utils/index.ts');
    return execCodeInContext(code, scope);
  }
};

// 将 ApidocVariable[] 转换为 Record<string, any>
export const getObjectVariable = async (variables: ApidocVariable[]) => {
  const objectVariable: Record<string, any> = {};
  for (let i = 0; i < variables.length; i++) {
    const varInfo = variables[i];
    const { name, value, fileValue } = varInfo;
    if (varInfo.type === "string") {
      objectVariable[name] = value;
    } else if (varInfo.type === "number") {
      objectVariable[name] = Number(value);
    } else if (varInfo.type === "boolean") {
      objectVariable[name] = value === "true" ? true : false;
    } else if (varInfo.type === "null") {
      objectVariable[name] = null;
    } else if (varInfo.type === "any") {
      const result = await execCode(value, {});
      if (result.code === 0) {
        objectVariable[name] = result.data;
      } else {
        objectVariable[name] = value;
      }
    } else if (varInfo.type === "file") {
      objectVariable[name] = fileValue.path;
    }
  }
  return Promise.resolve(objectVariable);
};

// 获取嵌套对象属性值，支持点语法访问
const getNestedValue = (path: string, scope: Record<string, any>): any => {
  try {
    const keys = path.split('.');
    let result: any = scope;
    for (const key of keys) {
      if (result === null || result === undefined) {
        return undefined;
      }
      result = result[key];
    }
    return result;
  } catch {
    return undefined;
  }
}

// Mock数据生成函数
const evaluateMock = (mockExpr: string): any => {
  try {
    const result = Mock.mock(mockExpr);
    return result;
  } catch (mockError) {
    try {
      const fakerPath = mockExpr.slice(1);
      const keys = fakerPath.split('.');
      let fakerMethod: any = faker;
      for (const key of keys) {
        fakerMethod = fakerMethod[key];
        if (!fakerMethod) {
          return mockExpr;
        }
      }
      if (typeof fakerMethod === 'function') {
        return fakerMethod();
      }
      return fakerMethod;
    } catch {
      return mockExpr;
    }
  }
}

// 表达式求值函数
const evaluateExpression = async (expr: string, scope: Record<string, any>): Promise<any> => {
  const trimmed = expr.trim();
  if (trimmed.startsWith('@')) {
    return evaluateMock(trimmed);
  }
  if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) {
    return getNestedValue(trimmed, scope);
  }
  try {
    const result = await execCode(trimmed, scope);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.msg);
  } catch {
    return undefined;
  }
}

// 将字符串模板转换为编译后的值
export const getCompiledTemplate = async (
  template: string,
  variables: ApidocVariable[],
  Context?: Record<string, any>
): Promise<any> => {
  try {
    const objectVariable = await getObjectVariable(variables);
    const context = Context || {};
    const scope = { ...objectVariable, _: context };
    const pureMatch = template.match(/^\s*\{\{\s*(.+?)\s*\}\}\s*$/);
    if (pureMatch) {
      const result = await evaluateExpression(pureMatch[1], scope);
      if (result === undefined) {
        return template;
      }
      return result;
    }
    const matches = template.matchAll(/\{\{\s*(.+?)\s*\}\}/g);
    const replacements: { match: string; value: string }[] = [];
    for (const match of matches) {
      try {
        const expr = match[1];
        const value = await evaluateExpression(expr, scope);
        let replacement: string;
        if (value === undefined) {
          replacement = match[0];
        } else if (value === null) {
          replacement = 'null';
        } else if (typeof value === 'object') {
          replacement = JSON.stringify(value);
        } else {
          replacement = String(value);
        }
        replacements.push({ match: match[0], value: replacement });
      } catch {
        replacements.push({ match: match[0], value: match[0] });
      }
    }
    let result = template;
    for (const { match, value } of replacements) {
      result = result.replaceAll(match, value);
    }
    return result;
  } catch (error) {
    return template;
  }
};
