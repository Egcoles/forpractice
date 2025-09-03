using System.Text.Json.Serialization;

namespace TodoApi.Models
{
    public class UserModel
    {
        public string? Username { get; set; }
        public string Password { get; set; } = "ATI2025";
        public int UserId { get; set; }
        public int? EmpId { get; set; }
        public string? Email { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Position { get; set; } = string.Empty;
        public int ? DepartmentId { get; set; }
        public int ? RoleId { get; set; }
        public int EndorserId { get; set; } = 0;
        public int ApproverId { get; set; } = 0;
        public string UserStatus { get; set; } = "Active";
        public string Location { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserSummaryModel
    {
        public int UserId { get; set; }
        public int EmpId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public string? RoleName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string UserStatus { get; set; } = "Active";
    }

    public class UserList
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
         
    }
    public class RoutingModel
    {
        public int RoleId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int UserId { get; set; }

        public string RoleName { get; set; } = string.Empty;

    }


    public class RoleModel
    {
        public int Id { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? Updated { get; set; } = DateTime.UtcNow;
        public int Responsible { get; set; }
        public int? UpdatedBy { get; set; }

    }

    public class DepartmentModel
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Responsible { get; set; }
    }

    public class Items
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public class UnitByItemId
    {
        public int ItemId { get; set; }
        public string Unit { get; set; } = string.Empty;
    }

    public class Suppliers
    {
        public int SupplierID { get; set; }
        public string SupplierName { get; set; } = string.Empty;
    }
}


