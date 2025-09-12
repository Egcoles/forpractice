import api from "../api";

export const fetchModules = async () => {
    const { data } = await api.get("Module/modules");
    return data;
};