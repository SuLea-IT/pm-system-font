import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import apiClient from './services/api'; // 引入 axios 配置
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './styles/style.scss'

import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/dark/css-vars.scss'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus);
app.provide('$api', apiClient); // 使用 provide 使 axios 在全局可用
app.mount('#app')
