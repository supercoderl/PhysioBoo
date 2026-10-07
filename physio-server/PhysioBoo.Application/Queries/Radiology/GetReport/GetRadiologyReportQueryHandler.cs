using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Radiology.GetReport
{
    public sealed class GetRadiologyReportQueryHandler : IRequestHandler<GetRadiologyReportQuery, RadiologyReportViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetRadiologyReportQueryHandler(IMediatorHandler bus, IImagingOrderRepository imagingOrderRepository)
        {
            _bus = bus;
            _imagingOrderRepository = imagingOrderRepository;
        }

        /// <summary>Returns the order's report, or an empty draft (Id = empty GUID) when none was saved yet.</summary>
        public async Task<RadiologyReportViewModel?> Handle(GetRadiologyReportQuery request, CancellationToken ct)
        {
            ImagingOrder? order = await _imagingOrderRepository
                .GetAllNoTracking(o => o.Id == request.OrderId,
                    includeProperties: "Patient.Profile,ImagingReports.Radiologist.Profile,ImagingReports.Verifier.Profile")
                .AsSplitQuery()
                .FirstOrDefaultAsync(ct);

            if (order == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetRadiologyReportQuery),
                    $"Imaging order with id {request.OrderId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            return RadiologyWorkspace.ToReport(order, RadiologyWorkspace.LatestReport(order));
        }
    }
}
