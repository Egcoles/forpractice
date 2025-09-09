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

        public async Task<IEnumerable<MainModel>> GetMainModuleAsync()
        {

            using var connection = _context.CreateConnection();
            var query = "sp_GetModule";
            return await connection.QueryAsync<MainModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<SubModuleModel>> GetSubModulesAsync()
        {
            using var connection = _context.CreateConnection();
            var query = "sp_GetSubModule";
            return await connection.QueryAsync<SubModuleModel>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

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

        
    }
}