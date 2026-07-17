using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetEncounters
{
    public sealed class GetMedicalRecordEncountersQueryHandler : IRequestHandler<GetMedicalRecordEncountersQuery, PagedResult<EncounterViewModel>>
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public GetMedicalRecordEncountersQueryHandler(
            IAppointmentRepository appointmentRepository
        )
        {
            _appointmentRepository = appointmentRepository;
        }

        public async Task<PagedResult<EncounterViewModel>> Handle(GetMedicalRecordEncountersQuery request, CancellationToken cancellationToken)
        {
            List<Domain.Entities.Operation.Appointment> appointments = await _appointmentRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId
            ).ToListAsync();

            return new PagedResult<EncounterViewModel>(0, appointments.Select(x => EncounterViewModel.FromEntity(x)).ToList(), 1, 1);
        }
    }
}
