using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<bool> RegisterUserAsync(UserModel user);
        Task<UserWithPermissions?> GetUserByUsernameAsync(string username);
        
    }
}

//Task<int> GetTokenVersionAsync(int userId);
//Task IncrementTokenVersionByRoleAndDepartmentAsync(int roleId, int departmentId);