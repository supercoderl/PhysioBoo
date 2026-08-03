using MediatR;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.PrintTemplates.CreatePrintTemplate
{
    public sealed class CreatePrintTemplateCommandHandler : CommandHandlerBase, IRequestHandler<CreatePrintTemplateCommand>
    {
        private readonly IPrintTemplateRepository _printTemplateRepository;
        private readonly IPrintTemplateVersionRepository _printTemplateVersionRepository;

        public CreatePrintTemplateCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrintTemplateRepository printTemplateRepository,
            IPrintTemplateVersionRepository printTemplateVersionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _printTemplateRepository = printTemplateRepository;
            _printTemplateVersionRepository = printTemplateVersionRepository;
        }

        public async Task Handle(CreatePrintTemplateCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid newVersionId = Guid.NewGuid();

            PrintTemplate printTemplate = new PrintTemplate(
                request.NewId,
                request.NewPrintTemplate.Name,
                request.NewPrintTemplate.Code,
                request.NewPrintTemplate.Module,
                request.NewPrintTemplate.DocumentType,
                null
            );

            PrintTemplateVersion printTemplateVersion = new PrintTemplateVersion(
                newVersionId,
                request.NewId,
                request.NewPrintTemplate.Version.VersionNumber,
                request.NewPrintTemplate.Version.PaperSize,
                request.NewPrintTemplate.Version.Orientation,
                request.NewPrintTemplate.Version.HeaderHtml,
                request.NewPrintTemplate.Version.BodyHtml,
                request.NewPrintTemplate.Version.FooterHtml,
                request.NewPrintTemplate.Version.CustomCss
            );

            SharedKernel.Results.DbResult<Guid> result = await _printTemplateRepository.InsertTemplateWithVersion(printTemplate, printTemplateVersion, ct);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }
        }
    }
}