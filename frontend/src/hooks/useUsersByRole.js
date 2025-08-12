import { useQuery } from "@tanstack/react-query";
import api from "../api";

export const useUsersByRole = (roleId, enabled = true) => {
  return useQuery({
    queryKey: ["usersByRole", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data } = await api.get(`/User/users/by-role/${roleId}`, { withCredentials: true });
      return data;
    },
    enabled: enabled && !!roleId,
  });
};