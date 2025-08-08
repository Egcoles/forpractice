using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Threading.Tasks;

namespace TodoApi.Middleware
{
    public class JwtExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        // Middleware to handle JWT exceptions
        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (SecurityTokenExpiredException)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"error\": \"Token expired. Please log in again.\"}");
            }
            catch (SecurityTokenException ex)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync($"{{\"error\": \"Invalid token: {ex.Message}\"}}");
            }
        }
    }
}       

