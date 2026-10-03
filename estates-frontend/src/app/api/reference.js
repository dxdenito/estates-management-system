import { apiClient } from "./client";

export const fetchReference = (kind) =>
  apiClient.get(`/reference/${kind}`).then((res) => res.data);

export const createReference = (kind, payload) =>
  apiClient.post(`/reference/${kind}`, payload).then((res) => res.data);

export const updateReference = (kind, id, payload) =>
  apiClient.patch(`/reference/${kind}/${id}`, payload).then((res) => res.data);

export const setReferenceActive = (kind, id, active) =>
  apiClient
    .post(`/reference/${kind}/${id}/${active ? "activate" : "deactivate"}`)
    .then((res) => res.data);

export const deleteReference = (kind, id) =>
  apiClient.delete(`/reference/${kind}/${id}`).then((res) => res.data);

export const fetchDomains = () => apiClient.get("/reference/domains").then((res) => res.data);

export const addDomain = (domain) =>
  apiClient.post("/reference/domains", { domain }).then((res) => res.data);

export const removeDomain = (domain) =>
  apiClient.delete(`/reference/domains/${encodeURIComponent(domain)}`).then((res) => res.data);