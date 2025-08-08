import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

export default function InterceptorProvider() {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          if (initialized) {
            toast.warning("Session expired. Please log in again.");
          }
          navigate("/");
        }
        return Promise.reject(error);
      }
    );

    setInitialized(true);

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return null;
}
