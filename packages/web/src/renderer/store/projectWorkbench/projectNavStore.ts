import { ProjectNavItem } from "@src/types/projectWorkbench/nav";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { findNodeById } from '@/helper';
import { eventEmitter } from '@/helper';
import { router } from "@/router";
import { ClConfirm } from '@/components/ui/cleanDesign/clConfirm/ClConfirm2';
import { i18n } from '@/i18n';
import { httpNodeCache } from "@/cache/httpNode/httpNodeCache.ts";
import { projectWorkbenchCache } from "@/cache/projectWorkbench/projectWorkbenchCache.ts";
import { request } from '@/api/api';
import { useBanner } from "./bannerStore";
import { logger } from '@/helper';

type EditNavPayload<K extends keyof ProjectNavItem> = {
  id: string,
  field: K,
  value: ProjectNavItem[K],
};

export const useProjectNav = defineStore('projectNav', () => {
  const navs = ref<Record<string, ProjectNavItem[]>>({});
  const { changeExpandItems } = useBanner()
  // 获取当前选中的nav（基于当前路由的projectId）
  const currentSelectNav = computed(() => {
    const projectId = router.currentRoute.value.query.id as string;
    if (!projectId || !navs.value[projectId]) {
      return null;
    }
    return navs.value[projectId].find((nav) => nav.selected) || null;
  });
  // 初始化本地nav
  const initLocalNavs = (payload: { projectId: string }): void => {
    const { projectId } = payload;
    const localNavs: Record<string, ProjectNavItem[]> = projectWorkbenchCache.getProjectNavs();
    const selectedNav = localNavs[projectId]?.find((val) => val.selected);
    if (selectedNav) {
      changeExpandItems([selectedNav._id])
    }
    navs.value[projectId] = localNavs[projectId];
  }
  // 新增一个nav
  const addNav = (payload: ProjectNavItem): void => {
    const { _id, projectId, fixed } = payload;
    const navInfo = payload;
    const isInProject = navs.value[projectId];
    if (!isInProject) {
      navs.value[projectId] = [];
    }
    const selectedNavIndex = navs.value[projectId].findIndex((val) => val.selected);
    navs.value[projectId].forEach((nav) => nav.selected = false);
    const hasNav = navs.value[projectId].find((val) => val._id === _id);
    const unFixedNav = navs.value[projectId].find((val) => !val.fixed && val.saved);
    const unFixedNavIndex = navs.value[projectId].findIndex((val) => !val.fixed && val.saved);
    if (_id.startsWith('local_') && !hasNav) {
      navs.value[projectId].push(navInfo)
    } else if (!fixed && unFixedNav && !hasNav) {
      // 检查被覆盖的导航项是否为WebSocket类型，如果是则断开连接
      if (unFixedNav.tabType === 'websocket') {
        window.electronAPI?.websocket.disconnectByNode(unFixedNav._id).catch((error) => {
          logger.error(`覆盖WebSocket导航项时断开连接失败 [${unFixedNav._id}]`, { error });
        });
      }
      navs.value[projectId].splice(unFixedNavIndex, 1, navInfo)
    } else if (!unFixedNav && !hasNav) {
      navs.value[projectId].splice(selectedNavIndex + 1, 0, navInfo);
    } else if (fixed && !hasNav) {
      navs.value[projectId].splice(selectedNavIndex + 1, 0, navInfo);
    }
    const matchedNav = navs.value[projectId].find((val) => val._id === _id) as ProjectNavItem;
    matchedNav.selected = true;
    projectWorkbenchCache.setProjectNavs(navs.value);
    eventEmitter.emit('apidoc/tabs/addOrDeleteTab')
    changeExpandItems([_id])
  }
  // 更新全部的nav
  const updateAllNavs = (payload: { navs: ProjectNavItem[], projectId: string }): void => {
    navs.value[payload.projectId] = payload.navs;
    projectWorkbenchCache.setProjectNavs(navs.value);
  }
  // 固定一个nav
  const fixedNav = (payload: { _id: string, projectId: string}): void => {
    const { _id, projectId } = payload;
    const matchedNav = navs.value[projectId].find((val) => val._id === _id);
    if (matchedNav) {
      matchedNav.fixed = true;
    }
    projectWorkbenchCache.setProjectNavs(navs.value);
  }
  // 根据index删除nav
  const deleteNavByIndex = (payload: { deleteIndex: number, projectId: string }): void => {
    const { deleteIndex, projectId } = payload;
    const deletedNav = navs.value[projectId][deleteIndex];
    // 删除导航项时断开对应的WebSocket连接（检查类型）
    if (deletedNav && deletedNav.tabType === 'websocket') {
      window.electronAPI?.websocket.disconnectByNode(deletedNav._id).catch((error) => {
        logger.error(`删除WebSocket导航项时断开连接失败 [${deletedNav._id}]`, { error });
      });
    }
    navs.value[projectId].splice(deleteIndex, 1);
    eventEmitter.emit('apidoc/tabs/addOrDeleteTab')
  }
  // 根据id选中nav
  const selectNavById = (payload: { id: string, projectId: string }): void => {
    const { id, projectId } = payload;
    if (!navs.value[projectId]) {
      return;
    }
    navs.value[projectId].forEach((nav) => {
      if (nav._id === id) {
        nav.selected = true;
      } else {
        nav.selected = false;
      }
    })
    projectWorkbenchCache.setProjectNavs(navs.value);
    eventEmitter.emit('apidoc/tabs/addOrDeleteTab')
  }
  // 根据id改变节点属性
  const changeNavInfoById = <K extends keyof ProjectNavItem>(payload: EditNavPayload<K>): void => {
    const { id, field, value } = payload;
    const projectId = router.currentRoute.value.query.id as string;
    const currentNavs = navs.value[projectId];
    const editData = findNodeById(currentNavs, id, {
      idKey: '_id',
    }) as ProjectNavItem;
    if (!editData) {
      return
    }
    editData[field] = value;
    projectWorkbenchCache.setProjectNavs(navs.value);
  }
  // 强制关闭所有节点
  const forceDeleteAllNav = (projectId: string): void  => {
    const navsToDelete = navs.value[projectId] || [];
    // 检查是否有WebSocket类型的导航项，如果有则清空所有WebSocket连接
    const hasWebSocketNavs = navsToDelete.some(nav => nav.tabType === 'websocket');
    if (hasWebSocketNavs) {
      window.electronAPI?.websocket.clearAllConnections().catch((error) => {
        logger.error('强制关闭所有导航项时清空WebSocket连接失败', { error });
      });
    }
    const deleteIds = navsToDelete.map(v => v._id);
    deleteIds.forEach((id) => {
      const deleteIndex = navs.value[projectId].findIndex((nav) => nav._id === id);
      if (deleteIndex !== -1) {
        navs.value[projectId].splice(deleteIndex, 1);
        eventEmitter.emit('apidoc/tabs/addOrDeleteTab')
      }
    })
    projectWorkbenchCache.setProjectNavs(navs.value);
  }
  // 根据id删除nav
  const deleteNavByIds = async(payload: { ids: string[], projectId: string, force?: boolean }): Promise<void> => {
    const { ids, projectId, force } = payload;
    const freshNewSeletedNav = () => {
      const selectNav = navs.value[projectId].find((nav) => nav.selected);
      const hasNav = navs.value[projectId].length > 0;
      if (!selectNav && hasNav) {
        const selectNavIndex = navs.value[projectId].length - 1;
        changeNavInfoById({
          id: navs.value[projectId][selectNavIndex]._id,
          field: 'selected',
          value: true,
        })
        navs.value[projectId][selectNavIndex].selected = true;
      }
      projectWorkbenchCache.setProjectNavs(navs.value);
      const activeNav = navs.value[projectId].find((nav) => nav.selected);
      if (activeNav) {
        changeExpandItems([activeNav._id])
      }
    }
    if (!navs.value[projectId]) {
      return;
    }
    if (force) {
      ids.forEach((id) => {
        const deleteIndex = navs.value[projectId].findIndex((nav) => nav._id === id);
        if (deleteIndex !== -1) {
          deleteNavByIndex({
            projectId,
            deleteIndex,
          })
        }
      })
      freshNewSeletedNav();
      return
    }
    const unsavedNavs: ProjectNavItem[] = navs.value[projectId].filter(nav => !nav.saved && ids.find(v => v === nav._id));
    for (let i = 0; i < unsavedNavs.length; i += 1) {
      const unsavedNav = unsavedNavs[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        await ClConfirm({
          content: i18n.global.t('是否要保存对内容的修改', { msg: unsavedNav.label }),
          title: i18n.global.t('提示'),
          confirmButtonText: i18n.global.t('保存'),
          cancelButtonText: i18n.global.t('不保存'),
          type: 'warning',
          distinguishCancelAndClose: true,
        })
        const apidoc = httpNodeCache.getHttpNode(unsavedNav._id)
        if (!apidoc) {
          continue;
        }
        if (apidoc._id.includes('local_')) {
          // todo
        } else {
          const params = {
            _id: apidoc._id,
            projectId,
            info: apidoc.info,
            item: apidoc.item,
            preRequest: apidoc.preRequest,
            afterRequest: apidoc.afterRequest,
          };
          request.post('/api/project/fill_doc', params).then(() => {
            const deleteIndex = navs.value[projectId].findIndex((nav) => nav._id === apidoc._id);
            deleteNavByIndex({
              projectId,
              deleteIndex,
            })
            freshNewSeletedNav();
          }).catch((err) => {
            console.error(err);
          })
        }
      } catch (error) {
        if (error === 'close') {
          return;
        }
        if (error === 'cancel') {
          const deleteIndex = navs.value[projectId].findIndex((nav) => nav._id === unsavedNav._id);
          deleteNavByIndex({
            projectId,
            deleteIndex,
          })
        }
      }
    }
    ids.forEach((id) => {
      const deleteIndex = navs.value[projectId].findIndex((nav) => nav._id === id);
      const deleteNav = navs.value[projectId].find((nav) => nav._id === id);
      if (deleteNav?.saved) {
        deleteNavByIndex({
          projectId,
          deleteIndex,
        })
      }
    })
    freshNewSeletedNav();
  }
  // 获取当前选中的nav
  const getSelectedNav = (projectId: string) => {
    return navs.value[projectId].find((nav) => nav.selected)
  }
  return {
    navs,
    currentSelectNav,
    initLocalNavs,
    addNav,
    fixedNav,
    updateAllNavs,
    selectNavById,
    changeNavInfoById,
    forceDeleteAllNav,
    deleteNavByIds,
    getSelectedNav,
  }
})
