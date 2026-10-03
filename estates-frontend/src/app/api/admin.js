import { apiClient } from "./client";

export const fetchUsers = () => apiClient.get("/admin/users").then((res) => res.data);

export const fetchUser = (id) => apiClient.get(`/admin/users/${id}`).then((res) => res.data);

export const createUser = (payload) =>
  apiClient.post("/admin/users", payload).then((res) => res.data);

export const updateUser = (id, payload) =>
  apiClient.patch(`/admin/users/${id}`, payload).then((res) => res.data);

export const deactivateUser = (id) =>
  apiClient.post(`/admin/users/${id}/deactivate`).then((res) => res.data);

export const activateUser = (id) =>
  apiClient.post(`/admin/users/${id}/activate`).then((res) => res.data);

export const resetPassword = (id, temporaryPassword) =>
  apiClient
    .post(`/admin/users/${id}/reset-password`, { temporary_password: temporaryPassword })
    .then((res) => res.data);

export const resendConfirmation = (id) =>
  apiClient.post(`/admin/users/${id}/resend-confirmation`).then((res) => res.data);