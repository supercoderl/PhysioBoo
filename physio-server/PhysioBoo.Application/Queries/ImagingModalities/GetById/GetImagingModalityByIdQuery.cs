using MediatR;
using PhysioBoo.Application.ViewModels.ImagingModalities;

namespace PhysioBoo.Application.Queries.ImagingModalities.GetById
{
    public sealed record GetImagingModalityByIdQuery(Guid Id) : IRequest<ImagingModalityViewModel?>;
}
