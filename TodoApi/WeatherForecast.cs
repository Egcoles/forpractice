namespace TodoApi;

public class WeatherForecast
{
    public DateOnly Date { get; set; }

    public int TemperatureC { get; set; }

    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

    public string? Summary { get; set; }
}



// using System.Data;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.Data.SqlClient;
// using TodoApi.Models;
// namespace TodoApi.Controllers;

// using System.Security.Claims;
// using Microsoft.AspNetCore.Authorization;

// [Route("api/[controller]")]
// [ApiController]
// public class RoleController(IConfiguration configuration) : ControllerBase
// {
//     private readonly IConfiguration _configuration = configuration;

//     [HttpGet("list")]
//     public async Task<IActionResult> GetRoles()
//     {
//         var roles = new List<RoleModel>();

//         using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
//         using var command = new SqlCommand("sp_get_AllRoles", connection)
//         {
//             CommandType = CommandType.StoredProcedure
//         };

//         await connection.OpenAsync();

//         using var reader = await command.ExecuteReaderAsync();
//         while (await reader.ReadAsync())
//         {
//             roles.Add(new RoleModel
//             {
//                 Id = reader.GetInt32(0),
//                 RoleName = reader.GetString(1),
//                 CreatedAt = reader.GetDateTime(2),
//                 Responsible = reader.GetInt32(3),
//                 UpdatedBy = reader.IsDBNull(4) ? (int?)null : reader.GetInt32(4),
//                 Updated = reader.IsDBNull(5) ? (DateTime?)null : reader.GetDateTime(5),

//             });
//         }

//         return Ok(roles);
//     }

//     [Authorize]
//     [HttpPost("create")]
//     public async Task<IActionResult> CreateRole([FromBody] RoleModel model)
//     {
//         try
//         {
//             var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
//             if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int responsible))
//             {
//                 return Unauthorized(new { message = "Invalid user ID in token." });
//             }

//             using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
//             using var command = new SqlCommand("sp_insert_role", connection)
//             {
//                 CommandType = CommandType.StoredProcedure
//             };

//             command.Parameters.AddWithValue("@RoleName", model.RoleName);
//             command.Parameters.AddWithValue("@Responsible", responsible);

//             await connection.OpenAsync();
//             await command.ExecuteNonQueryAsync();

//             return Ok(new { message = "Role created successfully." });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine("Error: " + ex.ToString());
//             return StatusCode(500, new { message = "Error creating role.", error = ex.Message });
//         }
//     }

//     [Authorize]
//     [HttpPut("update/{id}")]
//     public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleModel model)
//     {
//         try
//         {
//             var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
//             if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int updatedBy))
//             {
//                 return Unauthorized(new { message = "Invalid user ID in token." });
//             }

//             using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
//             using var command = new SqlCommand("sp_update_role", connection)
//             {
//                 CommandType = CommandType.StoredProcedure
//             };


//             command.Parameters.AddWithValue("@RoleName", model.RoleName);
//             command.Parameters.AddWithValue("@Responsible", updatedBy);
//             command.Parameters.AddWithValue("@RoleID", id);

//             await connection.OpenAsync();
//             await command.ExecuteNonQueryAsync();

//             return Ok(new { message = "Role updated successfully." });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine("Error: " + ex.ToString());
//             return StatusCode(500, new { message = "Error updating role.", error = ex.Message });
//         }
//     }

//     [Authorize]
//     [HttpDelete("delete/{id}")]
    
//     public async Task<IActionResult> DeleteRole(int id)
//     {
//         try
//         {
//             using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
//             using var command = new SqlCommand("sp_delete_role", connection)
//             {
//                 CommandType = CommandType.StoredProcedure
//             };

//             command.Parameters.AddWithValue("@RoleID", id);

//             await connection.OpenAsync(); 
//             await command.ExecuteNonQueryAsync();

//             return Ok(new { message = "Role deleted successfully." });
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine("Error: " + ex.ToString());
//             return StatusCode(500, new { message = "Error deleting role.", error = ex.Message });
//         }
//     }




// }
