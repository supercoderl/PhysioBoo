using MediatR;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.LabTestCategories.GetAll
{
    public sealed record GetAllLabTestCategoriesQuery(
        PagedRequest<LabTestCategoryFilter> Request
    ) : IRequest<PagedResult<LabTestCategoryViewModel>>;
}
