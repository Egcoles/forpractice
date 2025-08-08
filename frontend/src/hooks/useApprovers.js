
import { useQuery } from "@tanstack/react-query";
import api from "../api"; 

const fetchApproverNames = async () => {
  const { data } = await api.get("/User/approvers");
  return data;
};

export const useApprovers= () => {
  return useQuery({
    queryKey: ["approvers"],
    queryFn: fetchApproverNames,
    staleTime: 1000 * 60 * 5, 
  });
};
