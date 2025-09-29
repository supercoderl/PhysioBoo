using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.DoctorPublications;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorPublications.CreateDoctorPublication
{
    public sealed class CreateDoctorPublicationCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorPublicationCommandValidation s_validation = new();

        public CreateDoctorPublicationViewModel NewDoctorPublication { get; }

        public CreateDoctorPublicationCommand(CreateDoctorPublicationViewModel newDoctorPublication) : base(Guid.NewGuid())
        {
            NewDoctorPublication = newDoctorPublication;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}