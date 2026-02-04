using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace PhysioBoo.Infrastructure.BackgroundJobs
{
    public sealed class CloudinaryCleanupJob : BackgroundService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryCleanupJob> _logger;

        public CloudinaryCleanupJob(
            Cloudinary cloudinary,
            ILogger<CloudinaryCleanupJob> logger
        )
        {
            _cloudinary = cloudinary;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Scanning trash bin images on Cloudinary...");
                    SearchResult searchResults = await _cloudinary.Search()
                        .Expression("tags=temporary AND created_at<1d")
                        .MaxResults(500).ExecuteAsync();

                    if (searchResults.Resources.Any())
                    {
                        List<string> publicIds = searchResults.Resources.Select(r => r.PublicId).ToList();
                        await _cloudinary.DeleteResourcesAsync(new DelResParams
                        {
                            PublicIds = publicIds
                        });

                        _logger.LogInformation($"Deleted {publicIds.Count} trash images.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred during the garbage collection process.");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
