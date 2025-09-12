import { createBrowserRouter, redirect } from "react-router-dom";

// Auth related
import RequireAuth from "./auths/authentication";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import RootLayout from "./layouts/RootLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Registerpage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Module from "./pages/module/modules";
import Access from "./pages/Access";
import AddUserAcess from "./pages/access/AddUserAccess";
import PurchaseRequisition from "./pages/PurchaseRequisition";
import Quotation from "./pages/Quotation";
import CreateQuotation from "./pages/Quotation/createQuotation";
import CreatePR from "./pages/PR/createPR";
import Users from "./pages/maintenance/Users";
import CreateUser from "./pages/maintenance/CreateUser";
import Role from "./pages/maintenance/Role";
import Department from "./pages/maintenance/department";

// Data Fetching Functions
import { fetchModules } from "./api/modulesApi";
import { fetchAuthStatus } from "./api/authApi";
import { queryClient } from "./main";

// Updated loader function to check auth status and handle redirection
const authLoader = async () => {
  try {
    await queryClient.ensureQueryData({
      queryKey: ["auth"],
      queryFn: fetchAuthStatus,
      retry: false,
    });
    return redirect("/dashboard");
  } catch (error) {
    return null;
  }
};

const protectedRouteLoader = async () => {
  try {
    await queryClient.ensureQueryData({
      queryKey: ["auth"],
      queryFn: fetchAuthStatus,
      retry: false,
    });
    return null;
  } catch (error) {
    return redirect("/"); // Redirect unauthenticated users
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    loader: authLoader,
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },

  // Protected routes
  {
    element: <RequireAuth />,
    children: [
      {
        path: "dashboard", 
        Component: DashboardLayout,
        loader: protectedRouteLoader,
        HydrateFallback: () => <div>Loading Dashboard...</div>,
        children: [
          {
            index: true,
            Component: Dashboard,
          },
          {
            path: "pr",
            Component: PurchaseRequisition,
          },
          {
            path: "pr/CreatePR", 
            Component: CreatePR,
          },

          { path: "profile", Component: Profile },
          { path: "modules", Component: Module },
          {
            path: "quotation",
            Component: Quotation,
          },
          {
            path: "quotation/CreateQuotation",
            Component: CreateQuotation,
          },
          {
            path: "access",
            Component: Access,
          },
          {
            path: "access/AddUserAccess",
            Component: AddUserAcess,
            loader: fetchModules,
            HydrateFallback: () => <div>Loading Access Modules...</div>,
          },

          { path: "users", Component: Users },
          { path: "create", Component: CreateUser },
          { path: "roles", Component: Role },
          { path: "department", Component: Department },
        ],
      },
    ],
  },
]);

export default router;
