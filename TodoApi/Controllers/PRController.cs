using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Authorization;

namespace TodoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PRController(IPRRepository prRepository) : ControllerBase
    {
        private readonly IPRRepository _prRepository = prRepository;

        [AuthorizePermission("module:8:7")]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePR([FromBody] PRModel model)
        {
            if (model is null)
            {
                return BadRequest(new { message = "Request body is required." });
            }

            try
            {
                // Log available claims to aid debugging
                Console.WriteLine("Logging User Claims:");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
                }
                Console.WriteLine($"Is Authenticated: {User.Identity?.IsAuthenticated}");

                // Resolve the authenticated user's id from claims
                var userIdStr =
                    User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                    User.FindFirst("UserId")?.Value ??
                    User.FindFirst("userid")?.Value ??
                    User.Identity?.Name;

                if (!int.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized(new { message = "Unable to determine the current user id from the token." });
                }

                // Set the CreatedBy property
                model.CreatedBy = userId;


                await _prRepository.InsertAsync(model);
                return CreatedAtAction(nameof(GetAllPRs), new { id = model.PRId }, model);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreatePR: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating a purchase request.", error = ex.Message });
            }
        }

        [AuthorizePermission("module:8:7")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllPRs()
        {
            try
            {
                var prs = await _prRepository.GetAllPRsAsync();
                return Ok(prs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllPRs: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving purchase requests.", error = ex.Message });
            }
        }
        [AuthorizePermission("module:8:null")]
        [HttpGet("PRTableDisplay")]
        public async Task<IActionResult> GetPRTableDisplay()
        {
            try
            {
                var prs = await _prRepository.GetPRTableDisplay();
                return Ok(prs);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetPRTableDisplay: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving purchase requests.", error = ex.Message });
            }
        }
        [AuthorizePermission("module:8:7")]
        [HttpGet("PRDetailsByPRNumber/{PRNumber}")]
        public async Task<IActionResult> GetPRDetailsByPRNumber(string PRNumber)
        {
            try
            {
                var pr = await _prRepository.GetPRDetailsByPRNumber(PRNumber);
                return Ok(pr);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetPRDetailsByPRNumber: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving purchase requests.", error = ex.Message });
            }
        }
        [AuthorizePermission("module:8:7")]
        [HttpGet("PRDetailsById/{PRId}")]
        public async Task<IActionResult> GetPRDetailsById(int PRId)
        {
            try
            {
                var pr = await _prRepository.GetPRDetailsById(PRId);
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetPRDetailsById: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while retrieving purchase requests.", error = ex.Message });
            }
        }

    }
}
