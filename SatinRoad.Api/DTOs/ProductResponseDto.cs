namespace SatinRoad.Api.DTOs
{
    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Price { get; set; }
        public string? Description { get; set; }
        public int VendorId { get; set; } 
        public DateTime? PurchasedAt { get; set; } 
    }
}