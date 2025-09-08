 import React, { useEffect, useState } from 'react';
 import connection from './SignalRConn.js';

    function NotificationComponent() {
        const [notifications, setNotifications] = useState([]);

        useEffect(() => {
            connection.start()
                .then(() => console.log('SignalR Connected'))
                .catch(err => console.error('SignalR Connection Error: ', err));

            connection.on("ReceiveNotification", (user, message) => {
                setNotifications(prev => [...prev, { user, message }]);
            });

            return () => {
                connection.stop(); // Clean up connection on component unmount
            };
        }, []);

        return (
            <div>
                <h2>System Notifications</h2>
                <ul>
                    {notifications.map((n, index) => (
                        <li key={index}><strong>{n.user}:</strong> {n.message}</li>
                    ))}
                </ul>
            </div>
        );
    }

    export default NotificationComponent;