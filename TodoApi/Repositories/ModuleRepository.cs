using Dapper;
using System.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Data;
using System.Transactions;

namespace TodoApi.Repositories
{
    public class ModuleRepository(DapperContextUsers context) : IModuleRepository
    {
        private readonly DapperContextUsers _context = context;

        //Create Modules
        public async Task InsertAsync(MainModel model)
        {

            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
            using var connection = _context.CreateConnection();
            var query = "sp_insertMain";
            var mainId = await connection.ExecuteScalarAsync<int>(
                query,
                new
                {
                    model.ModuleName,
                },
                commandType: CommandType.StoredProcedure
            );
            if (model?.SubModules != null)
            {
                foreach (var subModule in model.SubModules)
                {
                    subModule.MainId = mainId;
                    var subModuleQuery = "sp_insertSub";
                    await connection.ExecuteAsync(
                        subModuleQuery,
                        new
                        {
                            subModule.MainId,
                            subModule.SubName,
                        },
                        commandType: CommandType.StoredProcedure

                    );
                }
            }

            transaction.Complete();

        }

        //Set Up Module Access
        public async Task InsertModuleAsync(ModuleAccessRequestDto model)
        {
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
            using var connection = _context.CreateConnection();
            try
            {
                // Check if Role + Department exists
                bool exists = await CheckRoleDepartmentExistsAsync(model.RoleId, model.DepartmentId);
                if (exists)
                {
                    throw new InvalidOperationException("This Role + Department combination already exists.");
                }

                // If not exists, proceed with inserts
                var query = "sp_insert_ModuleAccessSetUp";

                foreach (var moduleString in model.SelectedModules)
                {
                    var ids = moduleString.Split('-');


                    if (ids.Length == 1 && int.TryParse(ids[0], out int mainId))
                    {
                        // Main module only
                        var parameters = new
                        {
                            DepartmentID = model.DepartmentId,
                            RoleID = model.RoleId,
                            MainID = mainId,
                            SubModuleID = 0
                        };

                        await connection.ExecuteAsync(query, parameters, commandType: CommandType.StoredProcedure);
                    }
                    else if (ids.Length == 2 &&
                             int.TryParse(ids[0], out mainId) &&
                             int.TryParse(ids[1], out int subModuleId))
                    {
                        // Main + submodule
                        var parameters = new
                        {
                            DepartmentID = model.DepartmentId,
                            RoleID = model.RoleId,
                            MainID = mainId,
                            SubModuleID = subModuleId
                        };

                        await connection.ExecuteAsync(query, parameters, commandType: CommandType.StoredProcedure);
                    }
                    else
                    {
                        Console.WriteLine($"Invalid module format skipped: {moduleString}");
                    }
                }

                transaction.Complete();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Transaction failed: {ex.Message}");
                throw;
            }
        }

        //Checker if Role + Department exists
        public async Task<bool> CheckRoleDepartmentExistsAsync(int roleId, int departmentId)
        {
            using var connection = _context.CreateConnection();
            var parameters = new { RoleId = roleId, DepartmentId = departmentId };

            var result = await connection.QuerySingleAsync<int>(
                "sp_CheckRoleDepartmentExists",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result == 1;
        }

        //Get Main Module
        public async Task<IEnumerable<MainModel>> GetMainModuleAsync()
        {

            using var connection = _context.CreateConnection();
            var query = "sp_GetModule";
            return await connection.QueryAsync<MainModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

        // Get SubModule
        public async Task<IEnumerable<SubModuleModel>> GetSubModulesAsync()
        {
            using var connection = _context.CreateConnection();
            var query = "sp_GetSubModule";
            return await connection.QueryAsync<SubModuleModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

        //Populate the Modules
        public async Task<List<MainModel>> PopulateMainModelsAsync()
        {
            using var connection = _context.CreateConnection();
            var MainModule = await GetMainModuleAsync();
            var SubModule = await GetSubModulesAsync();
            var mainModels = new List<MainModel>();
            foreach (var main in MainModule)
            {
                var subModules = SubModule.Where(s => s.MainId == main.MainId).ToList();
                main.SubModules = subModules;
                mainModels.Add(main);
            }
            return mainModels;
        }

        //Get Module Access
        public async Task<IEnumerable<ModuleAccessResponseDto>> GetModuleAccessResponseAsync()
        {
            using var connection = _context.CreateConnection();
            var query = "sp_GetRoleModuleAccess";
            return await connection.QueryAsync<ModuleAccessResponseDto>(
                query,
                commandType: CommandType.StoredProcedure
            );

        }

        //Get Specific Data based on roleID and DepartmentID
        public async Task<IEnumerable<RoleModulePermission>> GetModuleByRoleIDandDepartmentIDAsync(int roleId, int departmentId)
        {
            using var connection = _context.CreateConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@RoleID", roleId);
            parameters.Add("@DepartmentID", departmentId);

            var permissions = await connection.QueryAsync<RoleModulePermission>(
                "sp_GetModuleByRoleIDandDepartmentID",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return permissions;
        }

        //Sync Role Module Permissions when new permisions are added or removed
        public async Task SyncRoleModulePermissionsAsync(SyncRoleModuleRequest request)
        {
            // Ensure each permission has RoleId and DepartmentId
            foreach (var p in request.Permissions)
            {
                p.RoleID = request.RoleId;
                p.DepartmentID = request.DepartmentId;
            }

            // Convert to DataTable
            var tvp = ToDataTable(request.Permissions);

            // Debug log what will be sent
            Console.WriteLine("=== Permissions going to SQL ===");
            foreach (DataRow row in tvp.Rows)
            {
                Console.WriteLine(
                    $"RoleID={row["RoleID"]}, " +
                    $"DepartmentID={row["DepartmentID"]}, " +
                    $"MainID={row["MainID"]}, " +
                    $"SubModuleID={(row["SubModuleID"] == DBNull.Value ? "NULL" : row["SubModuleID"])}"
                );
            }
            Console.WriteLine("================================");

            using var connection = _context.CreateConnection();
            var parameters = new DynamicParameters();
            parameters.Add("@Permissions", tvp.AsTableValuedParameter("dbo.RoleModulePermissionType"));

            await connection.ExecuteAsync(
                "sp_SyncRoleModulePermissions",
                parameters,
                commandType: CommandType.StoredProcedure
            );
        }

        //helper function to convert the list of permissions to a DataTable
        private static DataTable ToDataTable(IEnumerable<RoleModulePermission> permissions)
        {
            var table = new DataTable();
            table.Columns.Add("RoleID", typeof(int));
            table.Columns.Add("DepartmentID", typeof(int));
            table.Columns.Add("MainID", typeof(int));
            table.Columns.Add("SubModuleID", typeof(int));

            foreach (var p in permissions)
            {
                table.Rows.Add(
                    p.RoleID,
                    p.DepartmentID,
                    p.MainID,
                    (object?)p.SubModuleID ?? DBNull.Value
                );
            }

            return table;
        }



    }
}