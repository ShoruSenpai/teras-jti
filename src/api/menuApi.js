import apiClient from "@/services/apiClient";

export async function getMenus(token) {
  const res = await apiClient.get("/menus", {
    headers: {
      "X-Session-Token": token,
    },
  });

  return res.data;
}
