import { apiClient } from "./client";

export const fetchTriageQueue = (stage) =>
  apiClient.get("/triage/requests", { params: { stage } }).then((res) => res.data);

export const fetchTriageRequest = (id) =>
  apiClient.get(`/triage/requests/${id}`).then((res) => res.data);

export const categorizeRequest = (id, categoryId) =>
  apiClient
    .post(`/triage/requests/${id}/categorize`, { category_id: categoryId })
    .then((res) => res.data);