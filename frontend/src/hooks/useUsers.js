import { useQuery } from "@tanstack/react-query";
import api from "../api";

export const useUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const { data } = await api.get("/User/UserList");
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useItems = () => {
    return useQuery({
        queryKey: ["particulars"],
        queryFn: async () => {
            const { data } = await api.get("/User/items");
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useSuppliers = () => {
    return useQuery({
        queryKey: ["suppliers"],
        queryFn: async () => {
            const { data } = await api.get("/User/Suppliers");
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};