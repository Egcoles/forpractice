using Dapper;
using System.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Data;

namespace TodoApi.Repositories {
    public class PRRepository(DapperContextUsers context) : IPRRepository
    {
        private readonly DapperContextUsers _context = context;

        //insert
        public async Task InsertAsync(PRModel model)
        {
            var query = "sp_insert_PurchaseRequisition";
            using var connection = _context.CreateConnection();
            await connection.ExecuteAsync(
                query,
                new
                {
                    model.ProjecDescription,
                    model.DateNeeded,
                    model.CanvassedBy,
                    model.EndorserId,
                    model.ApproverId,
                    model.EndorsedDate,
                    model.ApprovedDate,
                    model.Status,
                    model.EntryDate,
                    model.CreatedBy,
                    model.Notification,
                    model.FormStatus,
                    model.ItemId,
                    model.ItemDescription,
                    model.Qty,
                    model.Supplier1,
                    model.Supplier2,
                    model.Supplier3,
                    model.Supplier1_PRICE,
                    model.Supplier2_PRICE,
                    model.Supplier3_PRICE,
                    model.Supplier1_TOTAL,
                    model.Supplier2_TOTAL,
                    model.Supplier3_TOTAL
                },
                commandType: CommandType.StoredProcedure
            );
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