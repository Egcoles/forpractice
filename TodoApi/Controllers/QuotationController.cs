using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;

namespace TodoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuotationController(IQuotationRepository quotationRepository) : ControllerBase
    {
        private readonly IQuotationRepository _quotationRepository = quotationRepository;

        [Authorize]
        [HttpGet("companies")]
        public async Task<IActionResult> GetCompanies()
        {
            var companies = await _quotationRepository.GetCompanyListAsync();
            return Ok(companies);
        }

        [Authorize]
        [HttpGet("locations/{companyId}")]
        public async Task<IActionResult> GetLocations(int companyId)
        {
            var locations = await _quotationRepository.GetLocationListAsync(companyId);
            return Ok(locations);
        }

        [Authorize]
        [HttpGet("quotations")]
        public async Task<IActionResult> GetQuotations()
        {   
            var userIdStr =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirst("UserId")?.Value ??
                User.FindFirst("userid")?.Value ??
                User.Identity?.Name;
            if (!int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Unable to determine the current user id from the token." });
            }
            var CreateBy = userId;
            Console.WriteLine($"Fetching quotations for CreatedBy: {CreateBy}, UserId from token): {userIdStr}");
            var quotations = await _quotationRepository.GetTableDataAsync(CreateBy);
            return Ok(quotations);
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuotation([FromBody] QuotationModel quotation)
        {
            if (quotation == null)
            {
                return BadRequest(new { message = "Request body is required." });
            }

            try
            {
                Console.WriteLine("Logging User Claims:");
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"Claim Type: {claim.Type}, Value: {claim.Value}");
                }
                Console.WriteLine($"Is Authenticated: {User.Identity?.IsAuthenticated}");
                var userIdStr =
                    User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                    User.FindFirst("UserId")?.Value ??
                    User.FindFirst("userid")?.Value ??
                    User.Identity?.Name;

                if (!int.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized(new { message = "Unable to determine the current user id from the token." });
                }
                var RoleId = User.FindFirstValue("RoleId") ?? string.Empty;
                if (string.IsNullOrEmpty(RoleId)) {
                    Console.WriteLine("RoleId not found in claims.");
                }

                switch (RoleId) {
                    case "31":
                        quotation.Status = "FOR ENDORSEMENT";
                        break;
                    case "32":
                        quotation.Status = "FOR APPROVAL";
                        break;
                    case "33":
                        quotation.Status = "APPROVED";
                        break;
                }

                quotation.CreatedBy = userId;
                Console.WriteLine($"Creating quotation with Status: {quotation.Status}, CreatedBy: {quotation.CreatedBy}");
          
                await _quotationRepository.InsertAsync(quotation);
                return CreatedAtAction(nameof(GetCompanies), new { id = quotation.QuotationID }, quotation);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred while creating quotation: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while creating the quotation." });
            }
        }


    }
}
