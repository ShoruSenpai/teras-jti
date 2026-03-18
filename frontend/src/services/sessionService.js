import apiClient from "./apiClient";

export async function createSession(type) {
  const res = await apiClient.post("/session/create", {
    session_type: type,
  });

  return res.data;
}

export async function validateSession(token) {
  const res = await apiClient.post("/session/validate", {
    token,
  });

  return res.data;
}
