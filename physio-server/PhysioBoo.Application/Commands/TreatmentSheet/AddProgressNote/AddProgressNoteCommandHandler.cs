using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.TreatmentSheet.AddProgressNote
{
    public sealed class AddProgressNoteCommandHandler : CommandHandlerBase, IRequestHandler<AddProgressNoteCommand>
    {
        private readonly IClinicalNoteRepository _noteRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public AddProgressNoteCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IClinicalNoteRepository noteRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _noteRepository = noteRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(AddProgressNoteCommand request, CancellationToken cancellationToken)
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

            ClinicalNote note = new ClinicalNote(
                Guid.NewGuid(),
                request.PatientId,
                Enum.Parse<ClinicalNoteType>(request.Input.Type, true),
                request.Input.Content.Trim(),
                _user.Name
            );
            note.SetTenantId(_user.GetTenantId());
            note.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _noteRepository.InsertAsync<ClinicalNote, Guid>(note);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to add the note: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = TreatmentProgressNoteViewModel.FromEntity(note);
        }
    }
}
