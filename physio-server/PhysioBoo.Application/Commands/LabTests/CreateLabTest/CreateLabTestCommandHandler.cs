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
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;

        public CreateLabTestCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabTestRepository labTestRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestRepository = labTestRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
        }

        public async Task Handle(CreateLabTestCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(LabTest), cancellationToken);

            LabTest newLabTest = new LabTest(
                request.NewId,
                request.NewLabTest.TestName,
                newCode,
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
            );

            newLabTest.SetPreparationRequired(request.NewLabTest.PreparationRequired);
            newLabTest.SetFastingRequired(request.NewLabTest.FastingRequired);
            newLabTest.SetFastingHours(request.NewLabTest.FastingHours);
            newLabTest.SetReportingTimeHours(request.NewLabTest.ReportingTimeHours);
            newLabTest.SetCost(request.NewLabTest.Cost);
            newLabTest.SetIsProfile(request.NewLabTest.IsProfile);
            newLabTest.SetIsUrgentAvailable(request.NewLabTest.IsUrgentAvailable);
            newLabTest.SetUrgentCost(request.NewLabTest.UrgentCost);
            newLabTest.SetUrgentReportingTimeHours(request.NewLabTest.UrgentReportingTimeHours);
            newLabTest.SetIsHomeCollectionAvailable(request.NewLabTest.IsHomeCollectionAvailable);
            newLabTest.SetHomeCollectionCharge(request.NewLabTest.HomeCollectionCharge);
            newLabTest.SetRequiresAppoinment(request.NewLabTest.RequiresAppoinment);

            SharedKernel.Results.DbResult<Guid> result = await _labTestRepository.InsertAsync<LabTest, Guid>(newLabTest);

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
