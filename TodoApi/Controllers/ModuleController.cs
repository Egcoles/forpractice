using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;

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
    }
}