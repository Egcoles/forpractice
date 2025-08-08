
import { Skeleton, Box } from "@mui/material";

export default function PageSkeleton() {
  return (
    <Box p={3}>
      <Skeleton variant="text" width="40%" height={40} />
      <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
    </Box>
  );
}
