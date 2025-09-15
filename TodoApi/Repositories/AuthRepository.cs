using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using TodoApi.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;

namespace TodoApi.Repositories
{
    public class AuthRepository(DapperContextUsers context) : IAuthRepository
    {
        private readonly DapperContextUsers _context = context;

        public async Task<bool> RegisterUserAsync(UserModel user)
        {
            var sql = "sp_register_user";
            using var connection = _context.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Username", user.Username);
            parameters.Add("@Password", user.Password); // Already hashed from controller

            try
            {
                await connection.ExecuteAsync(sql, parameters, commandType: System.Data.CommandType.StoredProcedure);
                return true;
            }
            catch (SqlException)
            {
                return false;
            }
        }

        public async Task<UserWithPermissions?> GetUserByUsernameAsync(string username)
        {
            var sql = "sp_login_user";
            using var connection = _context.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Username", username);

            var userWithPermissionsDictionary = new Dictionary<int, UserWithPermissions>();

            var result = await connection.QueryAsync<UserModel, dynamic, UserWithPermissions>(
            sql,
            (user, permission) =>
            {
             
                if (!userWithPermissionsDictionary.TryGetValue(user.UserId, out var userWithPermissions))
                {
                    userWithPermissions = new UserWithPermissions { User = user };
                    userWithPermissionsDictionary.Add(user.UserId, userWithPermissions);
                }

                
                if (permission.MainID != null)
                {
                    userWithPermissions.Permissions.Add($"module:{permission.MainID}:{permission.SubModuleID}");
                }

                return userWithPermissions;
            },
                    param: parameters,
                    commandType: CommandType.StoredProcedure,
                    splitOn: "MainID"
                );

            return userWithPermissionsDictionary.Values.FirstOrDefault();

        }
    }
}
