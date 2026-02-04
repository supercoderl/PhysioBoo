using PhysioBoo.SharedKernel.Commands;
using System.Text.Json.Serialization;

namespace PhysioBoo.Application.Commands.Sys_Resources.ImportRemoteResource
{
    public sealed class ImportRemoteResourceCommand : CommandBase
    {
        private static readonly ImportRemoteResourceCommandValidation s_validation = new();

        public string Url { get; }

        [JsonIgnore]
        public int Inserted { get; set; }

        [JsonIgnore]
        public int Updated { get; set; }

        public ImportRemoteResourceCommand(string url) : base(Guid.NewGuid())
        {
            Url = url;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
