using MediatR;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicineCategories.GetAll
{
    public sealed record GetAllMedicineCategoriesQuery(
        PagedRequest<MedicineCategoryFilter> Request
    ) : IRequest<PagedResult<MedicineCategoryViewModel>>;
}
