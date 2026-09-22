using PhysioBoo.Application.ViewModels.MedicalServices;

namespace PhysioBoo.Application.Queries.MedicalServices.GetStats
{
    public sealed record GetMedicalServiceStatsQuery : IRequest<MedicalServiceStatsViewModel>;
}
