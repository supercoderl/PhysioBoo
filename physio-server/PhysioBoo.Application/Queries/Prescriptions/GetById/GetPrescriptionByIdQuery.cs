
using PhysioBoo.Application.ViewModels.Prescriptions;

namespace PhysioBoo.Application.Queries.Prescriptions.GetById
{
    public sealed record GetPrescriptionByIdQuery(Guid Id) : IRequest<PrescriptionDraftViewModel?>
    {
    }
}
