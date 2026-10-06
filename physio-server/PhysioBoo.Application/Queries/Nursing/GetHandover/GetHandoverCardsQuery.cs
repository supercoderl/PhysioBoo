using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Nursing.GetHandover
{
    public sealed record GetHandoverCardsQuery(ShiftCode OutgoingShift, Guid? WardId) : IRequest<List<ShiftHandoverCardViewModel>>;
}
