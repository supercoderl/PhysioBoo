using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.DeletePrescriptionTemplate
{
    public sealed class DeletePrescriptionTemplateCommandHandler : CommandHandlerBase, IRequestHandler<DeletePrescriptionTemplateCommand>
    {
        private readonly IPrescriptionTemplateRepository _templateRepository;

        public DeletePrescriptionTemplateCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionTemplateRepository templateRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _templateRepository = templateRepository;
        }

        public async Task Handle(DeletePrescriptionTemplateCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            PrescriptionTemplate? template = await _templateRepository.GetByIdAsync(request.Id, ct: ct);
            if (template == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Prescription template with id {request.Id} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            _templateRepository.SoftDeleteSingle(template, false, ct);
            await CommitAsync();
        }
    }
}
