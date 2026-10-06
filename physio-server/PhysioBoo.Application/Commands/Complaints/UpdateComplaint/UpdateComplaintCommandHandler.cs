using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Complaints.UpdateComplaint
{
    public sealed class UpdateComplaintCommandHandler : CommandHandlerBase, IRequestHandler<UpdateComplaintCommand>
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public UpdateComplaintCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IComplaintRepository complaintRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _complaintRepository = complaintRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(UpdateComplaintCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Crm.Complaint? complaint = await _complaintRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (complaint == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Complaint with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            Guid? patientId = string.IsNullOrWhiteSpace(request.Complaint.PatientId)
                ? null
                : Guid.Parse(request.Complaint.PatientId);

            if (patientId.HasValue && !await _patientRepository.ExistsAsync(patientId.Value, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with id {patientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            complaint.SetPatientName(request.Complaint.PatientName.Trim());
            complaint.SetPatientId(patientId);
            complaint.SetEmail(request.Complaint.Email.Trim());
            complaint.SetPhone(request.Complaint.Phone.Trim());
            complaint.SetCategory(request.Complaint.Category);
            complaint.SetPriority(request.Complaint.Priority);
            complaint.SetSubject(request.Complaint.Subject.Trim());
            complaint.SetDescription(request.Complaint.Description.Trim());
            complaint.SetAssignedTo(string.IsNullOrWhiteSpace(request.Complaint.AssignedTo) ? null : request.Complaint.AssignedTo.Trim());

            ApplyStatus(complaint, request.Complaint.Status);

            complaint.SetUpdatedBy(_user.GetUserId());

            await _complaintRepository.UpdateTrackedAsync(complaint, cancellationToken);
        }

        // ResolvedAt is stamped the first time a ticket reaches Resolved/Closed and cleared if it is reopened.
        private static void ApplyStatus(Domain.Entities.Crm.Complaint complaint, ComplaintStatus status)
        {
            complaint.SetStatus(status);

            bool isDone = status is ComplaintStatus.Resolved or ComplaintStatus.Closed;
            if (isDone && complaint.ResolvedAt == null)
            {
                complaint.SetResolvedAt(TimeZoneHelper.GetLocalTimeNow());
            }
            else if (!isDone)
            {
                complaint.SetResolvedAt(null);
            }
        }
    }
}
