using MediatR;
using PhysioBoo.Application.ViewModels.LabTestCategories;

namespace PhysioBoo.Application.Queries.LabTestCategories.GetById
{
    public sealed record GetLabTestCategoryByIdQuery(Guid Id) : IRequest<LabTestCategoryViewModel?>;
}
