import { useQuery } from "@tanstack/react-query";
import { fetchModules } from "../api/modulesApi";

export const useModles = () => {
    return useQuery({
        queryKey: ["modules"],
        queryFn: fetchModules,
        staleTime: 100 * 60 * 5,
    });
};