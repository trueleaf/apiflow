import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ApiNode, ApidocVariable, ApidocBanner } from '@src/types';
import { ApidocTab } from '@src/types/apidoc/tabs';
import { SharedProjectInfo } from '@src/types/index.ts';
import { getObjectVariable } from '../helper';
import { setProjectWorkbenchTabs } from '../cache/shareCache';

export type ShareEnvironment = {
  _id: string;
  name: string;
  baseUrl: string;
  description: string;
  order: number;
  variables: {
    _id: string;
    environmentId: string;
    key: string;
    sharedValue: string;
    enabled: boolean;
    order: number;
  }[];
}

export type ShareHost = {
  _id: string;
  name: string;
  url: string;
}

const docs = ref<ApiNode[]>([]);
const project = ref<SharedProjectInfo>({
  projectName: '',
  shareName: '',
  expire: null,
  needPassword: false
});
const varibles = ref<ApidocVariable[]>([]);
const tabs = ref<Record<string, ApidocTab[]>>({});
const banner = ref<ApidocBanner[]>([]);
const objectVariable = ref<Record<string, any>>({});
const defaultExpandedKeys = ref<string[]>([]);
const activeDocInfo = ref<ApiNode | null>(null);
const contentLoading = ref(false);
const environments = ref<ShareEnvironment[]>([]);
const hosts = ref<ShareHost[]>([]);
const activeEnvironmentId = ref<string>('');
/*
|--------------------------------------------------------------------------
| 逻辑处理函数
|--------------------------------------------------------------------------
*/
// 新增tab
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
  setProjectWorkbenchTabs(tabs.value);
};
// 更新全部tab
const updateAllTabs = (payload: { tabs: ApidocTab[]; shareId: string }): void => {
  tabs.value[payload.shareId] = payload.tabs;
  setProjectWorkbenchTabs(tabs.value);
};
// 固定tab
const fixedTab = (payload: { _id: string; shareId: string }): void => {
  const { _id, shareId } = payload;
  const matchedTab = tabs.value[shareId].find((val) => val._id === _id);
  if (matchedTab) {
    matchedTab.fixed = true;
  }
  setProjectWorkbenchTabs(tabs.value);
};
// 根据索引删除tab
const deleteTabByIndex = (payload: { deleteIndex: number; shareId: string }): void => {
  tabs.value[payload.shareId].splice(payload.deleteIndex, 1);
};
// 选中tab
const selectTabById = (payload: { id: string; shareId: string }): void => {
  const { id, shareId } = payload;
  if (!tabs.value[shareId]) {
    return;
  }
  tabs.value[shareId].forEach((tab) => {
    tab.selected = tab._id === id;
  });
  setProjectWorkbenchTabs(tabs.value);
};
// 修改tab属性
const changeTabInfoById = (payload: { id: string; field: keyof ApidocTab; value: any; shareId: string }): void => {
  const { id, field, value, shareId } = payload;
  const currentTabs = tabs.value[shareId];
  const editData = currentTabs?.find((tab) => tab._id === id);
  if (!editData) return;
  (editData as any)[field] = value;
  setProjectWorkbenchTabs(tabs.value);
};
// 强制删除所有tab
const forceDeleteAllTab = (shareId: string): void => {
  const deleteIds = tabs.value[shareId]?.map((v) => v._id) || [];
  deleteIds.forEach((id) => {
    const deleteIndex = tabs.value[shareId].findIndex((tab) => tab._id === id);
    tabs.value[shareId].splice(deleteIndex, 1);
  });
  setProjectWorkbenchTabs(tabs.value);
};
// 根据id批量删除tab
const deleteTabByIds = (payload: { ids: string[]; shareId: string; force?: boolean }): void => {
  const { ids, shareId } = payload;
  // const { ids, shareId, force } = payload;
  const freshNewSeletedTab = () => {
    const selectTab = tabs.value[shareId]?.find((tab) => tab.selected);
    const hasTab = tabs.value[shareId]?.length > 0;
    if (!selectTab && hasTab) {
      const selectTabIndex = tabs.value[shareId].length - 1;
      changeTabInfoById({
        id: tabs.value[shareId][selectTabIndex]._id,
        field: 'selected',
        value: true,
        shareId,
      })
      tabs.value[shareId][selectTabIndex].selected = true;
    }
    setProjectWorkbenchTabs(tabs.value);
  };
  if (!tabs.value[shareId]) {
    return;
  }
  ids.forEach((id) => {
    const deleteIndex = tabs.value[shareId].findIndex((tab) => tab._id === id);
    if (deleteIndex !== -1) {
      deleteTabByIndex({ shareId, deleteIndex });
    }
  });
  freshNewSeletedTab();
};
// 获取当前选中的tab
const getSelectedTab = (shareId: string) => {
  return tabs.value[shareId]?.find((tab) => tab.selected);
};

