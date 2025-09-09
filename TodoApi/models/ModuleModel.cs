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
}