using LinqToDB;
using LinqToDB.AspNet;
using SatinRoad.Api;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
builder.Services.AddLinqToDBContext<AppDbContext>((provider, options) =>
    options.UseConnectionString(ProviderName.PostgreSQL, connectionString)
);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

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

app.MapControllers();

app.Run();
