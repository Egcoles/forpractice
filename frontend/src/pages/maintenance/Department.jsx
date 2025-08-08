import React, { useState, useMemo } from "react";
import { Typography, Box, Button, IconButton, Stack, Modal, Slide,TextField, CircularProgress, Paper, Snackbar, Alert} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Edit as EditIcon, Close as CloseIcon, AddCircle as AddCircleIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api";

const Department = () => {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({ departmentName: "" });

  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get("/department/departments", { withCredentials: true });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: (newDept) => api.post("/department/create", newDept, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      showSnackbar("Department created successfully.");
      handleClose();
    },
    onError: () => showSnackbar("Error saving department. Please contact administrator.", "error")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/department/update/${id}`, data, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      showSnackbar("Department updated successfully.");
      handleClose();
    },
    onError: () => showSnackbar("Error updating department. Please contact administrator.", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/department/delete/${id}`, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      showSnackbar("Department deleted successfully.");
      handleDeleteCancel();
    },
    onError: () => showSnackbar("Error deleting department. Please contact administrator.", "error")
  });

  const handleOpen = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm({ departmentName: "" });
    setOpenModal(true);
  };

  const handleClose = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm({ departmentName: "" });
    setOpenModal(false);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setSelectedId(row.id);
    setForm({ departmentName: row.departmentName });
    setOpenModal(true);
  };

  const handleDeleteClick = (row) => {
    setDepartmentToDelete(row);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setDepartmentToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (departmentToDelete) {
      deleteMutation.mutate(departmentToDelete.id);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (editMode && selectedId) {
      updateMutation.mutate({ id: selectedId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filteredRows = useMemo(() => {
    return departments.filter((row) =>
      [row.departmentName || "", row.createdAt || ""]
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, departments]);

  const columns = [
    { field: "id", headerName: "ID", width: 70, headerAlign: "center", align: "center" },
    { field: "departmentName", headerName: "Department Name", flex: 1, headerAlign: "center", align: "center" },
    { field: "createdAt", headerName: "Date Created", flex: 1, headerAlign: "center", align: "center" },
    {
      field: "actions", headerName: "Actions", width: 120, headerAlign: "center", align: "center",
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row)}><EditIcon /></IconButton>
          <IconButton color="error" onClick={() => handleDeleteClick(params.row)}><DeleteIcon /></IconButton>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Department Management</Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpen}>
          Create Department
        </Button>
      </Stack>

      <TextField
        label="Search"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <Box sx={{ height: 400 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
        
          />
        )}
      </Box>

      <Modal open={openModal} onClose={handleClose} closeAfterTransition>
        <Box component={Paper} sx={{ width: 400, p: 4, mx: "auto", mt: "15%", borderRadius: 2, position: "relative", outline: "none" }}>
          <Slide direction="up" in={openModal} mountOnEnter unmountOnExit>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" gutterBottom>
                {editMode ? "Edit Department" : "Create Department"}
              </Typography>

              <TextField
                label="Department Name"
                name="departmentName"
                value={form.departmentName}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
                required
              />

              <Button variant="contained" fullWidth type="submit">
                {editMode ? "Update Department" : "Save Department"}
              </Button>
            </Box>
          </Slide>
        </Box>
      </Modal>

      <Modal open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <Box component={Paper} sx={{ width: 400, p: 4, mx: "auto", mt: "15%", borderRadius: 2, position: "relative", outline: "none" }}>
          <Typography variant="h6" gutterBottom>Confirm Deletion</Typography>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete department <strong>{departmentToDelete?.departmentName}</strong>?
          </Typography>
          <Stack direction="row" spacing={2} mt={3} justifyContent="flex-end">
            <Button onClick={handleDeleteCancel} variant="outlined">Cancel</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
          </Stack>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Department;
