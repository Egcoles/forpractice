import React, { useMemo, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import {useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Typography, Divider, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Menu } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import CreateIcon from '@mui/icons-material/Create';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Document, Page } from '@react-pdf/renderer';
import api from "../api";


const PurchaseRequisition = () => {
const getStatusColor = (status) => {
    switch(status) {
        case 'FOR ENDORSEMENT':
            return 'warning.main';
        case 'ENDORSED':
            return 'orange';
        case 'APPROVED':
            return 'green';
        case 'FOR APPROVAL':
            return 'primary.main';
        case 'REJECTED':
            return 'red';
        default:
            return 'inherit'; 
    }
};
  const { data: prs = [] } = useQuery({
    queryKey: ['prs'],
    queryFn: async () => {
      const response = await api.get("PR/PRTableDisplay", { withCredentials: true });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

    const navigate = useNavigate();

    const handleEdit = (prNumber) => {
      // Adjust the route to your edit page as needed
      navigate(`/pr/edit/${prNumber}`);
    };

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
   

    const columns = [
        { 
    field: 'prNumber', 
    headerName: 'PR No.', 
    width: 100,
    flex: 1,
    headerAlign: "center", 
    align: "center",
    renderCell: (params) => {
    const handleClick = async () => {
    try {
      const response = await api.get(`PR/PRDetailsById/${params.row.prId}`, { responseType: 'blob' });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      // Set state with PDF blob or URL
      const pdfUrl = URL.createObjectURL(pdfBlob);
      navigate('/pdf-view', { state: { pdfUrl } });
    } catch (error) {
      console.error('Error fetching PDF:', error);
      alert('Failed to fetch PDF.'); // Show user feedback
    } 
  };


      return <span style={{ cursor: 'pointer', color: 'blue' }} onClick={handleClick}>{params.value}</span>;
    }
  },

  {
    field: 'projecDescription',
    headerName: 'Project Description',
    headerAlign: "center", align: "center",
    editable: false,
    flex: 1,
  },
  {
    field: 'formStatus',
    headerName: 'Status',
    headerAlign: "center", align: "center",
    editable: false,
    flex: 1,
      renderCell: (params) => (
            <Typography sx={{ color: getStatusColor(params.value), mt:2}}>
                {params.value}
            </Typography>
        ),
  },
  {
    field: 'formattedEntryDate',
    headerName: 'EntryDate',
    headerAlign: "center", align: "center",
    editable: false,
    flex: 1,
  },
  {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      align: "center",
      renderCell: (params) => (
        <>
          <Button
            id="demo-positioned-button"
            aria-controls={open ? 'demo-positioned-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreVertIcon/>
          </Button>
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleEdit}><EditIcon/></MenuItem>
            <MenuItem onClick={handleClose}><PrintIcon/></MenuItem>
          </Menu>
        </>
     
      ),
   
    },
];



  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(prs.map(r => (r.formStatus ?? "None"))));
    return ["All", ...unique];
  }, [prs]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prs.filter(r => {
      const matchesStatus = status === "All" ? true : (r.formStatus ?? "None") === status;
      if (!q) return matchesStatus;
      const hay = `${r.prNumber ?? ""} ${r.projecDescription ?? ""}`.toLowerCase();
      return matchesStatus && hay.includes(q);
    });
  }, [prs, search, status]);

 return (

  <Box sx={{ height: 400, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h5" fontWeight="bold">
          Purchase Requisition
        </Typography>
        <Button variant="contained" onClick={() => navigate('CreatePR')}>
          <CreateIcon />
          Create PR
        </Button>
      </Stack>
       <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
        <Stack direction="row" spacing={2} mb={2} justifyContent="flex-end">
          <TextField
            size="small"
            label="Search"
            placeholder="PR No. or Project Description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <DataGrid
            rows={filteredRows}
            columns={columns}
            sx={{
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 'bold',
                },
              }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            getRowId={(row) => row.prId ?? row.PRId ?? row.id ?? row.prNumber}
          
        />
    </Box>
 

    
     
    
      
  
  );
};


export default PurchaseRequisition;