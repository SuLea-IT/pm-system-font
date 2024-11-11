// src/services/admin/index.js
import apiClient from "../api";

// 分页查询用户列表
export const fetchUsersList = (page = 1, pageSize = 5) =>
    apiClient.get('/api/admin/users', {
        params: { page, pageSize }
    });

// 按姓名分页查询用户列表
export const fetchUsersByName = (username, page = 1, pageSize = 5) =>
    apiClient.get('/api/admin/users/search', {
        params: { username, page, pageSize }
    });

// 删除用户
export const deleteUser = (userId) =>
    apiClient.delete(`/api/admin/users/${userId}`);

// 新建用户
export const createUser = (userData) =>
    apiClient.post('/api/admin/users', userData);

// 更新用户信息
export const updateUser = (userId, updatedData) =>
    apiClient.put(`/api/admin/users/${userId}`, updatedData);
