using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{
    public interface IUserRepository
    {
        // Task<(int totalCount, List<UserModel> users)> GetAllUsersAsync(int page, int size);
        Task<IEnumerable<UserModel>> GetAllUsersAsync();
        Task<IEnumerable<RoutingModel>> GetAllApproversAsync();
        Task<IEnumerable<RoutingModel>> GetAllAEndorsersAsync();
        Task<IEnumerable<UserSummaryModel>> GetUserSummaryAsync();

        Task CreateAsync(UserModel model);
        
    }
 

}
