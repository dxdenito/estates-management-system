import { apiClient } from "./client";

export const fetchDashboardSummary = () =>
  apiClient.get("/dashboard/summary").then((res) => res.data);