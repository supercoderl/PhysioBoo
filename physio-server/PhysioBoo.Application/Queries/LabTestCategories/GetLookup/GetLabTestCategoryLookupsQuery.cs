using MediatR;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.LabTestCategories.GetLookup
{
    public sealed record GetLabTestCategoryLookupsQuery() : IRequest<PagedResult<LabTestCategoryLookupViewModel>>;
}
