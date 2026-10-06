using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetStats
{
    public sealed class GetTreatmentStatsQueryHandler : IRequestHandler<GetTreatmentStatsQuery, TreatmentStatsViewModel>
    {
        // Doses due within this window (or already overdue) count as "medication due".
        private static readonly TimeSpan DueWindow = TimeSpan.FromHours(1);

        private readonly ITreatmentOrderRepository _orderRepository;
        private readonly IMedicationAdministrationRepository _medicationRepository;
        private readonly IClinicalAlertRepository _alertRepository;
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IImagingOrderRepository _imagingOrderRepository;

        public GetTreatmentStatsQueryHandler(
            ITreatmentOrderRepository orderRepository,
            IMedicationAdministrationRepository medicationRepository,
            IClinicalAlertRepository alertRepository,
            ILabOrderItemRepository labOrderItemRepository,
            IImagingOrderRepository imagingOrderRepository
        )
        {
            _orderRepository = orderRepository;
            _medicationRepository = medicationRepository;
            _alertRepository = alertRepository;
            _labOrderItemRepository = labOrderItemRepository;
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task<TreatmentStatsViewModel> Handle(GetTreatmentStatsQuery request, CancellationToken cancellationToken)
        {
            Guid patientId = request.PatientId;
            DateTime dueBefore = TimeZoneHelper.GetLocalTimeNow().Add(DueWindow);
            ClinicalAlertType[] alertTypes = TreatmentAlertViewModel.SupportedTypes;

            return new TreatmentStatsViewModel
            {
                ActiveOrders = await _orderRepository
                    .GetAllNoTracking(o => o.PatientId == patientId && o.Status == TreatmentOrderStatus.Active)
                    .CountAsync(cancellationToken),
                CompletedOrders = await _orderRepository
                    .GetAllNoTracking(o => o.PatientId == patientId && o.Status == TreatmentOrderStatus.Completed)
                    .CountAsync(cancellationToken),
                PendingOrders = await _orderRepository
                    .GetAllNoTracking(o => o.PatientId == patientId && o.Status == TreatmentOrderStatus.Pending)
                    .CountAsync(cancellationToken),
                MedicationDue = await _medicationRepository
                    .GetAllNoTracking(m => m.PatientId == patientId && m.Status == AdministrationStatus.Scheduled && m.ScheduledAt <= dueBefore)
                    .CountAsync(cancellationToken),
                CriticalAlerts = await _alertRepository
                    .GetAllNoTracking(a => a.PatientId == patientId && !a.IsAcknowledged
                                           && a.Severity == ClinicalAlertSeverity.Critical && alertTypes.Contains(a.Type))
                    .CountAsync(cancellationToken),
                PendingLabs = await _labOrderItemRepository
                    .GetAllNoTracking(i => i.LabOrder!.PatientId == patientId
                                           && (i.Status == ItemStatus.Pending || i.Status == ItemStatus.Collected || i.Status == ItemStatus.Processing))
                    .CountAsync(cancellationToken),
                PendingImaging = await _imagingOrderRepository
                    .GetAllNoTracking(o => o.PatientId == patientId
                                           && (o.Status == ImagingOrderStatus.Ordered || o.Status == ImagingOrderStatus.Scheduled || o.Status == ImagingOrderStatus.InProgress))
                    .CountAsync(cancellationToken)
            };
        }
    }
}
