using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Public.RequestAppointment
{
    public sealed class RequestPublicAppointmentCommandHandler : CommandHandlerBase, IRequestHandler<RequestPublicAppointmentCommand>
    {
        public const string LeadSource = "Website";
        // A repeat of the same request (same phone, same doctor) inside this window is accepted but not stored again.
        private static readonly TimeSpan DuplicateWindow = TimeSpan.FromMinutes(10);

        private readonly ILeadRepository _leadRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMedicalServiceRepository _medicalServiceRepository;

        public RequestPublicAppointmentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILeadRepository leadRepository,
            IDoctorRepository doctorRepository,
            IMedicalServiceRepository medicalServiceRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _leadRepository = leadRepository;
            _doctorRepository = doctorRepository;
            _medicalServiceRepository = medicalServiceRepository;
        }

        public async Task Handle(RequestPublicAppointmentCommand command, CancellationToken ct)
        {
            if (!await TestValidityAsync(command)) return;

            PublicAppointmentRequestViewModel r = command.Request;

            // Bots fill the hidden field; answer as if it worked so they learn nothing, but store nothing.
            if (!string.IsNullOrWhiteSpace(r.Website)) return;

            var doctor = await PublicDoctorScope.Doctors(_doctorRepository.GetAllNoTracking(), command.TenantId)
                .Where(d => d.Id == r.DoctorId)
                .Select(d => new { d.User!.Profile!.FirstName, d.User.Profile.MiddleName, d.User.Profile.LastName })
                .FirstOrDefaultAsync(ct);

            if (doctor is null)
            {
                await NotifyAsync(new DomainNotification(command.MessageType, "This doctor is not available for requests.", ErrorCodes.ObjectNotFound));
                return;
            }

            string doctorName = PublicText.FullName(doctor.FirstName, doctor.MiddleName, doctor.LastName);

            // The facility and service must be ones this doctor actually offers on the public site.
            List<PublicFacilityViewModel> facilities = await PublicDoctorFacilities.ForDoctorAsync(_doctorRepository, command.TenantId, r.DoctorId, ct);
            PublicFacilityViewModel? facility = r.FacilityId is Guid fid ? facilities.FirstOrDefault(f => f.Id == fid) : null;
            if (r.FacilityId is not null && facility is null || r.FacilityId is null && facilities.Count > 1)
            {
                await NotifyAsync(new DomainNotification(command.MessageType, "Choose the facility you want to visit.", ErrorCodes.InvalidValue));
                return;
            }
            facility ??= facilities.Count == 1 ? facilities[0] : null;

            // ServicesOf is tenant-scoped, so a service id from another tenant is never found.
            List<PublicRequestServiceOption> offered = await PublicDoctorScope
                .ServicesOf(_medicalServiceRepository.GetAllNoTracking(), command.TenantId, r.DoctorId)
                .Select(s => new PublicRequestServiceOption(s.Id, s.Name, s.HospitalId))
                .ToListAsync(ct);
            var (chosenService, serviceError) = PublicRequestService.Resolve(offered, r.ServiceId, PublicText.OrNull(r.Service), facility?.Id);
            if (serviceError == PublicRequestServiceError.NotOffered)
            {
                await NotifyAsync(new DomainNotification(command.MessageType, "Choose a service.", ErrorCodes.InvalidValue));
                return;
            }
            if (serviceError == PublicRequestServiceError.WrongFacility)
            {
                await NotifyAsync(new DomainNotification(command.MessageType, "This service isn't offered at the chosen facility. Choose another service or facility.", ErrorCodes.InvalidValue));
                return;
            }
            string? service = chosenService?.Name;

            string phone = r.Phone.Trim();
            string doctorTag = $"Doctor ID: {r.DoctorId}";
            DateTime since = TimeZoneHelper.GetLocalTimeNow() - DuplicateWindow;
            bool duplicate = await _leadRepository.GetAllNoTracking().IgnoreQueryFilters()
                .AnyAsync(l =>
                    l.TenantId == command.TenantId &&
                    l.DeletedAt == null &&
                    l.Source == LeadSource &&
                    l.Phone == phone &&
                    l.CreatedAt >= since &&
                    l.Notes != null && l.Notes.Contains(doctorTag), ct);
            if (duplicate) return;

            string notes = string.Join('\n', new[]
            {
                "Appointment request from the public website. Call back to agree a time; nothing is booked yet.",
                $"Doctor: {doctorName}",
                doctorTag,
                facility is null ? null : $"Facility: {facility.Name}",
                service is null ? null : $"Service: {service}",
            }.Where(l => l != null));

            Lead lead = new Lead(
                command.NewId,
                PublicText.OrNull(r.FullName)!,
                phone,
                PublicText.OrNull(r.Email) ?? string.Empty,
                service ?? $"Appointment with {doctorName}",
                LeadSource,
                LeadStatus.New,
                LeadPriority.Medium,
                null,
                notes
            );
            // Anonymous request: the tenant comes from the site, never from the caller.
            lead.SetTenantId(command.TenantId);

            SharedKernel.Results.DbResult<Guid> result = await _leadRepository.InsertAsync<Lead, Guid>(lead);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(command.MessageType, "We couldn't send your request.", ErrorCodes.CommitFailed));
            }
        }
    }
}
