import React, { useState, useEffect } from "react";
import { useDepartmentNames } from "../../hooks/useDepartmentNames";
import { useRoles } from "../../hooks/useRoles";
import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const EditUserAccess = () => {
  const { roleId, departmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditMode = !!roleId && !!departmentId;

  const { data: roles = [], isLoading: isRolesLoading } = useRoles();
  const { data: departments = [], isLoading: isDeptLoading } =
    useDepartmentNames();
  const allModules = useLoaderData();

  // Fetch current permissions for edit mode
  const { data: currentPermissions = [], isLoading: isPermissionsLoading } =
    useQuery({
      queryKey: ["modulePermissions", roleId, departmentId],
      queryFn: async () => {
        const response = await api.get(
          `Module/edit-module-access/${roleId}/${departmentId}`
        );
        console.log(response.data);
        return response.data || [];
      },
      enabled: isEditMode,
    });

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

  // Set form values when in edit mode
  useEffect(() => {
    if (isEditMode) {
      setForm({
        DepartmentId: parseInt(departmentId),
        RoleId: parseInt(roleId),
      });
    }
  }, [isEditMode, roleId, departmentId]);

  useEffect(() => {
    if (isEditMode && currentPermissions.length > 0) {
      const selectedIds = [];

      currentPermissions.forEach((permission) => {
        selectedIds.push(`main-${permission.mainID}`);
        if (permission.subModuleID && permission.subModuleID > 0) {
          selectedIds.push(`sub-${permission.subModuleID}`);
        }
      });

      setSelectedModules([...new Set(selectedIds)]); // remove duplicates
    }
  }, [isEditMode, currentPermissions]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEditMode) {
        // Update existing access
        const response = await api.put(
          `Module/update-module-access/${formData.RoleId}/${formData.DepartmentId}`,
          formData,
          { withCredentials: true }
        );
        return response.data;
      } else {
        // Create new access
        const response = await api.post("Module/setModuleAccess", formData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      if (!isEditMode) {
        // Reset form only for add mode
        setForm({
          DepartmentId: "",
          RoleId: "",
        });
        setSelectedModules([]);
      }
      openSnackbar(
        isEditMode
          ? "Module access updated successfully!"
          : "Module access set successfully!",
        "success"
      );

      if (isEditMode) {
        setTimeout(() => navigate("/dashboard/Access"), 1500); //
      }
    },
    onError: (err) => {
      openSnackbar(
        `${isEditMode ? "Update" : "Submission"} failed: ${err.message}`,
        "error"
      );
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

    // Use your full tree data (richtreeview data) to find parents
    const permissions = selectedModules.map((id) => {
      const [type, value] = id.split("-");
      const intValue = parseInt(value, 10);

      if (type === "main") {
        return { MainID: intValue, SubModuleID: null };
      } else if (type === "sub") {
        // Hanapin parent main mula sa allModules tree
        let parentMainId = 0;

        for (const main of allModules) {
          if (main.subModules?.some((s) => s.subModuleId === intValue)) {
            parentMainId = main.mainId;
            break;
          }
        }

        return {
          MainID: parentMainId,
          SubModuleID: intValue,
        };
      }
    });

    const formData = {
      DepartmentId: form.DepartmentId,
      RoleId: form.RoleId,
      Permissions: permissions,
    };

    console.log("Submitting form data:", formData);
    mutation.mutate(formData);
  };

  const getItemId = (item) => {
    if (item.subModuleId !== undefined) {
      return `sub-${item.subModuleId}`;
    }
    if (item.mainId !== undefined && item.mainId !== null) {
      return `main-${item.mainId}`;
    }
    return `unknown-${Math.random()}`;
  };

  const getItemLabel = (item) => {
    return item?.moduleName || item?.subName || "";
  };

  const getItemChildren = (item) => {
    return item?.subModules || [];
  };

  if ((isEditMode && isPermissionsLoading) || isRolesLoading || isDeptLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress sx={{ mr: 3 }} /> Loading...
      </Box>
    );
  }

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
            {isEditMode ? "Edit User Access" : "Set User Access"}
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
              value={roles.find((r) => r.id === form.RoleId) || null}
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
              disabled={isEditMode}
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
              disabled={isEditMode}
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
          <Box sx={{ height: 400, minWidth: 250, overflowY: "auto", mt: 2 }}>
            <RichTreeView
              items={allModules}
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
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              isEditMode
                ? navigate("/dashboard/Access")
                : setSelectedModules([])
            }
          >
            {isEditMode ? "Cancel" : "Clear"}
          </Button>
          <Button
            variant="contained"
            type="submit"
            endIcon={<SendIcon />}
            disabled={mutation.isPending || selectedModules.length === 0}
          >
            {mutation.isPending ? (
              <CircularProgress size={24} />
            ) : isEditMode ? (
              "Update"
            ) : (
              "Submit"
            )}
          </Button>
        </Box>
      </form>
    </>
  );
};

export default EditUserAccess;
