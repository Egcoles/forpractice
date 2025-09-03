import { Outlet, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";

import {
  AppBar,
  Box,
  Collapse,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  AssignmentInd as AssignmentIndIcon,
  ViewList as ViewListIcon,
  Email as EmailIcon,
  Book as BookIcon,
  ListAlt as ListAltIcon,
  EditSquare as EditSquareIcon,
  Apartment as ApartmentIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api";

const drawerWidth = 240;
const miniDrawerWidth = 72;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useAuth();
  const username = data?.username || "User";

  const isMenuOpen = Boolean(anchorEl);
  const handleToggleDrawer = () => setOpen(!open);
  const handleToggleMaintenance = () => setMaintenanceOpen(!maintenanceOpen);
  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    handleMenuClose();
    try {
      await api.post("/auth/logout");
      await queryClient.removeQueries({ queryKey: ["auth"], exact: true });
    } catch (e) {
      // ignore logout errors
    }
    navigate("/");
  };

  const location = useLocation();

const pathnames = location.pathname.split("/").filter((x) => x);
const upperCamelCasePathnames = pathnames.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());



  useEffect(() => {
    if (isError) {
      navigate("/");
    }
  }, [isError, navigate]);

  const breadcrumbNameMap = {
    dashboard: "Dashboard",
    pr: "PR",
    quotation: "Quotation",
    client: "PO Client",
    supplier: "PO Supplier",
    users: "Users",
    roles: "Roles",
    department: "Department",
    smpt: "SMTP",
  };


  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#fff",
          color: "#000",
          ml: open ? `${drawerWidth}px` : `${miniDrawerWidth}px`,
          width: open
            ? `calc(100% - ${drawerWidth}px)`
            : `calc(100% - ${miniDrawerWidth}px)`,
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton edge="start" onClick={handleToggleDrawer}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} noWrap>
              Archangel Technologies, Inc.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton>
              <NotificationsIcon />
            </IconButton>

            <Box
              onClick={handleMenuClick}
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                bgcolor: "#f1f1f1",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              <AccountCircleIcon sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                {isLoading ? "Loading..." : username}
              </Typography>
              <ExpandMore fontSize="small" />
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : miniDrawerWidth,
            transition: "width 0.3s",
            overflowX: "hidden",
            backgroundColor: "#0f172a",
            color: "#fff",
            borderRight: 0,
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <List>
            <NavItem icon={<HomeIcon />} label="Dashboard" open={open} onClick={() => navigate("/dashboard")} />
            <NavItem icon={<ListAltIcon />} label="PR" open={open} onClick={() => navigate("/pr")} />
            <NavItem icon={<EditSquareIcon />} label="Quotation" open={open} onClick={() => navigate("/quotation")} />
            <NavItem icon={<EditSquareIcon />} label="PO Client" open={open} onClick={() => navigate("/client")} />
            <NavItem icon={<ListAltIcon />} label="PO Supplier" open={open} onClick={() => navigate("/supplier")} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleToggleMaintenance}>
                <ListItemIcon sx={{ color: "#fff" }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText primary="Maintenance" />
                    {maintenanceOpen ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            <Collapse in={maintenanceOpen && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <NavItem icon={<GroupIcon />} label="Users" open={open} indent onClick={() => navigate("/maintenance/users")} />
                <NavItem icon={<AssignmentIndIcon />} label="Roles" open={open} indent onClick={() => navigate("/maintenance/roles")} />
                <NavItem icon={<ApartmentIcon />} label="Department" open={open} indent onClick={() => navigate("/maintenance/department")} />
                <NavItem icon={<ViewListIcon />} label="Master List" open={open} indent onClick={() => navigate("/maintenance/master-list")} />
                <NavItem icon={<EmailIcon />} label="SMTP" open={open} indent onClick={() => navigate("/maintenance/smtp")} />
                <NavItem icon={<BookIcon />} label="System Logs" open={open} indent onClick={() => navigate("/maintenance/system-logs")} />
              </List>
            </Collapse>
          </List>

          {open && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 1 }} />
              <Typography variant="caption" color="gray">
                Beta Version 2.1.0
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Content Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          backgroundColor: "#f8fafc",
        }}
      >
        <Toolbar />

        {/* ⬇ Semantic main content area */}
        <main role="main" style={{ flex: 1 }}>
         <Container maxWidth="xl" sx={{ py: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link to="/dashboard" style={{ textDecoration: "none", color: "#1976d2" }}>
                  Home
                </Link>
                {upperCamelCasePathnames
                  .filter((value) => value !== "maintenance")
                  .map((value, index, filtered) => {
                    const to = `/${upperCamelCasePathnames.slice(0, upperCamelCasePathnames.indexOf(value) + 1).join("/")}`;
                    const isLast = index === filtered.length - 1;

                    return isLast ? (
                      <Typography key={to} color="text.primary">
                        {breadcrumbNameMap[value] || value}
                      </Typography>
                    ) : (
                      <Link
                        key={to}
                        to={to}
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        {breadcrumbNameMap[value] || value}
                      </Link>
                    );
                  })}
              </Breadcrumbs>
            </Box>

            <Outlet />
          </Container>

        </main>

        {/* ⬇ Semantic footer outside <main> */}
        <footer role="contentinfo">
          <Box
            sx={{
              py: 2,
              px: 3,
              backgroundColor: "#f1f5f9",
              borderTop: "1px solid #e0e0e0",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </Typography>
          </Box>
        </footer>
      </Box>
    </Box>
  );
}

function NavItem({ icon, label, onClick, open, indent = false }) {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={onClick} sx={indent ? { pl: 4 } : {}}>
        <ListItemIcon sx={{ color: "#fff" }}>{icon}</ListItemIcon>
        {open && <ListItemText primary={label} />}
      </ListItemButton>
    </ListItem>
  );
}
