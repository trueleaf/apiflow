import { ActionContext } from 'vuex'
import { RouteRecordRaw } from 'vue-router'
import type { State as RootState, PermissionState } from '@src/types/store'
import { Response, PermissionUserInfo, PermissionClientMenu, PermissionClientRoute, GlobalConfig } from '@src/types/global'
import { request } from '@/api/api'
import { uniqueByKey } from '@/helper/index'
import { router, routes } from '@/router/index'
import { config } from '@/../config/config'
import layout from '@/pages/layout/layout.vue';
import { globalCache } from '@/cache/cache'

type ResUserInfo = PermissionUserInfo & {
  clientBanner: PermissionClientMenu[],
  clientRoutes: PermissionClientRoute[],
  globalConfig: GlobalConfig
}

const permission = {
  namespaced: true,
  state: {
    userInfo: {}, //-----------用户信息
    routes: [], //-------------路由
    menus: [], //--------------用户菜单
    globalConfig: {}, //-------全局配置
    loadingBanner: false, //---是否加载banner中
  },
  mutations: {
    /**
     * 改变用户基本信息
     */
    changeUserInfo(state: PermissionState, payload: PermissionUserInfo): void {
      state.userInfo = {
        id: payload.id,
        loginName: payload.loginName,
        phone: payload.phone,
        realName: payload.realName,
        roleIds: payload.roleIds,
      };
    },
    /**
         * 动态生成路由
         */
    generateRoutes(state: PermissionState): void {
      if (config.renderConfig.permission.free) { //free模式允许看见所有路由信息
        router.addRoute({
          path: '/v1',
          component: layout,
          children: [
            ...routes,
          ],
        });
      } else {
        const matchedRoutes: RouteRecordRaw[] = [];
        routes.forEach((route) => { //遍历本地所有路由
          state.routes.forEach((val) => {
            if (val.path === route.path) {
              if (!matchedRoutes.find((m) => m.path === val.path)) { //如果已经存在匹配的数据则不再push
                matchedRoutes.push(route);
              }
            }
          });
        });
        // console.log(state.routes, matchedRoutes, 222)
        // router.addRoute({
        //     path: "/v1",
        //     component: layout,
        //     children: [
        //         ...matchedRoutes,
        //     ],
        // });
      }
    },
    /**
         * 改变用户可访问路由
         */
    changeRoutes(state: PermissionState, payload: PermissionClientRoute[]): void {
      const localRoutesStr = sessionStorage.getItem('permission/routes') || '[]';
      const localRoutes = JSON.parse(localRoutesStr) as PermissionClientRoute[];
      const storeRoutes = uniqueByKey(localRoutes.concat(payload), 'path');
      sessionStorage.setItem('permission/routes', JSON.stringify(storeRoutes));
      state.routes = storeRoutes;
    },
    /**
         * 改变当前访问菜单
         */
    changeMenus(state: PermissionState, payload: PermissionClientMenu[]): void {
      if (config.renderConfig.permission.free && state.userInfo.loginName === 'admin') {
        state.menus = [{
          path: '/v1/apidoc/doc-list',
          name: 'api文档',
        }, {
          path: '/v1/permission/permission',
          name: '权限管理',
        }];
      } else if (config.renderConfig.permission.free) {
        state.menus = [{
          path: '/v1/apidoc/doc-list',
          name: 'api文档',
        }];
      } else {
        state.menus = payload;
      }
    },
    /**
         * 改变全局配置信息
         */
    changeGlobalConfig(state: PermissionState, payload: GlobalConfig): void {
      state.globalConfig = payload;
      globalCache.changeGlobalConfig(payload);
    },
    // 清空全部权限
    clearAllPermission(state: PermissionState): void {
      state.routes = [];
      state.menus = [];
    },
  },
  actions: {
    async getPermission(context: ActionContext<PermissionState, RootState>): Promise<ResUserInfo> {
      return new Promise((resolve, reject) => {
        request.get<Response<ResUserInfo>, Response<ResUserInfo>>('/api/security/user_base_info').then((res) => {
          context.commit('changeUserInfo', res.data);
          context.commit('changeMenus', res.data.clientBanner);
          context.commit('changeRoutes', res.data.clientRoutes);
          context.commit('changeGlobalConfig', res.data.globalConfig);
          context.commit('generateRoutes');
          resolve(res.data);
          sessionStorage.setItem('permission/userInfo', JSON.stringify(res.data));
        }).catch((err) => {
          reject(err);
        });
      });
    },
  },
}

export { permission }
