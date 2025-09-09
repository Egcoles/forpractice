import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDepartmentNames } from "../../hooks/useDepartmentNames";
import { useRoles } from "../../hooks/useRoles";
import { useModles } from "../../hooks/useModules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api";
import {
  Typography,
  Box,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Grid,
   Collapse,
   IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,

} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  Close as CloseIcon,
  AddCircle as AddCircleIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
  Send as SendIcon,
  FileOpen as FileOpenIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const Acess = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState ({
    DepartmentId: "",
    RoleId: "",
  });
  const [check, setCheck] = useState(false);
  const [page, setPage] = useState(false);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });

  const handleTogglePage = () => setPage(!page);

  const createModule = useMutation ({
    mutationFn:(newModule) => api.post("Module/create", newModule, {withCredentials: true}),
    onSuccess: () => {
      queryClient.invalidateQueries(["modules"]);
      setSnackbar({ open: true, message: "Module created successfully", severity: "success" });
      setMainName("");
      setRows([{ id: 1, value: "" }]);
      setErrors({});
    },
    onError: (error) => {
      setErrors(error.response.data);
      openSnackbar("Failed to create module.", "error");
    },
  })

  const handleOpen = () => {
    // Close any open snackbar to avoid focus remaining on elements that will be aria-hidden
    setSnackbar((s) => ({ ...s, open: false }));
    // Blur the currently focused element to prevent aria-hidden focus conflicts
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const openSnackbar = (message, severity = "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmission = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!mainName.trim()) {
      nextErrors.mainName = "Main Name is required";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      openSnackbar("Please fill the required field.", "warning");
      return;
    }

    setErrors({});
    const payload = {
    moduleName: mainName.trim(), 
    subModules: rows .map(r => r.value.trim()) .filter(v => v.length > 0) .map(v => ({ subName: v })), };
    console.log(payload);
    createModule.mutate(payload);
    setOpen(false);
    
  };
  const { data: roles = [], isLoading, isError } = useRoles();
  const { data: departments = [], isLoading: isDeptLoading, isError: isDeptError, } = useDepartmentNames();
  const {data: modules = [], isLoading: isModLoading, isError: isModError, } = useModles([]);

  const [selectedRouting, setSelectedRouting] = useState([]);

  const allRoutingSelected = selectedRouting.length === modules.length && modules.length > 0;
  const someRoutingSelected = selectedRouting.length > 0 && !allRoutingSelected;

  const handleToggleAllRouting = (checked) => {
    setSelectedRouting(checked ? modules.map((i) => i.key) : []);
  };

  const handleToggleRoutingItem = (key, checked) => {
    setSelectedRouting((prev) =>
      checked ? Array.from(new Set([...prev, key])) : prev.filter((k) => k !== key)
    );
  };

  return (
    <>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h5" fontWeight="bold">
            User Access Control
          </Typography>
          <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpen}>
            Add Access
          </Button>
        </Stack>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      <BootstrapDialog
        container={() => document.getElementById('root')}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          component: "form",
          onSubmit: handleSubmission,
          noValidate: true,
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Set Up Access
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers >
            <Grid container spacing={2}>
                <Grid size={6}>
                 <Autocomplete
                    disablePortal
                    fullWidth
                    options={roles}
                    getOptionLabel={(option) => option?.roleName ||  `Role ${option?.id}`}
                    value={roles.find((d) => d.id === form.RoleId) || null}
                        onChange={(event, newValue) => {
                            setForm((prev) => ({
                            ...prev,
                            RoleId: newValue ? newValue.id : "",
                            }));
                        }}
                    renderInput={(params) => <TextField {...params} label="Role" />}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </Grid>
                <Grid size={6}>
                    <Autocomplete
                        options={departments}
                        getOptionLabel={(option) => option?.departmentName || `Department ${option?.id}`}
                        value={departments.find((d) => d.id === form.DepartmentId) || null}
                        onChange={(event, newValue) => {
                          setForm((prev) => ({
                            ...prev,
                            DepartmentId: newValue ? newValue.id : "",
                          }));
                        }}
                        renderInput={(params) => <TextField {...params} label="Department" required/>}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                </Grid>
                <Grid size={12}>
                    {modules.map((mainId) => (
                      <React.Fragment key={mainId.id}>
                        <ListItem disablePadding >
                          <ListItemButton onClick={handleTogglePage}>
                            <ListItemIcon sx={{ color: "#101010ff" }}>
                              <Checkbox
                                edge="start"
                                checked={allRoutingSelected}
                                indeterminate={someRoutingSelected}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleAllRouting(e.target.checked);
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText primary={`${mainId.moduleName}`} />
                            {page ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                        </ListItem>
                        <Collapse in={page && open} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {modules.map((subModuleId) => (
                              <ListItem key={subModuleId.id} disablePadding sx={{ pl: 4 }}>
                                <ListItemButton onClick={() => navigate(subModuleId.path)}>
                                  <ListItemIcon sx={{ color: "#101010ff" }}>
                                    <Checkbox
                                      edge="start"
                                      checked={selectedRouting.includes(subModuleId.key)}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleToggleRoutingItem(subModuleId.key, e.target.checked);
                                      }}
                                      tabIndex={-1}
                                      disableRipple
                                    />
                                  </ListItemIcon>
                                  <ListItemText primary={subModuleId.subName} />
                                </ListItemButton>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </React.Fragment>
                    ))}
                </Grid>
            </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" type="submit" endIcon={<SendIcon />}>
            Submit
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
};



export default Acess;