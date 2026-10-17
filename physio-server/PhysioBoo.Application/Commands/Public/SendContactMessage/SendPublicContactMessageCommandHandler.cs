using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Commands.Public.RequestAppointment;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Application.Queries.Public.Hospitals;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Public.SendContactMessage
{
    public sealed class SendPublicContactMessageCommandHandler : CommandHandlerBase, IRequestHandler<SendPublicContactMessageCommand>
    {
        public const string UnknownClinic = "Choose a clinic from the list, or leave it as No preference.";
        // A repeat of the same message (same phone, same text) inside this window is accepted but not stored again.
        private static readonly TimeSpan DuplicateWindow = TimeSpan.FromMinutes(10);

        private readonly ILeadRepository _leadRepository;
        private readonly IHospitalRepository _hospitalRepository;

        public SendPublicContactMessageCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILeadRepository leadRepository,
            IHospitalRepository hospitalRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _leadRepository = leadRepository;
            _hospitalRepository = hospitalRepository;
        }

        public async Task Handle(SendPublicContactMessageCommand command, CancellationToken ct)
        {
            if (!await TestValidityAsync(command)) return;

            PublicContactMessageViewModel m = command.Message;

            // Bots fill the hidden field; answer as if it worked so they learn nothing, but store nothing.
            if (!string.IsNullOrWhiteSpace(m.Website)) return;

            // Only a clinic the public site lists can be chosen; ids from other tenants are never found.
            string? clinic = null;
            if (m.ClinicId is Guid clinicId)
            {
                clinic = await PublicHospitalScope.Hospitals(_hospitalRepository.GetAllNoTracking(), command.TenantId)
                    .Where(h => h.Id == clinicId)
                    .Select(h => h.Name)
                    .FirstOrDefaultAsync(ct);
                if (clinic is null)
                {
                    await NotifyAsync(new DomainNotification(command.MessageType, UnknownClinic, ErrorCodes.InvalidValue));
                    return;
                }
            }

            string? topic = string.IsNullOrEmpty(m.Topic) ? null : PublicContactTopics.Labels[m.Topic];
            string notes = BuildNotes(topic, clinic, m.ClinicId, m.Message.Trim());

            string phone = m.Phone.Trim();
            DateTime since = TimeZoneHelper.GetLocalTimeNow() - DuplicateWindow;
            bool duplicate = await _leadRepository.GetAllNoTracking().IgnoreQueryFilters()
                .AnyAsync(l =>
                    l.TenantId == command.TenantId &&
                    l.DeletedAt == null &&
                    l.Source == RequestPublicAppointmentCommandHandler.LeadSource &&
                    l.Phone == phone &&
                    l.CreatedAt >= since &&
                    l.Notes == notes, ct);
            if (duplicate) return;

            Lead lead = new Lead(
                command.NewId,
                PublicText.OrNull(m.FullName)!,
                phone,
                PublicText.OrNull(m.Email) ?? string.Empty,
                ServiceLabel(topic),
                RequestPublicAppointmentCommandHandler.LeadSource,
                LeadStatus.New,
                m.Topic == "complaint" ? LeadPriority.High : LeadPriority.Medium,
                null,
                notes
            );
            // Anonymous message: the tenant comes from the site, never from the caller.
            lead.SetTenantId(command.TenantId);

            SharedKernel.Results.DbResult<Guid> result = await _leadRepository.InsertAsync<Lead, Guid>(lead);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(command.MessageType, "We couldn't send your message.", ErrorCodes.CommitFailed));
            }
        }

        /// <summary>The lead's service column (64 characters) names where it came from and the topic.</summary>
        public static string ServiceLabel(string? topic) => topic is null ? "Contact form" : $"Contact form: {topic}";

        /// <summary>Topic and clinic go on their own lines above the visitor's text, so staff can read them at a glance.</summary>
        public static string BuildNotes(string? topic, string? clinic, Guid? clinicId, string message)
        {
            string header = string.Join('\n', new[]
            {
                "Message from the contact form on the public website.",
                topic is null ? null : $"Topic: {topic}",
                clinic is null ? null : $"Clinic: {clinic}",
                clinicId is null || clinic is null ? null : $"Clinic ID: {clinicId}",
            }.Where(l => l != null));

            // The lead's notes hold 2,000 characters; a very long clinic name shortens the header, never the message.
            int room = 2000 - message.Length - 2;
            if (header.Length > room) header = header[..Math.Max(0, room)];
            return header + "\n\n" + message;
        }
    }
}