const replaceVaribles = async (varList: ApidocVariable[]) => {
  varibles.value.splice(0, varibles.value.length, ...varList);
  const value = await getObjectVariable(varibles.value);
  objectVariable.value = value;
};

const setProject = (info: Partial<SharedProjectInfo>) => {
  project.value = { ...project.value, ...info };
};

const setDocs = (docsList: ApiNode[]) => {
  docs.value.splice(0, docs.value.length, ...docsList);
};

const setBanner = (bannerList: ApidocBanner[]) => {
  banner.value.splice(0, banner.value.length, ...bannerList);
};

const setDefaultExpandedKeys = (keys: string[]) => {
  defaultExpandedKeys.value = keys;
};

const setActiveDocInfo = (info: ApiNode) => {
  activeDocInfo.value = info;
};

const setContentLoading = (loading: boolean) => {
  contentLoading.value = loading;
};

const setEnvironments = (envList: ShareEnvironment[]) => {
  environments.value.splice(0, environments.value.length, ...envList);
  if (envList.length > 0 && !activeEnvironmentId.value) {
    activeEnvironmentId.value = envList[0]._id;
  }
};

const setHosts = (hostList: ShareHost[]) => {
  hosts.value.splice(0, hosts.value.length, ...hostList);
};

const setActiveEnvironmentId = (id: string) => {
  activeEnvironmentId.value = id;
};

const activeEnvironment = computed(() => {
  return environments.value.find(e => e._id === activeEnvironmentId.value) || null;
});

const activeEnvironmentVariables = computed<ApidocVariable[]>(() => {
  const env = activeEnvironment.value;
  if (!env) return [];
  return env.variables
    .filter(v => v.enabled)
    .map(v => ({
      _id: v._id,
      projectId: '',
      name: v.key,
      value: v.sharedValue,
      type: 'string' as const,
      fileValue: { name: '', path: '', fileType: '' },
    }));
});

const mergedVariables = computed<ApidocVariable[]>(() => {
  const envVars = activeEnvironmentVariables.value;
  const projectVars = varibles.value;
  const envVarNames = new Set(envVars.map(v => v.name));
  const uniqueProjectVars = projectVars.filter(v => !envVarNames.has(v.name));
  return [...envVars, ...uniqueProjectVars];
});

export const useShareStore = defineStore('shareStore', () => ({
  docs,
  project,
  varibles,
  banner,
  tabs,
  objectVariable,
  defaultExpandedKeys,
  activeDocInfo,
  contentLoading,
  environments,
  hosts,
  activeEnvironmentId,
  activeEnvironment,
  activeEnvironmentVariables,
  mergedVariables,
  addTab,
  updateAllTabs,
  fixedTab,
  deleteTabByIndex,
  selectTabById,
  changeTabInfoById,
  forceDeleteAllTab,
  deleteTabByIds,
  getSelectedTab,
  replaceVaribles,
  setProject,
  setDocs,
  setBanner,
  setDefaultExpandedKeys,
  setActiveDocInfo,
  setContentLoading,
  setEnvironments,
  setHosts,
  setActiveEnvironmentId,
}));
