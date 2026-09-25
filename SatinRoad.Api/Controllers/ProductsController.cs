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

    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetProducts()
    {
        var products = await _db.Products.ToListAsync();
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> AddProduct([FromBody] CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            Description = dto.Description,
            UserId = dto.UserId 
        };

        await _db.InsertAsync(product);
        return Ok(new { message = "Product has been successfully added!" });
    }

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

        await _db.DeleteAsync(product);
        return Ok(new { message = "Product has been successfully deleted!" });
    }
}