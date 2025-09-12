import React, { useMemo, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import {useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Modal, Typography, Divider, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Menu } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import CreateIcon from '@mui/icons-material/Create';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Document, Page } from '@react-pdf/renderer';
import api from "../api";


const Quotation = () => {
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
 const [openModal, setOpenModal] = useState(false);
 const { data: quotations = [] } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const response = await api.get("Quotation/quotations", { withCredentials: true });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
    const navigate = useNavigate();

    const handleEdit = (ControlNo) => {
      // Adjust the route to your edit page as needed
      navigate(`/pr/edit/${ControlNo}`);
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
    field: 'controlNo', 
    headerName: 'Control No.', 
    width: 100,
    flex: 1,
    headerAlign: "center", 
    align: "center",
    renderCell: (params) => {
      const handleClick = async () => {
        try {
          const response = await api.get(`PR/PRDetailsById/${params.row.prId}`, { responseType: 'blob' });
          const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);

          // Open the PDF in a new tab
          window.open(pdfUrl, '_blank');
        } catch (error) {
          console.error('Error fetching PDF:', error);
        }
      };

      return <span style={{ cursor: 'pointer', color: 'blue' }} onClick={handleClick}>{params.value}</span>;
    }
  },

  {
    field: 'projectName',
    headerName: 'Project Name',
    headerAlign: "center", align: "center",
    editable: false,
    flex: 1,
  },
    {
    field: 'clientName',
    headerName: 'Client Name',
    headerAlign: "center", align: "center",
    editable: false,
    flex: 1,
  },
    {
    field: 'companyName',
    headerName: 'Company',
    headerAlign: "center", align: "center",
    editable: false,
    flex: 1,
  },
     {
    field: 'locationName',
    headerName: 'Location',
    headerAlign: "center", align: "center",
    editable: false,
    flex: 1,
  },
  {
    field: 'status',
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
    field: 'formattedDate',
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
    const unique = Array.from(new Set(quotations.map(r => (r.formStatus ?? "None"))));
    return ["All", ...unique];
  }, [quotations]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotations.filter(r => {
      const matchesStatus = status === "All" ? true : (r.status ?? "None") === status;
      if (!q) return matchesStatus;
      const hay = `${r.controlNo ?? ""} ${r.projectName ?? ""}`.toLowerCase();
      return matchesStatus && hay.includes(q);
    });
  }, [quotations, search, status]);

 return (

  <Box sx={{ height: 400, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h5" fontWeight="bold">
          Quotation
        </Typography>
        <Button variant="contained" onClick={() => navigate('CreateQuotation')}>
          <CreateIcon />
          Create Quotation
        </Button>
      </Stack>
       <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
        <Stack direction="row" spacing={2} mb={2} justifyContent="flex-end">
          <TextField
            size="small"
            label="Search"
            placeholder="Control No., Project Name"
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
            getRowId={(row) =>  row.controlNo}
          
        />
    </Box>
 
  );
};


export default Quotation;