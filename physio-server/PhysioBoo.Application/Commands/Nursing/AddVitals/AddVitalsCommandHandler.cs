using PhysioBoo.Application.Queries.Nursing;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.AddVitals
{
    public sealed class AddVitalsCommandHandler : CommandHandlerBase, IRequestHandler<AddVitalsCommand>
    {
        private readonly IVitalSignRepository _vitalSignRepository;
        private readonly IClinicalAlertRepository _alertRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public AddVitalsCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IVitalSignRepository vitalSignRepository,
            IClinicalAlertRepository alertRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _vitalSignRepository = vitalSignRepository;
            _alertRepository = alertRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(AddVitalsCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _patientRepository.ExistsAsync(request.PatientId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with id {request.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            var input = request.Input;

            // The server decides what is abnormal; the client's flag is ignored.
            VitalThresholds.Result evaluation = VitalThresholds.Evaluate(
                input.BloodPressureSystolic,
                input.BloodPressureDiastolic,
                input.HeartRate,
                input.Temperature,
                input.RespiratoryRate,
                input.Spo2);

            VitalSign reading = new VitalSign(
                Guid.NewGuid(),
                request.PatientId,
                input.RecordedAt ?? TimeZoneHelper.GetLocalTimeNow(),
                _user.Name,
                input.BloodPressureSystolic,
                input.BloodPressureDiastolic,
                input.HeartRate,
                input.Temperature,
                input.RespiratoryRate,
                input.Spo2,
                evaluation.IsAbnormal
            );
            reading.SetTenantId(_user.GetTenantId());
            reading.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _vitalSignRepository.InsertAsync<VitalSign, Guid>(reading);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to record vitals: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            if (evaluation.IsAbnormal)
            {
                await ClinicalAlertRaiser.EnsureOpenAsync(
                    _alertRepository,
                    request.PatientId,
                    ClinicalAlertType.AbnormalVitals,
                    evaluation.IsCritical ? ClinicalAlertSeverity.Critical : ClinicalAlertSeverity.High,
                    $"Abnormal vitals: {evaluation.Summary}",
                    _user.GetTenantId(),
                    _user.GetUserId(),
                    cancellationToken);
            }

            request.Result = VitalsReadingViewModel.FromEntity(reading);
        }
    }
}
