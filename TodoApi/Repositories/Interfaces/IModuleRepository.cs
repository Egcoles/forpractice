using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{
    public interface IModuleRepository
    {
        Task InsertAsync(MainModel model);
        Task InsertModuleAsync(ModuleAccessRequestDto model);
        Task<IEnumerable<SubModuleModel>> GetSubModulesAsync();
        Task<IEnumerable<MainModel>> GetMainModuleAsync();
        Task<List<MainModel>> PopulateMainModelsAsync();
        Task<IEnumerable<ModuleAccessResponseDto>> GetModuleAccessResponseAsync();
        Task<IEnumerable<RoleModulePermission>> GetModuleByRoleIDandDepartmentIDAsync(int roleId, int departmentId);
        Task SyncRoleModulePermissionsAsync(SyncRoleModuleRequest request);
  
    }
}