// src/services/projects/index.js
import apiClient from "../api";

// 创建项目
export const createProject = (projectData) => apiClient.post('/api/projects/create', projectData);

// 更新项目信息
export const updateProject = (projectId, projectData) => apiClient.put(`/api/projects/${projectId}`, projectData);

// 删除项目
export const deleteProject = (projectId) => apiClient.delete(`/api/projects/${projectId}`);

// 获取项目信息
export const getProjectInfo = (projectId) => apiClient.get(`/api/projects/${projectId}/info`);

// 邀请成员进入项目
export const inviteProjectMember = (projectId, memberData) => apiClient.post(`/api/projects/${projectId}/invite`, memberData);

// 上传项目文件
export const uploadProjectFile = (projectId, fileData) => apiClient.post(`/api/projects/${projectId}/upload`, fileData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// 获取项目文件信息
export const getProjectFiles = (projectId) => apiClient.get(`/api/projects/${projectId}/files`);

// 用户申请进入项目
export const applyForProject = (projectId, applicationData) => apiClient.post(`/api/projects/${projectId}/apply`, applicationData);

// 获取项目全部申请情况
export const getProjectApplications = (projectId) => apiClient.get(`/api/projects/${projectId}/applications`);

// 审核项目申请
export const reviewProjectApplication = (applicationId, reviewData) => apiClient.put(`/api/projects/applications/${applicationId}`, reviewData);

// 移除项目成员
export const removeProjectMember = (projectId, memberData) => apiClient.delete(`/api/projects/${projectId}/remove-member`, { data: memberData });

// 搜索本人项目
export const UserProjectsList = (projectData) => apiClient.get('/api/projects', { params: projectData });

// 搜索本人项目
export const searchUserProjects = (projectData) =>
    apiClient.get('/api/projects/search', { params: projectData });
