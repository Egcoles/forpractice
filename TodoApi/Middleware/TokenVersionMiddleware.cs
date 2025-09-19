// using Microsoft.AspNetCore.Http;
// using System.Security.Claims;
// using System.Threading.Tasks;
// using TodoApi.Repositories;
// using TodoApi.Repositories.Interfaces;
// using TodoApi.Middleware;

// namespace TodoApi.Middleware
// {
//     public class TokenVersionMiddleware(RequestDelegate next)
//     {
//         private readonly RequestDelegate _next = next;

//         public async Task InvokeAsync(HttpContext context, IAuthRepository userRepo)
//         {
//             if (context.User.Identity?.IsAuthenticated == true)
//             {
//                 var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
//                 var tokenVersionClaim = context.User.FindFirst("TokenVersion");

//                 if (userIdClaim != null && tokenVersionClaim != null)
//                 {
//                     var userId = int.Parse(userIdClaim.Value);
//                     var tokenVersion = int.Parse(tokenVersionClaim.Value);

//                     var currentVersion = await userRepo.GetTokenVersionAsync(userId);

//                     if (tokenVersion != currentVersion)
//                     {
//                         context.Response.StatusCode = StatusCodes.Status401Unauthorized;
//                         await context.Response.WriteAsync("Token is no longer valid. Please re-login.");
//                         return;
//                     }
//                 }
//             }

//             await _next(context);
//         }
//     }

// }
