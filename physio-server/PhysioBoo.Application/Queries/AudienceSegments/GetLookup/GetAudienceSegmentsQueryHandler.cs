using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.AudienceSegments;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.AudienceSegments.GetLookup
{
    public sealed class GetAudienceSegmentsQueryHandler : IRequestHandler<GetAudienceSegmentsQuery, List<AudienceSegmentViewModel>>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly ILeadRepository _leadRepository;

        public GetAudienceSegmentsQueryHandler(
            IPatientRepository patientRepository,
            IMemberRepository memberRepository,
            ILeadRepository leadRepository
        )
        {
            _patientRepository = patientRepository;
            _memberRepository = memberRepository;
            _leadRepository = leadRepository;
        }

        public async Task<List<AudienceSegmentViewModel>> Handle(GetAudienceSegmentsQuery request, CancellationToken ct)
        {
            // Run one at a time: the repositories share a DbContext, which does not allow parallel queries.
            Dictionary<Guid, int> counts = new()
            {
                [AudienceSegmentCatalog.AllPatients] = await _patientRepository.GetAllNoTracking().CountAsync(ct),
                [AudienceSegmentCatalog.MarketingConsent] = await _patientRepository.GetAllNoTracking(p => p.ConsentForMarketing).CountAsync(ct),
                [AudienceSegmentCatalog.VipPatients] = await _patientRepository.GetAllNoTracking(p => p.IsVip).CountAsync(ct),
                [AudienceSegmentCatalog.SeniorCitizens] = await _patientRepository.GetAllNoTracking(p => p.IsSeniorCitizen).CountAsync(ct),
                [AudienceSegmentCatalog.ChronicPatients] = await _patientRepository.GetAllNoTracking(p => p.IsChronicPatient).CountAsync(ct),
                [AudienceSegmentCatalog.ActiveMembers] = await _memberRepository.GetAllNoTracking(m => m.Status == MemberStatus.Active).CountAsync(ct),
                [AudienceSegmentCatalog.OpenLeads] = await _leadRepository.GetAllNoTracking(l => l.Status != LeadStatus.Converted && l.Status != LeadStatus.Lost).CountAsync(ct),
            };

            return AudienceSegmentCatalog.Segments
                .Select(s => new AudienceSegmentViewModel(s.Id, s.Name, counts[s.Id], s.Criteria))
                .ToList();
        }
    }
}
