using Microsoft.AspNetCore.Authorization;
using System;

namespace TodoApi.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class AuthorizePermissionAttribute : Attribute, IAuthorizeData
    {
        public string[] Permissions { get; }

        // IAuthorizeData properties
        public string? Roles { get; set; } = null;
        public string? AuthenticationSchemes { get; set; } = null;

        // Explicit implementation to satisfy interface
        string? IAuthorizeData.Policy
        {
            get => null;              // we handle policies dynamically
            set => throw new NotImplementedException();
        }

        public AuthorizePermissionAttribute(params string[] permissions)
        {
            Permissions = permissions;
        }
    }
}
