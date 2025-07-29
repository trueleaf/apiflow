import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import docEdit from "@/pages/modules/apidoc/doc-edit/doc-edit.vue";
import { config } from "@/../config/config";
import { usePermissionStore } from "@/store/permission";

let lastVisitPage = localStorage.getItem("history/lastVisitePage"); //上次访问的页面

const routes: Array<RouteRecordRaw> = [
  {
    path: "/header",
    name: "Header",
    component: () => import("@/pages/layout/header.vue"),
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
];

// 判断lastVisitPage路径是否匹配routes中的path
const getRedirectPath = () => {
  if (!lastVisitPage) {
    return "/v1/apidoc/doc-list";
  }
  // 提取路径部分，去除查询字符串和hash
  const lastVisitPath = lastVisitPage.split("?")[0].split("#")[0];
  const allRoutePaths = routes.map((route) => route.path)
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
      path: "/header",
      name: "Header",
      component: () => import("@/pages/layout/header.vue"),
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
  ],
};

const router = createRouter(routerConfig);

//=====================================路由守卫====================================//
if (!__STANDALONE__) {
  router.beforeEach((to, _, next) => {
    const permissionStore = usePermissionStore();
    NProgress.start();
    const hasPermission = permissionStore.routes.length > 0; //挂载了路由代表存在权限
    if (
      config.renderConfig.permission.whiteList.find((val) => val === to.path)
    ) {
      //白名单内的路由直接放行
      next();
      return;
    }
    if (!hasPermission) {
      permissionStore
        .getPermission()
        .then(() => {
          next(to.fullPath);
        })
        .catch((err) => {
          router.push("/login");
          console.error(err);
        })
        .finally(() => {
          NProgress.done();
        });
    } else {
      next();
    }
  });
  router.afterEach((to) => {
    localStorage.setItem("history/lastVisitePage", to.fullPath);
    NProgress.done(); // 页面顶部的加载条
  });
} else {
  router.afterEach((to) => {
    localStorage.setItem("history/lastVisitePage", to.fullPath);
  });
}

export { routes, router };
