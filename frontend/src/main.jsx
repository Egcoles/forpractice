import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import router from "./router"; 
// Initialize the React Query client
const queryClient = new QueryClient();

// Render the app with React Query Provider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
       <RouterProvider router={router} context={{ queryClient }} />
    </QueryClientProvider>
  </React.StrictMode>
);
export { queryClient };

