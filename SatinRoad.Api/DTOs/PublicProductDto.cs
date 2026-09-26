namespace SatinRoad.Api.DTOs;

public class PublicProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Price { get; set; }
    public string? Description { get; set; }
    public int VendorId { get; set; }
    public int? CategoryId { get; set; }
}