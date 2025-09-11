using System.Text.Json.Serialization;

namespace TodoApi.Models
{
    public class MainModel
    {
        public int MainId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public List<SubModuleModel>? SubModules { get; set; } = new List<SubModuleModel>();
    }

    public class SubModuleModel
    {
        public int SubModuleId { get; set; }
        public int MainId { get; set; }
        public string SubName { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;

    }
    public class ModuleAccessRequestDto
    {
        public int DepartmentId { get; set; }
        public int RoleId { get; set; }
        public List<string> SelectedModules { get; set; } = new List<string>();
    }
    public class ModuleAccessResponseDto
    {
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string RoleName { get; set; }  = string.Empty;
        public string SelectedModules { get; set; }  = string.Empty;
    }
}