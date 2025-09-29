using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.LabReports.CreateLabReport
{
    public sealed class CreateLabReportCommandHandler : CommandHandlerBase, IRequestHandler<CreateLabReportCommand>
    {
        private readonly ILabReportRepository _labReportRepository;

        public CreateLabReportCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabReportRepository labReportRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labReportRepository = labReportRepository;
        }

        public async Task Handle(CreateLabReportCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _labReportRepository.InsertAsync<LabReport, Guid>(new LabReport(
                request.NewLabReport.Id,
                TextHelper.GenerateEntityNumber("REP"),
                request.NewLabReport.LabOrderId,
                request.NewLabReport.PatientId,
                request.NewLabReport.DoctorId,
                request.NewLabReport.PathologistId,
                request.NewLabReport.OverallImpression,
                request.NewLabReport.ClinicalCorrelation,
                request.NewLabReport.Recommendations,
                request.NewLabReport.CriticalValues,
                request.NewLabReport.PathologistSignature,
                request.NewLabReport.AmendmentReason,
                request.NewLabReport.OriginalReportId,
                request.NewLabReport.ReportPdfUrl,
                request.NewLabReport.DeliveredAt,
                request.NewLabReport.DeliveryMethod
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
