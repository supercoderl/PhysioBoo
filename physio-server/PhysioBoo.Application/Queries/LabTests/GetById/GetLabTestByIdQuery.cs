using MediatR;
using PhysioBoo.Application.ViewModels.LabTests;

namespace PhysioBoo.Application.Queries.LabTests.GetById
{
    public sealed record GetLabTestByIdQuery(Guid Id) : IRequest<LabTestViewModel?>;
}
