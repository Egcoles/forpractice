using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Threading.Tasks;

namespace TodoApi.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            // Extract permissions from the attribute (dynamic)
            var mvcContext = context.Resource as AuthorizationFilterContext;
            var attrPermissions = mvcContext?.ActionDescriptor.EndpointMetadata
                .OfType<AuthorizePermissionAttribute>()
                .SelectMany(a => a.Permissions)
                .ToArray();

            if (attrPermissions != null && attrPermissions.Any())
            {
                // Check if user has at least one of the required permissions
                if (context.User.Claims.Any(c => c.Type == "Permission" && attrPermissions.Contains(c.Value)))
                {
                    context.Succeed(requirement);
                }
            }

            return Task.CompletedTask;
        }
    }
}
