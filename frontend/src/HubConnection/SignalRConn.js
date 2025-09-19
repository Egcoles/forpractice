import * as signalR from "@microsoft/signalr";
import { enqueueSnackbar } from "notistack";

const connection = new signalR.HubConnectionBuilder()
   .withUrl("http://localhost:5125/notificationHub", {
    withCredentials: true, // ✅ ensures cookies go with SignalR
  })
  .withAutomaticReconnect()
  .build();
connection
  .start()
  .then(() => console.log("Connection established!"))
  .catch((err) => console.error("Connection failed: ", err));

// Listen for backend event
connection.on("PermissionChanged", (message) => {
  enqueueSnackbar(message, { variant: "warning" });

  // Auto logout after showing message
  setTimeout(() => {
    localStorage.removeItem("token");
    window.location.href = "/";
  }, 3000);
});
export default connection;
