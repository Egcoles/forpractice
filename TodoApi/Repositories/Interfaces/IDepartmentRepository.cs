using TodoApi.Models;

namespace TodoApi.Repositories.Interfaces
{

    public interface IDepartmentRepository
    {
        Task<IEnumerable<DepartmentModel>> GetAllDepartmentsAsync();
        Task CreateAsync(DepartmentModel model);
        Task<IEnumerable<DepartmentModel >> GetAllDepartmentNamesAsync();
    }

}
