using PhysioBoo.Application.ViewModels.PrescriptionTemplates;

namespace PhysioBoo.Application.Queries.PrescriptionTemplates.GetTemplates
{
    public sealed record GetPrescriptionTemplatesQuery(Guid DoctorId) : IRequest<List<PrescriptionTemplateViewModel>>;
}
