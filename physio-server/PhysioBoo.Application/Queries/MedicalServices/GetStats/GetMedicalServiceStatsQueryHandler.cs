using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicalServices.GetStats
{
    public sealed class GetMedicalServiceStatsQueryHandler : IRequestHandler<GetMedicalServiceStatsQuery, MedicalServiceStatsViewModel>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;

        public GetMedicalServiceStatsQueryHandler(IMedicalServiceRepository medicalServiceRepository)
        {
            _medicalServiceRepository = medicalServiceRepository;
        }

        public async Task<MedicalServiceStatsViewModel> Handle(GetMedicalServiceStatsQuery request, CancellationToken ct)
        {
            // Live = not archived. Reuses the same IQueryable the search spec builds on,
            // filtered directly here since stats has no paging/sorting concerns.
            IQueryable<MedicalService> live = _medicalServiceRepository
                .GetAllNoTracking(x => x.Status != ServiceStatus.Archived);

            int total = await live.CountAsync(ct);
            int active = await live.CountAsync(x => x.Status == ServiceStatus.Active, ct);

            decimal averagePrice = await live
                .Where(x => x.Status == ServiceStatus.Active)
                .Select(x => (decimal?)x.BasePrice)
                .AverageAsync(ct) ?? 0m;

            var topDepartment = await live
                .SelectMany(x => x.Departments)
                .GroupBy(l => new { l.DepartmentId, l.Department.Name })
                .Select(g => new { g.Key.DepartmentId, g.Key.Name, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .FirstOrDefaultAsync(ct);

            return new MedicalServiceStatsViewModel
            {
                TotalServices = total,
                ActiveServices = active,
                AveragePrice = averagePrice,
                MostUsedDepartment = topDepartment is null
                    ? null
                    : new MostUsedDepartmentViewModel
                    {
                        Id = topDepartment.DepartmentId,
                        Name = topDepartment.Name,
                        ServiceCount = topDepartment.Count
                    }
            };
        }
    }
}
