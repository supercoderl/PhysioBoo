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

        public CreateImagingReportCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingReportRepository imagingReportRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingReportRepository = imagingReportRepository;
        }

        public async Task Handle(CreateImagingReportCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _imagingReportRepository.InsertAsync<ImagingReport, Guid>(new ImagingReport(
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
