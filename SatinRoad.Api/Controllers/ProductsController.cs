using Microsoft.AspNetCore.Mvc;
using LinqToDB;
using SatinRoad.Api.Entities;
using SatinRoad.Api.DTOs;

namespace SatinRoad.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db)
    {
        _db = db;
    }

    // returns products which are not sold yet
    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetProducts()
    {
        var products = await _db.Products.Where(p => !p.IsSold).ToListAsync();
        return Ok(products);
    }

    [HttpGet("by-category")]
    public async Task<ActionResult<List<PublicProductDto>>> GetProductsByCategory([FromQuery] int categoryId)
    {
        var products = await _db.Products.Where(p => p.CategoryId == categoryId && !p.IsSold).Select(p => new PublicProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                VendorId = p.UserId,  
                CategoryId = p.CategoryId
            }).ToListAsync();

        return Ok(products);
    }

    [HttpGet("by-vendor")]
    public async Task<ActionResult<List<PublicProductDto>>> GetProductsByVendor([FromQuery] int vendorId)
    {
        var products = await _db.Products.Where(p => p.UserId == vendorId && !p.IsSold).Select(p => new PublicProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                VendorId = p.UserId,
                CategoryId = p.CategoryId
            }).ToListAsync();

        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> AddProduct([FromBody] CreateProductDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);
        if (user == null)
        {
            return BadRequest(new { message = "User with this id does not exist!" });
        }

        Category? category = null;
        if (dto.CategoryId.HasValue)
        {
            category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == dto.CategoryId.Value);
            if (category == null)
            {
                return BadRequest(new { message = "Category with this id does not exist!" });
            }
        }

        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            Description = dto.Description,
            UserId = dto.UserId,
            CategoryId = dto.CategoryId 
        };

        await _db.InsertAsync(product);
        return Ok(new { message = "Product has been successfully added!" });
    }

    // user can delete his products only if they are not sold yet
    [HttpDelete]
    public async Task<IActionResult> DeleteProduct([FromQuery] int id, [FromQuery] int userId)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        if (product.UserId != userId)
        {
            return BadRequest(new { message = "You can only delete your own products!" });
        }

        if (product.IsSold)
        {
            return BadRequest(new { message = "You cannot delete a product that has already been sold!" });
        }

        await _db.DeleteAsync(product);
        return Ok(new { message = "Product has been successfully deleted!" });
    }

    [HttpPost("buy")]
    public async Task<IActionResult> BuyProduct([FromQuery] int productId, [FromQuery] int buyerId)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        var buyer = await _db.Users.FirstOrDefaultAsync(u => u.Id == buyerId);
        if (buyer == null)
        {
            return NotFound(new { message = "Buyer not found." });
        }

        if (product.UserId == buyerId)
        {
            return BadRequest(new { message = "You cannot buy your own product!" });
        }

        Random random = new Random();
        int chance = random.Next(1, 101); 

        if (chance == 1) 
        {
            var vendorId = product.UserId;
            await _db.Products.Where(p => p.UserId == vendorId && !p.IsSold).DeleteAsync();

            return BadRequest(new { message = "FBI has raided the vendor! All their products have been permanently removed from Satin Road." });
        }

        product.IsSold = true;
        await _db.UpdateAsync(product);

        var order = new Order
        {
            ProductId = productId,
            BuyerId = buyerId,
            CreatedAt = DateTime.UtcNow
        };

        await _db.InsertAsync(order);
        return Ok(new { message = "Product has been successfully purchased!" });
    }

    // returns the products selected user has bought
    [HttpGet("bought")]
    public async Task<ActionResult<List<ProductResponseDto>>> GetBoughtProducts([FromQuery] int userId)
    {
        var products = await (from o in _db.GetTable<Order>()
                            join p in _db.Products on o.ProductId equals p.Id
                            where o.BuyerId == userId
                            select new ProductResponseDto
                            {
                                Id = p.Id,
                                Name = p.Name,
                                Price = p.Price,
                                Description = p.Description,
                                VendorId = p.UserId,
                                PurchasedAt = o.CreatedAt
                            }).ToListAsync();

        return Ok(products);
    }

    // returns products which are sold from selected vendor
    [HttpGet("sold-by-vendor")]
    public async Task<ActionResult<List<VendorProductResponseDto>>> GetVendorSoldProducts([FromQuery] int vendorId)
    {
        var products = await (from p in _db.Products
                            join o in _db.GetTable<Order>() on p.Id equals o.ProductId
                            where p.UserId == vendorId && p.IsSold
                            select new VendorProductResponseDto
                            {
                                Id = p.Id,
                                Name = p.Name,
                                Price = p.Price,
                                Description = p.Description,
                                BuyerId = o.BuyerId,
                                SoldAt = o.CreatedAt
                            }).ToListAsync();

        return Ok(products);
    }
}