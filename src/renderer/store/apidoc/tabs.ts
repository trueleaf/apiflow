import { ApidocTab } from "@src/types/apidoc/tabs";
import { defineStore } from "pinia";
import { ref } from "vue";
import { event, findNodeById } from "@/helper";
import { router } from "@/router";
import { ElMessageBox } from "element-plus";
import 'element-plus/es/components/message-box/style/css';
import { t } from 'i18next'
import { apidocCache } from "@/cache/apidoc";
import { axios } from "@/api/api";
import { useApidocBanner } from "./banner";

type EditTabPayload<K extends keyof ApidocTab> = {
  id: string,
  field: K,
  value: ApidocTab[K],
};

export const useApidocTas = defineStore('apidocTabs', () => {
  const tabs = ref<Record<string, ApidocTab[]>>({});
  const { changeExpandItems } = useApidocBanner()
  //初始化本地tab
  const initLocalTabs = (payload: { projectId: string }): void => {
    const { projectId } = payload;
    const localEditTabs = localStorage.getItem('apidoc/editTabs');
    const localTabs: Record<string, ApidocTab[]> = localEditTabs ? JSON.parse(localEditTabs) : {};
    const selectedTab = localTabs[projectId]?.find((val) => val.selected);
    if (selectedTab) {
      changeExpandItems([selectedTab._id])
    }
    tabs.value[projectId] = localTabs[projectId];
  }
  //新增一个tab
  const addTab = (payload: ApidocTab): void => {
    const { _id, projectId, fixed } = payload;
    const tabInfo = payload;
    const isInProject = tabs.value[projectId]; //当前项目是否存在tabs
    if (!isInProject) {
      tabs.value[projectId] = [];
    }
    const selectedTabIndex = tabs.value[projectId].findIndex((val) => val.selected); //获取之前选中节点index
    tabs.value[projectId].forEach((tab) => tab.selected = false); //选中状态全部清空
    const hasTab = tabs.value[projectId].find((val) => val._id === _id);
    const unFixedTab = tabs.value[projectId].find((val) => !val.fixed && val.saved);
    const unFixedTabIndex = tabs.value[projectId].findIndex((val) => !val.fixed && val.saved);
    if (_id.startsWith('local_')) { //直接末尾添加
      tabs.value[projectId].push(tabInfo)
    } else if (!fixed && unFixedTab && !hasTab) { //如果tabs里面存在未固定的tab并且是新增一个tab则覆盖未固定
      tabs.value[projectId].splice(unFixedTabIndex, 1, tabInfo)
    } else if (!unFixedTab && !hasTab) { //不存在未固定的并且不存在tab则新增一个tab
      tabs.value[projectId].splice(selectedTabIndex + 1, 0, tabInfo); //添加到已选中的后面
    } else if (fixed && !hasTab) {
      tabs.value[projectId].splice(selectedTabIndex + 1, 0, tabInfo); //添加到已选中的后面
    }

    const matchedTab = tabs.value[projectId].find((val) => val._id === _id) as ApidocTab;
    matchedTab.selected = true;
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
    event.emit('apidoc/tabs/addOrDeleteTab')
    changeExpandItems([_id])
  }
  //更新全部的tab
  const updateAllTabs = (payload: { tabs: ApidocTab[], projectId: string }): void => {
    tabs.value[payload.projectId] = payload.tabs;
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  }
  //固定一个tab
  const fixedTab = (payload: { _id: string, projectId: string}): void => {
    const { _id, projectId } = payload;
    const matchedTab = tabs.value[projectId].find((val) => val._id === _id);
    if (matchedTab) {
      matchedTab.fixed = true;
    }
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  }
  //根据id删除tab
  const deleteTabByIndex = (payload: { deleteIndex: number, projectId: string }): void => {
    tabs.value[payload.projectId].splice(payload.deleteIndex, 1);
    event.emit('apidoc/tabs/addOrDeleteTab')
  }
  //根据id选中tab
  const selectTabById = (payload: { id: string, projectId: string }): void => {
    const { id, projectId } = payload;
    if (!tabs.value[projectId]) {
      return;
    }
    tabs.value[projectId].forEach((tab) => {
      if (tab._id === id) {
        tab.selected = true;
      } else {
        tab.selected = false;
      }
    })
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
    event.emit('apidoc/tabs/addOrDeleteTab')
  }
  //根据id改变节点属性
  const changeTabInfoById = <K extends keyof ApidocTab>(payload: EditTabPayload<K>): void => {
    const { id, field, value } = payload;
    const projectId = router.currentRoute.value.query.id as string;
    //todo 
    // const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
    const currentTabs = tabs.value[projectId];
    const editData = findNodeById(currentTabs, id, {
      idKey: '_id',
    }) as ApidocTab;
    if (!editData) { //folder不需要修改，没找到节点也不需要修改
      return
    }
    editData[field] = value;
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  }
  //强制关闭所有节点
  const forceDeleteAllTab = (projectId: string): void  => {
    const deleteIds = tabs.value[projectId].map(v => v._id);
    deleteIds.forEach((id) => {
      const deleteIndex = tabs.value[projectId].findIndex((tab) => tab._id === id);
      tabs.value[projectId].splice(deleteIndex, 1);
      event.emit('apidoc/tabs/addOrDeleteTab')
    })
    localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
  }
  //根据id删除tab
  const deleteTabByIds = async(payload: { ids: string[], projectId: string }): Promise<void> => {
    const { ids, projectId } = payload;
    const checkSeletedTab = () => {
      const selectTab = tabs.value[projectId].find((tab) => tab.selected);
      const hasTab = tabs.value[projectId].length > 0;
      if (!selectTab && hasTab) {
        const selectTabIndex = tabs.value[projectId].length - 1;
        changeTabInfoById({
          id: tabs.value[projectId][selectTabIndex]._id,
          field: 'selected',
          value: true,
        })
        tabs.value[projectId][selectTabIndex].selected = true;
      }
      localStorage.setItem('apidoc/editTabs', JSON.stringify(tabs.value));
      const activeTab = tabs.value[projectId].find((tab) => tab.selected);
      if (activeTab) {
        changeExpandItems([activeTab._id])
      }
    }
    //=========================================================================//
    if (!tabs.value[projectId]) {
      return;
    }
    const unsavedTabs: ApidocTab[] = tabs.value[projectId].filter(tab => !tab.saved && ids.find(v => v === tab._id));
    for (let i = 0; i < unsavedTabs.length; i += 1) {
      //todo  预览模式直接删除
      // if (store.state['apidoc/baseInfo'].mode === 'view') {
      //   const deleteIndex = tabs.value[projectId].findIndex((tab) => tab._id === unsavedTabs[i]._id);
      //   context.commit('deleteTabByIndex', {
      //     projectId,
      //     deleteIndex,
      //   });
      //   continue;
      // }
      const unsavedTab = unsavedTabs[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        await ElMessageBox.confirm(t('是否要保存对接口的修改', { msg: unsavedTab.label }), '提示', {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'warning',
          distinguishCancelAndClose: true,
        })
        const apidoc = apidocCache.getApidoc(unsavedTab._id)
        if (!apidoc) {
          continue;
        }
        if (apidoc._id.includes('local_')) {
          //todo
          // const deleteIndex = tabs.value[projectId].findIndex((tab) => tab._id === apidoc._id);
          // const result = await store.dispatch('apidoc/apidoc/openSaveDocDialog', apidoc._id);
          // if (result === 'save') {
          //   deleteTabByIndex({
          //     projectId,
          //     deleteIndex,
          //   })
          //   checkSeletedTab();
          // }
        } else {
          const params = {
            _id: apidoc._id,
            projectId,
            info: apidoc.info,
            item: apidoc.item,
            preRequest: apidoc.preRequest,
            afterRequest: apidoc.afterRequest,
            mockInfo: apidoc.mockInfo,
          };
          axios.post('/api/project/fill_doc', params).then(() => {
            const deleteIndex = tabs.value[projectId].findIndex((tab) => tab._id === apidoc._id);
            deleteTabByIndex({
              projectId,
              deleteIndex,
            })
            checkSeletedTab();
          }).catch((err) => {
            console.error(err);
          })
        }
      } catch (error) {
        if (error === 'close') {
          return;
        }
        if (error === 'cancel') { //不保存，异步方法无法直接改变state值
          const deleteIndex = tabs.value[projectId].findIndex((tab) => tab._id === unsavedTab._id);
          deleteTabByIndex({
            projectId,
            deleteIndex,
          })
        }
      }
    }
    ids.forEach((id) => {
      const deleteIndex = tabs.value[projectId].findIndex((tab) => tab._id === id);
      const deleteTab = tabs.value[projectId].find((tab) => tab._id === id);
      if (deleteTab?.saved) { //只删除保存的
        deleteTabByIndex({
          projectId,
          deleteIndex,
        })
      }
    })
    checkSeletedTab();
  }
  return {
    tabs,
    initLocalTabs,
    addTab,
    fixedTab,
    updateAllTabs,
    selectTabById,
    changeTabInfoById,
    forceDeleteAllTab,
    deleteTabByIds,
  }
})