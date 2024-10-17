/**
 * tabs导航
 */
import type { ActionContext } from 'vuex'
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from 'element-plus'
import type { State as RootState, ApidocTabsState, ApidocTab } from '@src/types/store'
import { store } from '@/pages/modules/apidoc/doc-view/store/index'
import { findNodeById, event } from '@/helper/index'
import { t } from 'i18next'
import { apidocCache } from '@/cache/apidoc'
import { axios } from '../../api/api'
import router from '../../router/index'

type EditTabPayload<K extends keyof ApidocTab> = {
  id: string,
  field: K,
  value: ApidocTab[K],
};

const storeTabs = {
  namespaced: true,
  state: {
    tabs: {},
  },
  mutations: {
    //=====================================初始化和更新tab====================================//
    //初始化本地tab
    initLocalTabs(state: ApidocTabsState, payload: { projectId: string }): void {
      const { projectId } = payload;
      const localEditTabs = localStorage.getItem('apidoc/editTabs');
      const tabs: ApidocTabsState['tabs'] = localEditTabs ? JSON.parse(localEditTabs) : {};
      const selectedTab = tabs[projectId]?.find((val) => val.selected);
      if (selectedTab) {
        store.commit('apidoc/banner/changeExpandItems', [selectedTab._id]);
      }
      state.tabs[projectId] = tabs[projectId];
    },
    //更新全部的tab
    updateAllTabs(state: ApidocTabsState, payload: { tabs: ApidocTab[], projectId: string }): void {
      const { tabs, projectId } = payload;
      state.tabs[projectId] = tabs;
      localStorage.setItem('apidoc/editTabs', JSON.stringify(state.tabs));
    },
    //新增一个tab
    addTab(state: ApidocTabsState, payload: ApidocTab): void {
      const { _id, projectId, fixed } = payload;
      const tabInfo = payload;
      const isInProject = state.tabs[projectId]; //当前项目是否存在tabs
      if (!isInProject) {
        state.tabs[projectId] = [];
      }
      const selectedTabIndex = state.tabs[projectId].findIndex((val) => val.selected); //获取之前选中节点index
      // eslint-disable-next-line no-return-assign
      state.tabs[projectId].forEach((tab) => tab.selected = false); //选中状态全部清空
      const hasTab = state.tabs[projectId].find((val) => val._id === _id);
      const unFixedTab = state.tabs[projectId].find((val) => !val.fixed && val.saved);
      const unFixedTabIndex = state.tabs[projectId].findIndex((val) => !val.fixed && val.saved);
      if (!fixed && unFixedTab && !hasTab) { //如果tabs里面存在未固定的tab并且是新增一个tab则覆盖未固定
        state.tabs[projectId].splice(unFixedTabIndex, 1, tabInfo)
      } else if (!unFixedTab && !hasTab) { //不存在未固定的并且不存在tab则新增一个tab
        state.tabs[projectId].splice(selectedTabIndex + 1, 0, tabInfo); //添加到已选中的后面
      } else if (fixed && !hasTab) {
        state.tabs[projectId].splice(selectedTabIndex + 1, 0, tabInfo); //添加到已选中的后面
      }

      const matchedTab = state.tabs[projectId].find((val) => val._id === _id) as ApidocTab;
      matchedTab.selected = true;
      localStorage.setItem('apidoc/editTabs', JSON.stringify(state.tabs));
      event.emit('apidoc/tabs/addOrDeleteTab')
      store.commit('apidoc/banner/changeExpandItems', [_id]);
    },
    //固定一个tab
    fixedTab(state: ApidocTabsState, payload: ApidocTab): void {
      const { _id, projectId } = payload;
      const matchedTab = state.tabs[projectId].find((val) => val._id === _id);
      if (matchedTab) {
        matchedTab.fixed = true;
      }
      localStorage.setItem('apidoc/editTabs', JSON.stringify(state.tabs));
    },
    //在异步回调中无法直接改变state的值
    deleteTabByIndex(state: ApidocTabsState, payload: { deleteIndex: number, projectId: string }): void {
      state.tabs[payload.projectId].splice(payload.deleteIndex, 1);
      event.emit('apidoc/tabs/addOrDeleteTab')
    },
    //根据id选中tab
    selectTabById(state: ApidocTabsState, payload: { id: string, projectId: string }): void {
      const { id, projectId } = payload;
      if (!state.tabs[projectId]) {
        return;
      }
      state.tabs[projectId].forEach((tab) => {
        if (tab._id === id) {
          tab.selected = true;
        } else {
          tab.selected = false;
        }
      })
      localStorage.setItem('apidoc/editTabs', JSON.stringify(state.tabs));
      store.commit('apidoc/banner/changeExpandItems', [id]);
    },
    //根据id改变节点属性
    changeTabInfoById<K extends keyof ApidocTab>(state: ApidocTabsState, payload: EditTabPayload<K>): void {
      const { id, field, value } = payload;
      const projectId = router.currentRoute.value.query.id as string;
      const tabs = state.tabs[projectId];
      const editData = findNodeById(tabs, id, {
        idKey: '_id',
      }) as ApidocTab;
      editData[field] = value;
      localStorage.setItem('apidoc/editTabs', JSON.stringify(state.tabs));
    },
    //强制关闭所有节点
    forceDeleteAllTab(state: ApidocTabsState, projectId: string): void {
      const deleteIds = store.state['apidoc/tabs'].tabs[projectId].map(v => v._id);
      deleteIds.forEach((id) => {
        const deleteIndex = state.tabs[projectId].findIndex((tab) => tab._id === id);
        state.tabs[projectId].splice(deleteIndex, 1);
        event.emit('apidoc/tabs/addOrDeleteTab')
      })
      localStorage.setItem('apidoc/editTabs', JSON.stringify(state.tabs));
    },
  },
  actions: {
    //根据id删除tab
    async deleteTabByIds(context: ActionContext<ApidocTabsState, RootState>, payload: { ids: string[], projectId: string }): Promise<void> {
      const { ids, projectId } = payload;
      const checkSeletedTab = () => {
        const selectTab = context.state.tabs[projectId].find((tab) => tab.selected);
        const hasTab = context.state.tabs[projectId].length > 0;
        if (!selectTab && hasTab) {
          const selectTabIndex = context.state.tabs[projectId].length - 1;
          context.commit('changeTabInfoById', {
            id: context.state.tabs[projectId][selectTabIndex]._id,
            field: 'selected',
            value: true,
          });
          context.state.tabs[projectId][selectTabIndex].selected = true;
        }
        localStorage.setItem('apidoc/editTabs', JSON.stringify(context.state.tabs));
        const activeTab = context.state.tabs[projectId].find((tab) => tab.selected);
        if (activeTab) {
          store.commit('apidoc/banner/changeExpandItems', [activeTab._id]);
        }
      }
      //=========================================================================//
      if (!context.state.tabs[projectId]) {
        return;
      }
      const unsavedTabs: ApidocTab[] = context.state.tabs[projectId].filter(tab => !tab.saved && ids.find(v => v === tab._id));
      for (let i = 0; i < unsavedTabs.length; i += 1) {
        //预览模式直接删除
        if (store.state['apidoc/baseInfo'].mode === 'view') {
          const deleteIndex = context.state.tabs[projectId].findIndex((tab) => tab._id === unsavedTabs[i]._id);
          context.commit('deleteTabByIndex', {
            projectId,
            deleteIndex,
          });
          continue;
        }
        const unsavedTab = unsavedTabs[i];
        try {
          // eslint-disable-next-line no-await-in-loop
          await ElMessageBox.confirm(t('是否要保存对接口的修改', { msg: unsavedTab.label }), t('提示'), {
            confirmButtonText: t('保存'),
            cancelButtonText: t('不保存'),
            type: 'warning',
            distinguishCancelAndClose: true,
          })
          const apidoc = apidocCache.getApidoc(unsavedTab._id)
          if (!apidoc) {
            continue;
          }
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
            const deleteIndex = context.state.tabs[projectId].findIndex((tab) => tab._id === apidoc._id);
            context.commit('deleteTabByIndex', {
              projectId,
              deleteIndex,
            });
            checkSeletedTab();
          }).catch((err) => {
            console.error(err);
          })
        } catch (error) {
          if (error === 'close') {
            return;
          }
          if (error === 'cancel') { //不保存，异步方法无法直接改变state值
            const deleteIndex = context.state.tabs[projectId].findIndex((tab) => tab._id === unsavedTab._id);
            context.commit('deleteTabByIndex', {
              projectId,
              deleteIndex,
            });
          }
        }
      }
      ids.forEach((id) => {
        const deleteIndex = context.state.tabs[projectId].findIndex((tab) => tab._id === id);
        const deleteTab = context.state.tabs[projectId].find((tab) => tab._id === id);
        if (deleteTab?.saved) { //只删除保存的
          context.commit('deleteTabByIndex', {
            projectId,
            deleteIndex,
          });
        }
      })
      checkSeletedTab();
    },
  },
}

export { storeTabs as tabs }
