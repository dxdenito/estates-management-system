import { apiClient } from "./client";

export const fetchManagerQueue = (scope) =>
  apiClient.get("/manager/requests", { params: { scope } }).then((res) => res.data);

export const fetchManagerRequest = (id) =>
  apiClient.get(`/manager/requests/${id}`).then((res) => res.data);

export const fetchArtisans = () => apiClient.get("/manager/artisans").then((res) => res.data);

export const fetchSupervisors = (categoryId) =>
  apiClient
    .get("/manager/supervisors", { params: { category_id: categoryId } })
    .then((res) => res.data);

export const approveRequisition = (id) =>
  apiClient.post(`/manager/requests/${id}/approve-requisition`).then((res) => res.data);

export const assignArtisan = (id, artisanId) =>
  apiClient.post(`/manager/requests/${id}/assign`, { artisan_id: artisanId }).then((res) => res.data);

export const releaseRequest = (id) =>
  apiClient.post(`/manager/requests/${id}/release`).then((res) => res.data);

export const reassignRequest = (id, supervisorId) =>
  apiClient
    .post(`/manager/requests/${id}/reassign`, { supervisor_id: supervisorId })
    .then((res) => res.data);