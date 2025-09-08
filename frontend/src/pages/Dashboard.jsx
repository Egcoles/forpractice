import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardMedia
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts";
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';

import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  PeopleAlt as PeopleAltIcon,
  Contacts as ContactsIcon,
  HourglassBottom  as HourglassBottomIcon ,
  HourglassFull as HourglassFullIcon,
  CalendarMonth as CalendarMonthIcon ,
} from "@mui/icons-material";
export default function Dashboard() {

  const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
      '&:hover': {
          transform: 'scale(1.05)',
          transition: 'transform 0.1s ease',
      },
    }));

    //Line Chart
    const goodsData = [2400, 1398, 9800, 3908, 4800, 3800, 4300]; // Example data
    const servicesData = [1400, 398, 800, 308, 480, 380, 400]; // Example data
    const xLabels = [
      '2022',
      '2023',
      '2024',
      '2025',
    ]; 

    //Order's Overview
    const orderData = [20, 35, 45, 30, 50, 25, 15]; // Example data for each weekday
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
    //Request
    const chartData = {
        series: [
          {
            data: [10, 25, 15, 11],
            label: 'Endorsement', 
            color: '#f5a742',
          },
          {
            data: [20, 15, 30, 35],
            label: 'Endorsed', 
            color: '#c8de1cff',
          },
          {
            data: [20, 15, 30, 15],
            label: 'Approval', 
             color: '#4287f5',
          },
          {
            data: [20, 15, 30, 23],
            label: 'Approved', 
             color: '#42f584',
          },
        ],
      };
  return (
    <>
     <Box 
       sx={{
         display: 'flex',
         flexDirection: 'column',
         borderRadius: 2,
         background: 'linear-gradient(to right, #0f172a, #1e3a8a)',
         boxShadow: 3,
         width: '100%',
         p: 4,
         mb: 3,
         height: '100%',
       }}
       >
         <Typography variant="h5" fontWeight={600} gutterBottom color="#fff">
           Dashboard Analytics
         </Typography>
         <Typography variant="body1" color="#fff" mb={4} fontSize={14} >
           This is system-generated data for this year.
         </Typography>
         <Grid container spacing={3}>
           <Grid size={3}>
             <StyledCard>
               <CardContent sx={{ml:2}}>
                 <Typography variant="h6" color="Bold" gutterBottom sx={{display:'flex',gap:1}}>
                   ₱ 100,000  <CalendarMonthIcon sx={{ml: 'auto', mr:2}}/>
                 </Typography>
                 <Typography variant="body2" color="text.secondary" >
                   Today's Sales 
                 </Typography>
               </CardContent>
             </StyledCard>
           </Grid>
   
           <Grid size={3}>
             <StyledCard>
               <CardContent sx={{ml:2}}>
                 <Typography variant="h6" color="Bold" gutterBottom sx={{display:'flex',gap:1}}>
                   ₱ 200,000 <CalendarMonthIcon sx={{ml: 'auto', mr:2}}/>
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   This Month Sales 
                 </Typography>
               </CardContent>
             </StyledCard>
           </Grid>
   
           <Grid size={3}>
             <StyledCard>
               <CardContent sx={{ml:2}}>
                 <Typography variant="h6" color="Bold" gutterBottom sx={{display:'flex',gap:1}}>
                   ₱ 100,000,000 <CalendarMonthIcon sx={{ml: 'auto', mr:2}}/>
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   This Year Sales
                 </Typography>
               </CardContent>
             </StyledCard>
           </Grid>
   
           <Grid size={3}>
             <StyledCard>
               <CardContent sx={{ml:2}}>
                 <Typography variant="h6" color="Bold" gutterBottom sx={{display:'flex',gap:1}}>
                   ₱ 100,000,000 <CalendarMonthIcon sx={{ml: 'auto', mr:2}}/>
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Average Monthly Sale
                 </Typography>
               </CardContent>
             </StyledCard>
           </Grid>
         </Grid>
       </Box >

        <Grid container spacing={3}>
          <Grid size={6}>
            <Box
              sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.300',
              boxShadow: 3,
              width: '100%',
              p: 4,
              mb: 3,
              height: '100%',
            }}>
                <Typography variant="body1" sx={{display:'flex',gap:1,}}>
                  <BarChartIcon/> Oders Overview
                </Typography>
                <BarChart
                xAxis={[
                  {
                    id: 'weekdays', // A unique ID for your x-axis
                    data: weekdays, // The array of weekday labels
                    scaleType: 'band', // Essential for categorical data like weekdays
                  },
                ]}
                series={[
                  {
                    data: orderData, // Your data corresponding to each weekday
                  },
                ]}
                height={300} // Set a height for your chart
              />
            </Box>
          </Grid>

          <Grid size={6}>
            <Box
              sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.300',
              boxShadow: 3,
              width: '100%',
              p: 4,
              mb: 3,
              height: '100%',
            }}>
                <Typography variant="body1" sx={{display:'flex',gap:1,}}>
                  <TrendingUpIcon /> Yearly Orders
                </Typography>
                 <LineChart
                  xAxis={[{ scaleType: 'point', data: xLabels }]} 
                  series={[
                    { data: goodsData, label: 'Goods' },
                    { data: servicesData, label: 'Services' },
                  ]}
                  width={500}
                  height={300}
                />
            </Box>
          </Grid>

          {/* <Grid size={4}>
            <Box
              sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.300',
              boxShadow: 3,
              width: '100%',
              p: 4,
              mb: 3,
              height: '100%',
            }}>
              <Typography variant="body1" sx={{display:'flex',gap:1,}}>
                <WhatshotIcon />Trending Products
              </Typography>
            </Box>
          </Grid> */}
        </Grid>

        <Grid container spacing={3}
        sx={{
          mt:3,
          display:'flex',
          flexDirection: 'row',
        }}
        >

          <Grid size={8} rowSpacing={2}>
            <Box
            sx={{
              borderRadius:2,
              borderColor: 'grey.300',
              boxShadow:3,
              width: '100%',
              p: 4,
              mb: 3,
              height: '100%',
             
             
            }}
            >
              <Typography variant="body1" sx={{display: 'flex',gap: 1}}>
                <BarChartIcon/> Request
              </Typography>
                <BarChart
                  series={chartData.series}
                  height={290}
                  xAxis={[{ data: ['PR', 'PO', 'Quotation', 'COC'], scaleType: 'band' }]}
                  margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                />
            </Box>
          </Grid>

          <Grid  size={4} rowSpacing={2}>
            <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.300',
              boxShadow: 3,
              width: '100%',
              p: 4,
              mb: 3,
              height: '100%',
            }}>
              <Typography variant="body1" sx={{display:'flex',gap:1,mb: 2}}>
                <BusinessIcon /> Business Overview
              </Typography>
              {/* Client and Supplier Data */}
              <Grid container={6} spacing={3}>
                <Grid size={6}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" color="Bold" gutterBottom  sx={{ml:2}}>
                        100
                      </Typography>
                      <Typography variant="body2" sx={{display:'flex',gap:1,ml:2,}}>
                         Active Clients <PeopleAltIcon sx={{ml: 'auto', mr:2}} />
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
    
                <Grid size={6}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" color="Bold" gutterBottom  sx={{ml:2}}>
                        100
                      </Typography>
                      <Typography variant="body2" sx={{display:'flex',gap:1,ml:2,}}>
                         Active Suppliers <ContactsIcon sx={{ml: 'auto', mr:2}}/>
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
    
              {/* Projects Data */}
              <Grid container={6} spacing={3} sx={{mt:2}}>
                <Grid size={6}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" color="Bold" gutterBottom  sx={{ml:2}}>
                        100
                      </Typography>
                      <Typography variant="body2" sx={{display:'flex', gap:1,ml:2,}}>
                        On-going Projects   <HourglassBottomIcon sx={{ml: 'auto', mr:2}}/>
                    </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
                <Grid size={6}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" color="Bold" gutterBottom  sx={{ml:2}}>
                        100
                      </Typography>
                      <Typography variant="body2" sx={{display:'flex', gap:1,ml:2,}}>
                        Completed  Projects   <HourglassBottomIcon sx={{ml: 'auto', mr:2}}/>
                    </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </>
  );
}
