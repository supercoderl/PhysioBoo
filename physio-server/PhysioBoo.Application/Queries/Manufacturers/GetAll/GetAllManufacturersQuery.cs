using MediatR;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Manufacturers.GetAll
{
    public sealed record GetAllManufacturersQuery(
        PagedRequest<ManufacturerFilter> Request
    ) : IRequest<PagedResult<ManufacturerViewModel>>;
}
