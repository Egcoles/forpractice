
import { useQuery } from "@tanstack/react-query";
import api from "../api"; 

const fetchDepartmentNames = async () => {
  const { data } = await api.get("/Department/names");
  return data;
};

export const useDepartmentNames = () => {
  return useQuery({
    queryKey: ["department-names"],
    queryFn: fetchDepartmentNames,
    staleTime: 1000 * 60 * 5, 
  });
};
