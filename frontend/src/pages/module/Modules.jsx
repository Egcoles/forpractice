import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  Close as CloseIcon,
  AddCircle as AddCircleIcon,
  Remove as RemoveIcon,
  Add as AddIcon,
  Send as SendIcon,
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

const Module = () => {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [mainName, setMainName] = useState("");
  const [rows, setRows] = useState([{ id: 1, value: "" }]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([...rows, { id: newId, value: "" }]);
  };

  const handleRowChange = (id, newValue) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, value: newValue } : row)));
  };

  const removeRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
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
      mainName: mainName.trim(),
      rows: rows.map((row) => row.value.trim()),
    };

    console.log(payload);
    // Example success flow:
    // openSnackbar("Module created successfully.", "success");
    // setOpen(false);
  };

  return (
    <>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h5" fontWeight="bold">
            Module Management
          </Typography>
          <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleOpen}>
            Create Module
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
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        PaperProps={{
          component: "form",
          onSubmit: handleSubmission,
          noValidate: true,
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Create Module
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

        <DialogContent dividers>
          <TextField
            label="Main Name"
            id="mainName"
            name="mainName"
            variant="outlined"
            value={mainName}
            onChange={(e) => {
              const value = e.target.value;
              setMainName(value);
              setErrors((prev) => ({ ...prev, mainName: value.trim() ? "" : "Main Name is required" }));
            }}
            error={Boolean(errors.mainName)}
            helperText={errors.mainName}
            fullWidth
          />

          <Stack direction="row" spacing={2} mt={2} mb={2}>
            <Button variant="contained" onClick={addRow}>
              <AddIcon />
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={rows.length === 1}
              onClick={() => removeRow(rows[rows.length - 1].id)}
            >
              <RemoveIcon />
            </Button>
          </Stack>

          {rows.map((row, index) => (
            <Box key={row.id} sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label={`Sub Name ${index + 1}`}
                value={row.value}
                onChange={(e) => handleRowChange(row.id, e.target.value)}
                fullWidth
              />
            </Box>
          ))}
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

export default Module;