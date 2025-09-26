using MediatR;
using PhysioBoo.Application.ViewModels.Prescriptions;
using PhysioBoo.SharedKernel.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhysioBoo.Application.Commands.Prescriptions.CreatePrescription
{
    public sealed class CreatePrescriptionCommand : CommandBase, IRequest
    {
        private static readonly CreatePrescriptionCommandValidation s_validation = new();

        public CreatePrescriptionViewModel NewPrescription { get; }

        public CreatePrescriptionCommand(CreatePrescriptionViewModel newPrescription) : base(Guid.NewGuid())
        {
            NewPrescription = newPrescription;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
