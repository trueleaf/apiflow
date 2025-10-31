import type { ApidocVariable } from '@src/types';
import Mock from 'mockjs';
import { faker } from '@faker-js/faker';

/**
 * 在沙箱环境中执行代码
 */
import SandboxWorker from '@/worker/sandbox.ts?worker&inline';
import type { SandboxPostMessage } from '@src/types';

export const evalCode = (code: string) => {
  return new Promise((resolve, reject) => {
    const worker = new SandboxWorker();
    worker.onmessage = (event: MessageEvent<SandboxPostMessage>) => {
      if (event.data.type === "error") {
        reject(event.data.msg);
      } else if (event.data.type === "evalSuccess") {
        resolve(event.data.data);
      }
    };
    worker.onerror = (error) => {
      reject(error.message);
    };
    worker.postMessage({
      type: "eval",
      code,
    });
  });
};

/**
 * 将 ApidocVariable[] 转换为 Record<string, any>
 */
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
      objectVariable[name] = await evalCode(value);
    } else if (varInfo.type === "file") {
      objectVariable[name] = fileValue.path;
    }
  }
  return Promise.resolve(objectVariable);
};

/**
 * 检查字符串是否为表达式
 * 表达式特征：包含运算符且不是纯变量名
 */
const isExpression = (str: string): boolean => {
  // 去除首尾空格
  const trimmed = str.trim();

  // 如果是纯数字，不视为表达式
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return false;
  }

  // 如果是纯变量名（字母、数字、下划线），不视为表达式
  if (/^[a-zA-Z_]\w*$/.test(trimmed)) {
    return false;
  }

  // 包含运算符的视为表达式
  return /[+\-*/()%<>=!&|]/.test(trimmed);
};

/**
 * 安全计算表达式（同步版本，用于 convertTemplateValueToRealValue）
 * 支持基本的数学运算和变量替换
 */
const evaluateExpressionSync = (expression: string, variables: Record<string, any>): any => {
  // 创建安全的计算环境
  const safeGlobals = {
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    ...variables
  };

  try {
    // 替换表达式中的变量
    let processedExpression = expression;

    // 替换变量名为实际值
    Object.keys(variables).forEach(varName => {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      const value = variables[varName];
      // 如果是字符串，需要加引号
      const replacement = typeof value === 'string' ? `"${value}"` : String(value);
      processedExpression = processedExpression.replace(regex, replacement);
    });

    // 使用Function构造函数在受限环境中执行
    const func = new Function(...Object.keys(safeGlobals), `return (${processedExpression})`);
    return func(...Object.values(safeGlobals));
  } catch (error) {
    throw new Error(`表达式计算错误: ${(error as Error).message}`);
  }
};

/**
 * 将模板转换为字符串
 * 变量类型一：{{ variable }}
 * 变量类型二：{{ @variable }}
 * 变量类型三：@xxx
 */
export const convertTemplateValueToRealValue = async (
  stringValue: string,
  objectVariable: Record<string, any>
) => {

  const isSingleMustachTemplate = stringValue.match(
    /^\s*\{\{\s*(.*?)\s*\}\}\s*$/
  ); // 这种属于单模板，返回实际值，可能是数字、对象等"{{ variable }}"或"{{ expression }}"
  if (isSingleMustachTemplate) {
    const variableName = isSingleMustachTemplate[1];
    if (variableName.startsWith("@")) {
      return variableName;
    }
    if (objectVariable[variableName] !== undefined) {
      return objectVariable[variableName];
    }
    // 检查是否为表达式
    if (isExpression(variableName)) {
      try {
        const result = evaluateExpressionSync(variableName, objectVariable);
        // 如果结果是数字，直接返回数字而不是字符串
        return result;
      } catch (error) {
        console.warn('表达式计算失败:', variableName, error);
        return isSingleMustachTemplate[0];
      }
    }
    return isSingleMustachTemplate[0];
  }

  const withoutVaribleString = stringValue.replace(
    /(?<!\\)\{\{\s*(.*?)\s*\}\}/g,
    ($1, variableName: string) => {
      const isVariableExist = variableName in objectVariable;
      if (variableName.startsWith("@")) {
        return variableName;
      }
      if (!isVariableExist) {
        // 检查是否为表达式
        if (isExpression(variableName)) {
          try {
            const result = evaluateExpressionSync(variableName, objectVariable);
            // 在字符串模板中，需要将结果转换为字符串
            return String(result);
          } catch (error) {
            console.warn('表达式计算失败:', variableName, error);
            return $1;
          }
        }
        return $1;
      }
      const value = objectVariable[variableName];
      return value;
    }
  );

  const withoutAtPatternString = withoutVaribleString.replace(
    /(@[^@]+)/g,
    (_, variableName: string) => {
      return variableName;
    }
  );

  const withoutEscapeString = withoutAtPatternString.replace(
    /((\\)(?=\{\{))|(\\)(?=@)/g,
    ""
  );
  return withoutEscapeString;
};

/**
 * 获取嵌套对象属性值，支持点语法访问
 */
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

/**
 * Mock数据生成函数
 */
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

/**
 * 表达式求值函数
 */
const evaluateExpression = async (expr: string, scope: Record<string, any>): Promise<any> => {
  const trimmed = expr.trim();
  if (trimmed.startsWith('@')) {
    return evaluateMock(trimmed);
  }
  if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) {
    return getNestedValue(trimmed, scope);
  }
  try {
    const result = await (window as any).electronAPI.execCode(trimmed, scope);
    if (result.code === 0) {
      return result.data;
    }
    throw new Error(result.msg);
  } catch {
    return undefined;
  }
}

/**
 * 将字符串模板转换为编译后的值（用于 helper 内部使用）
 */
export const getCompiledTemplate = async (
  template: string,
  variables: ApidocVariable[],
  Context?: Record<string, any>
): Promise<any> => {
  try {
    // 使用本地的 getObjectVariable 而不是动态导入
    const objectVariable = await getObjectVariable(variables);
    const context = Context || {};
    const scope = { ...objectVariable, _: context };
    const pureMatch = template.match(/^\s*\{\{\s*(.+?)\s*\}\}\s*$/);
    if (pureMatch) {
      const result = await evaluateExpression(pureMatch[1], scope);
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
      result = result.replace(match, value);
    }
    return result;
  } catch (error) {
    return template;
  }
}
