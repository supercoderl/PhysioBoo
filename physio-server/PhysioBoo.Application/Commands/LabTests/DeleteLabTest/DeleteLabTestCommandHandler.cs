using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabTests.DeleteLabTest.Commands.DeleteLabTestCommand
{
    public sealed class DeleteLabTestCommandHandler : CommandHandlerBase, IRequestHandler<DeleteLabTestCommand>
    {
        private readonly ILabTestRepository _labTestRepository;

        public DeleteLabTestCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabTestRepository labTestRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestRepository = labTestRepository;
        }

        public async Task Handle(DeleteLabTestCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.LaboratoryImaging.LabTest? labTest = await _labTestRepository.GetByIdAsync(request.Id);

            if (labTest == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Lab test not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _labTestRepository.SoftDeleteSingle(
                labTest,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}