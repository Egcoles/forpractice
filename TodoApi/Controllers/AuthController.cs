using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TodoApi.Repositories.Interfaces;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IConfiguration config, IAuthRepository authRepo) : ControllerBase
{
    private readonly IConfiguration _config = config;
    private readonly IAuthRepository _authRepo = authRepo;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserModel user)
    {
        if (string.IsNullOrEmpty(user.Password))
            return BadRequest(new { error = "Password is required" });

        user.Password = HashPassword(user.Password);
        var success = await _authRepo.RegisterUserAsync(user);

        if (!success)

            return BadRequest(new { error = "Registration failed. Username may already exist." });
        Console.WriteLine($"[REGISTER] Failed to register user: {user.Username}");
        return Ok(new { message = "Registered successfully!" });

    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserModel user)
    {
        if (string.IsNullOrEmpty(user.Username))
            return BadRequest(new { error = "Username is required" });

        var userPermissions = await _authRepo.GetUserByUsernameAsync(user.Username);

        // Check if the user was found and has a User object
        if (userPermissions == null || userPermissions.User == null)
        {
            return Unauthorized(new { error = "User not found" });
        }

        var foundUser = userPermissions.User;

        if (!VerifyPassword(user.Password!, foundUser.Password!))
            return Unauthorized(new { error = "Invalid password" });
        Console.WriteLine($"[LOGIN] UserID: {foundUser.UserId}, Username: {foundUser.Username}, RoleID: {foundUser.RoleId}");

        // Log the permissions of the user
        if (userPermissions.Permissions != null && userPermissions.Permissions.Count != 0)
        {
            Console.WriteLine($"[LOGIN] Permissions for user '{foundUser.Username}': {string.Join(", ", userPermissions.Permissions)}");
        }
        else
        {
            Console.WriteLine($"[LOGIN] User '{foundUser.Username}' has no permissions assigned.");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);

        // Create a list of claims for the JWT
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, foundUser.UserId.ToString()),
            new(ClaimTypes.Name, foundUser.Username ?? string.Empty),
            new("RoleId", foundUser.RoleId?.ToString() ?? string.Empty)
        };

        // Add each permission to the claims
        if (userPermissions.Permissions != null)
        {
            foreach (var permission in userPermissions.Permissions)
            {
                claims.Add(new Claim("Permission", permission));
            }
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(10),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        Response.Cookies.Append("token", jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(10)
        });

        return Ok(new { message = "Login successful" });
    }


    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("token");
        return Ok(new { message = "Logged out" });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        if (User.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
        {
            return Unauthorized(new { error = "Not authenticated" });
        }

       
        var username = identity.Name;
        var roleIdClaim = identity.FindFirst("RoleId");
        var roleId = roleIdClaim != null ? int.Parse(roleIdClaim.Value) : (int?)null;
        var permissions = identity.FindAll("Permission")
                                  .Select(c => c.Value)
                                  .ToList();
        return Ok(new
        {
            username,
            roleId,
            permissions
        });
    }


    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        return HashPassword(password) == storedHash;
    }
}
