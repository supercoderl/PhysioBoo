using Microsoft.AspNetCore.Http;
using PhysioBoo.SharedKernel.Commands;
using System.Text.Json.Serialization;

namespace PhysioBoo.Application.Commands.Sys_Resources.ImportLocalResource
{
    public sealed class ImportLocalResourceCommand : CommandBase
    {
        private static readonly ImportLocalResourceCommandValidation s_validation = new();

        public IFormFile File { get; set; }

        [JsonIgnore]
        public int Inserted { get; set; }

        [JsonIgnore]
        public int Updated { get; set; }

        public ImportLocalResourceCommand(
            IFormFile file
        ) : base(Guid.NewGuid())
        {
            File = file;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
