using Dapper;
using System.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Data;
using System.Transactions;


namespace TodoApi.Repositories {
    public class PRRepository(DapperContextUsers context) : IPRRepository
    {
        private readonly DapperContextUsers _context = context;

        //insert
        public async Task InsertAsync(PRModel model)
        {
            var query = "sp_insert_PurchaseRequisition";
            using var connection = _context.CreateConnection();

            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            var prId = await connection.ExecuteScalarAsync<int>(
                query,
                new
                {
                    model.ProjecDescription,
                    model.DateNeeded,
                    model.CanvassedBy,
                    model.EndorserId,
                    model.ApproverId,
                    model.Status,
                    model.EntryDate,
                    model.CreatedBy,
                    model.Notification,
                    model.FormStatus,
                },
                commandType: CommandType.StoredProcedure
            );

            if (model?.Items != null)
            {
                foreach (var item in model.Items)
                {
                    item.PRId = prId;
                    var itemQuery = "sp_insertPRGRID";
                    var prGridId = await connection.ExecuteScalarAsync<int>(
                        itemQuery,
                        new
                        {
                            item.PRId,
                            item.ItemId,
                            item.ItemDescription,
                            item.Qty,
                        },
                        commandType: CommandType.StoredProcedure
                    );

                    if (item.Suppliers != null)
                    {
                        foreach (var supplier in item.Suppliers)
                        {
                            supplier.PRGRID_Id = prGridId; 
                            var supplierQuery = "sp_insertPRSupplier";
                            await connection.ExecuteAsync(
                                supplierQuery,
                                new
                                {
                                    supplier.SupplierId,
                                    supplier.PRGRID_Id,
                                    supplier.Price,
                                    supplier.Total
                                },
                                commandType: CommandType.StoredProcedure
                            );
                        }
                    }
                }
            }

            Console.WriteLine($"PR inserted with ID: {prId}");
            transaction.Complete();
        }


        //get all
        public async Task<IEnumerable<PRModel>> GetAllPRsAsync()
        {
            var query = "sp_GetPRDetails";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<PRModel>(query, commandType: CommandType.StoredProcedure);
        }

        //for PR Tbale Display
        public async Task<IEnumerable<PRGRID>> GetPRTableDisplay()
        {
            var query = "sp_GetPRDetails";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<PRGRID>(
                query,
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<IEnumerable<PRModel>> GetPRDetailsByPRNumber(string PRNumber)
        {
            var query = "sp_GetPRDetailsByPRNumber";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<PRModel>(
                query,
                new { PRNumber },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<PRDetails?> GetPRDetailsById(int PRId)
        {
            var query = "sp_GETPRBYID";
            var prDetailsDict = new Dictionary<int, PRDetails>();

            using var connection = _context.CreateConnection();
            var result = await connection.QueryAsync<PRDetails, Item, PRDetails>(
                query,
                (prDetails, item) =>
                {
                    if (!prDetailsDict.TryGetValue(prDetails.PRId, out var pr))
                    {
                        pr = prDetails;
                        pr.Items = new List<Item>();
                        prDetailsDict.Add(pr.PRId, pr);
                    }
                    
                    if (item != null)
                    {
                        pr.Items.Add(item);
                    }
                    
                    return pr;
                },
                new { PRId },
                commandType: CommandType.StoredProcedure,
                splitOn: "ItemID"
            );

            return prDetailsDict.Values.FirstOrDefault();
        }



        
    }
}