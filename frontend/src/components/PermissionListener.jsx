import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api";
import connection from "../HubConnection/SignalRConn";

export default function PermissionListener() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("[PermissionListener] Mounting...");

    connection
      .start()
      .then(() => console.log("[SignalR] Connected!"))
      .catch((err) => console.error("[SignalR] Connect error:", err));

    const handler = async (message) => {
      console.log("🚨 [SignalR] PermissionChanged received:", message);

      enqueueSnackbar(message, { variant: "warning" });

      setTimeout(async () => {
        try {
          console.log("[PermissionListener] Logging out user...");
          await api.post("/auth/logout"); // clear cookie server-side
        } catch (err) {
          console.error("[PermissionListener] Logout error:", err);
        }

        queryClient.removeQueries({ queryKey: ["auth"], exact: true });
        navigate("/"); // redirect to login
      }, 3000);
    };

    connection.on("PermissionChanged", handler);

    return () => {
      console.log("[PermissionListener] Unmounting...");
      connection.off("PermissionChanged", handler);
    };
  }, [enqueueSnackbar, navigate, queryClient]);

  return null;
}
