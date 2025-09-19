import React from "react";
import ReactDOM from "react-dom/client";
import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import PermissionListener from "./components/PermissionListener";
// Initialize the React Query client
const queryClient = new QueryClient();

// Render the app with React Query Provider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
        {/* Must be inside RouterProvider so hooks like useNavigate work */}
        <RouterProvider router={router} context={{ queryClient }}>
          <PermissionListener />
        </RouterProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
export { queryClient };
