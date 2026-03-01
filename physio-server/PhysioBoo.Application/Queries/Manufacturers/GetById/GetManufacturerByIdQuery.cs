using MediatR;
using PhysioBoo.Application.ViewModels.Manufacturers;

namespace PhysioBoo.Application.Queries.Manufacturers.GetById
{
    public sealed record GetManufacturerByIdQuery(Guid Id) : IRequest<ManufacturerViewModel?>;
}
