using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SatinRoad.Api.Controllers;
using SatinRoad.Api.DTOs;

namespace SatinRoad.Api.Tests;

public class AuthorizationTests
{
    [Theory]
    [InlineData(nameof(CategoriesController.CreateCategory))]
    [InlineData(nameof(CategoriesController.DeleteCategory))]
    public void CategoryWritesRequireAdmin(string action)
    {
        var method = typeof(CategoriesController).GetMethod(action)!;

        Assert.Equal("Admin", method.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
    }

    [Theory]
    [InlineData(nameof(ProductsController.AddProduct))]
    [InlineData(nameof(ProductsController.DeleteProduct))]
    [InlineData(nameof(ProductsController.BuyProduct))]
    [InlineData(nameof(ProductsController.GetBoughtProducts))]
    [InlineData(nameof(ProductsController.GetVendorSoldProducts))]
    public void PersonalProductActionsRequireUser(string action)
    {
        var method = typeof(ProductsController).GetMethod(action)!;

        Assert.Equal("User", method.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
    }

    [Fact]
    public async Task ProductActionsRejectAnIdDifferentFromTheSignedInUser()
    {
        var controller = AsUser(7);

        Assert.IsType<ForbidResult>(await controller.AddProduct(new CreateProductDto
        {
            Name = "Test product",
            Price = 10,
            UserId = 8
        }));
        Assert.IsType<ForbidResult>(await controller.DeleteProduct(1, 8));
        Assert.IsType<ForbidResult>((await controller.GetBoughtProducts(8)).Result);
        Assert.IsType<ForbidResult>((await controller.GetVendorSoldProducts(8)).Result);
    }

    private static ProductsController AsUser(int userId)
    {
        var identity = new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, userId.ToString()), new Claim(ClaimTypes.Role, "User")],
            "test");
        return new ProductsController(null!)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            }
        };
    }
}
