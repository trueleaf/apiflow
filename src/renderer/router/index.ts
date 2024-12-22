import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
// import docEdit from '@/pages/modules/apidoc/doc-edit/doc-edit.vue'
import { config } from '@/../config/config'
import { usePermissionStore } from '@/store/permission';

const lastVisitPage = localStorage.getItem('history/lastVisitePage'); //回复上次访问的页面

const routes: Array<RouteRecordRaw> = [ 
//   {
//   path: '/v1/permission/permission',
//   name: 'Permission',
//   component: () => import('@/pages/modules/permission/permission.vue'),
// }, 
{
  path: '/v1/apidoc/doc-list',
  name: 'DocList',
  component: () => import('@/pages/modules/apidoc/doc-list/doc-list.vue'),
}, 
// {
//   path: '/v1/apidoc/doc-edit',
//   name: 'DocEdit',
//   component: docEdit,
// },
// {
//   path: '/v1/apidoc/doc-view',
//   name: 'DocView',
//   component: () => import('@/pages/modules/apidoc/doc-view/view/view.vue'),
// }, 
// {
//   path: '/v1/settings/user',
//   name: 'UserSettings',
//   component: () => import('@/pages/modules/settings/user/user.vue'),
// }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/',
    redirect: lastVisitPage || '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/login.vue')
  },
  {
    path: '/test',
    component: () => import('@/pages/test/test.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import(/* webpackChunkName: "404" */ '@/pages/layout/404/404.vue'),
  }]
})

//=====================================路由守卫====================================//
router.beforeEach((to, _, next) => {
const permissionStore = usePermissionStore();
  NProgress.start();
  const hasPermission = permissionStore.routes.length > 0; //挂载了路由代表存在权限
  if (config.renderConfig.permission.whiteList.find((val) => val === to.path)) {
    //白名单内的路由直接放行
    next();
    return;
  }
  if (!hasPermission) {
    permissionStore.getPermission().then(() => {
      next(to.fullPath);
    }).catch((err) => {
      router.push('/login');
      console.error(err);
    }).finally(() => {
      NProgress.done();
    });
  } else {
    next();
  }
});
router.afterEach((to) => {
  localStorage.setItem('history/lastVisitePage', to.fullPath);
  NProgress.done(); // 页面顶部的加载条
});
export {
  routes,
  router,
}
