using PhysioBoo.Application.ViewModels.Radiology;

namespace PhysioBoo.Application.Queries.Radiology.GetReportTemplates
{
    public sealed record GetRadiologyReportTemplatesQuery() : IRequest<List<RadiologyReportTemplateViewModel>>;
}
