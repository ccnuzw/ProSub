import { createRouter, createWebHistory } from 'vue-router'
import ClientLayout from '../components/ClientLayout.vue'

const routes = [
  {
    path: '/',
    component: ClientLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/nodes',
        name: 'Nodes',
        component: () => import('../views/Nodes.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/profiles',
        name: 'Profiles',
        component: () => import('../views/Profiles.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/subscriptions',
        name: 'Subscriptions',
        component: () => import('../views/Subscriptions.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/user',
        name: 'UserProfile',
        component: () => import('../views/UserProfile.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 在开发环境下跳过认证检查
  if (import.meta.env.DEV) {
    next()
    return
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        next()
      } else {
        next('/login')
      }
    } catch (error) {
      console.error('认证检查失败:', error)
      next('/login')
    }
  } else {
    next()
  }
})

export default router