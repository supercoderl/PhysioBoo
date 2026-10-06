using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Nursing.GetAssignments
{
    public sealed record GetNursingAssignmentsQuery(ShiftCode Shift, Guid? WardId) : IRequest<List<NursingPatientViewModel>>;
}
