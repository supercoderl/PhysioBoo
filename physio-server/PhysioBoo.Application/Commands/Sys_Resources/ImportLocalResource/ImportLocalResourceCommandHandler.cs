using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Sys_Resources.ImportLocalResource
{
    public sealed class ImportLocalResourceCommandHandler : CommandHandlerBase, IRequestHandler<ImportLocalResourceCommand>
    {
        private readonly IResourceExcelProcessor _resourceExcelProcessor;

        public ImportLocalResourceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IResourceExcelProcessor resourceExcelProcessor
        ) : base(bus, unitOfWork, notifications)
        {
            _resourceExcelProcessor = resourceExcelProcessor;
        }

        public async Task Handle(ImportLocalResourceCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            using Stream stream = request.File.OpenReadStream();

            (int Inserted, int Updated) result = await _resourceExcelProcessor.ProcessAsync(stream, ct);

            request.Inserted = result.Inserted;
            request.Updated = result.Updated;
        }
    }
}
