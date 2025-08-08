using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly IRoleRepository _roleRepository;

    public RoleController(IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
    }

    //GET: All roles
    [HttpGet("list")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _roleRepository.GetAllRolesAsync();
        return Ok(roles);
    }

    // GET: Only role names
    [HttpGet("names")]
    public async Task<IActionResult> GetRoleNames()
    {
        var roleNames = await _roleRepository.GetAllRoleNamesAsync();
        return Ok(roleNames);
    }

    // POST: Create role
    [Authorize]
    [HttpPost("create")]
    public async Task<IActionResult> CreateRole([FromBody] RoleModel model)
    {
        // Log all available claims
        Console.WriteLine("🔍 Logging User Claims:");
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
        }

        Console.WriteLine($"Is Authenticated: {User.Identity?.IsAuthenticated}");

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userId, out int responsible))
        {
            return BadRequest("Invalid user ID.");
        }

        model.Responsible = responsible;
        await _roleRepository.CreateAsync(model);

        return Ok("Role created successfully.");
    }


    // PUT: Update role
    [Authorize]
    [HttpPut("update/{id}")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleModel model)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int updatedBy))
            {
                return Unauthorized(new { message = "Invalid user ID in token." });
            }

            await _roleRepository.UpdateAsync(id, model, updatedBy);
            return Ok(new { message = "Role updated successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating role.", error = ex.Message });
        }
    }

    // DELETE: Delete role
    [Authorize]
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        try
        {
            await _roleRepository.DeleteAsync(id);
            return Ok(new { message = "Role deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting role.", error = ex.Message });
        }
    }
}
