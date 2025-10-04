import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import docEdit from "@/pages/modules/apidoc/doc-edit/doc-edit.vue";
import { usePermissionStore } from "@/store/permission";
import { useRuntime } from "@/store/runtime/runtime.ts";

let lastVisitPage = localStorage.getItem("history/lastVisitePage"); // 上次访问的页面

const routes: Array<RouteRecordRaw> = [
  {
    path: "/header",
    name: "Header",
    component: () => import("@/pages/header/header.vue"),
  },
  {
    path: "/v1/apidoc/doc-list",
    name: "DocList",
    component: () => import("@/pages/modules/apidoc/doc-list/doc-list.vue"),
  },
  {
    path: "/v1/apidoc/doc-edit",
    name: "DocEdit",
    component: docEdit,
  },
  {
    path: "/share",
    name: "Share",
    component: () => import("@/pages/modules/apidoc/doc-share/share.vue"),
  },
  {
    path: "/user-center",
    name: "UserCenter",
    component: () => import("@/pages/modules/user-center/UserCenter.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/layout/404/404.vue"),
  },
];

// 判断 lastVisitPage 路径是否匹配 routes 中的 path
const getRedirectPath = () => {
  if (!lastVisitPage) {
    return "/v1/apidoc/doc-list";
  }
  // 取路径部分，去掉查询字符串和 hash
  const lastVisitPath = lastVisitPage.split("?")[0].split("#")[0];
  const allRoutePaths = routes.map((route) => route.path);
  const isValidPath = allRoutePaths.some((routePath) => {
    return lastVisitPath === routePath;
  });
  return isValidPath ? lastVisitPage : "/v1/apidoc/doc-list";
};

const routerConfig = {
  history: __COMMAND__ === 'build' ? createWebHashHistory() : createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: getRedirectPath(),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/pages/login/login.vue"),
    },
    {
      path: "/header",
      name: "Header",
      component: () => import("@/pages/header/header.vue"),
    },
    {
      path: "/v1/apidoc/doc-list",
      name: "DocList",
      component: () => import("@/pages/modules/apidoc/doc-list/doc-list.vue"),
    },
    {
      path: "/v1/apidoc/doc-edit",
      name: "DocEdit",
      component: docEdit,
    },
    {
      path: "/share",
      name: "Share",
      component: () => import("@/pages/modules/apidoc/doc-share/share.vue"),
    },
    {
      path: "/user-center",
      name: "UserCenter",
      component: () => import("@/pages/modules/user-center/UserCenter.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/pages/layout/404/404.vue"),
    },
  ],
};

const router = createRouter(routerConfig);

// 注意：不要在模块顶层直接 useRuntime()，需等 Pinia 激活后在守卫内访问
//===================================== 路由守卫 ====================================//
router.beforeEach((to, _, next) => {
  const runtimeStore = useRuntime();
  if (runtimeStore.networkMode === 'offline') {
    next();
    return;
  }
  const permissionStore = usePermissionStore();
  if (!permissionStore.userInfo.id) {
    // 如果用户未登录且不是访问登录页面，则跳转到登录页面
    if (to.path !== '/login') {
      next('/login');
      return;
    }
  }
  next();
});

router.afterEach((to) => {
  localStorage.setItem("history/lastVisitePage", to.fullPath);
  const runtimeStore = useRuntime();
  if (runtimeStore.networkMode !== 'offline') {
    NProgress.done(); // 页面顶部的加载条
  }
});

export { routes, router };
