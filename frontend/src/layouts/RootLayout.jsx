import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InterceptorProvider from "../components/InterceptorProvider";
import connection from "../HubConnection/SignalRConn";

const RootLayout = () => {
  return (
    <InterceptorProvider>
      <ToastContainer position="top-right" autoClose={3000} />
       <h1>Root Layout is working!</h1> {/* Idagdag ito para malaman kung nagre-render */}
      <Outlet />
    </InterceptorProvider>
  );
};

export default RootLayout;