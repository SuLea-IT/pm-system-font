// src/services/api.js
import axios from 'axios';

// 定义一个白名单数组，包含所有不需要携带 token 的接口路径
const whitelist = ['/login', '/register', '/public/data'];

const apiClient = axios.create({
    baseURL: 'https://localhost:3000', // 配置基础 URL
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
apiClient.interceptors.request.use(config => {
    // 检查当前请求的 URL 是否在白名单内
    const isWhitelisted = whitelist.some(path => config.url.includes(path));

    // 如果不在白名单中，则添加 token
    if (!isWhitelisted) {
        const token = localStorage.getItem('token'); // 假设 token 存储在 localStorage 中
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截器
apiClient.interceptors.response.use(response => {
    return response.data;
}, error => {
    return Promise.reject(error);
});

export default apiClient;
