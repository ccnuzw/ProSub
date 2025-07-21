import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Nodes from '../views/Nodes.vue'
import Profiles from '../views/Profiles.vue'
import Subscriptions from '../views/Subscriptions.vue'
import Users from '../views/Users.vue'
import Login from '../views/Login.vue'
import UserEdit from '../views/UserEdit.vue'
import UserNew from '../views/UserNew.vue'
import UserProfile from '../views/UserProfile.vue'
import UserSubscription from '../views/UserSubscription.vue'
import NodeEdit from '../views/NodeEdit.vue'
import NodeNew from '../views/NodeNew.vue'
import ProfileEdit from '../views/ProfileEdit.vue'
import ProfileNew from '../views/ProfileNew.vue'
import SubscriptionEdit from '../views/SubscriptionEdit.vue'
import SubscriptionNew from '../views/SubscriptionNew.vue'

import UserChangePassword from '../views/UserChangePassword.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/nodes',
    name: 'Nodes',
    component: Nodes,
  },
  {
    path: '/profiles',
    name: 'Profiles',
    component: Profiles,
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: Subscriptions,
  },
  {
    path: '/user',
    name: 'Users',
    component: Users,
  },
  {
    path: '/user/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/user/change-password',
    name: 'UserChangePassword',
    component: UserChangePassword,
  },
  {
    path: '/user/:id',
    name: 'UserEdit',
    component: UserEdit,
  },
  {
    path: '/user/new',
    name: 'UserNew',
    component: UserNew,
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: UserProfile,
  },
  {
    path: '/user/subscription',
    name: 'UserSubscription',
    component: UserSubscription,
  },
  {
    path: '/nodes/:id',
    name: 'NodeEdit',
    component: NodeEdit,
  },
  {
    path: '/nodes/new',
    name: 'NodeNew',
    component: NodeNew,
  },
  {
    path: '/profiles/:id',
    name: 'ProfileEdit',
    component: ProfileEdit,
  },
  {
    path: '/profiles/new',
    name: 'ProfileNew',
    component: ProfileNew,
  },
  {
    path: '/subscriptions/:id',
    name: 'SubscriptionEdit',
    component: SubscriptionEdit,
  },
  {
    path: '/subscriptions/new',
    name: 'SubscriptionNew',
    component: SubscriptionNew,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router