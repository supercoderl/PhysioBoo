using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.ReturnRadiologyReportForRevision
{
    public sealed class ReturnRadiologyReportForRevisionCommandHandler : CommandHandlerBase, IRequestHandler<ReturnRadiologyReportForRevisionCommand>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IUser _user;

        public ReturnRadiologyReportForRevisionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingOrderRepository imagingOrderRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _user = user;
        }

        public async Task Handle(ReturnRadiologyReportForRevisionCommand request, CancellationToken cancellationToken)
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

            if (report.WorkflowStatus is RadiologyReportStatus.Verified or RadiologyReportStatus.Released)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This report is already verified.",
                    DomainErrorCodes.RadiologyWorkspace.ReportAlreadyVerified
                ));
                return;
            }

            report.ReturnForRevision(request.Body.Reason!.Trim());
            report.SetUpdatedBy(_user.GetUserId());

            await CommitAsync();
        }
    }
}
