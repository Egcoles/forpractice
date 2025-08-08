import { useQuery } from "@tanstack/react-query";
import api from "../api";

export const fetchAuthStatus = async () => {
  const res = await api.get("/Auth/me", { withCredentials: true });
  return res.data;
};

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: fetchAuthStatus,
    retry: false, 
    staleTime: 1000 * 60 * 5, 
  });
};
