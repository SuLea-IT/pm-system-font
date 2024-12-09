// src/services/admin/index.js
import apiClient from "../api";

// 分页查询用户列表
export const fetchUsersList = (page = 1, pageSize = 5) =>
    apiClient.get('/api/admin/users', {
        params: { page, pageSize }
    });

// 获取项目列表
export const fetchProjectsList = (page = 1, pageSize = 5) =>
    apiClient.get('/api/admin/projects', {
        params: { page, pageSize }
    });

// 按用户名分页查询用户列表
export const fetchUsersByName = (username, page = 1, pageSize = 5) =>
    apiClient.get('/api/admin/users/search', {
        params: { username, page, pageSize }
    });

// 删除用户
export const deleteUser = (userId) =>
    apiClient.delete(`/api/admin/users/${userId}`);

// 创建用户
export const createUser = (userData) =>
    apiClient.post('/api/admin/users', userData);

// 更新用户信息
export const updateUser = (userId, updatedData) =>
    apiClient.put(`/api/admin/users/${userId}`, updatedData);

// 重置用户密码
export const resetUserPassword = (userId) =>
    apiClient.post('/api/admin/users/reset-password', { userid: userId });

// 禁用用户（设置用户状态为0）
export const setUserStatus = (userId) =>
    apiClient.post('/api/admin/set-status', { userid: userId });

// 强制解散项目
export const forceDissolveProject = (projectId) =>
    apiClient.post('/api/admin/force-dissolve-project', { projectId });

// 删除项目
export const deleteProject = (projectId) =>
    apiClient.delete(`/api/admin/projects/${projectId}`);

// 获取项目成员列表
export const fetchProjectMembers = (projectId) =>
    apiClient.get(`/api/admin/projects/${projectId}/members`);

// 将成员添加到项目
export const addMemberToProject = (projectId, userId, role = 'member') =>
    apiClient.post(`/api/admin/projects/${projectId}/members`, { user_id: userId, role });

// 搜索项目
export const searchProjects = (query, page = 1, limit = 5) =>
    apiClient.get('/api/admin/projects/search', {
        params: { query, page, limit }
    });

// 获取单个项目详细信息
export const fetchProjectDetails = (projectId) =>
    apiClient.get(`/api/admin/projects/${projectId}`);
