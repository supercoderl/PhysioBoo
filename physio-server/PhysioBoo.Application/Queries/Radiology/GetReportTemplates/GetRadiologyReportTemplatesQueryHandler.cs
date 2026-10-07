using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetReportTemplates
{
    public sealed class GetRadiologyReportTemplatesQueryHandler : IRequestHandler<GetRadiologyReportTemplatesQuery, List<RadiologyReportTemplateViewModel>>
    {
        public Task<List<RadiologyReportTemplateViewModel>> Handle(GetRadiologyReportTemplatesQuery request, CancellationToken ct)
        {
            return Task.FromResult(RadiologyReportTemplates.All.ToList());
        }
    }
}
