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
            const response = await api.get(`/Quotation/locations/${companyId}`, { withCredentials: true });
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!companyId, // Only run the query if companyId is defined
    });
};
// export const useCompanyAddress = (locationId) => {
//     return useQuery({
//         queryKey: ["addresses", locationId],
//         queryFn: async () => {
//             const response = await api.get(`/Quotation/addresses/${locationId}`, { withCredentials: true });
//             return response.data;
//         },
//         staleTime: 1000 * 60 * 5,
//     });
// };
