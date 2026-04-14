import apiClient from "@/services/apiClient";

export const getbanners = async () => {
  const res = await apiClient.get("/banners");

  return res.data;
};
