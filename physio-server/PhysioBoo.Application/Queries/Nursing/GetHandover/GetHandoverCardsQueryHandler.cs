using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Admissions;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Nursing.GetHandover
{
    // Cards are created by GenerateHandoverCardsCommand; this only reads them.
    public sealed class GetHandoverCardsQueryHandler : IRequestHandler<GetHandoverCardsQuery, List<ShiftHandoverCardViewModel>>
    {
        private readonly IHandoverCardRepository _handoverCardRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;

        public GetHandoverCardsQueryHandler(
            IHandoverCardRepository handoverCardRepository,
            IBedAssignmentRepository bedAssignmentRepository
        )
        {
            _handoverCardRepository = handoverCardRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
        }

        public async Task<List<ShiftHandoverCardViewModel>> Handle(GetHandoverCardsQuery request, CancellationToken cancellationToken)
        {
            DateOnly shiftDate = ShiftClock.ShiftDateFor(request.OutgoingShift, TimeZoneHelper.GetLocalTimeNow());

            List<HandoverCard> cards = await _handoverCardRepository
                .GetAllNoTracking(
                    c => c.ShiftDate == shiftDate && c.OutgoingShift == request.OutgoingShift,
                    includeProperties: "Patient.Profile")
                .ToListAsync(cancellationToken);

            Dictionary<Guid, BedAssignment> stays = await OpenStayLoader.LoadAsync(
                _bedAssignmentRepository,
                cards.Select(c => c.AdmissionId).ToList(),
                cancellationToken);

            IEnumerable<HandoverCard> visible = request.WardId.HasValue
                ? cards.Where(c => stays.TryGetValue(c.AdmissionId, out BedAssignment? s) && s.Bed?.WardId == request.WardId.Value)
                : cards;

            return visible
                .Select(c => ShiftHandoverCardViewModel.FromEntity(c, stays.GetValueOrDefault(c.AdmissionId)?.Bed?.Number))
                .OrderBy(c => c.BedNumber)
                .ToList();
        }
    }
}
