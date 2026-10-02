import { apiClient } from "./client";

export const fetchTasks = (scope) =>
  apiClient.get("/artisan/tasks", { params: { scope } }).then((res) => res.data);

export const fetchTask = (id) => apiClient.get(`/artisan/tasks/${id}`).then((res) => res.data);

export const startTask = (id) =>
  apiClient.post(`/artisan/tasks/${id}/start`).then((res) => res.data);

export const completeTask = (id, payload) =>
  apiClient.post(`/artisan/tasks/${id}/complete`, payload).then((res) => res.data);