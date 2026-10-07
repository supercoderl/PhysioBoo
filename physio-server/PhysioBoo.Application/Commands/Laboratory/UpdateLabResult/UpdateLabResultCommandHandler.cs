using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.UpdateLabResult
{
    public sealed class UpdateLabResultCommandHandler : CommandHandlerBase, IRequestHandler<UpdateLabResultCommand>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly ILabAlertRepository _labAlertRepository;
        private readonly IUser _user;

        public UpdateLabResultCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabOrderItemRepository labOrderItemRepository,
            ILabAlertRepository labAlertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _labOrderItemRepository = labOrderItemRepository;
            _labAlertRepository = labAlertRepository;
            _user = user;
        }

        public async Task Handle(UpdateLabResultCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            LabOrderItem? item = await LabWorkflow.LoadItemAsync(_labOrderItemRepository, request.Id, cancellationToken);
            if (item == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lab test with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (item.SampleStatus == LabSampleStatus.Rejected)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "The sample was rejected. Request a recollection before entering a result.",
                    DomainErrorCodes.LabWorkspace.SampleRejected
                ));
                return;
            }

            string value = request.Body.Value!.Trim();
            string? referenceRange = Queries.Laboratory.LabWorkspace.ReferenceRange(item);
            (string flag, bool critical) = Queries.Laboratory.LabWorkspace.Flag(value, referenceRange);
            bool wasCritical = item.CritialFlag;

            // Keep the range and unit used for this result on the row, so later test edits don't change it.
            item.SetReferenceRange(referenceRange);
            if (item.ResultUnit == null) item.SetResultUnit(item.LabTest?.UnitOfMeasurement);
            item.EnterResult(value, request.Body.Comments?.Trim(), flag, critical, _user.GetUserId(), TimeZoneHelper.GetLocalTimeNow());

            if (critical && !wasCritical)
            {
                await LabWorkflow.RaiseAlertAsync(
                    _labAlertRepository, _user, item,
                    LabAlertType.PanicValue, LabAlertSeverity.Critical,
                    $"Panic value for {item.TestName}: {value} {item.ResultUnit} (ref {referenceRange})".Trim(),
                    "Repeat the test to confirm, then call the ordering doctor and record the read-back.");
            }

            item.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
