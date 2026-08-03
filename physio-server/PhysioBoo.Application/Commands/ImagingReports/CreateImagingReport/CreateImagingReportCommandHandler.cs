using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.ImagingReports.CreateImagingReport
{
    public sealed class CreateImagingReportCommandHandler : CommandHandlerBase, IRequestHandler<CreateImagingReportCommand>
    {
        private readonly IImagingReportRepository _imagingReportRepository;
        private readonly IUser _user;

        public CreateImagingReportCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingReportRepository imagingReportRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingReportRepository = imagingReportRepository;
            _user = user;
        }

        public async Task Handle(CreateImagingReportCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            ImagingReport newImagingReport = new ImagingReport(
                request.NewImagingReport.Id,
                TextHelper.GenerateEntityNumber("IR"),
                request.NewImagingReport.ImagingOrderId,
                request.NewImagingReport.PatientId,
                request.NewImagingReport.RadiologistId,
                request.NewImagingReport.Technique,
                request.NewImagingReport.Findings,
                request.NewImagingReport.Impression,
                request.NewImagingReport.Recommendations,
                request.NewImagingReport.ComparisonStudies,
                request.NewImagingReport.Limitations,
                request.NewImagingReport.CriticalFindings,
                request.NewImagingReport.AmendmentReason,
                request.NewImagingReport.DictatedAt,
                request.NewImagingReport.TranscribedAt,
                request.NewImagingReport.VerifiedAt,
                request.NewImagingReport.DicomStudyUid,
                request.NewImagingReport.ReportPdfUrl,
                request.NewImagingReport.ImagesUrl
            );

            newImagingReport.SetTenantId(_user.GetTenantId());
            newImagingReport.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _imagingReportRepository.InsertAsync<ImagingReport, Guid>(newImagingReport);

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
