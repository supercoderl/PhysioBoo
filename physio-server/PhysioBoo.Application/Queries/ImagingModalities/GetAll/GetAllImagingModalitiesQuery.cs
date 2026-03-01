using MediatR;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.ImagingModalities.GetAll
{
    public sealed record GetAllImagingModalitiesQuery(
        PagedRequest<ImagingModalityFilter> Request
    ) : IRequest<PagedResult<ImagingModalityViewModel>>;
}
