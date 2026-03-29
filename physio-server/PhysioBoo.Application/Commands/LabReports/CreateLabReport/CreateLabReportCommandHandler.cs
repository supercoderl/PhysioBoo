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
        private readonly IUser _user;

        public CreateLabReportCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabReportRepository labReportRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _labReportRepository = labReportRepository;
            _user = user;
        }

        public async Task Handle(CreateLabReportCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            LabReport newLabReport = new LabReport(
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
            );

            newLabReport.SetTenantId(_user.GetTenantId());
            newLabReport.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _labReportRepository.InsertAsync<LabReport, Guid>(newLabReport);

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
