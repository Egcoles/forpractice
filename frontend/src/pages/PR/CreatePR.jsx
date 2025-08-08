import React from 'react';
import { Typography, Box, Stack, TextField} from '@mui/material';

const CreatePR= () => {
  return (
    <>
   
        <Typography variant="h4">Create New Purchase Requisition</Typography>
  
      
      <Box
        component="form"
        onSubmit={handleSumbit}
        sx={{
            display: "grid",
            gridTemplateColumns: {xs: "1fr", sm: "repeat(2, 1fr)"},
            gap: 2,
            mt: 2,
        }}  
      >
        <TextField
          id="clientName"
          label="Client Name"
          value={formData.clientName}
          onChange={handleChange}
          autoComplete='off'
        />
         <TextField
          id="clientName"
          label="Client Name"
          value={formData.clientName}
          onChange={handleChange}
          autoComplete='off'
        />
      </Box>
    </>
  
  );
};

export default CreatePR;

