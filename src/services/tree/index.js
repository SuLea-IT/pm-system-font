import apiClient from "../api";

// 获取项目目录树
export const getDirectoryTree = (projectId) => apiClient.get(`/api/directories/${projectId}`);
// 获取项目目录树
export const getDirectory = (projectId) => apiClient.get(`/api/directories/get/${projectId}`);

// 创建新目录
export const createDirectory = (directoryData) => apiClient.post('/api/directories/create', directoryData);

// 删除目录
export const deleteDirectory = (directoryId) => apiClient.delete(`/api/directories/${directoryId}`);

// 重命名目录
export const renameDirectory = (directoryId, newName) => apiClient.put(`/api/directories/${directoryId}`, { name: newName });

// 批量上传文件
export const batchUploadFiles = (formData) => {
    return apiClient.post('/api/directories/files/batch-upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
// 查询目录的详细信息
export const getDirectoryInfo = (directoryId) => apiClient.get(`/api/directories/info/${directoryId}`);
