import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import {
  Typography,
  Box,
  Button,
  Stack,
  CircularProgress,
  Divider,
  TextField,
  MenuItem,
  Menu,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as  MoreVertIcon
} from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";

const Access = () => {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { data: modules = [], isPending, isError, error } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const response = await api.get("Module/role-module-permissions", { withCredentials: true });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredRows = useMemo(() => {
    return modules.filter((row) =>
      [
        row.roleName || "",
        row.departmentName || "",
      ]
      .join("")
      .toLowerCase()
      .includes(searchText.toLowerCase())
    );
  }, [modules, searchText]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setSelectedId(row.roleId);
    //use navigate
  };

  const handleDeleteClick = (row) => {
    setModuleToDelete(row);
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (moduleToDelete) {
      deleteMutation.mutate(moduleToDelete.roleId);
    }
  };

  const columns = [
    { field: "roleName", headerName: "Role Name", flex: 1, width: 600 },
    { field: "departmentName", headerName: "Department Name", width: 600 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            id="demo-positioned-button"
            aria-controls={open ? 'demo-positioned-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MoreVertIcon />
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
            <MenuItem onClick={() => handleEdit(params.row)}><EditIcon /></MenuItem>
            <MenuItem onClick={() => handleDeleteClick(params.row)} color="error"><DeleteIcon /></MenuItem>
          </Menu>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h5" fontWeight="bold">
            User Access Control
          </Typography>
          <Button variant="contained" onClick={() => navigate('AddUserAccess')}>
            <AddCircleIcon sx={{mr:2}} /> Add Access
          </Button>
        </Stack>
        <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <TextField
            size="small"
            label="Search"
            placeholder="Search here..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Stack>
      </Box>

      <Box sx={{ height: 400 }}>
        {/* Check for isPending first */}
        {isPending ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 'bold',
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            disableRowSelectionOnClick
            getRowId={(row) => `${row.roleId}-${row.selectedModules}`}
          />
        )}
      </Box>
    </>
  );
};

export default Access;