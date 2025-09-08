using Microsoft.AspNetCore.SignalR;

namespace TodoApi.Hubs

{
    public class NotificationHub : Hub
    {
        public async Task SendNotification(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}