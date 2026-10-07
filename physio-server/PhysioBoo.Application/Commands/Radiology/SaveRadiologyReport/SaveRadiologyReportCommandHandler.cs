using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.SaveRadiologyReport
{
    public sealed class SaveRadiologyReportCommandHandler : CommandHandlerBase, IRequestHandler<SaveRadiologyReportCommand>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IImagingReportRepository _imagingReportRepository;
        private readonly IUser _user;

        public SaveRadiologyReportCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingOrderRepository imagingOrderRepository,
            IImagingReportRepository imagingReportRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _imagingReportRepository = imagingReportRepository;
            _user = user;
        }

        public async Task Handle(SaveRadiologyReportCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ImagingOrder? order = await _imagingOrderRepository.GetAll(o => o.Id == request.Id, includeProperties: "ImagingReports").AsTracking().FirstOrDefaultAsync(cancellationToken);
            if (order == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Imaging order with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (order.IsCancelled)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This imaging order is cancelled.",
                    DomainErrorCodes.RadiologyWorkspace.OrderCancelled
                ));
                return;
            }

            if (!order.IsImagingDone)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Imaging for this order is not completed yet.",
                    DomainErrorCodes.RadiologyWorkspace.ImagingNotCompleted
                ));
                return;
            }

            ViewModels.Radiology.SaveRadiologyReportViewModel vm = request.Body;
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            ImagingReport? report = order.ImagingReports.OrderByDescending(r => r.CreatedAt).FirstOrDefault();

            if (report == null)
            {
                report = new ImagingReport(
                    Guid.NewGuid(),
                    $"RPT-{order.OrderNumber}",
                    order.Id,
                    order.PatientId,
                    _user.GetUserId(),
                    vm.Technique?.Trim(),
                    vm.Findings?.Trim(),
                    vm.Impression?.Trim(),
                    vm.Recommendations?.Trim(),
                    null, null, null, null, null, null, null, null, null, null
                );
                report.SetClinicalIndication(vm.ClinicalIndication?.Trim() ?? order.ClinicalIndication);
                report.SaveDraft(_user.GetUserId(), vm.IsCritical ?? false, now);
                report.SetTenantId(_user.GetTenantId());
                report.SetCreatedBy(_user.GetUserId());

                SharedKernel.Results.DbResult<Guid> inserted = await _imagingReportRepository.InsertAsync<ImagingReport, Guid>(report);
                if (!inserted.Success)
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Failed to save the report: {inserted.Error}",
                        ErrorCodes.CommitFailed
                    ));
                }
                return;
            }

            if (report.WorkflowStatus is RadiologyReportStatus.Verified or RadiologyReportStatus.Released)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This report is already verified and can no longer be edited.",
                    DomainErrorCodes.RadiologyWorkspace.ReportAlreadyVerified
                ));
                return;
            }

            // Null fields are left unchanged (the editor auto-saves the whole form).
            if (vm.ClinicalIndication != null) report.SetClinicalIndication(vm.ClinicalIndication.Trim());
            if (vm.Technique != null) report.SetTechnique(vm.Technique.Trim());
            if (vm.Findings != null) report.SetFindings(vm.Findings.Trim());
            if (vm.Impression != null) report.SetImpression(vm.Impression.Trim());
            if (vm.Recommendations != null) report.SetRecommendations(vm.Recommendations.Trim());
            report.SaveDraft(_user.GetUserId(), vm.IsCritical ?? report.IsCritical, now);
            report.SetUpdatedBy(_user.GetUserId());

            await CommitAsync();
        }
    }
}
