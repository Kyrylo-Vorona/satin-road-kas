using Microsoft.AspNetCore.Mvc;
using LinqToDB;
using SatinRoad.Api.Entities;
using SatinRoad.Api.DTOs;

namespace SatinRoad.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _db.Categories.ToListAsync();
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        var existingCategory = await _db.Categories.FirstOrDefaultAsync(c => c.Name == dto.Name);
        if (existingCategory != null)
        {
            return BadRequest(new { message = "Category with this name already exists!" });
        }

        var category = new Category
        {
            Name = dto.Name
        };

        await _db.InsertAsync(category);

        return Ok(new { message = "Category has been successfully created!" });
    }

    // The database is configured so that when an administrator deletes a category, 
    // all related products will automatically have their foreign key field set to null, 
    // so there is no need to implement extra queries or logic to update category_id.
    [HttpDelete]
    public async Task<ActionResult> DeleteCategory([FromQuery] int id)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category == null)
        {
            return NotFound(new { message = "Category not found" });
        }

        await _db.DeleteAsync(category);
        return Ok(new { message = "Category has been successfully deleted!" });
    }
}