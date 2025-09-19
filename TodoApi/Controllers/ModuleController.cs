using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace TodoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ModuleController(IModuleRepository moduleRepository) : ControllerBase
    {
        private readonly IModuleRepository _moduleRepository = moduleRepository;

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateModule([FromBody] MainModel model)
        {
            if (model is null)
            {
                return BadRequest(new { message = "Request body is required" });
            }
            try
            {
                await _moduleRepository.InsertAsync(model);
                return Ok(new { message = "Module created successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in creating module: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating the module" });
            }
        }

        [HttpPost("setModuleAccess")]
        public async Task<IActionResult> InsertModule([FromBody] ModuleAccessRequestDto model)
        {
            if (model is null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            try
            {
                await _moduleRepository.InsertModuleAsync(model);
                return Ok(new { message = "Module created successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in creating module: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating the module" });
            }
        }


        [HttpGet("role-module-permissions")]
        public async Task<IActionResult> GetRoleModulePermissions()
        {
            try
            {
                var permissions = await _moduleRepository.GetModuleAccessResponseAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in fetching module permissions: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching module permissions" });
            }
        }

        [HttpGet("modules")]
        public async Task<IActionResult> GetModules()
        {
            try
            {
                var modules = await _moduleRepository.PopulateMainModelsAsync();
                return Ok(modules);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in fetching modules: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching modules" });
            }
        }

        [HttpGet("edit-module-access/{roleId}/{departmentId}")]
        public async Task<IActionResult> GetModuleAccess(int roleId, int departmentId)
        {
            try
            {
                var modules = await _moduleRepository.GetModuleByRoleIDandDepartmentIDAsync(roleId, departmentId);
                return Ok(modules);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in fetching module access: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching module access" });
            }
        }

        [HttpPut("update-module-access/{roleId}/{departmentId}")]
        public async Task<IActionResult> UpdateModuleAccess(int roleId, int departmentId, [FromBody] SyncRoleModuleRequest model, [FromServices] IHubContext<NotificationHub> hubContext)
        {
            if (model is null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            try
            {
                model.RoleId = roleId;
                model.DepartmentId = departmentId;

                // Debug log: check incoming payload
                Console.WriteLine("=== Incoming Payload ===");
                Console.WriteLine($"RoleId={model.RoleId}, DepartmentId={model.DepartmentId}");
                foreach (var p in model.Permissions)
                {
                    Console.WriteLine($"MainID={p.MainID}, SubModuleID={(p.SubModuleID.HasValue ? p.SubModuleID.Value.ToString() : "NULL")}");
                }
                Console.WriteLine("========================");

                await _moduleRepository.SyncRoleModulePermissionsAsync(model);

                // Fire SignalR event to users match the roleid and departmentid
                await hubContext.Clients
                .Group($"role_{roleId}_dept_{departmentId}")
                .SendAsync("PermissionChanged", "Permission change detected, please re-login.");
                Console.WriteLine($"[HUB] Sent PermissionChanged to group role_{roleId}_dept_{departmentId}");

                return Ok(new { message = "Module access updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in updating module access: {ex}");
                return StatusCode(500, new { message = "An error occurred while updating module access" });
            }
        }

    }
}