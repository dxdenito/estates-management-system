import { apiClient } from "./client";

export const fetchWorkbenchQueue = (scope) =>
  apiClient.get("/workbench/requests", { params: { scope } }).then((res) => res.data);

export const fetchWorkbenchRequest = (id) =>
  apiClient.get(`/workbench/requests/${id}`).then((res) => res.data);

export const claimRequest = (id) =>
  apiClient.post(`/workbench/requests/${id}/claim`).then((res) => res.data);

export const submitAssessment = (id, payload) =>
  apiClient.post(`/workbench/requests/${id}/assessment`, payload).then((res) => res.data);

export const submitRequisition = (id, procurementRef) =>
  apiClient
    .post(`/workbench/requests/${id}/requisition/submit`, { procurement_ref: procurementRef })
    .then((res) => res.data);

export const issueRequisition = (id) =>
  apiClient.post(`/workbench/requests/${id}/requisition/issue`).then((res) => res.data);

export const submitReview = (id, payload) =>
  apiClient.post(`/workbench/requests/${id}/review`, payload).then((res) => res.data);