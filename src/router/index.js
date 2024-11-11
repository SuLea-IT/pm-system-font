import { createRouter, createWebHashHistory } from 'vue-router';
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';

import GlobalLayout from '../layouts/GlobalLayout.vue';
import MainLayout from '../layouts/MainLayout.vue';

import UsersSys from '../views/Admin/UsersSys.vue';
import ProjectSys from '../views/Admin/ProjectSys.vue';
import ProjectList from '../views/Project/ProjectList.vue';
import ProjectInfo from '../views/Project/ProjectInfo.vue';
const routes = [
  {
    path: '/',
    redirect: to => {
      const user = JSON.parse(localStorage.getItem('user'));
      return user ? '/sys' : '/login';
    },
    component: GlobalLayout,
    children: [
      {
        path: 'login',
        component: LoginView,
        name: "登录"
      },
      {
        path: 'register',
        component: RegisterView,
        name: "注册"
      },
    ],
  },
  {
    path: '/sys',
    component: MainLayout,
    children: [
      {
        path: '', // 默认子路由
        component: UsersSys,
        name: '用户管理', // 与 TabsView 中一致
      },
      {
        path: 'projectSys', // 子路由路径无斜杠
        component: ProjectSys,
        name: '项目管理', // 与 TabsView 中一致
      },
    ],
  },
  {
    path: '/project',
    component: MainLayout,
    children: [
      {
        path: '', // 默认子路由
        component: ProjectList,
        name: '项目列表',
      },
      {
        path: 'projectInfo/:id', // 子路由路径无斜杠
        component: ProjectInfo,
        name: '项目信息',
        props: true,
      },
    ],
  },
];


const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 导航守卫检查本地是否有 user 数据
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user && to.path !== '/login' && to.path !== '/register') {
    next('/login'); // 没有用户数据则跳转到登录页面
  } else {
    next(); // 允许进入目标页面
  }
});

export default router;
