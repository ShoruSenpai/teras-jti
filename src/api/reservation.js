import apiClient from "@/services/apiClient";

/**
 * @param {string} month - Format: "YYYY-MM"
 */
export const getMonthAvailability = async (month) => {
  const res = await apiClient.get("/reservation/month-availability", {
    params: { month },
  });

  return res.data;
};

/**
 * @param {string} date - Format: "YYYY-MM-DD"
 */
export const getAreaAvailability = async (date) => {
  const res = await apiClient.get("/reservation/availability", {
    params: { date },
  });

  return res.data;
};

// step 1
export const saveStepArea = async (date, areaId) => {
  const res = await apiClient.post("/reservation/step-area", {
    date: date,
    area_id: areaId,
  });

  return res.data;
};

export const saveStepPersonalData = async (data) => {
  const res = await apiClient.post("/reservation/step-personal-data", data);

  return res.data;
};

export const getReservationSummary = async () => {
  const res = await apiClient.get("/reservation/summary");

  return res.data;
};

export const getPersonalData = async () => {
  const res = await apiClient.get("/reservation/get-personal-data");

  return res.data;
};

export const getPreorderCart = async () => {
  const res = await apiClient.get("/reservation/preorder-cart");

  return res.data;
};

export const addPreorderMenu = async (menuId, options = []) => {
  const res = await apiClient.post("/reservation/preorder-add", {
    menu_id: menuId,
    options: options,
  });

  return res.data;
};

export const updatePreorderMenuQty = async (itemId, action) => {
  const res = await apiClient.post(`/reservation/preorder-update/${itemId}`, {
    action: action,
  });

  return res.data;
};

export const processReservationCheckout = async () => {
  const res = await apiClient.post("/reservation/checkout");

  return res.data;
};
