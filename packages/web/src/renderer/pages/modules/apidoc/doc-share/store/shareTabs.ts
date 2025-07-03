import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApidocTab } from '@src/types/apidoc/tabs';
import { event, findNodeById } from '../helper';
import { ElMessageBox } from 'element-plus';
import 'element-plus/es/components/message-box/style/css';
import { t } from 'i18next';
import { apidocCache } from '@/cache/apidoc';
import { request } from '../api/api';

export const useShareTabsStore = defineStore('shareTabs', () => {
  /*
  |--------------------------------------------------------------------------
  | 变量定义
  |--------------------------------------------------------------------------
  */
  const tabs = ref<Record<string, ApidocTab[]>>({});

  /*
  |--------------------------------------------------------------------------
  | 初始化数据获取逻辑
  |--------------------------------------------------------------------------
  */
  const initLocalTabs = (payload: { shareId: string }): void => {
    const { shareId } = payload;
    const localEditTabs = localStorage.getItem('apidoc/editTabs');
    const localTabs: Record<string, ApidocTab[]> = localEditTabs ? JSON.parse(localEditTabs) : {};
    const selectedTab = localTabs[shareId]?.find((val) => val.selected);
    tabs.value[shareId] = localTabs[shareId];
  };

  /*
  |--------------------------------------------------------------------------
  | 逻辑处理函数
  |--------------------------------------------------------------------------
  */
  const addTab = (payload: ApidocTab): void => {
    const { _id, projectId, fixed } = payload;
    const tabInfo = payload;
    const isInProject = tabs.value[projectId];
    if (!isInProject) {
      tabs.value[projectId] = [];
    }
    const selectedTabIndex = tabs.value[projectId].findIndex((val) => val.selected);
    tabs.value[projectId].forEach((tab) => (tab.selected = false));
    const hasTab = tabs.value[projectId].find((val) => val._id === _id);
    const unFixedTab = tabs.value[projectId].find((val) => !val.fixed && val.saved);
    const unFixedTabIndex = tabs.value[projectId].findIndex((val) => !val.fixed && val.saved);
    if (_id.startsWith('local_')) {
      tabs.value[projectId].push(tabInfo);
    } else if (!fixed && unFixedTab && !hasTab) {
      tabs.value[projectId].splice(unFixedTabIndex, 1, tabInfo);
    } else if (!unFixedTab && !hasTab) {
      tabs.value[projectId].splice(selectedTabIndex + 1, 0, tabInfo);
    } else if (fixed && !hasTab) {
      tabs.value[projectId].splice(selectedTabIndex + 1, 0, tabInfo);
    }
    const matchedTab = tabs.value[projectId].find((val) => val._id === _id) as ApidocTab;
    matchedTab.selected = true;
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
    event.emit('apidoc/tabs/addOrDeleteTab');
  };
  const updateAllTabs = (payload: { tabs: ApidocTab[]; shareId: string }): void => {
    tabs.value[payload.shareId] = payload.tabs;
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  };
  const fixedTab = (payload: { _id: string; shareId: string }): void => {
    const { _id, shareId } = payload;
    const matchedTab = tabs.value[shareId].find((val) => val._id === _id);
    if (matchedTab) {
      matchedTab.fixed = true;
    }
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  };
  const deleteTabByIndex = (payload: { deleteIndex: number; shareId: string }): void => {
    tabs.value[payload.shareId].splice(payload.deleteIndex, 1);
    event.emit('apidoc/tabs/addOrDeleteTab');
  };
  const selectTabById = (payload: { id: string; shareId: string }): void => {
    const { id, shareId } = payload;
    if (!tabs.value[shareId]) {
      return;
    }
    tabs.value[shareId].forEach((tab) => {
      if (tab._id === id) {
        tab.selected = true;
      } else {
        tab.selected = false;
      }
    });
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
    event.emit('apidoc/tabs/addOrDeleteTab');
  };
  const changeTabInfoById = (payload: { id: string; field: keyof ApidocTab; value: any; shareId: string }): void => {
    const { id, field, value, shareId } = payload;
    const currentTabs = tabs.value[shareId];
    const editData = findNodeById(currentTabs, id, { idKey: '_id' }) as ApidocTab;
    if (!editData) return;
    (editData as any)[field] = value;
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  };
  const forceDeleteAllTab = (shareId: string): void => {
    const deleteIds = tabs.value[shareId].map((v) => v._id);
    deleteIds.forEach((id) => {
      const deleteIndex = tabs.value[shareId].findIndex((tab) => tab._id === id);
      tabs.value[shareId].splice(deleteIndex, 1);
      event.emit('apidoc/tabs/addOrDeleteTab');
    });
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  };
  const deleteTabByIds = async (payload: { ids: string[]; shareId: string; force?: boolean }): Promise<void> => {
    const { ids, shareId, force } = payload;
    const freshNewSeletedTab = () => {
      const selectTab = tabs.value[shareId].find((tab) => tab.selected);
      const hasTab = tabs.value[shareId].length > 0;
      if (!selectTab && hasTab) {
        const selectTabIndex = tabs.value[shareId].length - 1;
        changeTabInfoById({
          id: tabs.value[shareId][selectTabIndex]._id,
          field: 'selected',
          value: true,
          shareId,
        });
        tabs.value[shareId][selectTabIndex].selected = true;
      }
      localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
    };
    if (!tabs.value[shareId]) {
      return;
    }
    if (force) {
      ids.forEach((id) => {
        const deleteIndex = tabs.value[shareId].findIndex((tab) => tab._id === id);
        if (deleteIndex !== -1) {
          deleteTabByIndex({ shareId, deleteIndex });
        }
      });
      freshNewSeletedTab();
      return;
    }
    const unsavedTabs: ApidocTab[] = tabs.value[shareId].filter(
      (tab) => !tab.saved && ids.find((v) => v === tab._id)
    );
    for (let i = 0; i < unsavedTabs.length; i += 1) {
      const unsavedTab = unsavedTabs[i];
      try {
        await ElMessageBox.confirm(t('是否要保存对接口的修改', { msg: unsavedTab.label }), '提示', {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'warning',
          distinguishCancelAndClose: true,
        });
        const apidoc = apidocCache.getApidoc(unsavedTab._id);
        if (!apidoc) {
          continue;
        }
        if (apidoc._id.includes('local_')) {
          // todo: 本地文档保存逻辑
        } else {
          const params = {
            _id: apidoc._id,
            projectId: shareId,
            info: apidoc.info,
            item: apidoc.item,
            preRequest: apidoc.preRequest,
            afterRequest: apidoc.afterRequest,
            mockInfo: apidoc.mockInfo,
          };
          await request.post('/api/project/fill_doc', params);
          const deleteIndex = tabs.value[shareId].findIndex((tab) => tab._id === apidoc._id);
          deleteTabByIndex({ shareId, deleteIndex });
          freshNewSeletedTab();
        }
      } catch (e) {
        // 用户取消
      }
    }
  };
  const getSelectedTab = (shareId: string) => {
    return tabs.value[shareId]?.find((tab) => tab.selected);
  };

  /*
  |--------------------------------------------------------------------------
  | 生命周期函数
  |--------------------------------------------------------------------------
  */

  return {
    tabs,
    initLocalTabs,
    addTab,
    updateAllTabs,
    fixedTab,
    deleteTabByIndex,
    selectTabById,
    changeTabInfoById,
    forceDeleteAllTab,
    deleteTabByIds,
    getSelectedTab,
  };
}); 