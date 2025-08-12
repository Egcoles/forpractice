using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<UserModel>> GetAllUsersAsync();
        Task<IEnumerable<UserSummaryModel>> GetUserSummaryAsync();
        Task CreateAsync(UserModel model);
        Task<IEnumerable<RoutingModel>> GetUsersByRoleAsync(int roleId);
    }

}
