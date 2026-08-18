using MediatR;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Appointments.CompleteConsultation
{
    public sealed class CompleteConsultationCommand : CommandBase, IRequest
    {
        private static readonly CompleteConsultationCommandValidation s_validation = new();

        public Guid Id { get; }
        public CompleteConsultationViewModel Consultation { get; }

        public CompleteConsultationCommand(
            Guid id,
            CompleteConsultationViewModel consultation
        ) : base(Guid.NewGuid())
        {
            Id = id;
            Consultation = consultation;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
