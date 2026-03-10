using MediatR;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.LabTests.GetAll
{
    public sealed record GetAllLabTestsQuery(
        PagedRequest<LabTestFilter> Request
    ) : IRequest<PagedResult<LabTestViewModel>>;
}
