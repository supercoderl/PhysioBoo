using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.InsuranceClaims.UploadInsuranceClaimDocument
{
    public sealed class UploadInsuranceClaimDocumentCommandHandler : CommandHandlerBase, IRequestHandler<UploadInsuranceClaimDocumentCommand>
    {
        private const string UploadFolder = "insurance-claims";

        private readonly IInsuranceClaimRepository _claimRepository;
        private readonly Cloudinary _cloudinary;
        private readonly IUser _user;

        public UploadInsuranceClaimDocumentCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInsuranceClaimRepository claimRepository,
            Cloudinary cloudinary,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _claimRepository = claimRepository;
            _cloudinary = cloudinary;
            _user = user;
        }

        public async Task Handle(UploadInsuranceClaimDocumentCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            InsuranceClaim? claim = await _claimRepository.GetByIdAsync(request.ClaimId, includeProperties: "Documents", ct: ct);
            if (claim == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Insurance claim with id {request.ClaimId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            (string? url, string? publicId, string? error) = await UploadAsync(request);
            if (url == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Upload failed: {error}", DomainErrorCodes.InsuranceClaim.UploadFailed));
                return;
            }

            string documentType = string.IsNullOrWhiteSpace(request.DocumentType) ? "PDF" : request.DocumentType.Trim();
            string fileName = Path.GetFileName(request.File.FileName);
            int sizeKb = (int)Math.Ceiling(request.File.Length / 1024.0);

            // Fill the matching required slot (by name), otherwise the next missing required slot,
            // otherwise store it as an extra supporting document.
            List<InsuranceClaimDocument> missingSlots = claim.Documents
                .Where(d => d.Required && d.Status == InsuranceClaimDocumentStatus.Missing)
                .OrderBy(d => d.CreatedAt)
                .ToList();

            InsuranceClaimDocument? document =
                missingSlots.FirstOrDefault(d => string.Equals(d.Name, documentType, StringComparison.OrdinalIgnoreCase))
                ?? missingSlots.FirstOrDefault();

            if (document == null)
            {
                document = new InsuranceClaimDocument(Guid.NewGuid(), claim.Id, fileName, documentType, required: false);
                document.SetTenantId(_user.GetTenantId());
                document.SetCreatedBy(_user.GetUserId());
                claim.Documents.Add(document);
            }

            document.MarkUploaded(fileName, url, publicId, sizeKb, _user.GetUserEmail(), DateTime.UtcNow);
            claim.RefreshDocumentStatus();

            claim.Activities.Add(InsuranceClaimActivityFactory.Create(
                _user,
                claim.Id,
                InsuranceClaimActivityKind.Audit,
                "DocumentUploaded",
                details: $"{fileName} ({sizeKb} KB) → {document.Name}"
            ));

            claim.SetUpdatedBy(_user.GetUserId());

            if (await CommitAsync())
            {
                request.DocumentId = document.Id;
            }
        }

        private async Task<(string? Url, string? PublicId, string? Error)> UploadAsync(UploadInsuranceClaimDocumentCommand request)
        {
            await using Stream stream = request.File.OpenReadStream();
            FileDescription file = new FileDescription(request.File.FileName, stream);

            // Cloudinary serves images and PDFs as "image" resources (previewable); anything else is raw.
            bool isPreviewable = request.File.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
                || string.Equals(request.File.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase);

            if (isPreviewable)
            {
                ImageUploadResult result = await _cloudinary.UploadAsync(new ImageUploadParams { File = file, Folder = UploadFolder });
                return (result.Error == null ? result.SecureUrl?.ToString() : null, result.PublicId, result.Error?.Message);
            }

            RawUploadResult raw = await _cloudinary.UploadAsync(new RawUploadParams { File = file, Folder = UploadFolder });
            return (raw.Error == null ? raw.SecureUrl?.ToString() : null, raw.PublicId, raw.Error?.Message);
        }
    }
}
