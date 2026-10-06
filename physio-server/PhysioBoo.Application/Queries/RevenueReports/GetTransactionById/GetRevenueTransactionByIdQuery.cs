using PhysioBoo.Application.ViewModels.RevenueReports;

namespace PhysioBoo.Application.Queries.RevenueReports.GetTransactionById
{
    public sealed record GetRevenueTransactionByIdQuery(Guid Id) : IRequest<RevenueTransactionDetailViewModel?>;
}
