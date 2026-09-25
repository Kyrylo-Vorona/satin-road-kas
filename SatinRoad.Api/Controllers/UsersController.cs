using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using LinqToDB;
using SatinRoad.Api.Entities;

namespace SatinRoad.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<User>>> GetUsers()
    {
        var users = await _db.Users.ToListAsync();
        return Ok(users);
    }

    [HttpPost]
    public async Task<ActionResult> AddUser([FromBody] User user)
    {
        user.PasswordHash = _passwordHasher.HashPassword(user, user.PasswordHash);

        await _db.InsertAsync(user);
        return Ok(new { message = "User has been successfully added with a secure hashed password!" });
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteUser([FromQuery] int id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        await _db.DeleteAsync(user);
        return Ok(new { message = "User has been successfully deleted!" });
    }
}