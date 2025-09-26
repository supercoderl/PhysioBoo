using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord
{
    public sealed class CreateMedicalRecordCommand : CommandBase, IRequest
    {
        private static readonly CreateMedicalRecordCommandValidation s_validation = new();

        public CreateMedicalRecordViewModel NewMedicalRecord { get; }
        public Guid UserId { get; }

        public CreateMedicalRecordCommand(CreateMedicalRecordViewModel newMedicalRecord, Guid userId) : base(Guid.NewGuid())
        {
            NewMedicalRecord = newMedicalRecord;
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
