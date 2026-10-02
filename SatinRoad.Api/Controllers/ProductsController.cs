using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
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

    private int? CurrentUserId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id
        : null;

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
    [Authorize(Roles = "User")]
    public async Task<IActionResult> AddProduct([FromBody] CreateProductDto dto)
    {
        if (CurrentUserId != dto.UserId)
        {
            return Forbid();
        }

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
    [Authorize(Roles = "User")]
    public async Task<IActionResult> DeleteProduct([FromQuery] int id, [FromQuery] int userId)
    {
        if (CurrentUserId != userId)
        {
            return Forbid();
        }

        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        if (product.UserId != CurrentUserId)
        {
            return Forbid();
        }

        if (product.IsSold)
        {
            return BadRequest(new { message = "You cannot delete a product that has already been sold!" });
        }

        await _db.DeleteAsync(product);
        return Ok(new { message = "Product has been successfully deleted!" });
    }

    [HttpPost("buy")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> BuyProduct([FromQuery] int productId, [FromQuery] int buyerId)
    {
        if (CurrentUserId != buyerId)
        {
            return Forbid();
        }

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
        var previousOrdersCount = await _db.Orders.InnerJoin(_db.Products, (o, p) => o.ProductId == p.Id, (o, p) => new { o.BuyerId, p.UserId }).Where(x => x.BuyerId == buyerId && x.UserId == product.UserId).CountAsync();

        var discountApplied = PurchaseRules.IsDiscountEligible(previousOrdersCount);
        var finalPrice = PurchaseRules.CalculateFinalPrice(product.Price, previousOrdersCount);

        product.IsSold = true;
        await _db.UpdateAsync(product);

        var order = new Order
        {
            ProductId = productId,
            BuyerId = buyerId,
            Price = finalPrice,
            CreatedAt = DateTime.UtcNow
        };

        await _db.InsertAsync(order);

        if (discountApplied)
        {
            return Ok(new { message = "Product successfully purchased with a 20% discount on your 11th order!" });
        }

        return Ok(new { message = "Product has been successfully purchased!" });
    }

    // returns the products selected user has bought
    [HttpGet("bought")]
    [Authorize(Roles = "User")]
    public async Task<ActionResult<List<ProductResponseDto>>> GetBoughtProducts([FromQuery] int userId)
    {
        if (CurrentUserId != userId)
        {
            return Forbid();
        }

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
    [Authorize(Roles = "User")]
    public async Task<ActionResult<List<VendorProductResponseDto>>> GetVendorSoldProducts([FromQuery] int vendorId)
    {
        if (CurrentUserId != vendorId)
        {
            return Forbid();
        }

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
