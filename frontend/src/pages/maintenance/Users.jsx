import React, { useState, useEffect, useRef, useMemo } from "react";
import {Box,Button,IconButton,Modal,Slide,Stack,TextField,Typography,CircularProgress,Snackbar, Alert} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {Edit as EditIcon, Close as CloseIcon,AddCircle as AddCircleIcon,} from "@mui/icons-material";
import { useQuery} from "@tanstack/react-query";
import CreateUser from "./CreateUser";

import api from "../../api";

const Users = () => {
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  // const {data: user = [], isUserLoading} = useQuery ({
  //   queryKey: ["user"],
  //   queryFn: async () => {
  //     const res = await api.get("/user/users", {withCredentials: true});
  //     return res.data;
  //   }
  // })

  const { data: users =[], isLoading} = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/user/summary", { withCredentials: true });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  //function for setting inert attribute on root when modal is open
  //to improve accessibility
  const rootRef = useRef(null);
  useEffect(() => {
    const root = document.getElementById("root");
    rootRef.current = root;

    if (openModal && root) {
      root.setAttribute("inert", "true");
    } else if (root) {
      root.removeAttribute("inert");
    }

    return () => {
      if (root) root.removeAttribute("inert");
    };
  }, [openModal]);

  const handleCloseModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setOpenModal(false);
  };

  const handleEdit = (row) => {
    setEditMode(true);
    setSelectedId(row.userId);
    setOpenModal(true);
  };

  const filteredRows = useMemo(() => {
    return users.filter((row) =>
      [
        row.username || "", 
        row.firstName || "", 
        row.lastName || "", 
        row.email || ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, users]);

  const columns = [
    { field: "userId", headerName: "User ID", flex: 1, width: 70, headerAlign: "center", align: "center"},
    { field: "empId", headerName: "Employee ID", flex: 1, headerAlign: "center", align: "center" },
    { field: "fullName", headerName: "Full Name", flex: 1, headerAlign: "center", align: "center" },
    { field: "username", headerName: "User Name", flex: 1, headerAlign: "center", align: "center" }, 
    { field: "roleName", headerName: "Role", flex: 1, headerAlign: "center", align: "center" }, 
    { field: "departmentName", headerName: "Department", flex: 1, headerAlign: "center", align: "center"},
    { field: "email", headerName: "Email", flex: 1, headerAlign: "center", align: "center" },
    { field: "userStatus", headerName: "Status", flex: 1, width: 70, headerAlign: "center", align: "center"},
   
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      align: "center",
      renderCell: (params) => (
        <IconButton color="primary" size="small" onClick={() => handleEdit(params.row.userId)}>
          <EditIcon />
        </IconButton>
      ),
   
    },
  ];

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          sx={{
            transition: "transform 0.1s ease-in-out",
            "&:hover": { transform: "scale(0.95)" },
            "&:active": { transform: "scale(0.92)" },
          }}
        >
          <AddCircleIcon sx={{ mr: 1 }} />
          Create User
        </Button>
      </Stack>

     <TextField
      id="search-user"
      name="searchUser"
      label="Search"
      variant="outlined"
      size="small"
      fullWidth
      autoComplete="off"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      sx={{ mb: 2 }}
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
            getRowId={(row) => row.userId}
            autoHeight
          />
        )}
      </Box>
   

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        disableEnforceFocus // Prevent focus issues with inert
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Slide direction="down" in={openModal} mountOnEnter unmountOnExit>
          <Box
            sx={{
              width: "90%",
              maxWidth: 960,
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 2,
              p: 3,
              position: "relative",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 10,
                transition: "transform 0.5s ease-in-out",
                "&:hover": {
                  transform: "rotate(360deg)",
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                },
              }}
            >
              <CloseIcon color="error" />
            </IconButton>
           <CreateUser />
          
          </Box>
        </Slide>
      </Modal>
    </>
  );
};

export default Users;
