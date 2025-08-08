using Dapper;
using System.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Data;

namespace TodoApi.Repositories
{
    public class DepartmentRepository(DapperContextUsers context) : IDepartmentRepository
    {
        private readonly DapperContextUsers _context = context;

        public async Task<IEnumerable<DepartmentModel>> GetAllDepartmentsAsync()
        {
            var query = "sp_get_AllDepartment";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<DepartmentModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }
       
        public async Task<IEnumerable<DepartmentModel>> GetAllDepartmentNamesAsync()
        {
            var departments = await GetAllDepartmentsAsync();
            return departments.Select(d => new DepartmentModel { Id = d.Id, DepartmentName = d.DepartmentName });
        }

        public async Task CreateAsync(DepartmentModel model)
        {
            var query = "sp_insert_department";
            using var connection = _context.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@DepartmentName", model.DepartmentName);
            parameters.Add("@Responsible", model.Responsible);

            await connection.ExecuteAsync(query, parameters, commandType: CommandType.StoredProcedure);
        }


       

    }

    
}
