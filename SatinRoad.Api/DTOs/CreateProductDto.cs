namespace SatinRoad.Api.DTOs
{
    public class CreateProductDto
    {
        public required string Name { get; set; }
        public int Price { get; set; }
        public string? Description { get; set; }
        public int UserId { get; set; } 
        public int? CategoryId { get; set; }
    }
}