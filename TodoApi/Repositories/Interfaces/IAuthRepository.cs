using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<bool> RegisterUserAsync(UserModel user);
        Task<UserWithPermissions?> GetUserByUsernameAsync(string username);
    }
}
