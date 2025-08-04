import { createRouter, createWebHistory } from 'vue-router'
import ClientLayout from '../components/ClientLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: ClientLayout,
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
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 开发环境下跳过认证
  if (import.meta.env.DEV) {
    next()
    return
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
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