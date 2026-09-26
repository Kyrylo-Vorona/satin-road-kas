using LinqToDB.Mapping;

namespace SatinRoad.Api.Entities
{
    [Table(Name = "orders")]
    public class Order
    {
        [PrimaryKey, Identity]
        [Column(Name = "id")]
        public int Id { get; set; }

        [Column(Name = "product_id")]
        public int? ProductId { get; set; }

        [Column(Name = "buyer_id")]
        public int BuyerId { get; set; }

        [Column(Name = "created_at")]
        public DateTime CreatedAt { get; set; }
    }
}