// src/services/users/index.js
import apiClient from "../api";

export const registerUser = (userData) => apiClient.post('/api/users/register', userData);
export const loginUser = (loginData) => apiClient.post('/api/users/login', loginData);
export const loginCode = (loginData) => apiClient.post('/api/users/login-with-code', loginData);
export const requestLoginCode = (username) => apiClient.post('/api/users/request-login-code', { username });
export const registerWithCode = (registerData) => apiClient.post('/api/users/send-confirmation-code', registerData);
export const getUserProfile = () => apiClient.get('/api/users/profile');
export const getUserIDProfile = (userData) => apiClient.get('/api/users/userprofile', { params: userData });
export const getExcludeSelf = (Params) => apiClient.get('/api/users/exclude-self', { params: Params });
export const getUsersBySearch = (searchParams) => apiClient.get('/api/users/search-users', { params: searchParams });