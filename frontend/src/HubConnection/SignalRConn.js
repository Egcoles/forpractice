import * as signalR from '@microsoft/signalr';

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5125/notificationHub") 
        .withAutomaticReconnect()
        .build();
    connection.start()
        .then(() => console.log('Connection established!'))
        .catch(err => console.error('Connection failed: ', err));
export default connection;