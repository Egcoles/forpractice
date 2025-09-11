// can we add the react router load?
// It is possible to use React Router loaders with TanStack Query. This powerful combination allows you to pre-fetch data before a route component is rendered, improving the user experience and centralizing your data-loading logic. This is especially useful for managing the loading and error states within the router, keeping your components cleaner. 
// Here is how you would modify your application to use React Router loaders.
// 1. Configure the data router
// First, you need to set up your router using createBrowserRouter, which is required for using the data loading APIs. You will define the routes and attach the loaders to them in a centralized configuration. 
// javascript
// src/router.jsx (or similar file)
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Access, { loader as accessLoader } from "./components/Access";
import AddUserAcess, { loader as addUserAccessLoader } from "./components/AddUserAccess";
import ErrorPage from "./ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "access",
        element: <Access />,
        loader: accessLoader, // Attach the loader here
      },
      {
        path: "access/AddUserAccess",
        element: <AddUserAcess />,
        loader: addUserAccessLoader, // Attach the loader here
      },
    ],
  },
]);
// Use code with caution.

// 2. Implement the loaders
// In each component's file, you will create and export an async function called loader. Inside this function, you will use a QueryClient to fetch the data. This pre-fills the TanStack Query cache so that when the component is rendered, the useQuery hook resolves instantly with the cached data. 
// Access component loader
// For the Access component, the loader will fetch the list of modules.
// javascript
// src/components/Access.jsx
import { useLoaderData } from "react-router-dom";
import { QueryClient, useQuery } from "@tanstack/react-query";
import api from "../api";
// ... (other imports)

// Create an instance of QueryClient to be used in the loader
const queryClient = new QueryClient();

export const loader = async () => {
  // Use `ensureQueryData` to either return cached data or fetch it
  return await queryClient.ensureQueryData({
    queryKey: ["modules"],
    queryFn: async () => {
      const response = await api.get("Module/role-module-permissions", { withCredentials: true });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

const Access = () => {
  const navigate = useNavigate();
  // We can use `useQuery` with the same key to access the cached data.
  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => { /* no need to refetch here */ },
  });
  const loaderData = useLoaderData(); // Optional: to demonstrate access

  // ... (rest of the component)

  return (
    // ... (rest of the JSX)
    <Box sx={{ height: 400 }}>
      {/* No need for the `isLoading` check here anymore */}
      <DataGrid
        rows={filteredRows}
        columns={columns}
        // ... (props)
      />
    </Box>
    // ... (rest of the JSX)
  );
};
Use code with caution.

AddUserAcess component loader
For the AddUserAcess component, the loader will fetch the data for roles, departments, and modules in parallel. 
javascript
// src/components/AddUserAccess.jsx
import { useLoaderData } from "react-router-dom";
import { QueryClient, useQuery } from "@tanstack/react-query";
import api from "../api";
// ... (other imports)

// Create a query client instance for the loader
const queryClient = new QueryClient();

const fetchRoles = () => api.get("Module/roles").then(res => res.data);
const fetchDepartments = () => api.get("Module/department-names").then(res => res.data);
const fetchModules = () => api.get("Module/modules").then(res => res.data);

export const loader = async () => {
  const rolesPromise = queryClient.ensureQueryData({ queryKey: ['roles'], queryFn: fetchRoles });
  const departmentsPromise = queryClient.ensureQueryData({ queryKey: ['departments'], queryFn: fetchDepartments });
  const modulesPromise = queryClient.ensureQueryData({ queryKey: ['modules'], queryFn: fetchModules });

  return Promise.allSettled([rolesPromise, departmentsPromise, modulesPromise]);
};

const AddUserAcess = () => {
  // Use useQuery hooks to access the cached data, no pending state needed.
  const { data: roles = [] } = useQuery({ queryKey: ['roles'] });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'] });
  const { data: modules = [] } = useQuery({ queryKey: ['modules'] });

  const [selectedModules, setSelectedModules] = useState([]);
  const [form, setForm] = useState({
    DepartmentId: "",
    RoleId: "",
  });
  // ... (rest of the component)

  return (
    <>
      {/* No need for the loading spinner or error alert from `isPending` */}
      <form onSubmit={handleSubmission}>
        {/* ... (rest of the JSX) */}
      </form>
    </>
  );
};
Use code with caution.

3. Update the entry point
Finally, in your main application file (main.jsx or index.js), you will use the RouterProvider to provide the router to your application. 
javascript
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router"; // Import the router configuration

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);