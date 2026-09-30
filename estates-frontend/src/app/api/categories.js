import { apiClient } from "./client";

export const fetchCategories = () => apiClient.get("/categories").then((res) => res.data);