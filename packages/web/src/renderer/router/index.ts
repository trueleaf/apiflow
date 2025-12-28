import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useRuntime } from "@/store/runtime/runtimeStore.ts";
import { projectCache } from '@/cache/project/projectCache';
import { apiNodesCache } from '@/cache/nodes/nodesCache';
import { commonHeaderCache } from '@/cache/project/commonHeadersCache';
import { nodeVariableCache } from '@/cache/variable/nodeVariableCache';
import { httpResponseCache } from '@/cache/httpNode/httpResponseCache';
import { httpNodeHistoryCache } from '@/cache/httpNode/httpNodeHistoryCache';
import { websocketResponseCache } from '@/cache/websocketNode/websocketResponseCache';
import { webSocketHistoryCache } from '@/cache/websocketNode/websocketHistoryCache';

let dbInitialized = false;
let dbInitPromise: Promise<void> | null = null;

const initDatabases = async () => {
  if (dbInitialized) return;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    try {
      await Promise.all([
        projectCache.getDB(),
        apiNodesCache.getDB(),
      ]);
      await Promise.all([
        commonHeaderCache.getDB(),
        nodeVariableCache.getDB(),
      ]);
      await Promise.all([
        httpResponseCache.getDB(),
        httpNodeHistoryCache.getDB(),
        websocketResponseCache.getDB(),
        webSocketHistoryCache.getDB(),
      ]);
      dbInitialized = true;
    } catch (error) {
      console.error('数据库预初始化失败:', error);
    }
  })();

  return dbInitPromise;
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/header",
    name: "Header",
    component: () => import("@/pages/appWorkbench/header/Header.vue"),    
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/pages/home/Home.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/pages/admin/Admin.vue"),
  },
  {
    path: "/workbench",
    name: "Workbench",
    component: () => import("@/pages/projectWorkbench/ProjectWorkbench.vue"),
  },
  {
    path: "/share",
    name: "Share",
    component: () => import("@/pages/share/Share.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/pages/settings/Settings.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/appWorkbench/404/404.vue"),
  },
];

// 判断 lastVisitPage 路径是否匹配 routes 中的 path
const getRedirectPath = () => {
  const lastVisitPage = localStorage.getItem("history/lastVisitePage");
  if (!lastVisitPage) {
    return "/home";
  }
  // 取路径部分，去掉查询字符串和 hash
  const lastVisitPath = lastVisitPage.split("?")[0].split("#")[0];
  const allRoutePaths = routes.map((route) => route.path);
  const isValidPath = allRoutePaths.some((routePath) => {
    return lastVisitPath === routePath;
  });
  return isValidPath ? lastVisitPage : "/home";
};

const routerConfig = {
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: () => getRedirectPath(),
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/pages/login/Login.vue"),
    },
    {
      path: "/header",
      name: "Header",
      component: () => import("@/pages/appWorkbench/header/Header.vue"),
    },
    {
      path: "/home",
      name: "Home",
      component: () => import("@/pages/home/Home.vue"),
    },
    {
      path: "/admin",
      name: "Admin",
      component: () => import("@/pages/admin/Admin.vue"),
    },
    {
      path: "/workbench",
      name: "Workbench",
      component: () => import("@/pages/projectWorkbench/ProjectWorkbench.vue"),
    },
    {
      path: "/share",
      name: "Share",
      component: () => import("@/pages/share/Share.vue"),
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import("@/pages/settings/Settings.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/pages/appWorkbench/404/404.vue"),
    },
  ],
};

const router = createRouter(routerConfig);

// 注意：不要在模块顶层直接 useRuntime()，需等 Pinia 激活后在守卫内访问
//===================================== 路由守卫 ====================================//
router.beforeEach(async (to, _, next) => {
  const runtimeStore = useRuntime();
  if (!runtimeStore.userInfo.id) {
    runtimeStore.initUserInfo()
  }
  // 需要数据库的页面路径
  const dbRequiredPaths = ['/workbench', '/home'];
  if (dbRequiredPaths.some(path => to.path.startsWith(path))) {
    await initDatabases();
  }
  if (to.path === '/admin') {
    if (runtimeStore.networkMode !== 'online') {
      next('/home')
      return
    }
    if (!runtimeStore.userInfo.id) {
      next('/login')
      return
    }
    if (runtimeStore.userInfo.role !== 'admin') {
      next('/home')
      return
    }
  }
  if (runtimeStore.networkMode === 'offline') {
    next();
    return;
  }
  const anonymousAllowedPaths = ['/login', '/settings'];
  if (!runtimeStore.userInfo.id) {
    if (!anonymousAllowedPaths.includes(to.path)) {
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
