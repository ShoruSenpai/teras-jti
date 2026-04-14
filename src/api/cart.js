import apiClient from "@/services/apiClient";

export const addToCart = async (menuId, options = []) => {
  const res = await apiClient.post("/cart/add", {
    menu_id: menuId,
    options: options,
  });

  return res.data;
};

export const getCartSummary = async (token) => {
  const res = await apiClient.get("/cart/summary", {
    headers: {
      "X-Session-Token": token,
    },
  });

  return res.data;
};
