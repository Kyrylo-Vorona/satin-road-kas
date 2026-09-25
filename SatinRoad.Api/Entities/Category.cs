using LinqToDB.Mapping;

namespace SatinRoad.Api.Entities;

[Table(Name = "categories")]
public class Category
{
    [PrimaryKey, Identity]
    [Column(Name = "id")]
    public int Id { get; set; }

    [Column(Name = "name"), NotNull]
    public string Name { get; set; } = null!;
}