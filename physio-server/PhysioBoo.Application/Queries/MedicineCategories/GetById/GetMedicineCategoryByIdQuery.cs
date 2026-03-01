using MediatR;
using PhysioBoo.Application.ViewModels.MedicineCategories;

namespace PhysioBoo.Application.Queries.MedicineCategories.GetById
{
    public sealed record GetMedicineCategoryByIdQuery(Guid Id) : IRequest<MedicineCategoryViewModel?>;
}
