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

            // Use TransactionScope for async transactions
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
            // Perform the PR insertion
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
                // Insert Items
                foreach (var item in model.Items)
                {
                    item.PRId = prId; // Set the foreign key
                    var itemQuery = "sp_insertPRGRID";
                    await connection.ExecuteAsync(
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


                }
                if (model?.Suppliers != null)
                    {
                        foreach (var supplier in model.Suppliers)
                        {
                            supplier.PRId = prId; // Set the foreign key
                            var supplierQuery = "sp_insertPRSupplier";
                            await connection.ExecuteAsync(
                                supplierQuery,
                                new
                                {
                                    supplier.PRId,
                                    supplier.ItemId,
                                    supplier.SupplierId,
                                    supplier.Price,
                                    supplier.Total
                                },
                                commandType: CommandType.StoredProcedure
                            );
                        }
                    }
            }

            Console.WriteLine($"PR inserted with ID: {prId}");
       
            // Complete the transaction
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

        public async Task<IEnumerable<PRModel>> GetPRDetailsByPRNumber( string PRNumber)
        {
            var query = "sp_GetPRDetailsByPRNumber";
            using var connection = _context.CreateConnection();
            return await connection.QueryAsync<PRModel>(
                query,
                new { PRNumber },
                commandType: CommandType.StoredProcedure
            );
        }
    }
}