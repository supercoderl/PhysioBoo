using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabTests.CreateLabTest
{
    public sealed class CreateLabTestCommandHandler : CommandHandlerBase, IRequestHandler<CreateLabTestCommand>
    {
        private readonly ILabTestRepository _labTestRepository;

        public CreateLabTestCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabTestRepository labTestRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestRepository = labTestRepository;
        }

        public async Task Handle(CreateLabTestCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _labTestRepository.InsertAsync<LabTest, Guid>(new LabTest(
                request.NewLabTest.Id,
                request.NewLabTest.TestName,
                request.NewLabTest.TestCode,
                request.NewLabTest.CategoryId,
                request.NewLabTest.Description,
                request.NewLabTest.SampleType,
                request.NewLabTest.SampleVolume,
                request.NewLabTest.CollectionInstructions,
                request.NewLabTest.PreparationInstructions,
                request.NewLabTest.NormalRangeMale,
                request.NewLabTest.NormalRangeFemale,
                request.NewLabTest.NormalPediatric,
                request.NewLabTest.UnitOfMeasurement,
                request.NewLabTest.Methodology
            ));

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
