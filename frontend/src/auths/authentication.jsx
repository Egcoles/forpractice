import { Outlet, useNavigation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";


const RequireAuth = () => {

  const navigation = useNavigation();

  if (navigation.state === "loading") {
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

  return <Outlet />;
};

export default RequireAuth;
