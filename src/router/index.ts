import { createRouter, createWebHistory } from 'vue-router'
import ClientLayout from '../components/ClientLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: ClientLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
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
        path: '/node-groups',
        name: 'NodeGroups',
        component: () => import('../views/NodeGroups.vue'),
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
        path: '/rule-sets',
        name: 'RuleSets',
        component: () => import('../views/RuleSets.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/user/change-password',
        name: 'UserChangePassword',
        component: () => import('../views/UserChangePassword.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/user/profile',
        name: 'UserProfile',
        component: () => import('../views/UserProfile.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/nodes/:id',
        name: 'NodeEdit',
        component: () => import('../views/NodeEdit.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/nodes/new',
        name: 'NodeNew',
        component: () => import('../views/NodeNew.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/profiles/:id',
        name: 'ProfileEdit',
        component: () => import('../views/ProfileEdit.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/profiles/new',
        name: 'ProfileNew',
        component: () => import('../views/ProfileNew.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/subscriptions/:id',
        name: 'SubscriptionEdit',
        component: () => import('../views/SubscriptionEdit.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/subscriptions/new',
        name: 'SubscriptionNew',
        component: () => import('../views/SubscriptionNew.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/node-groups/:id',
        name: 'NodeGroupEdit',
        component: () => import('../views/NodeGroupEdit.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/node-groups/new',
        name: 'NodeGroupNew',
        component: () => import('../views/NodeGroupNew.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/rule-sets/:id',
        name: 'RuleSetEdit',
        component: () => import('../views/RuleSetEdit.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/rule-sets/new',
        name: 'RuleSetNew',
        component: () => import('../views/RuleSetNew.vue'),
        meta: { requiresAuth: true }
      },
    ]
  },
  {
    path: '/user/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    let isAuthenticated = false;
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        isAuthenticated = true;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      isAuthenticated = false;
    }

    if (!isAuthenticated) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router