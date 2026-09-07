
using PhysioBoo.Application.ViewModels.Retail;

namespace PhysioBoo.Application.Queries.RetailCarts.SearchPatients
{
    public sealed record SearchPatientsQuery(string Query) : IRequest<List<RetailCustomerViewModel>>;
}
