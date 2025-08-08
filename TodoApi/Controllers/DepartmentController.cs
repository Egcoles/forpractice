using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;

namespace TodoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentController(IDepartmentRepository departmentRepository) : ControllerBase
    {
        private readonly IDepartmentRepository _departmentRepository = departmentRepository;

        [HttpGet("departments")]
        public async Task<IActionResult> GetAllDepartments()
        {
            try
            {
                var departments = await _departmentRepository.GetAllDepartmentsAsync();
                return Ok(departments);
            }
            catch (Exception ex)
            {
                 Console.WriteLine($"Error in GetAllDepartments: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving departments.", error = ex.Message });
            }
        }
        [HttpGet("names")]
        public async Task<IActionResult> GetAllDepartmentNames()
        {
            try
            {
                var departmentNames = await _departmentRepository.GetAllDepartmentNamesAsync();
                return Ok(departmentNames);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllDepartmentNames: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving department names.", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateDepartment([FromBody] DepartmentModel model)
        {
            try
            {
                await _departmentRepository.CreateAsync(model);
                return CreatedAtAction(nameof(GetAllDepartments), new { id = model.Id }, model);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the department.", error = ex.Message });
            }
        }
    }
}
