namespace SatinRoad.Api.DTOs;

public class VendorProductResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int Price { get; set; }
    public string? Description { get; set; }
    public int BuyerId { get; set; }
    public DateTime? SoldAt { get; set; }
}