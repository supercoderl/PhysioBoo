using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.PrintTemplates.UpdatePrintTemplate
{
    public sealed class UpdatePrintTemplateCommandHandler : CommandHandlerBase, IRequestHandler<UpdatePrintTemplateCommand>
    {
        private readonly IPrintTemplateRepository _printTemplateRepository;

        public UpdatePrintTemplateCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrintTemplateRepository printTemplateRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _printTemplateRepository = printTemplateRepository;
        }

        public async Task Handle(UpdatePrintTemplateCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.System.PrintTemplate? printTemplate = await _printTemplateRepository.GetByIdAsync(request.Id);

            if (printTemplate == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Print template with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            printTemplate.SetName(request.PrintTemplate.Name);
            printTemplate.SetCode(request.PrintTemplate.Code);
            printTemplate.SetModule(request.PrintTemplate.Module);
            printTemplate.SetDocumentType(request.PrintTemplate.DocumentType);
            printTemplate.SetIsActive(request.PrintTemplate.IsActive);
            printTemplate.SetIsDefault(request.PrintTemplate.IsSystemDefault);

            await _printTemplateRepository.UpdateTrackedAsync(printTemplate, cancellationToken);
        }
    }
}