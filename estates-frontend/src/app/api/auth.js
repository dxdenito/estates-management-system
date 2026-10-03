import { apiClient } from "./client";

export const changePassword = (payload) =>
  apiClient.post("/auth/change-password", payload).then((res) => res.data);

export const confirmEmail = (token) =>
  apiClient.post("/auth/confirm-email", { token }).then((res) => res.data);