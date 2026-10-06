using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Complaints.CreateComplaint
{
    public sealed class CreateComplaintCommandHandler : CommandHandlerBase, IRequestHandler<CreateComplaintCommand>
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public CreateComplaintCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IComplaintRepository complaintRepository,
            IPatientRepository patientRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _complaintRepository = complaintRepository;
            _patientRepository = patientRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(CreateComplaintCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            // PatientId is validated as "empty or a Guid"; when present it must also be a real patient.
            Guid? patientId = string.IsNullOrWhiteSpace(request.NewComplaint.PatientId)
                ? null
                : Guid.Parse(request.NewComplaint.PatientId);

            if (patientId.HasValue && !await _patientRepository.ExistsAsync(patientId.Value, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with id {patientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string ticketNumber = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(Complaint), cancellationToken);

            Complaint newComplaint = new Complaint(
                request.NewId,
                ticketNumber,
                request.NewComplaint.PatientName.Trim(),
                patientId,
                request.NewComplaint.Email.Trim(),
                request.NewComplaint.Phone.Trim(),
                request.NewComplaint.Category,
                request.NewComplaint.Priority,
                request.NewComplaint.Subject.Trim(),
                request.NewComplaint.Description.Trim(),
                string.IsNullOrWhiteSpace(request.NewComplaint.AssignedTo) ? null : request.NewComplaint.AssignedTo.Trim()
            );

            newComplaint.SetTenantId(_user.GetTenantId());
            newComplaint.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _complaintRepository.InsertAsync<Complaint, Guid>(newComplaint);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create complaint: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
            }
        }
    }
}
