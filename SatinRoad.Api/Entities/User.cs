using LinqToDB.Mapping;

namespace SatinRoad.Api.Entities;

[Table(Name = "users")]
public class User
{
    [PrimaryKey, Identity]
    [Column(Name = "id")]
    public int Id { get; set; }

    [Column(Name = "username"), NotNull]
    public string Username { get; set; } = null!;

    [Column(Name = "email"), NotNull]
    public string Email { get; set; } = null!;

    [Column(Name = "password_hash"), NotNull]
    public string PasswordHash { get; set; } = null!;

    [Column(Name = "role"), NotNull]
    public string Role { get; set; } = "User"; 
}