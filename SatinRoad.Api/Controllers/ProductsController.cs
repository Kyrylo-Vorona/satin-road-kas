using Microsoft.AspNetCore.Mvc;
using LinqToDB;
using SatinRoad.Api.Entities;

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
    public async Task<ActionResult> AddProduct([FromBody] Product product)
    {
        await _db.InsertAsync(product);
        return Ok(new { message = "Product has been succesfuly added!" });
    }
}