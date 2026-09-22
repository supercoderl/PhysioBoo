namespace PhysioBoo.Application.Commands.MedicalServices.DeleteMedicalService
{
    public sealed class DeleteMedicalServiceCommand : CommandBase, IRequest
    {
        private static readonly DeleteMedicalServiceCommandValidation s_validation = new();

        public List<Guid> Ids { get; }

        public DeleteMedicalServiceCommand(List<Guid> ids) : base(Guid.NewGuid())
        {
            Ids = ids;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
