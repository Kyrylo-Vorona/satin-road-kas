using LinqToDB.Mapping;

namespace SatinRoad.Api.Entities;

[Table(Name = "products")]
public class Product
{
    [PrimaryKey, Identity]
    [Column(Name = "id")]
    public int Id { get; set; }

    [Column(Name = "name"), NotNull]
    public string Name { get; set; } = null!;

    [Column(Name = "price")]
    public int Price { get; set; }

    [Column(Name = "description")]
    public string? Description { get; set; }

    [Column(Name = "user_id")]
    public int UserId { get; set; }
}