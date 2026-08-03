using MediatR;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.MedicineCategories.GetById
{
    public sealed class GetMedicineCategoryByIdQueryHandler : IRequestHandler<GetMedicineCategoryByIdQuery, MedicineCategoryViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IMedicineCategoryRepository _medicineCategoryRepository;

        public GetMedicineCategoryByIdQueryHandler(
            IMediatorHandler bus,
            IMedicineCategoryRepository medicineCategoryRepository
        )
        {
            _bus = bus;
            _medicineCategoryRepository = medicineCategoryRepository;
        }

        public async Task<MedicineCategoryViewModel?> Handle(GetMedicineCategoryByIdQuery request, CancellationToken ct)
        {
            MedicineCategory? medicineCategory = await _medicineCategoryRepository.GetByIdAsync(request.Id, ct: ct);

            if (medicineCategory == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetMedicineCategoryByIdQuery),
                    $"Medicine category with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return MedicineCategoryViewModel.FromMedicineCategory(medicineCategory);
        }
    }
}
