using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetHistory
{
    public sealed class GetMedicalRecordHistoryQueryHandler : IRequestHandler<GetMedicalRecordHistoryQuery, HistoricalSummaryViewModel?>
    {
        private readonly IMedicalRecordRepository _medicalRecordRepository;
        private readonly IMediatorHandler _bus;

        public GetMedicalRecordHistoryQueryHandler(
             IMedicalRecordRepository medicalRecordRepository,
             IMediatorHandler bus
        )
        {
            _medicalRecordRepository = medicalRecordRepository;
            _bus = bus;
        }

        public async Task<HistoricalSummaryViewModel?> Handle(GetMedicalRecordHistoryQuery request, CancellationToken ct)
        {
            Domain.Entities.Clinical.MedicalRecord? latestHistory = await _medicalRecordRepository.FirstOrDefaultAsync(new PastHistoryByPatientSpec(request.PatientId));

            if (latestHistory == null)
            {
                return HistoricalSummaryViewModel.NewData();
            }

            return HistoricalSummaryViewModel.FromEntity(
                latestHistory.PastMedicalHistory ?? string.Empty,
                latestHistory.FamilyHistory ?? string.Empty,
                latestHistory.SocialHistory ?? string.Empty,
                latestHistory.ReviewOfSystems ?? string.Empty,
                TimeZoneHelper.ConvertDateTimeToString(latestHistory.UpdatedAt, DateFormats.IsoDate),
                latestHistory.Updater?.Profile?.FullName ?? string.Empty
            );
        }
    }
}
