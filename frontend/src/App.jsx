import { BrowserRouter, Routes, Route } from "react-router-dom";
import InterceptorProvider from "./components/InterceptorProvider"; 
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Registerpage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Users from "./pages/maintenance/Users";
import CreateUser from "./pages/maintenance/CreateUser";
import Role from "./pages/maintenance/Role";
import Module from "./pages/module/modules";
import Acess from "./pages/access/UserAcess";
import PurchaseRequisition from "./pages/PurchaseRequisition";
import Quotation from "./pages/Quotation";
import CreatePR from "./pages/PR/createPR";
import CreateQuotation from "./pages/Quotation/createQuotation";
import Department from "./pages/maintenance/department";
import RequireAuth from "./auths/authentication";
import DashboardLayout from "./layouts/DashboardLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import connection from "./HubConnection/SignalRConn";
function App() {
  return (
    <BrowserRouter>
      <InterceptorProvider />
       <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes inside Layout */}
          <Route element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path ="/pr" element={<PurchaseRequisition />} />
              <Route path ="/quotation" element={<Quotation />} />
              <Route path ="module/modules" element={<Module />} />
              <Route path ="access/UserAcess" element={<Acess />} />


              {/* PR Routes */}
              <Route path="/pr/CreatePR" element={<CreatePR/>} />
              <Route path="/quotation/createQuotation" element={<CreateQuotation/>} />

              {/* Maintenance Routes */}              
              <Route path="/maintenance/users" element={<Users />} />
              <Route path="/maintenance/create" element={<CreateUser />} />
              <Route path="/maintenance/roles" element={<Role />} />
              <Route path="/maintenance/department" element={<Department />} />
            </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
