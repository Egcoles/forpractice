import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { BarChart } from "@mui/x-charts";

export default function Dashboard() {
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Welcome back!
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Here's what's happening in your system.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        {[
          { label: "Total Users", value: 128 },
          { label: "PR Requests", value: 45 },
          { label: "Approved Quotations", value: 87 },
        ].map((card, idx) => (
          <Grid key={idx} item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardHeader title="Monthly Requests Overview" />
            <CardContent>
              <BarChart
                height={300}
                xAxis={[
                  { scaleType: "band", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
                ]}
                series={[
                  { data: [10, 20, 30, 40, 35, 50], label: "PR Requests" },
                  { data: [8, 15, 25, 30, 28, 45], label: "Quotations" },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardHeader title="System Stats" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Add pie chart or recent activity here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
