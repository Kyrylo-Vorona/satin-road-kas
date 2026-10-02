using LinqToDB;
using LinqToDB.AspNet;
using Microsoft.AspNetCore.Authentication.Cookies;
using SatinRoad.Api;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
builder.Services.AddLinqToDBContext<AppDbContext>((provider, options) =>
    options.UseConnectionString(ProviderName.PostgreSQL, connectionString)
);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "SatinRoad.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromHours(2);
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); 
    
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "SatinRoad API v1");
        options.RoutePrefix = string.Empty;
    });
}

// Vite forwards local /api requests over HTTP. Redirecting them to the
// development HTTPS port bypasses that proxy and requires a trusted certificate.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.Use(async (context, next) =>
{
    var unsafeMethod = !HttpMethods.IsGet(context.Request.Method) &&
        !HttpMethods.IsHead(context.Request.Method) &&
        !HttpMethods.IsOptions(context.Request.Method);
    if (unsafeMethod && context.User.Identity?.IsAuthenticated == true &&
        context.Request.Headers.TryGetValue("Sec-Fetch-Site", out var site) &&
        site != "same-origin")
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return;
    }

    await next();
});
app.UseAuthorization();

app.MapControllers();

app.Run();
