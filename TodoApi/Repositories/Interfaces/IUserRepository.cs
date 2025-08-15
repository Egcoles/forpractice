using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<UserModel>> GetAllUsersAsync();
        Task<IEnumerable<Items>> GetAllItemsAsync();
        Task<IEnumerable<Suppliers>> GetAllSuppliersAsync();
        Task<IEnumerable<UserSummaryModel>> GetUserSummaryAsync();
        Task CreateAsync(UserModel model);
        Task<IEnumerable<RoutingModel>> GetUsersByRoleAsync(int roleId);
        Task<IEnumerable<UnitByItemId>> GetUnitByItemIdAsync(int itemId);
        Task<IEnumerable<UserList>> GetUserListsAsync();
        Task<IEnumerable<RoutingModel>> GetEndorsersAsync();
        Task<IEnumerable<RoutingModel>> GetApproversAsync();
    }

}
