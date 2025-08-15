
import { useQuery } from "@tanstack/react-query";
import api from "../api"; 

export const useEndorsers = () => {
  return useQuery({
    queryKey: ["endorsers"],
    queryFn: async () => {
      const { data } = await api.get("User/endorsers");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  }); 
};