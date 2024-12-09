import apiClient from "../api";

// 获取项目的所有任务
export const getProjectTasks = (page = 1, limit = 3) =>
    apiClient.get(`/api/tasks/projects`, {
        params: { page, limit }
    });

// 获取当前用户的所有任务
export const getMyTasks = (page = 1, limit = 3) =>
    apiClient.get('/api/tasks/my-tasks', {
        params: { page, limit }
    });

// 创建新任务
export const createTask = (taskData) =>
    apiClient.post('/api/tasks/create', taskData);
// 取消任务
export const cancelTask = (taskId) =>
    apiClient.put(`/api/tasks/${taskId}/cancel`);

// 删除任务
export const deleteTask = (taskId) =>
    apiClient.delete(`/api/tasks/${taskId}`);

// 更新任务状态
export const updateTaskStatus = (taskId, status) =>
    apiClient.put(`/api/tasks/${taskId}/status`, { status });
