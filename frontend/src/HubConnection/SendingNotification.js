 connection.invoke("SendNotification", "Admin", "New update available!")
        .catch(err => console.error(err));