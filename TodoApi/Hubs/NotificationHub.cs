using Microsoft.AspNetCore.SignalR;

namespace TodoApi.Hubs

{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var roleId = Context.User?.FindFirst("RoleId")?.Value;
            var deptId = Context.User?.FindFirst("DepartmentId")?.Value;

            if (!string.IsNullOrEmpty(roleId) && !string.IsNullOrEmpty(deptId))
            {
                var groupName = $"role_{roleId}_dept_{deptId}";
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                Console.WriteLine($"[HUB] User {Context.UserIdentifier} joined {groupName}");
            }
            else
            {
                Console.WriteLine("[HUB] User connected without claims!");
            }

            await base.OnConnectedAsync();
        }


        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var roleId = Context.User?.FindFirst("RoleId")?.Value;
            var deptId = Context.User?.FindFirst("DepartmentId")?.Value;

            if (!string.IsNullOrEmpty(roleId) && !string.IsNullOrEmpty(deptId))
            {
                var groupName = $"role_{roleId}_dept_{deptId}";
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}