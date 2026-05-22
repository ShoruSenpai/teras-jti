import apiClient from "@/services/apiClient";

export const getCart = async () => {
  const res = await apiClient.get("/cart");

  return res.data;
};

export const addToCart = async (menuId, options = []) => {
  const res = await apiClient.post("/cart/add", {
    menu_id: menuId,
    options: options,
  });

  return res.data;
};

export const getCartSummary = async () => {
  const res = await apiClient.get("/cart/summary");

  return res.data;
};

export const updateCartQty = async (itemId, action) => {
  const res = await apiClient.post(`/cart/update/${itemId}`, { action });

  return res.data;
};

export const checkoutCart = async () => {
  const res = await apiClient.post("/cart/checkout");

  return res.data;
};
