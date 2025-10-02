import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/doc-list',
    name: 'DocList',
    component: () => import('@/views/DocList/index.vue'),
    meta: {
      title: 'API文档管理'
    },
    children: [
      {
        path: '',
        redirect: '/doc-list/projects'
      },
      {
        path: 'projects',
        name: 'ProjectManagement',
        component: () => import('@/views/DocList/ProjectManagement.vue'),
        meta: {
          title: '项目管理'
        }
      },
      {
        path: 'teams',
        name: 'TeamManagement',
        component: () => import('@/views/DocList/TeamManagement.vue'),
        meta: {
          title: '团队管理'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router