using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.ApproveRadiologyReport
{
    public sealed class ApproveRadiologyReportCommandHandler : CommandHandlerBase, IRequestHandler<ApproveRadiologyReportCommand>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IRadiologyAlertRepository _radiologyAlertRepository;
        private readonly IUser _user;

        public ApproveRadiologyReportCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingOrderRepository imagingOrderRepository,
            IRadiologyAlertRepository radiologyAlertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _radiologyAlertRepository = radiologyAlertRepository;
            _user = user;
        }

        public async Task Handle(ApproveRadiologyReportCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ImagingOrder? order = await _imagingOrderRepository.GetAll(o => o.Id == request.Id, includeProperties: "ImagingReports,Patient.Profile").AsTracking().FirstOrDefaultAsync(cancellationToken);
            if (order == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Imaging order with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            ImagingReport? report = order.ImagingReports.OrderByDescending(r => r.CreatedAt).FirstOrDefault();
            if (report == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "No report has been written for this order yet.",
                    DomainErrorCodes.RadiologyWorkspace.NoReport
                ));
                return;
            }

            if (string.IsNullOrWhiteSpace(report.Findings) || string.IsNullOrWhiteSpace(report.Impression))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Findings and impression are required before the report can be approved.",
                    DomainErrorCodes.RadiologyWorkspace.ReportIncomplete
                ));
                return;
            }

            if (report.WorkflowStatus is RadiologyReportStatus.Verified or RadiologyReportStatus.Released) return;

            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            report.Approve(_user.GetUserId(), now);
            report.SetUpdatedBy(_user.GetUserId());

            if (report.IsCritical)
            {
                RadiologyAlert alert = new RadiologyAlert(
                    Guid.NewGuid(),
                    RadiologyAlertType.CriticalFinding,
                    RadiologyAlertSeverity.Critical,
                    $"Critical finding on {order.OrderNumber}: {report.Impression}".Trim(),
                    order.Id,
                    order.Patient?.Profile?.FullName,
                    order.OrderNumber,
                    now
                );
                alert.SetTenantId(_user.GetTenantId());
                alert.SetCreatedBy(_user.GetUserId());
                await _radiologyAlertRepository.InsertAsync<RadiologyAlert, Guid>(alert);
            }

            await CommitAsync();
        }
    }
}
