using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Radiology.GetStudies;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetStudyById
{
    public sealed class GetStudyByIdQueryHandler : IRequestHandler<GetStudyByIdQuery, StudyRecordViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetStudyByIdQueryHandler(IMediatorHandler bus, IImagingOrderRepository imagingOrderRepository)
        {
            _bus = bus;
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task<StudyRecordViewModel?> Handle(GetStudyByIdQuery request, CancellationToken ct)
        {
            ImagingOrder? order = await _imagingOrderRepository
                .GetAllNoTracking(o => o.Id == request.Id, includeProperties: RadiologyWorkspace.OrderIncludes)
                .AsSplitQuery()
                .FirstOrDefaultAsync(ct);

            if (order == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetStudyByIdQuery),
                    $"Study with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return (await StudyComparisons.MapAsync(_imagingOrderRepository, new[] { order }, ct)).Single();
        }
    }
}
