using Dapper;
using System.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Data;

namespace TodoApi.Repositories
{
    public class RoleRepository(DapperContextUsers context) : IRoleRepository
    {
        private readonly DapperContextUsers _context = context;

        public async Task<IEnumerable<RoleModel>> GetAllRolesAsync()
        {
            var query = "sp_get_AllRoles";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<RoleModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<RoleModel>> GetAllRoleNamesAsync()
        {
            var roles = await GetAllRolesAsync();
            return roles.Select(r => new RoleModel
            {
                Id = r.Id,
                RoleName = r.RoleName
            });
        }


        public async Task CreateAsync(RoleModel model)
        {
            var query = "sp_insert_role"; 
            using var connection = _context.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@RoleName", model.RoleName);
            parameters.Add("@Responsible", model.Responsible);

            await connection.ExecuteAsync(query, parameters, commandType: CommandType.StoredProcedure);
        }


        public async Task UpdateAsync(int id, RoleModel model, int updatedBy)
        {
            var query = "sp_update_role";
            using var connection = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@RoleID", id);
            parameters.Add("@RoleName", model.RoleName);
            parameters.Add("@Responsible", updatedBy);

            await connection.ExecuteAsync(query, parameters, commandType: CommandType.StoredProcedure);
        }

        public async Task DeleteAsync(int id)
        {
            var query = "sp_delete_role";
            using var connection = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@RoleID", id);

            await connection.ExecuteAsync(query, parameters, commandType: CommandType.StoredProcedure);
        }
    }

    
}
