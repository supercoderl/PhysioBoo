using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Application.Commands.Public.RequestAppointment
{
    /// <summary>
    /// An anonymous visitor asks the clinic to call back about an appointment with a doctor.
    /// It becomes a CRM lead (source "Website"); it is not a booked appointment.
    /// </summary>
    public sealed class RequestPublicAppointmentCommand : CommandBase, IRequest
    {
        private static readonly RequestPublicAppointmentCommandValidation s_validation = new();

        public Guid NewId { get; }
        public Guid TenantId { get; }
        public PublicAppointmentRequestViewModel Request { get; }

        public RequestPublicAppointmentCommand(Guid newId, Guid tenantId, PublicAppointmentRequestViewModel request) : base(Guid.NewGuid())
        {
            NewId = newId;
            TenantId = tenantId;
            Request = request;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
