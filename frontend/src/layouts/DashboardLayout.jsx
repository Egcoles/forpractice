import { Outlet, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import menuConfig from "../components/sidebar";
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
  Grid,
  Stack,
  Avatar,
  ListItemAvatar,
  Badge,
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
  Circle as CircleIcon,
  Mail as MailIcon,
  Folder as FolderIcon,
  Autorenew as AutorenewIcon,
  Route as RouteIcon,
  FileOpen as FileOpenIcon,
  RoomPreferences as RoomPreferencesIcon,
  Key as KeyIcon,
} from "@mui/icons-material";

import { useAuth } from "../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api";

// Assuming NavItem is a separate component or defined here
const NavItem = ({ icon, label, open, onClick, indent }) => (
  <ListItem disablePadding sx={{ pl: indent ? 2 : 0 }}>
    <ListItemButton onClick={onClick}>
      <ListItemIcon sx={{ color: "#fff" }}>{icon}</ListItemIcon>
      {open && <ListItemText primary={label} />}
    </ListItemButton>
  </ListItem>
);

const drawerWidth = 240;
const miniDrawerWidth = 72;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [routing, setRouting] = useState(false);
  const [notification, setNotification] = useState(false);
  const [propen, setPROpen] = useState(false);
  const [quotationOpen, setQuotationOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [cocOpen, setCocOpen] = useState(false);
  const queryClient = useQueryClient();


  const isMenuOpen = Boolean(anchorEl);
  const handleToggleDrawer = () => setOpen(!open);
  const handleToggleMaintenance = () => setMaintenanceOpen(!maintenanceOpen);
  const hanldeToggleRouiting = () => setRouting(!routing);
  const handleTogglenotification = () => setNotification(!notification);
  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handlePR = () => setPROpen(!propen);
  const handleQuotation = () => setQuotationOpen(!quotationOpen);
  const handleSupplier = () => setSupplierOpen(!supplierOpen);
  const handleCoc = () => setCocOpen(!cocOpen);
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
  
const { data, isLoading, isError, error } = useAuth();

  // Handle loading and error states first
  if (isLoading) {
    return <div>Loading user data...</div>;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  // Define permissions only if data and permissions exist and are a string
  let userPermissions = new Set();
  if (typeof data?.permissions === 'string') {
    userPermissions = new Set(data.permissions.split(", "));
  }

  const username = data?.username || "User";
  const hasPermission = (requiredPermissions, userPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Walang kailangang permission, laging visible
    }
    if (!userPermissions) {
      return false; // Walang permissions ang user
    }
    return requiredPermissions.some((permission) =>
      userPermissions.has(permission)
    );
  };

  // Recursive function para i-render ang menu items
  const renderMenuItems = (items) => {
    return items.map((item, index) => {
      if (item.isCollapsible) {
        const canSeeCollapsible = item.children.some((child) =>
          hasPermission(child.permissions, userPermissions)
        );

        if (!canSeeCollapsible) {
          return null;
        }

        let stateOpen, stateToggle;
        switch (item.label) {
          case "Routing Approval":
            stateOpen = routingOpen;
            stateToggle = hanldeToggleRouiting;
            break;
          case "Maintenance":
            stateOpen = maintenanceOpen;
            stateToggle = handleToggleMaintenance;
            break;
          default:
            stateOpen = false;
            stateToggle = () => {};
        }

        return (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton onClick={stateToggle}>
                <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                {open && (
                  <>
                    <ListItemText primary={item.label} />
                    {stateOpen ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            <Collapse in={stateOpen && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(item.children)}
              </List>
            </Collapse>
          </React.Fragment>
        );
      }

      if (hasPermission(item.permissions, userPermissions)) {
        return (
          <NavItem
            key={index}
            icon={item.icon}
            label={item.label}
            open={open}
            onClick={() => navigate(item.path)}
            indent={item.children} // Pass indent for child items
          />
        );
      }

      return null;
    });
  };
  
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);
  const upperCamelCasePathnames = pathnames.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

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

          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mr: 2 }}>
            <IconButton>
              <Badge
                badgeContent={5}
                color="primary"
                sx={{ cursor: "pointer", fontSize: 12, px: 1 }}
              >
                <NotificationsIcon onClick={handleTogglenotification} />
              </Badge>
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
      {/* notification Drawer */}
      <Drawer
        anchor="right"
        open={notification}
        onClose={handleTogglenotification}
        sx={{
          "& .MuiDrawer-paper": {
            width: "380px", // Set your desired width
          },
        }}
      >
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          <ListItem>
            <ListItemText primary="Notification" />
          </ListItem>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ px: 2, mb: 2, gap: 2 }}
          >
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ mt: 3, mb: 2, ml: 2, textAlign: "center" }}
              >
                Legend
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={2}>
                  <Typography variant="body2">
                    <CircleIcon
                      sx={{ fontSize: 12, textAlign: "center", mr: 1 }}
                      color="warning"
                    />
                    Endorsement
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2">
                    <CircleIcon
                      sx={{ fontSize: 12, textAlign: "center", mr: 1 }}
                      color="info"
                    />
                    Endorsed
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2">
                    <CircleIcon sx={{ fontSize: 12, mr: 1 }} color="success" />
                    Approved
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2">
                    <CircleIcon sx={{ fontSize: 12, mr: 1 }} color="primary" />
                    Approval
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2">
                    <CircleIcon sx={{ fontSize: 12, mr: 1 }} color="error" />
                    Rejected
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 2 }} />

          <ListItem sx={{ mt: 2 }}>
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="PR REQUEST" />
            <Badge badgeContent={4} color="primary" onClick={handlePR}>
              <MailIcon color="action" />
            </Badge>
            <AutorenewIcon sx={{ ml: 2 }} />
          </ListItem>
          <Collapse in={propen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 1" sx={{ ml: 1 }} />
              </ListItem>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 2" sx={{ ml: 1 }} />
              </ListItem>
            </List>
          </Collapse>

          <Divider sx={{ mt: 2 }} />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="QUOTATION REQUEST" />
            <Badge badgeContent={4} color="primary" onClick={handleQuotation}>
              <MailIcon color="action" />
            </Badge>
            <AutorenewIcon sx={{ ml: 2 }} />
          </ListItem>
          <Collapse in={quotationOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 1" sx={{ ml: 1 }} />
              </ListItem>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 2" sx={{ ml: 1 }} />
              </ListItem>
            </List>
          </Collapse>

          <Divider sx={{ mt: 2 }} />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="SUPPLIER REQUEST" />
            <Badge badgeContent={4} color="primary" onClick={handleSupplier}>
              <MailIcon color="action" />
            </Badge>
            <AutorenewIcon sx={{ ml: 2 }} />
          </ListItem>
          <Collapse in={supplierOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 1" sx={{ ml: 1 }} />
              </ListItem>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 2" sx={{ ml: 1 }} />
              </ListItem>
            </List>
          </Collapse>

          <Divider sx={{ mt: 2 }} />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <FolderIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="COC REQUEST" />
            <Badge badgeContent={4} color="primary" onClick={handleCoc}>
              <MailIcon color="action" />
            </Badge>
            <AutorenewIcon sx={{ ml: 2 }} />
          </ListItem>
          <Collapse in={cocOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 1" sx={{ ml: 1 }} />
              </ListItem>
              <ListItem>
                <CircleIcon
                  sx={{ fontSize: 15, color: "transparent", ml: 4 }}
                />
                <ListItemText primary="Nested Item 2" sx={{ ml: 1 }} />
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Drawer>

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
            background: "linear-gradient(to right, #0f172a, #1e3a8a)",
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
          {renderMenuItems(menuConfig)}
        </List>
         {/* <List>
           
             <NavItem
              icon={<HomeIcon />}
              label="Dashboard"
              open={open}
              onClick={() => navigate("/dashboard")}
            />
            <NavItem
              icon={<ListAltIcon />}
              label="PR"
              open={open}
              onClick={() => navigate("pr")}
            />

            <NavItem
              icon={<EditSquareIcon />}
              label="Quotation"
              open={open}
              onClick={() => navigate("quotation")}
            />
            <NavItem
              icon={<EditSquareIcon />}
              label="PO Client"
              open={open}
              onClick={() => navigate("client")}
            />
            <NavItem
              icon={<ListAltIcon />}
              label="PO Supplier"
              open={open}
              onClick={() => navigate("supplier")}
            />
            <ListItem disablePadding>
              <ListItemButton onClick={hanldeToggleRouiting}>
                <ListItemIcon sx={{ color: "#fff" }}>
                  <RouteIcon />
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText primary="Routing Approval" />
                    {routing ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            <Collapse in={routing && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <NavItem
                  icon={<FileOpenIcon />}
                  label="PR Endorsement"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/pr_endorsemnet")}
                />
                <NavItem
                  icon={<FileOpenIcon />}
                  label="PO Endorsement"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/po_endorsemnet")}
                />
                <NavItem
                  icon={<FileOpenIcon />}
                  label="Quotation Endorsement"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/quotation_endorsemnet")}
                />
                <NavItem
                  icon={<FileOpenIcon />}
                  label="COC Endorsement"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/coc_endorsemnet")}
                />
                <NavItem
                  icon={<FileOpenIcon />}
                  label="PR Approval"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/pr_approval")}
                />
                <NavItem
                  icon={<FileOpenIcon />}
                  label="PO Approval"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/po_approval")}
                />
                <NavItem
                  icon={<FileOpenIcon />}
                  label="Quotation Approval"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/quotation_approval")}
                />
                <NavItem
                  icon={<FileOpenIcon />}
                  label="COC Approval"
                  open={open}
                  indent
                  onClick={() => navigate("/routing/coc_approval")}
                />
              </List>
            </Collapse>
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
                <NavItem
                  icon={<GroupIcon />}
                  label="Users"
                  open={open}
                  indent
                  onClick={() => navigate("users")}
                />
                <NavItem
                  icon={<AssignmentIndIcon />}
                  label="Roles"
                  open={open}
                  indent
                  onClick={() => navigate("roles")}
                />
                <NavItem
                  icon={<ApartmentIcon />}
                  label="Department"
                  open={open}
                  indent
                  onClick={() => navigate("department")}
                />
                <NavItem
                  icon={<ViewListIcon />}
                  label="Master List"
                  open={open}
                  indent
                  onClick={() => navigate("master-list")}
                />
                <NavItem
                  icon={<EmailIcon />}
                  label="SMTP"
                  open={open}
                  indent
                  onClick={() => navigate("smtp")}
                />
                <NavItem
                  icon={<BookIcon />}
                  label="System Logs"
                  open={open}
                  indent
                  onClick={() => navigate("system-logs")}
                />
              </List>
            </Collapse>
            <NavItem
              icon={<RoomPreferencesIcon />}
              label="Modules"
              open={open}
              onClick={() => navigate("modules")}
            />
            <NavItem
              icon={<KeyIcon />}
              label="User Access"
              open={open}
              onClick={() => navigate("Access")}
            /> 
          </List> */}

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
                <Link
                  to="/dashboard"
                  style={{ textDecoration: "none", color: "#1976d2" }}
                >
                  Home
                </Link>
                {upperCamelCasePathnames
                  .filter((value) => value !== "maintenance")
                  .map((value, index, filtered) => {
                    const to = `/${upperCamelCasePathnames
                      .slice(0, upperCamelCasePathnames.indexOf(value) + 1)
                      .join("/")}`;
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

// function NavItem({ icon, label, onClick, open, indent = false }) {
//   return (
//     <ListItem disablePadding>
//       <ListItemButton onClick={onClick} sx={indent ? { pl: 4 } : {}}>
//         <ListItemIcon sx={{ color: "#fff" }}>{icon}</ListItemIcon>
//         {open && <ListItemText primary={label} />}
//       </ListItemButton>
//     </ListItem>
//   );
// }
