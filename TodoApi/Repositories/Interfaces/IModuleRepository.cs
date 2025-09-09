using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{
    public interface IModuleRepository
    {
        Task InsertAsync(MainModel model);
        Task<IEnumerable<SubModuleModel>> GetSubModulesAsync();
        Task<IEnumerable<MainModel>> GetMainModuleAsync();
        Task<List<MainModel>> PopulateMainModelsAsync();
    }
}