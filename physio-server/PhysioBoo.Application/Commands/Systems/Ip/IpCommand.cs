using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Systems.Ip
{
    public sealed class BlockIpCommand : CommandBase
    {
        private static readonly BlockIpCommandValidation s_validation = new();

        public string IpAddress { get; }
        public string Reason { get; }
        public int DurationMinutes { get; } = 1440; // Default to 1 day

        public BlockIpCommand(
            string ipAddress,
            string reason,
            int durationMinutes = 1440
        ) : base(Guid.NewGuid())
        {
            IpAddress = ipAddress;
            Reason = reason;
            DurationMinutes = durationMinutes;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }

    public sealed class UnblockIpCommand : CommandBase
    {
        private static readonly UnblockIpCommandValidation s_validation = new();

        public string IpAddress { get; set; }

        public UnblockIpCommand(
            string ipAddress
        ) : base(Guid.NewGuid())
        {
            IpAddress = ipAddress;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
