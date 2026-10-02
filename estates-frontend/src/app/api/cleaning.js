import { apiClient } from "./client";

export const fetchAreas = () => apiClient.get("/cleaning/areas").then((res) => res.data);

export const fetchDeficiencies = (scope) =>
  apiClient.get("/cleaning/deficiencies", { params: { scope } }).then((res) => res.data);

export const fetchInspections = () =>
  apiClient.get("/cleaning/inspections").then((res) => res.data);

export const fetchInspection = (id) =>
  apiClient.get(`/cleaning/inspections/${id}`).then((res) => res.data);

export const createInspection = (payload) =>
  apiClient.post("/cleaning/inspections", payload).then((res) => res.data);

export const verifyDeficiency = (id) =>
  apiClient.post(`/cleaning/deficiencies/${id}/verify`).then((res) => res.data);

export const sendBackDeficiency = (id, note) =>
  apiClient.post(`/cleaning/deficiencies/${id}/reject`, { note }).then((res) => res.data);