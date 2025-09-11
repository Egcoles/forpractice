import { useQuery  } from "@tanstack/react-query";
import api from "../api";

const fetchModules = async () => {
    const {data} = await api.get("Module/modules");
    return data;
};

export const useModles = () => {
    return useQuery({
        queryKey: ["modules"],
        queryFn: fetchModules,
        staleTime: 100 * 60 * 5,
    });
};

