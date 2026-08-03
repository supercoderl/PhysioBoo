using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.PrintTemplates.SaveVersionPrintTemplate
{
    public sealed class SaveVersionPrintTemplateCommandHandler : CommandHandlerBase, IRequestHandler<SaveVersionPrintTemplateCommand>
    {
        private readonly IPrintTemplateVersionRepository _printTemplateVersionRepository;

        public SaveVersionPrintTemplateCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrintTemplateVersionRepository printTemplateVersionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _printTemplateVersionRepository = printTemplateVersionRepository;
        }

        public async Task Handle(SaveVersionPrintTemplateCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.System.PrintTemplateVersion? printTemplateVersion = await _printTemplateVersionRepository.GetByTemplateIdAsync(request.Id, ct);

            if (printTemplateVersion == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Print template version with template id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            printTemplateVersion.SetHeaderHtml(request.PrintTemplateVersion.HeaderHtml);
            printTemplateVersion.SetBodyHtml(request.PrintTemplateVersion.BodyHtml);
            printTemplateVersion.SetFooterHtml(request.PrintTemplateVersion.FooterHtml);
            printTemplateVersion.SetCustomCss(request.PrintTemplateVersion.CustomCss);
            printTemplateVersion.SetPaperSize(request.PrintTemplateVersion.PaperSize);
            printTemplateVersion.SetOrientation(request.PrintTemplateVersion.Orientation);
            printTemplateVersion.SetVersionNumber(request.PrintTemplateVersion.VersionNumber);

            await _printTemplateVersionRepository.UpdateTrackedAsync(printTemplateVersion, ct);
        }
    }
}