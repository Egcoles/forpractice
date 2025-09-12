import React, { useState, useEffect } from "react";
import { useDepartmentNames } from "../../hooks/useDepartmentNames";
import { useRoles } from "../../hooks/useRoles";
import { useLoaderData } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api";
import {
  Typography,
  Box,
  Button,
  Stack,
  TextField,
  Autocomplete,
  Grid,
  Checkbox,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
const AddUserAcess = () => {
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading: isRolesLoading } = useRoles();
  const {
    data: departments = [],
    isLoading: isDeptLoading,
    isError: isDeptError,
  } = useDepartmentNames();
  const modules = useLoaderData();

  const [selectedModules, setSelectedModules] = useState([]);
  const [form, setForm] = useState({
    DepartmentId: "",
    RoleId: "",
  });
  const [selectionPropagation, setSelectionPropagation] = useState({
    descendants: true,
    parents: true,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });

  const submitMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post("Module/setModuleAccess", formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moduleAccessPermissions"] });
      setForm({
        DepartmentId: "",
        RoleId: "",
      });
      setSelectedModules([]);
      document.body.focus();
      openSnackbar("Module access set successfully!", "success");
    },
    onError: (err) => {
      openSnackbar(`Submission failed: ${err.message}`, "error");
    },
  });

  const handleSelectedItemsChange = (event, itemIds) => {
    setSelectedModules(itemIds);
  };

  const openSnackbar = (message, severity = "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((s) => ({ ...s, open: false }));
  };

  const handleSubmission = async (e) => {
    e.preventDefault();

    if (selectedModules.length === 0) {
      openSnackbar("Please select at least one module.", "warning");
      return;
    }

    // I-filter at i-reformat ang selectedModules para lang sa mga sub-module
    const validSelectedModules = selectedModules.filter((id) => {
      // Tiyakin na ang ID ay may hyphen at parehong bahagi ay numero
      const ids = id.split("-");
      // Tiyakin na dalawang bahagi lang at parehong numero
      return (
        ids.length === 2 && !isNaN(parseInt(ids[0])) && !isNaN(parseInt(ids[1]))
      );
    });

    if (validSelectedModules.length === 0) {
      openSnackbar("Please select at least one valid module.", "warning");
      return;
    }

    const formData = {
      DepartmentId: form.DepartmentId,
      RoleId: form.RoleId,
      selectedModules: validSelectedModules, // Gamitin ang na-filter na listahan
    };

    console.log("Submitting form data:", formData);
    submitMutation.mutate(formData);
  };

  const getItemId = (item) => {
    // Para lang sa mga sub-module ang ibabalik na ID
    if (item.subModuleId !== undefined) {
      return `${item.mainId}-${item.subModuleId}`;
    }
    // Para sa mga main modules, gumamit ng ibang prefix
    if (item.mainId !== undefined && item.mainId !== null) {
      return `parent-${item.mainId}`; // Hindi ito mapipili ng filter sa handleSubmission
    }

    return `unknown-${Math.random()}`;
  };

  const getItemLabel = (item) => {
    return item?.moduleName || item?.subName || "";
  };

  const getItemChildren = (item) => {
    return item?.subModules || [];
  };

  return (
    <>
      <Box p={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" component="h5" fontWeight="bold">
            Set User Access
          </Typography>
        </Stack>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
      <form onSubmit={handleSubmission}>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Autocomplete
              disablePortal
              fullWidth
              options={roles}
              getOptionLabel={(option) =>
                option?.roleName || `Role ${option?.id}`
              }
              value={roles.find((d) => d.id === form.RoleId) || null}
              onChange={(event, newValue) => {
                setForm((prev) => ({
                  ...prev,
                  RoleId: newValue ? newValue.id : "",
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Role" required />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              options={departments}
              getOptionLabel={(option) =>
                option?.departmentName || `Department ${option?.id}`
              }
              value={
                departments.find((d) => d.id === form.DepartmentId) || null
              }
              onChange={(event, newValue) => {
                setForm((prev) => ({
                  ...prev,
                  DepartmentId: newValue ? newValue.id : "",
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Department" required />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
        </Grid>
        <div style={{ width: "100%" }}>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectionPropagation.descendants}
                  onChange={(event) =>
                    setSelectionPropagation((prev) => ({
                      ...prev,
                      descendants: event.target.checked,
                    }))
                  }
                />
              }
              label="Auto select Sub-modules"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectionPropagation.parents}
                  onChange={(event) =>
                    setSelectionPropagation((prev) => ({
                      ...prev,
                      parents: event.target.checked,
                    }))
                  }
                />
              }
              label="Auto select Main modules"
            />
          </Stack>
          <Box sx={{ height: 256, minWidth: 250, overflowY: "auto" }}>
            <RichTreeView
              items={modules}
              getItemId={getItemId}
              getItemLabel={getItemLabel}
              getItemChildren={getItemChildren}
              checkboxSelection
              multiSelect
              selectionPropagation={selectionPropagation}
              selectedItems={selectedModules}
              onSelectedItemsChange={handleSelectedItemsChange}
            />
          </Box>
        </div>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            type="submit"
            endIcon={<SendIcon />}
            disabled={submitMutation.isPending || selectedModules.length === 0}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default AddUserAcess;
