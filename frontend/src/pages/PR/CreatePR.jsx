import React, { useState } from "react";
import {Box,Button,TextField,Typography,Autocomplete,Grid,TextareaAutosize,Divider,Paper,} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'; // Import dayjs
const CreatePR = () => {
  const [selectedDate, setSelectedDate] = React.useState(dayjs());
  const [selectedValue, setSelectedValue] = useState(null); 
  const options = ['Apple', 'Banana', 'Cherry', 'Date'];

  return (
    <Box sx={{
       width: '100%',
   
       }}>
      <Typography variant="h5" component="h5" fontWeight="bold">
        Purchase Requisition
      </Typography>
      <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
     
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} >
        <Grid size={6}>
           <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: {
                    variant: 'standard',
                    sx: {
                      '& .MuiInput-underline:before': { 
                        borderBottom: 'none',
                      },
                      '& .MuiInput-underline:after': { 
                        borderBottom: 'none',
                      },
                    },
                  },
                }}
              />
        </LocalizationProvider>
        </Grid>
        <Grid size={6}>
         <Autocomplete
            options={options}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard" 
                label="Canvassed By"
                sx={{
                  '& .MuiInput-root': {
                    '& fieldset': {
                      border: 'none', 
                    },
                    '&:hover fieldset': {
                      border: 'none', 
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={12}>
            <TextField
            label="Project Description"
            multiline
            fullWidth 
            minRows={4} 
            variant="standard"
          />
        </Grid>
        
        
    
      </Grid>
        
    </Box>
    
  );
};
export default CreatePR;

