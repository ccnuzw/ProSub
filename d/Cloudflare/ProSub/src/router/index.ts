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
      // ... other authenticated routes ...
    ]
  },
  {
    path: '/user/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
]