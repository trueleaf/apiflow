import { router, routes as allRoutes } from '@/router';
import { config } from '@src/config/config';
import { GlobalConfig, PermissionClientMenu, PermissionClientRoute, PermissionUserInfo, CommonResponse } from '@src/types';
import { defineStore } from 'pinia'
import layout from '@/pages/layout/Layout.vue';
import { RouteRecordRaw } from 'vue-router';
import { ref } from 'vue';
import { uniqueByKey } from '@/helper';
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
    shareUrl: '',
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
    if (config.renderConfig.permission.free) { //free模式允许看见所有路由信息
      router.addRoute({
        path: '/v1',
        component: layout,
        children: [
          ...allRoutes,
        ],
      });
    } else {
      const matchedRoutes: RouteRecordRaw[] = [];
      allRoutes.forEach((route: RouteRecordRaw) => { //遍历本地所有路由
        routes.value.forEach((val) => {
          if (val.path === route.path) {
            if (!matchedRoutes.find((m) => m.path === val.path)) { //如果已经存在匹配的数据则不再push
              matchedRoutes.push(route);
            }
          }
        });
      });
      router.addRoute({
        path: '/v1',
        component: layout,
        children: [
          ...matchedRoutes,
        ],
      });
    }
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
  const changeMenus = (payload: PermissionClientMenu[]) => {
    const runtimeStore = useRuntime();
    if (config.renderConfig.permission.free && runtimeStore.userInfo.loginName === 'admin') {
      menus.value = [{
        path: '/home',
        name: 'api文档',
      }, {
        path: '/v1/permission/permission',
        name: '权限管理',
      }];
    } else if (config.renderConfig.permission.free) {
      menus.value = [{
        path: '/home',
        name: 'api文档',
      }];
    } else {
      menus.value = payload;
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
        changeMenus(res.data.clientBanner);
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