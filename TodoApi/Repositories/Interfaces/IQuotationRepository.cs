using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{

    public interface IQuotationRepository
    {
        Task<IEnumerable<CompanyModel>> GetCompanyListAsync();
        Task<IEnumerable<LocationModel>> GetLocationListAsync(int companyId);
        Task InsertAsync(QuotationModel quotation);
    }

}
