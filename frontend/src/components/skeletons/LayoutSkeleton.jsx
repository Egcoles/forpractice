import { Box, Skeleton, Toolbar } from "@mui/material";

const drawerWidth = 240;
const miniDrawerWidth = 72;

export default function LayoutSkeleton({ open = true }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: open ? drawerWidth : miniDrawerWidth,
          backgroundColor: "#0f172a",
          color: "#fff",
          transition: "width 0.3s",
          p: 2,
        }}
      >
        <Skeleton variant="text" width="80%" height={30} sx={{ bgcolor: "grey.800", mb: 2 }} />
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width="100%"
            height={36}
            sx={{ bgcolor: "grey.800", mb: 1 }}
          />
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </Box>
    </Box>
  );
}
