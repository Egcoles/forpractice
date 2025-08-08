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

        public async Task<UserModel?> GetUserByUsernameAsync(string username)
        {
            var sql = "sp_login_user";
            using var connection = _context.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Username", username);

            var result = await connection.QueryFirstOrDefaultAsync<UserModel>(sql, parameters,
                commandType: System.Data.CommandType.StoredProcedure);

            return result;
        }
    }
}
