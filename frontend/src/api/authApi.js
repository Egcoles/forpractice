import api from "../api";

export const fetchAuthStatus = async () => {
  const res = await api.get("/Auth/me", { withCredentials: true });
  return res.data;
};