using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.RevenueReports.GetDoctorPerformance
{
    /// <summary>
    /// Doctor attribution comes from the bill's appointment; bills without an appointment are skipped.
    /// </summary>
    public sealed class GetRevenueByDoctorQueryHandler : IRequestHandler<GetRevenueByDoctorQuery, List<DoctorRevenuePerformanceViewModel>>
    {
        private readonly IPaymentRepository _paymentRepository;

        public GetRevenueByDoctorQueryHandler(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<List<DoctorRevenuePerformanceViewModel>> Handle(GetRevenueByDoctorQuery request, CancellationToken ct)
        {
            RevenueReportFilter filter = request.Filter;
            (DateOnly from, DateOnly to) = RevenueReportScope.Range(filter);
            (DateOnly prevFrom, DateOnly prevTo) = RevenueReportScope.PreviousRange(filter);

            var current = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), filter, from, to)
                .Where(p => p.Bill != null && p.Bill.Appointment != null)
                .Select(p => new
                {
                    p.Amount,
                    p.PatientId,
                    p.BillId,
                    DoctorId = p.Bill!.Appointment!.DoctorId,
                    FirstName = p.Bill.Appointment.Doctor!.User!.Profile!.FirstName,
                    MiddleName = p.Bill.Appointment.Doctor.User.Profile.MiddleName,
                    LastName = p.Bill.Appointment.Doctor.User.Profile.LastName,
                    Department = p.Bill.Appointment.Doctor.Department != null ? p.Bill.Appointment.Doctor.Department.Name : null
                })
                .ToListAsync(ct);

            Dictionary<Guid, decimal> previous = await RevenueReportScope
                .PaidPaymentsIn(_paymentRepository.GetAllNoTracking(), filter, prevFrom, prevTo)
                .Where(p => p.Bill != null && p.Bill.Appointment != null)
                .GroupBy(p => p.Bill!.Appointment!.DoctorId)
                .Select(g => new { DoctorId = g.Key, Amount = g.Sum(p => p.Amount) })
                .ToDictionaryAsync(x => x.DoctorId, x => x.Amount, ct);

            return current
                .GroupBy(p => p.DoctorId)
                .Select(g =>
                {
                    var first = g.First();
                    decimal revenue = g.Sum(p => p.Amount);
                    int bills = g.Select(p => p.BillId).Distinct().Count();

                    return new DoctorRevenuePerformanceViewModel
                    {
                        DoctorId = g.Key,
                        Name = RevenueReportScope.FullName(first.FirstName, first.MiddleName, first.LastName),
                        Department = first.Department ?? string.Empty,
                        Revenue = revenue,
                        Patients = g.Select(p => p.PatientId).Distinct().Count(),
                        Transactions = bills,
                        AverageBillValue = bills == 0 ? 0 : Math.Round(revenue / bills, 2),
                        GrowthPct = RevenueReportScope.GrowthPct(revenue, previous.GetValueOrDefault(g.Key))
                    };
                })
                .OrderByDescending(d => d.Revenue)
                .ToList();
        }
    }
}
