import { useQuery } from "@tanstack/react-query";
import api from "../api";

export const useCompanyList = () => {
   return useQuery({
       queryKey: ["companies"],
       queryFn: async () => {
           const response = await api.get("/Quotation/companies");
           return response.data;
       },
       staleTime: 1000 * 60 * 5,
   });
};

export const useLocationList = (companyId) => {
    return useQuery({
        queryKey: ["locations", companyId],
        queryFn: async () => {
            const response = await api.get(`/Quotation/locations/${companyId}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useCompanyAddress = (locationId) => {
    return useQuery({
        queryKey: ["addresses", locationId],
        queryFn: async () => {
            const response = await api.get(`/Quotation/addresses/${locationId}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};
