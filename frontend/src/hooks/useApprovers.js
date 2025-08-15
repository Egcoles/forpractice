
import { useQuery } from "@tanstack/react-query";
import api from "../api"; 

export const useApprovers= () => {
  return useQuery({
    queryKey: ["approvers"],
    queryFn: async () => {
      const { data } = await api.get("User/approvers");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  }); 
};
