import React, { useState } from "react";
import {Box,Button,TextField,Typography,Autocomplete,Snackbar,Alert,} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { useRoles } from "../../hooks/useRoles";
import { useUsersByRole } from "../../hooks/useUsersByRole";
import { useDepartmentNames } from "../../hooks/useDepartmentNames";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api";

const CreateUser = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    empId: "",
    location: "",
    position: "",
    email: "",
    RoleId: "",
    DepartmentId: "",
    ApproverId: "",
    EndorserId: "",
    signature: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const createUserMutation = useMutation({
    mutationFn: (newUser) =>
      api.post("/user/create", newUser, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      showSnackbar("User created successfully");
      console.log("User created successfully:", formData);
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        empId: "",
        location: "",
        position: "",
        email: "",
        RoleId: "",
        DepartmentId: "",
        ApproverId: "",
        EndorserId: "",
        signature: null,
      });
    },
    onError: () =>
      showSnackbar("Error creating user. Please try again.", "error"),
  });

  const { data: roles = [], isLoading, isError } = useRoles();
  const { data: departments = [], isLoading: isDeptLoading, isError: isDeptError, } = useDepartmentNames();
  
  // Selected Role
  const selectedRole = roles.find(r => r.id === formData.RoleId);

  // Dynamically determine approver & endorser Role IDs from roles array
  const approverRoleId =
    (selectedRole?.roleName === "Encoder" || selectedRole?.roleName === "Endorser")
      ? roles.find(r => r.roleName === "Approver")?.id || null
      : null;

  const endorserRoleId =
    selectedRole?.roleName === "Encoder"
      ? roles.find(r => r.roleName === "Endorser")?.id || null
      : null;

  // Fetch approvers & endorsers dynamically
  const { data: approvers = [], isLoading: isAppLoading, isError: isAppError } =
    useUsersByRole(approverRoleId, !!approverRoleId);

  const { data: endorsers = [], isLoading: isEndorseLoading, isError: isEndorseError } =
    useUsersByRole(endorserRoleId, !!endorserRoleId);

  if (isLoading || isDeptLoading || isAppLoading || isEndorseLoading) {
    return <Typography>Loading please wait...</Typography>;
  }
  if (isError || isDeptError || isAppError || isEndorseError) {
    return <Typography color="error">Failed to load the data.</Typography>;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "signature") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        userData.append(key, formData[key]);
      }
    }
    createUserMutation.mutate(userData);
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Create New User
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2,
          mt: 2,
        }}
      >
        <TextField
          id="empId"
          label="Employee ID"
          name="empId"
          value={formData.empId}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="off"
        />
        <TextField
          id="username"
          label="User Name"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="username"
        />
        <TextField
          id="firstName"
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="given-name"
        />
        <TextField
          id="lastName"
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="family-name"
        />
        <TextField
          id="location"
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          autoComplete="off"
        />
        <TextField
          id="position"
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          fullWidth
          autoComplete="organization-title"
        />
        <TextField
          id="email"
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          autoComplete="email"
        />

        {/* Role Selection */}
        <Autocomplete 
          fullWidth
          required
          options={roles}
          getOptionLabel={(option) => option?.roleName || `Role ${option?.id}`}
          value={selectedRole || null}
          onChange={(event, newValue) => {
            setFormData((prev) => ({
              ...prev,
              RoleId: newValue ? newValue.id : "",
              ApproverId: "",
              EndorserId: ""
            }));
          }}
          renderInput={(params) => <TextField {...params} label="User Role"/>}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />

        {/* Approver */}
        {(selectedRole?.roleName === "Encoder" || selectedRole?.roleName === "Endorser") && (
          <Autocomplete
            options={approvers}
            getOptionLabel={(option) => option?.fullName || `Approver ${option?.userId}`}
            value={approvers.find((u) => u.userId === formData.ApproverId) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                ApproverId: newValue ? newValue.userId: "",
              }));
            }}
            renderInput={(params) => <TextField {...params} label="Approver" required/>}
            isOptionEqualToValue={(option, value) => option.userId === value.userId}
          />
        )}

        {/* Endorser */}
        {selectedRole?.roleName === "Encoder" && (
          <Autocomplete 
            options={endorsers}
            getOptionLabel={(option) => option?.fullName || `Endorser ${option?.userId}`}
            value={endorsers.find((u) => u.userId === formData.EndorserId) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                EndorserId: newValue ? newValue.userId : "",
              }));
            }}
            renderInput={(params) => <TextField {...params} label="Endorser" required/>}
            isOptionEqualToValue={(option, value) => option.userId === value.userId}
          />
        )}

          {/* Department */}
          <Autocomplete
            options={departments}
            getOptionLabel={(option) => option?.departmentName || `Department ${option?.id}`}
            value={departments.find((d) => d.id === formData.DepartmentId) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                DepartmentId: newValue ? newValue.id : "",
              }));
            }}
            renderInput={(params) => <TextField {...params} label="Department" required/>}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          {/* Signature */}
          <Box>
            <label htmlFor="signature">
              <Button variant="outlined" component="span" fullWidth>
                Upload Signature
              </Button>
            </label>
            <input id="signature" hidden type="file" name="signature" accept="image/*" onChange={handleChange}/>
            {formData.signature && (
              <Typography variant="caption" mt={1} display={block}>
                {formData.signature.name}
              </Typography>
            )}
          </Box>

          {/* Submit */}
          <Box sx={{ gridColumn: "1 / -1", mt: 2, textAlign: "right"}}>
            <Button
            type="submit" variant="contained" color="primary" disabled={createUserMutation.isLoading}
            sx={{
              transition: "transform 0.1s ease-in-out",
              "&:hover": {transform: "scale(0.95)"},
              "&:active": {transform: "scale(0.92)"},
            }}
            >
              <SaveIcon sx={{ mr : 1}}/>
              {createUserMutation.isLoading ? "Saving...." : "Save"}
            </Button>
          </Box>
        </Box>

          {/* SnackBar */}
          <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right"}}>
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
      </Box>

  );
};

export default CreateUser;
