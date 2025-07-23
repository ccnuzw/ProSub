import { createRouter, createWebHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/nodes',
    name: 'Nodes',
    component: () => import('../views/Nodes.vue'),
  },
  {
    path: '/profiles',
    name: 'Profiles',
    component: () => import('../views/Profiles.vue'),
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('../views/Subscriptions.vue'),
  },
  {
    path: '/user/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/user/change-password',
    name: 'UserChangePassword',
    component: () => import('../views/UserChangePassword.vue'),
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/UserProfile.vue'),
  },
  {
    path: '/nodes/:id',
    name: 'NodeEdit',
    component: () => import('../views/NodeEdit.vue'),
  },
  {
    path: '/nodes/new',
    name: 'NodeNew',
    component: () => import('../views/NodeNew.vue'),
  },
  {
    path: '/profiles/:id',
    name: 'ProfileEdit',
    component: () => import('../views/ProfileEdit.vue'),
  },
  {
    path: '/profiles/new',
    name: 'ProfileNew',
    component: () => import('../views/ProfileNew.vue'),
  },
  {
    path: '/subscriptions/:id',
    name: 'SubscriptionEdit',
    component: () => import('../views/SubscriptionEdit.vue'),
  },
  {
    path: '/subscriptions/new',
    name: 'SubscriptionNew',
    component: () => import('../views/SubscriptionNew.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router