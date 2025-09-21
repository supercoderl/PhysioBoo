using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Interfaces
{
    public interface IVerificationService
    {
        public Task SendAsync(
            Guid userId,
            string? email,
            VerificationType? type,
            CancellationToken cancellationToken
        );
    }
}
