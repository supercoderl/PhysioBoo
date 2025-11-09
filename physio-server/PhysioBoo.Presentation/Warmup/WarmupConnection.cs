using Microsoft.EntityFrameworkCore;
using PhysioBoo.Infrastructure.Database;
using System.Diagnostics;

namespace PhysioBoo.Presentation.Warmup
{
    public class WarmupConnection : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WarmupConnection> _logger;
        private readonly IHostApplicationLifetime _appLifetime;

        public WarmupConnection(
            IServiceProvider serviceProvider,
            ILogger<WarmupConnection> logger,
            IHostApplicationLifetime appLifetime
        )
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _appLifetime = appLifetime;
        }

        private async Task PrewarmEntityFramework()
        {
            try
            {
                using IServiceScope scope = _serviceProvider.CreateScope();
                DbContext?[] dbContexts = new DbContext?[]
                {
                    scope.ServiceProvider.GetService<ApplicationDbContext>(),
                    scope.ServiceProvider.GetService<EventStoreDbContext>(),
                    scope.ServiceProvider.GetService<DomainNotificationStoreDbContext>()
                };

                foreach (DbContext? dbContext in dbContexts.Where(x => x != null))
                {
                    Stopwatch sw = Stopwatch.StartNew();
                    _ = dbContext!.Model;
                    bool canConnect = await dbContext.Database.CanConnectAsync();
                    if (canConnect)
                    {
                        await dbContext.Database.ExecuteSqlRawAsync("SELECT 1");
                        _logger.LogInformation("{DbContext} warmed up in {Elapsed}ms",
                            dbContext.GetType().Name, sw.ElapsedMilliseconds);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to prewarm Entity Framework contexts");
            }
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _appLifetime.ApplicationStarted.Register(() =>
            {
                _ = Task.Run(async () =>
                {
                    await Task.Delay(2000, cancellationToken);
                    await PrewarmEntityFramework();
                }, cancellationToken);
            });

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
