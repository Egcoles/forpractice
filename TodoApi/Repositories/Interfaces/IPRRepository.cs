using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{

    public interface IPRRepository
    {
        Task InsertAsync(PRModel model);
        Task<IEnumerable<PRModel>> GetAllPRsAsync();
        Task<IEnumerable<PRGRID>> GetPRTableDisplay();
        Task<IEnumerable<PRModel>> GetPRDetailsByPRNumber(string PRNumber);
        Task<PRDetails?> GetPRDetailsById(int PRId);
    }

}
