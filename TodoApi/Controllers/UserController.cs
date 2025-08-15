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

        //api to get all users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("UserList")]
        public async Task<IActionResult> GetUserList()
        {
            var users = await _userRepository.GetUserListsAsync();
            return Ok(users);
        }
        //api to get user role
        [HttpGet("users/by-role/{roleId}")]
        public async Task<IActionResult> GetUsersByRole(int roleId)
        {
            var users = await _userRepository.GetUsersByRoleAsync(roleId);
            return Ok(users);
        }

        //api to get items
        [HttpGet("items")]
        public async Task<IActionResult> GetItems()
        {
            var items = await _userRepository.GetAllItemsAsync();
            return Ok(items);
        }
        //api to get UnitByItemId
        [HttpGet("items/{itemId}")]
        public async Task<IActionResult> GetItem(int itemId)
        {
            var item = await _userRepository.GetUnitByItemIdAsync(itemId);
            return Ok(item);
        }

        [HttpGet("Suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = await _userRepository.GetAllSuppliersAsync();
            return Ok(suppliers);
        }
        //api to get users necessary data
        [HttpGet("summary")]
        public async Task<IActionResult> GetUserSummary()
        {
            var summary = await _userRepository.GetUserSummaryAsync();
            return Ok(summary);
        }

        [HttpGet("approvers")]
        public async Task<IActionResult> GetApprovers()
        {
            var approvers = await _userRepository.GetApproversAsync();
            return Ok(approvers);
        }
        [HttpGet("endorsers")]
        public async Task<IActionResult> GetEndorsers()
        {
            var endorsers = await _userRepository.GetEndorsersAsync();
            return Ok(endorsers);
        }
        //api to create new user
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

    //helper funtion 
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
//Refferences
     // [HttpGet("users")]
        // public async Task<IActionResult> GetAllUsers(int page, int size)
        // {
        //     var (totalCount, users) = await _userRepository.GetAllUsersAsync(page, size);
        //     return Ok(new { totalCount, users });
        // }
             // [HttpGet("approvers")]
        // public async Task<IActionResult> GetAllApprovers()
        // {
        //     var approvers = await _userRepository.GetAllApproversAsync();
        //     return Ok(approvers);
        // }

        // [HttpGet("endorsers")]
        // public async Task<IActionResult> GetAllEndorsers()
        // {
        //     var endorsers = await _userRepository.GetAllAEndorsersAsync();
        //     return Ok(endorsers);
        // }