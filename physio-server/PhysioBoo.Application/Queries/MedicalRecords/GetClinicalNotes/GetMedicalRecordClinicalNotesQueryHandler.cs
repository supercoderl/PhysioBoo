using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalNotes
{
    public sealed class GetMedicalRecordClinicalNotesQueryHandler : IRequestHandler<GetMedicalRecordClinicalNotesQuery, PagedResult<ClinicalNoteViewModel>>
    {
        private readonly IMediatorHandler _bus;
        private readonly IMedicalRecordRepository _medicalRecordRepository;

        public GetMedicalRecordClinicalNotesQueryHandler(
            IMediatorHandler bus,
            IMedicalRecordRepository medicalRecordRepository
        )
        {
            _bus = bus;
            _medicalRecordRepository = medicalRecordRepository;
        }

        public async Task<PagedResult<ClinicalNoteViewModel>> Handle(GetMedicalRecordClinicalNotesQuery q, CancellationToken ct)
        {
            List<Domain.Entities.Clinical.MedicalRecord> medicalRecords = await _medicalRecordRepository.GetAllNoTracking(
                filter: x => x.PatientId == q.PatientId
            ).ToListAsync();

            return new PagedResult<ClinicalNoteViewModel>(0, medicalRecords.Select(x => ClinicalNoteViewModel.FromMedicalRecord(x)).ToList(), 1, 1);
        }
    }
}
