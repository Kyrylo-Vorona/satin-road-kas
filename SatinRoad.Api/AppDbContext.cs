using LinqToDB;
using LinqToDB.Data;
using SatinRoad.Api.Entities;

namespace SatinRoad.Api;

public class AppDbContext : DataConnection
{
    public AppDbContext(DataOptions options) : base(options) { }

    public ITable<Product> Products => this.GetTable<Product>();
    public ITable<User> Users => this.GetTable<User>();
    public ITable<Category> Categories => this.GetTable<Category>();
}