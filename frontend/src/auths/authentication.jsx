import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth"; // import hook

const RequireAuth = () => {
  const { data, isLoading, isError } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{ backgroundColor: "#000", color: "#fff" }}
      >
        <CircularProgress sx={{ color: "#fff" }} />
        <Typography variant="body2" mt={2}>
          Checking session, please wait...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
