import { apiClient } from "./client";

export const fetchLocationChildren = (parentId) =>
  apiClient
    .get("/locations", { params: parentId ? { parent_id: parentId } : {} })
    .then((res) => res.data);