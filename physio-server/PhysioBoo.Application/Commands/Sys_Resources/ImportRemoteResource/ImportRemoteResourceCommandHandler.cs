using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Sys_Resources.ImportRemoteResource
{
    public sealed class ImportRemoteResourceCommandHandler : CommandHandlerBase, IRequestHandler<ImportRemoteResourceCommand>
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IResourceExcelProcessor _resourceExcelProcessor;

        public ImportRemoteResourceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IHttpClientFactory httpClientFactory,
            IResourceExcelProcessor resourceExcelProcessor
        ) : base(bus, unitOfWork, notifications)
        {
            _httpClientFactory = httpClientFactory;
            _resourceExcelProcessor = resourceExcelProcessor;
        }

        public async Task Handle(ImportRemoteResourceCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string sheetId = ExtractSheetId(request.Url);
            if (string.IsNullOrEmpty(sheetId))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Link is invalid", ErrorCodes.InvalidValue));
                return;
            }

            string exportUrl = $"https://docs.google.com/spreadsheets/d/{sheetId}/export?format=xlsx";

            try
            {
                using HttpClient client = _httpClientFactory.CreateClient();
                byte[] fileBytes = await client.GetByteArrayAsync(exportUrl, ct);
                using MemoryStream stream = new MemoryStream(fileBytes);
                (int Inserted, int Updated) result = await _resourceExcelProcessor.ProcessAsync(stream, ct);

                request.Inserted = result.Inserted;
                request.Updated = result.Updated;
            }
            catch (Exception)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Error occurred while importing remote resource.",
                    ErrorCodes.CommitFailed)
                );
            }
        }

        private string ExtractSheetId(string url)
        {
            System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(url, @"/d/([a-zA-Z0-9-_]+)");
            return match.Success ? match.Groups[1].Value : string.Empty;
        }
    }
}
