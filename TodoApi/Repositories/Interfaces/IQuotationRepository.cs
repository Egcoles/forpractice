using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{

    public interface IQuotationRepository
    {
        Task<IEnumerable<CompanyModel>> GetCompanyListAsync();
        Task<IEnumerable<LocationModel>> GetLocationListAsync(int companyId);
        Task<IEnumerable<QuotationModel>> GetTableDataAsync( int CreatedBy);
        Task InsertAsync(QuotationModel quotation);
    }

}
