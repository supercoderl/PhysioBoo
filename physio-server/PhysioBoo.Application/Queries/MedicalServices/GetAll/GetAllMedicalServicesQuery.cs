using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalServices.GetAll
{
    public sealed record GetAllMedicalServicesQuery(
       PagedRequest<MedicalServiceFilter> Request
   ) : IRequest<PagedResult<MedicalServiceViewModel>>;
}
