using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetReport
{
    public sealed record GetRadiologyReportQuery(Guid OrderId) : IRequest<RadiologyReportViewModel?>;
}
