import { router, routes as allRoutes } from '@/router';
import { GlobalConfig, PermissionClientMenu, PermissionClientRoute, PermissionUserInfo, CommonResponse } from '@src/types';
import { defineStore } from 'pinia'
import layout from '@/pages/appWorkbench/content/content.vue';
import { ref } from 'vue';
import { uniqueByKey } from '@/helper/common';
import { request } from '@/api/api';
import { useRuntime } from '@/store/runtime/runtimeStore';

type ResUserInfo = PermissionUserInfo & {
  clientBanner: PermissionClientMenu[],
  clientRoutes: PermissionClientRoute[],
  globalConfig: GlobalConfig
}

export const usePermissionStore = defineStore('permission', () => {

  const globalConfig = ref<GlobalConfig>({
    title: "",
    version: "",
    autoUpdate: false,
    updateUrl: '',
  })
  const routes = ref<PermissionClientRoute[]>([]);
  const menus = ref<{ path: string; name: string }[]>([]);
  const loadingBanner = ref(false);

  //改变全局配置
  const changeGlobalConfig = (payload: GlobalConfig) => {
    globalConfig.value = payload;
  }
  //动态生成路由
  const generateRoutes = () => {
    router.addRoute({
      path: '/v1',
      component: layout,
      children: [
        ...allRoutes,
      ],
    });
  }
  //改变用户可访问路由
  const changeRoutes = (payload: PermissionClientRoute[]): void => {
    const localRoutesStr = sessionStorage.getItem('permission/routes') || '[]';
    const localRoutes = JSON.parse(localRoutesStr) as PermissionClientRoute[];
    const storeRoutes = uniqueByKey(localRoutes.concat(payload), 'path');
    sessionStorage.setItem('permission/routes', JSON.stringify(storeRoutes));
    routes.value = storeRoutes;
  }
  //改变当前访问菜单
  const changeMenus = () => {
    const runtimeStore = useRuntime();
    if (runtimeStore.userInfo.loginName === 'admin') {
      menus.value = [{
        path: '/home',
        name: 'api文档',
      }, {
        path: '/v1/admin/admin',
        name: '系统管理',
      }];
    } else {
      menus.value = [{
        path: '/home',
        name: 'api文档',
      }];
    }
  }
  //清空全部权限
  const clearAllPermission = () => {
    routes.value = [];
    menus.value = [];
  };
  //获取权限
  const getPermission = async (): Promise<ResUserInfo> => {
    const runtimeStore = useRuntime();
    return new Promise((resolve, reject) => {
      request.get<CommonResponse<ResUserInfo>, CommonResponse<ResUserInfo>>('/api/security/user_base_info').then((res) => {
        runtimeStore.setUserInfo(res.data);
        changeMenus();
        changeRoutes(res.data.clientRoutes);
        changeGlobalConfig(res.data.globalConfig);
        generateRoutes();
        resolve(res.data);
      }).catch((err) => {
        runtimeStore.clearUserInfo();
        reject(err);
      });
    });
  }

  return {
    routes,
    menus,
    loadingBanner,
    globalConfig,
    changeGlobalConfig,
    generateRoutes,
    changeRoutes,
    changeMenus,
    clearAllPermission,
    getPermission,
  }
})