using PhysioBoo.Application.ViewModels.Complaints;

namespace PhysioBoo.Application.Queries.Complaints.GetById
{
    public sealed record GetComplaintByIdQuery(Guid Id) : IRequest<ComplaintViewModel?>;
}
