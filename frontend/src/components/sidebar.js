import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import RouteIcon from "@mui/icons-material/Route";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ApartmentIcon from "@mui/icons-material/Apartment";
import RoomPreferencesIcon from "@mui/icons-material/RoomPreferences";
import KeyIcon from "@mui/icons-material/Key";

const menuConfig = [
  {
    label: "Dashboard",
    path: "/dashboard",
    permissions: ["module:10"],
  },
  {
    label: "PR",
    path: "pr",
    permissions: ["module:8:7"],
  },
  {
    label: "Quotation",
    path: "quotation",
    permissions: ["module:9:8"],
  },
  {
    label: "Routing Approval",
    isCollapsible: true,
    children: [
      {
        label: "PR Endorsement",
        path: "/routing/pr_endorsement",
        permissions: ["module:7:3"],
      },
      {
        label: "PR Approval",
        path: "/routing/pr_approval",
        permissions: ["modules:7:4"],
      },
      {
        label: "Quotation Endorsement",
        path: "/routing/quotation_endorsement",
        permissions: ["module:7:5"],
      },
      {
        label: "Quotation Approval",
        path: "/routing/quotation_approval",
        permissions: ["module:7:6"],
      },
    ],
  },
  {
    label: "Maintenance",
    isCollapsible: true,
    children: [
      {
        label: "Users",
        path: "users",
        permissions: ["module:10:1"],
      },
      {
        label: "Roles",
        path: "roles",
        permissions: ["module:10:2"],
      },
      {
        label: "Departments",
        path: "department",
        permissions: ["module:10:2"],
      },
    ],
  },
  {
    label: "Modules",
    path: "modules",
    permissions: ["module:11"],
  },
  {
    label: "User Access",
    path: "Access",
    permissions: ["module:13"],
  },
];

export default menuConfig;
