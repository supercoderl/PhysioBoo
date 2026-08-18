using Ardalis.Specification;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Application.Queries.Appointments.GetDaily
{
    public sealed class AppointmentsSearchSpec : Specification<Appointment>
    {
        public AppointmentsSearchSpec(Guid Id, DateOnly Date)
        {
            // Apply filter
            Query.Where(x => x.DoctorId.Equals(Id) && x.ScheduledDate.Equals(Date));

            Query
                .Include(a => a.Patient)
                    .ThenInclude(p => p!.Profile)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.User)
                        .ThenInclude(u => u!.Profile);
        }
    }
}
