using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace TodoApi.Data
{
   public class DapperContextUsers
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public DapperContextUsers(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("UsersConnection")!;
    }

    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}

}
