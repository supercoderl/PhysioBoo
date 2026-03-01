using MediatR;
using PhysioBoo.Application.ViewModels.Suppliers;

namespace PhysioBoo.Application.Queries.Suppliers.GetById
{
    public sealed record GetSupplierByIdQuery(Guid Id) : IRequest<SupplierViewModel?>;
}
