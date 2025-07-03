/**
 * @description        doc-share模块工具函数
 * @author             shuxiaokai
 * @create             2024-01-01 00:00
 */
import { nanoid } from 'nanoid/non-secure'
import type { ApidocCodeInfo } from '@src/types/global'
import dayjs from 'dayjs';
import mitt from 'mitt'
import { ApidocProjectBaseInfoState } from '@src/types/apidoc/base-info';
import { ApidocTab } from '@src/types/apidoc/tabs.ts';

type ForestData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [propName: string]: any,
}

/**
 * 全局事件订阅发布
 */
const emitter = mitt<{
  'apidoc/mock/closeMockServer': void;
  'apidoc/mock/openMockServer': void;
  'apidoc/mock/restartMockserver': void;
  'apidoc/editor/removePreEditor': void;
  'apidoc/editor/removeAfterEditor': void;
  'apidoc/hook/jumpToEdit': ApidocCodeInfo;
  'apidoc/mock/restartMockServer': void;
  'apidoc/tabs/addOrDeleteTab': void,
  'apidoc/getBaseInfo': ApidocProjectBaseInfoState,
  'searchItem/change': string,
  'tabs/saveTabSuccess': void,
  'tabs/saveTabError': void,
  'tabs/cancelSaveTab': void,
  'tabs/deleteTab': ApidocTab,
}>()

export const event = emitter;

/**
 * @description        返回uuid
 * @author             shuxiaokai
 * @create             2021-01-20 22:52
 * @return {string}    返回uuid
 */
export function uuid(): string {
  return nanoid();
}

/**
 * 根据id查询父元素
 */
export function findParentById<T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let pNode: T | null = null;
  const foo = (forestData: ForestData, p: T | null) => {
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
 * 根据id查询元素
 */
export function findNodeById<T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let targetNode: T | null = null;
  const foo = (forestData: ForestData) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        targetNode = currentData as T;
        return;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return targetNode;
}

/**
 * @description        格式化日期
 * @author             shuxiaokai
 * @create             2020-03-02 10:17
 * @param {string|number|Date|dayjs.Dayjs|undefined} date 日期
 * @param {string}     rule 格式化规则
 * @return {string}    返回格式化后的日期
 */
export function formatDate(date: string | number | Date | dayjs.Dayjs | undefined, rule?: string): string {
  if (!date) {
    return '';
  }
  try {
    const dayjsDate = dayjs(date);
    if (!dayjsDate.isValid()) {
      return '';
    }
    return dayjsDate.format(rule || 'YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '';
  }
} 
export function forEachForest<T extends ForestData>(forest: T[], fn: (arg: T) => void, options?: { childrenKey?: string }): void {
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