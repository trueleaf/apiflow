import { cloneDeep } from 'lodash-es';
import type { TreeNode } from '@src/types/helper';

/**
 * 遍历森林
 */
export const forEachForest = <T extends Record<string, any>>(forest: T[], fn: (arg: T) => void, options?: { childrenKey?: string }): void => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return;
  }
  const childrenKey = options?.childrenKey || 'children';
  const foo = (forestData: T[], hook: (arg: T) => void) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      hook(currentData);
      if (!currentData[childrenKey]) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!Array.isArray(currentData[childrenKey])) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if ((currentData[childrenKey] as T[]).length > 0) {
        foo(currentData[childrenKey] as T[], hook);
      }
    }
  };
  foo(forest, fn);
}

/**
 * 根据id查询父元素
 */
export const findParentById = <T extends Record<string, any>>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let pNode: T | null = null;
  const foo = (forestData: Record<string, any>, p: T | null) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        pNode = p;
        return;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey], currentData);
      }
    }
  };
  foo(forest, null);
  return pNode;
}

/**
 * 根据id查询兄弟节点（通用函数）
 * @param forest 树形数组
 * @param id 节点id
 * @param direction 方向：'next' 为下一个，'previous' 为上一个
 * @param options 配置选项
 */
export const findSiblingById = <T extends Record<string, any>>(
  forest: T[],
  id: string | number,
  direction: 'next' | 'previous',
  options?: { childrenKey?: string, idKey?: string }
): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let sibling: T | null = null;
  const offset = direction === 'next' ? 1 : -1;

  const foo = (forestData: Record<string, any>) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        sibling = forestData[i + offset] || null;
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return sibling;
}

/**
 * 根据id查询元素
 */
export const findNodeById = <T extends Record<string, any>>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null => {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型')
    return null;
  }
  let result = null;
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  const foo = (forestData: Record<string, any>) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        result = currentData;
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return result;
}

/**
 * 将树形数据所有节点转换为一维数组,数据会进行深拷贝
 */
export const flatTree = <T extends TreeNode<T>>(root: T): T[] => {
  const result: T[] = [];
  const foo = (nodes: T[]): void => {
    for (let i = 0; i < nodes.length; i += 1) {
      const item = nodes[i];
      const itemCopy = cloneDeep(item);
      itemCopy.children = [];
      result.push(itemCopy);
      if (item.children && item.children.length > 0) {
        foo(item.children);
      }
    }
  }
  foo([root]);
  return result;
}

/**
 * 将数组转换为树形结构
 */
export const arrayToTree = <T extends { _id: string; pid: string }>(list: T[]): (T & { children: T[] })[] => {
  const map = new Map<string, T & { children: T[] }>();
  const roots: (T & { children: T[] })[] = [];
  list.forEach(item => {
    map.set(item._id, { ...item, children: [] });
  });
  map.forEach(node => {
    if (node.pid && map.has(node.pid)) {
      map.get(node.pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}
