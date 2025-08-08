using Dapper;
using System.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Data;

namespace TodoApi.Repositories
{
    public class UserRepository(DapperContextUsers context) : IUserRepository
    {
        private readonly DapperContextUsers _context = context;

        // public async Task<(int totalCount, List<UserModel> users)> GetAllUsersAsync(int page, int size)
        // {
        //     using var connection = _context.CreateConnection();

        //     var parameters = new DynamicParameters();
        //     parameters.Add("@PageNumber", page, DbType.Int32);
        //     parameters.Add("@PageSize", size, DbType.Int32);

        //     using var multi = await connection.QueryMultipleAsync(
        //         "sp_get_AllUsers",
        //         parameters,
        //         commandType: CommandType.StoredProcedure);

        //     // Read totalCount from first result set
        //     int totalCount = await multi.ReadFirstAsync<int>();

        //     // Read users from second result set
        //     var users = (await multi.ReadAsync<UserModel>()).ToList();

        //     return (totalCount, users);
        // }

        public async Task<IEnumerable<UserModel>> GetAllUsersAsync()
        {
            var query = "sp_get_AllUsers";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<UserModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<UserSummaryModel>> GetUserSummaryAsync()
        {
            var query = "sp_get_AllUsers";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<UserSummaryModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<UserModel>> GetSingleUserAsync(int UserId)
        {
            var users = await GetAllUsersAsync();
            var user = 0;
            return users
            .Where(u => u.UserId == user);
        }
        public async Task<IEnumerable<RoutingModel>> GetAllApproversAsync()
        {
            var users = await GetAllUsersAsync();
            return users
                .Where(u => u.RoleId == 33)
                .Select(u => new RoutingModel
                {
                    RoleId = u.RoleId ?? 0,
                    UserId = u.UserId,
                    FullName = u.FullName
                });
        }

        public async Task<IEnumerable<RoutingModel>> GetAllAEndorsersAsync()
        {
            var users = await GetAllUsersAsync();
            return users
                .Where(u => u.RoleId == 32)
                .Select(u => new RoutingModel
                {
                    RoleId = u.RoleId ?? 0,
                    UserId = u.UserId,
                    FullName = u.FullName
                });
        }

        public async Task CreateAsync(UserModel model)
        {
            var query = "sp_insert_users";
            using var connection = _context.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Username", model.Username);
            parameters.Add("@Password", model.Password);
            parameters.Add("@empId", model.EmpId);
            parameters.Add("@FirstName", model.FirstName);
            parameters.Add("@LastName", model.LastName);
            parameters.Add("@RoleId", model.RoleId);
            parameters.Add("@DepartmentId", model.DepartmentId);
            parameters.Add("@Email", model.Email);
            parameters.Add("@position", model.Position);
            parameters.Add("@location", model.Location);
            parameters.Add("@departmentID", model.DepartmentId);
            parameters.Add("@RoleID", model.RoleId);
            parameters.Add("@EndorserID", model.EndorserId);
            parameters.Add("@ApproverID", model.ApproverId);
            parameters.Add("@UserStatus", model.UserStatus);
            parameters.Add("@signature", model.Signature);
            parameters.Add("@created_date", model.CreatedAt);
            parameters.Add("@updated_date", model.UpdatedAt);
            await connection.ExecuteAsync(query, parameters, commandType: CommandType.StoredProcedure);
        }

        
    }

    
}
