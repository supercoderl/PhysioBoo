using MediatR;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.LabTestCategories.GetById
{
    public sealed class GetLabTestCategoryByIdQueryHandler : IRequestHandler<GetLabTestCategoryByIdQuery, LabTestCategoryViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly ILabTestCategoryRepository _labTestCategoryRepository;

        public GetLabTestCategoryByIdQueryHandler(
            IMediatorHandler bus,
            ILabTestCategoryRepository labTestCategoryRepository
        )
        {
            _bus = bus;
            _labTestCategoryRepository = labTestCategoryRepository;
        }

        public async Task<LabTestCategoryViewModel?> Handle(GetLabTestCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            LabTestCategory? labTestCategory = await _labTestCategoryRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (labTestCategory == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetLabTestCategoryByIdQuery),
                    $"Lab test category with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return LabTestCategoryViewModel.FromLabTestCategory(labTestCategory);
        }
    }
}
