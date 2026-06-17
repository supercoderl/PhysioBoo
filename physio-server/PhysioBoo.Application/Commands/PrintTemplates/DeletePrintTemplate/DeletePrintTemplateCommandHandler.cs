using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.PrintTemplates.DeletePrintTemplate
{
    public sealed class DeletePrintTemplateCommandHandler : CommandHandlerBase, IRequestHandler<DeletePrintTemplateCommand>
    {
        private readonly IPrintTemplateRepository _printTemplateRepository;

        public DeletePrintTemplateCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrintTemplateRepository printTemplateRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _printTemplateRepository = printTemplateRepository;
        }

        public async Task Handle(DeletePrintTemplateCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.System.PrintTemplate? printTemplate = await _printTemplateRepository.GetByIdAsync(request.Id);

            if (printTemplate == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Print template not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _printTemplateRepository.SoftDeleteSingle(
                printTemplate,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}