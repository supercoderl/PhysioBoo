using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabTests.UpdateLabTest.Commands.UpdateLabTestCommand
{
    public sealed class UpdateLabTestCommandHandler : CommandHandlerBase, IRequestHandler<UpdateLabTestCommand>
    {
        private readonly ILabTestRepository _labTestRepository;

        public UpdateLabTestCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabTestRepository labTestRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestRepository = labTestRepository;
        }

        public async Task Handle(UpdateLabTestCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.LaboratoryImaging.LabTest? labTest = await _labTestRepository.GetByIdAsync(request.Id);

            if (labTest == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lab test with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            labTest.SetTestName(request.LabTest.TestName);
            labTest.SetCategoryId(request.LabTest.CategoryId);
            labTest.SetDescription(request.LabTest.Description);
            labTest.SetSampleType(request.LabTest.SampleType);
            labTest.SetSampleVolume(request.LabTest.SampleVolume);
            labTest.SetCollectionInstructions(request.LabTest.CollectionInstructions);
            labTest.SetPreparationRequired(request.LabTest.PreparationRequired);
            labTest.SetPreparationInstructions(request.LabTest.PreparationInstructions);
            labTest.SetFastingRequired(request.LabTest.FastingRequired);
            labTest.SetFastingHours(request.LabTest.FastingHours);
            labTest.SetNormalRangeMale(request.LabTest.NormalRangeMale);
            labTest.SetNormalRangeFemale(request.LabTest.NormalRangeFemale);
            labTest.SetNormalPediatric(request.LabTest.NormalPediatric);
            labTest.SetUnitOfMeasurement(request.LabTest.UnitOfMeasurement);
            labTest.SetMethodology(request.LabTest.Methodology);
            labTest.SetReportingTimeHours(request.LabTest.ReportingTimeHours);
            labTest.SetCost(request.LabTest.Cost);
            labTest.SetIsProfile(request.LabTest.IsProfile);
            labTest.SetIsUrgentAvailable(request.LabTest.IsUrgentAvailable);
            labTest.SetUrgentCost(request.LabTest.UrgentCost);
            labTest.SetUrgentReportingTimeHours(request.LabTest.UrgentReportingTimeHours);
            labTest.SetIsHomeCollectionAvailable(request.LabTest.IsHomeCollectionAvailable);
            labTest.SetHomeCollectionCharge(request.LabTest.HomeCollectionCharge);
            labTest.SetRequiresAppoinment(request.LabTest.RequiresAppoinment);
            labTest.SetIsActive(request.LabTest.IsActive);

            await _labTestRepository.UpdateTrackedAsync(labTest, cancellationToken);
        }
    }
}