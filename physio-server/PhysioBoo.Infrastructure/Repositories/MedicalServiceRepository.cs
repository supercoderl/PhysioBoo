using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Infrastructure.Database;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class MedicalServiceRepository : BaseRepository<MedicalService>, IMedicalServiceRepository
    {
        private readonly ApplicationDbContext _context;

        public MedicalServiceRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> CodeExistsAsync(string code, Guid? excludeId, CancellationToken ct)
        {
            return await DbSet.AnyAsync(x => x.Code == code && (excludeId == null || x.Id != excludeId), ct);
        }

        public async Task SaveLinksAsync(Guid serviceId, IEnumerable<Guid> departmentIds, IEnumerable<Guid> doctorIds, CancellationToken ct)
        {
            List<MedicalServiceDepartment> departments = departmentIds.Distinct()
                .Select(id => new MedicalServiceDepartment { MedicalServiceId = serviceId, DepartmentId = id })
                .ToList();
            List<MedicalServiceDoctor> doctors = doctorIds.Distinct()
                .Select(id => new MedicalServiceDoctor { MedicalServiceId = serviceId, DoctorId = id })
                .ToList();

            if (departments.Count == 0 && doctors.Count == 0) return;

            _context.Set<MedicalServiceDepartment>().AddRange(departments);
            _context.Set<MedicalServiceDoctor>().AddRange(doctors);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<List<MedicalService>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct)
        {
            List<Guid> idList = ids.Distinct().ToList();

            return await DbSet.Where(x => idList.Contains(x.Id)).ToListAsync(ct);
        }

        public async Task<MedicalService?> GetWithLinksAsync(Guid id, CancellationToken ct)
        {
            return await DbSet
                .Include(x => x.Departments)
                    .ThenInclude(d => d.Department)
                .Include(x => x.Doctors)
                .Include(x => x.PrimaryDoctor)
                    .ThenInclude(d => d!.User)
                        .ThenInclude(u => u!.Profile)
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }
    }
}
