import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'

// import MainLayout from '../layouts/MainLayout.vue'
import GlobalLayout from '../layouts/GlobalLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
    component: GlobalLayout,
    children: [
      {
        path: 'login',
        component: LoginView
      },
      {
        path: 'register',
        component: RegisterView
      },
    ]
  }
  // ,{
  //   path: '/analyse',
  //   component: MainLayout, // 仅在/analyse及其子页面使用MainLayout
  //   children: [
  //     {
  //       path: '',
  //       component: () => import('../views/Platform.vue')
  //     },
  //     {
  //       path: 'Platform',
  //       component: () => import('../views/Platform.vue')
  //     },
  //     {
  //       path: 'UploadData',
  //       component: () => import('../views/UploadData.vue')
  //     }
  //   ]
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


export default router
