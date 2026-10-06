using PhysioBoo.Application.ViewModels.InsuranceClaims;
using PhysioBoo.Domain.Entities.Finance;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.InsuranceClaims.CreateInsuranceClaim
{
    public sealed class CreateInsuranceClaimCommandHandler : CommandHandlerBase, IRequestHandler<CreateInsuranceClaimCommand>
    {
        private readonly IInsuranceClaimRepository _claimRepository;
        private readonly IInsuranceCompanyRepository _insuranceCompanyRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IBillRepository _billRepository;
        private readonly IUser _user;

        public CreateInsuranceClaimCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IInsuranceClaimRepository claimRepository,
            IInsuranceCompanyRepository insuranceCompanyRepository,
            IPatientRepository patientRepository,
            IBillRepository billRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _claimRepository = claimRepository;
            _insuranceCompanyRepository = insuranceCompanyRepository;
            _patientRepository = patientRepository;
            _billRepository = billRepository;
            _user = user;
        }

        public async Task Handle(CreateInsuranceClaimCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            CreateInsuranceClaimViewModel input = request.NewClaim;

            InsuranceCompany? provider = await _insuranceCompanyRepository.GetByIdAsync(input.ProviderId, ct: ct);
            if (provider == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Insurance provider with id {input.ProviderId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (input.PatientId.HasValue && !await _patientRepository.ExistsAsync(input.PatientId.Value, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Patient with id {input.PatientId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            if (input.BillId.HasValue && !await _billRepository.ExistsAsync(input.BillId.Value, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Bill with id {input.BillId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            InsuranceClaim claim = new InsuranceClaim(
                request.NewId,
                GenerateClaimNumber(),
                provider.Id,
                input.PatientId,
                input.PatientName.Trim(),
                input.BillId,
                input.PolicyNumber.Trim(),
                input.Diagnosis.Trim(),
                (input.Procedures ?? Array.Empty<string>()).Where(p => !string.IsNullOrWhiteSpace(p)).Select(p => p.Trim()).ToArray(),
                input.ClaimAmount,
                string.IsNullOrWhiteSpace(input.Hospital) ? null : input.Hospital.Trim(),
                string.IsNullOrWhiteSpace(input.Department) ? null : input.Department.Trim(),
                string.IsNullOrWhiteSpace(input.DoctorName) ? null : input.DoctorName.Trim(),
                Enum.Parse<InsuranceClaimPriority>(input.Priority, true)
            );

            claim.SetTenantId(_user.GetTenantId());
            claim.SetCreatedBy(_user.GetUserId());

            // One "Missing" slot per document the insurer requires; uploads fill these slots.
            List<InsuranceClaimDocument> documents = (provider.RequiredDocuments ?? Array.Empty<string>())
                .Where(d => !string.IsNullOrWhiteSpace(d))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Select(name =>
                {
                    InsuranceClaimDocument doc = new InsuranceClaimDocument(Guid.NewGuid(), claim.Id, name.Trim(), "ClaimForm", required: true);
                    doc.SetTenantId(_user.GetTenantId());
                    doc.SetCreatedBy(_user.GetUserId());
                    claim.Documents.Add(doc);
                    return doc;
                })
                .ToList();

            claim.RefreshDocumentStatus();

            SharedKernel.Results.DbResult<Guid> result = await _claimRepository.InsertAsync<InsuranceClaim, Guid>(claim);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            if (documents.Count > 0)
            {
                await _claimRepository.InsertBatchAsync(documents);
            }

            await _claimRepository.InsertBatchAsync(new[]
            {
                InsuranceClaimActivityFactory.Create(_user, claim.Id, InsuranceClaimActivityKind.Timeline, "Created"),
                InsuranceClaimActivityFactory.Create(_user, claim.Id, InsuranceClaimActivityKind.Audit, "Created", details: $"Claim {claim.ClaimNumber} created for {claim.ClaimAmount:N0}")
            });
        }

        private static string GenerateClaimNumber()
        {
            return $"CLM-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
        }
    }
}
