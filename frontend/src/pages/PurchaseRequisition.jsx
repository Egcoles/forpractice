import React, { PureComponent } from 'react';
import {useNavigate } from "react-router-dom";
import {
    Typography, 
    Box, 
    Button,
    Stack
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';

const PurchaseRequisition = () => {
    const navigate = useNavigate();
 return (
    <>
      <Typography variant="h4">PurchaseRequisition</Typography>
      <Typography>Purchase Requisition details here.</Typography>
      <Box p={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Button variant="contained" onClick={() => navigate("/PR/CreatePR")}>
                    Create PR
                </Button>
            </Stack>`
      </Box>
    
      
    </>
  );
};


export default PurchaseRequisition;