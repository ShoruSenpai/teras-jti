import apiClient from "@/services/apiClient";

export async function getMenus() {
  const res = await apiClient.get("/menus");

  return res.data;
}
