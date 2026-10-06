using PhysioBoo.Application.ViewModels.PrescriptionTemplates;

namespace PhysioBoo.Application.Queries.PrescriptionTemplates.GetRecentPrescriptions
{
    public sealed record GetRecentPrescriptionsQuery(Guid PatientId, int Take = 5) : IRequest<List<RecentPrescriptionViewModel>>;
}
