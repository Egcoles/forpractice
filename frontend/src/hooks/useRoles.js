
import { useQuery } from "@tanstack/react-query";
import api from "../api"; 

const fetchRoleNames = async () => {
  const { data } = await api.get("/Role/names");
  return data;
};

export const useRoles= () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoleNames,
    staleTime: 1000 * 60 * 5, 
  });
};
