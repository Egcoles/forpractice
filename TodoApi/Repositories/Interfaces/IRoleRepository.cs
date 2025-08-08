using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{

    public interface IRoleRepository
    {
    Task<IEnumerable<RoleModel>> GetAllRolesAsync();
    Task<IEnumerable<RoleModel>> GetAllRoleNamesAsync();
    Task CreateAsync(RoleModel model);
    Task UpdateAsync(int id, RoleModel model, int updatedBy);
    Task DeleteAsync(int id);
    }

}
