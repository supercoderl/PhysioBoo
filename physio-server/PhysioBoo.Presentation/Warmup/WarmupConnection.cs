using Microsoft.EntityFrameworkCore;
using PhysioBoo.Infrastructure.Database;
using System.Diagnostics;

namespace PhysioBoo.Presentation.Warmup
{
    public class WarmupConnection : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WarmupConnection> _logger;

        public WarmupConnection(IServiceProvider serviceProvider, ILogger<WarmupConnection> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        private async Task PrewarmEntityFramework()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetService<ApplicationDbContext>();

                if (dbContext == null)
                {
                    _logger.LogWarning("DbContext not found for EF warmup");
                    return;
                }

                var sw = Stopwatch.StartNew();

                // Force model building
                _ = dbContext.Model;
                _logger.LogInformation("EF Model built in {ElapsedMs}ms", sw.ElapsedMilliseconds);

                // Ensure database exists and is accessible
                var canConnect = await dbContext.Database.CanConnectAsync();
                if (!canConnect)
                {
                    _logger.LogWarning("Cannot connect to database during warmup");
                    return;
                }

                // Execute a simple query to warm up the query pipeline
                await dbContext.Database.ExecuteSqlRawAsync("SELECT 1");

                _logger.LogInformation("Entity Framework prewarmed in {ElapsedMs}ms", sw.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to prewarm Entity Framework");
            }
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await PrewarmEntityFramework();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
