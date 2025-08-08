using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Repositories.Interfaces;
using System.Security.Cryptography;
using System.Text;
using TodoApi.Models;

namespace TodoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(IUserRepository userRepository) : ControllerBase
    {
        private readonly IUserRepository _userRepository = userRepository;

        // [HttpGet("users")]
        // public async Task<IActionResult> GetAllUsers(int page, int size)
        // {
        //     var (totalCount, users) = await _userRepository.GetAllUsersAsync(page, size);
        //     return Ok(new { totalCount, users });
        // }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }
        [HttpGet("approvers")]
        public async Task<IActionResult> GetAllApprovers()
        {
            var approvers = await _userRepository.GetAllApproversAsync();
            return Ok(approvers);
        }

        [HttpGet("endorsers")]
        public async Task<IActionResult> GetAllEndorsers()
        {
            var endorsers = await _userRepository.GetAllAEndorsersAsync();
            return Ok(endorsers);
        }
        [HttpGet("summary")]
        public async Task<IActionResult> GetUserSummary()
        {
            var summary = await _userRepository.GetUserSummaryAsync();
            return Ok(summary);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateUser([FromForm] UserModel user)
        {
            if (string.IsNullOrWhiteSpace(user.Password))
            {
                return BadRequest("Password is required.");
            }

            user.Password = PasswordHelper.HashPassword(user.Password);

            await _userRepository.CreateAsync(user);
            Console.WriteLine($"[CREATE] User created: {user.Username}");
            Console.WriteLine($"[CREATE] User password hash: {user.Password}");
            return Ok("User created successfully.");
        }

    }


    public static class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public static bool VerifyPassword(string password, string storedHash)
        {
            return HashPassword(password) == storedHash;
        }
    }
}
