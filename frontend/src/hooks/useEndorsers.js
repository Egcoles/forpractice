
import { useQuery } from "@tanstack/react-query";
import api from "../api"; 

const fetchEndorserNames = async () => {
  const { data } = await api.get("/User/endorsers");
  return data;
};

export const useEndorsers= () => {
  return useQuery({
    queryKey: ["endorsers"],
    queryFn: fetchEndorserNames,
    staleTime: 1000 * 60 * 5, 
  });
};
