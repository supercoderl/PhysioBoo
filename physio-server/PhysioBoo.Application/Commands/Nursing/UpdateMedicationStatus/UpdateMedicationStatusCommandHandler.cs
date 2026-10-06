using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Nursing.UpdateMedicationStatus
{
    public sealed class UpdateMedicationStatusCommandHandler : CommandHandlerBase, IRequestHandler<UpdateMedicationStatusCommand>
    {
        private readonly IMedicationAdministrationRepository _medicationRepository;
        private readonly IUser _user;

        public UpdateMedicationStatusCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicationAdministrationRepository medicationRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _medicationRepository = medicationRepository;
            _user = user;
        }

        public async Task Handle(UpdateMedicationStatusCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            MedicationAdministration? entry = await _medicationRepository.GetByIdAsync(request.EntryId, ct: cancellationToken);
            if (entry == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Medication entry with id {request.EntryId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            AdministrationStatus status = Enum.Parse<AdministrationStatus>(request.Input.Status, true);
            bool given = status == AdministrationStatus.Given;
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateTime? administeredAt = given ? now : null;
            string? administeredBy = given ? _user.Name : null;
            string? notes = FirstNonEmpty(request.Input.Reason, request.Input.Notes);
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = now;

            // Only an open dose (scheduled, or held earlier) can be recorded, so two nurses cannot both give it.
            int updated = await _medicationRepository.BatchUpdateMultipleAsync(
                m => m.Id == request.EntryId && (m.Status == AdministrationStatus.Scheduled || m.Status == AdministrationStatus.Held),
                s => s
                    .SetProperty(m => m.Status, status)
                    .SetProperty(m => m.AdministeredAt, administeredAt)
                    .SetProperty(m => m.AdministeredByName, administeredBy)
                    .SetProperty(m => m.Notes, notes)
                    .SetProperty(m => m.UpdatedBy, userId)
                    .SetProperty(m => m.UpdatedAt, updatedAt),
                cancellationToken
            );

            if (updated == 0)
            {
                string who = string.IsNullOrWhiteSpace(entry.AdministeredByName) ? "another user" : entry.AdministeredByName;
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"This dose has already been recorded by {who}.",
                    DomainErrorCodes.Nursing.DoseAlreadyRecorded
                ));
                return;
            }

            entry.SetStatus(status);
            entry.SetAdministeredAt(administeredAt);
            entry.SetAdministeredByName(administeredBy);
            entry.SetNotes(notes);
            request.Result = entry;
        }

        private static string? FirstNonEmpty(params string?[] values)
        {
            string? value = values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v));
            return value?.Trim();
        }
    }
}
