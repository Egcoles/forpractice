using Microsoft.AspNetCore.Authorization;

namespace TodoApi.Authorization
{
    public class PermissionRequirement(string[] permissions) : IAuthorizationRequirement
    {
        public string[] Permissions { get; } = permissions;
    }
}
