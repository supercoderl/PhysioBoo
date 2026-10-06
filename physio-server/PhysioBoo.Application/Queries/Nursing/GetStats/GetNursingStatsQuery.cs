using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Nursing.GetStats
{
    public sealed record GetNursingStatsQuery(ShiftCode Shift) : IRequest<NursingStatsViewModel>;
}
