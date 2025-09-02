using Dapper;
using System.Data;
using TodoApi.Models;
using TodoApi.Repositories.Interfaces;
using TodoApi.Data;
using System.Transactions;

namespace TodoApi.Repositories
{
    public class QuotationRepository(DapperContextUsers context) : IQuotationRepository
    {
        private readonly DapperContextUsers _context = context;

        //get

        public async Task<IEnumerable<CompanyModel>> GetCompanyListAsync()
        {
            using var connection = _context.CreateConnection();
            var query = "sp_GetCompanyNames";
            return await connection.QueryAsync<CompanyModel>(query, commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<LocationModel>> GetLocationListAsync(int companyId)
        {
            using var connection = _context.CreateConnection();
            var query = "sp_GetLocationByCompanyID";
            return await connection.QueryAsync<LocationModel>(query, new { CompanyID = companyId }, commandType: CommandType.StoredProcedure);
        }



        //insert
        public async Task InsertAsync(QuotationModel quotation)
        {
            using var connection = _context.CreateConnection();
            var query = "sp_insertQuotation";

            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
           var QuotationID = await connection.ExecuteScalarAsync<int>(
                query,
                new
                {
                    quotation.ClientName,
                    quotation.ProjectName,
                    quotation.CompanyID,
                    quotation.LocationID,
                    quotation.Terms,
                    quotation.VAT,
                    quotation.Discount,
                    quotation.SubmittedBy,
                    quotation.Endorser,
                    quotation.Apporver,
                    quotation.CreatedBy,
                    quotation.OverAllTotal,
                    quotation.GrandTotalVat
                },
                commandType: CommandType.StoredProcedure
            );
         if (quotation?.Items != null)
            {
                foreach (var item in quotation.Items)
                {
                    item.QuotationID = QuotationID;
                    var itemQuery = "sp_insertQUOTAIONGRID";
                    await connection.ExecuteAsync(
                        itemQuery,
                        new
                        {
                            item.QuotationID,
                            item.ItemID,
                            item.ItemDescription,
                            item.Quantity,
                            item.UnitCost,
                            item.Markup,
                            item.TotalCost
                        },
                        commandType: CommandType.StoredProcedure
                    );
                }
            }

            transaction.Complete();

        }

    }
}