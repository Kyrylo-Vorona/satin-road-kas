using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using LinqToDB;
using SatinRoad.Api.Entities;
using SatinRoad.Api.DTOs;

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
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Username == user.Username);
        var existingUserEmail = await _db.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        if (existingUser != null || existingUserEmail != null)
        {
            return BadRequest(new { message = "User with this username or email already exists!" });
        }
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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }
        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password);

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }
        return Ok(new { userId = user.Id });
    }
}