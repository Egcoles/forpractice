import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Initialize the React Query client
const queryClient = new QueryClient();

// Optional: Show loader if app takes time to load
let loaderTimeout = setTimeout(() => {
  const loader = document.getElementById("global-loader");
  if (loader) loader.style.display = "flex";
}, 100);

const removeGlobalLoader = () => {
  clearTimeout(loaderTimeout);
  const loader = document.getElementById("global-loader");
  if (loader) loader.remove();
};

// Render the app with React Query Provider
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Remove loader once React is mounted
removeGlobalLoader();
