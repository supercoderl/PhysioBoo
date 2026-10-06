using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.RevenueReports;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RevenueReports
{
    /// <summary>
    /// Shared filtering and labelling rules for every revenue report query.
    /// Revenue = Paid payments by payment date; refunds count on their refund date.
    /// </summary>
    public static class RevenueReportScope
    {
        public const string PaymentIncludes = "Bill.Department,Bill.Appointment.Doctor.User.Profile,Bill.Appointment.Doctor.Department,Patient.Profile";
        public const string BillIncludes = "Patient.Profile,Department,Appointment.Doctor.User.Profile,Payments,InsuranceCompany,Approver.Profile";

        /// <summary>
        /// Paged requests may omit the filter; fall back to the last 30 days.
        /// </summary>
        public static RevenueReportFilter OrDefault(RevenueReportFilter? filter)
        {
            return filter ?? new RevenueReportFilter(DateTime.UtcNow.Date.AddDays(-29), DateTime.UtcNow.Date, "day", null, null, null, null, null);
        }

        public static (int PageNumber, int PageSize) Page(QueryParameters request, int defaultSize = 10)
        {
            return (request.PageNumber <= 0 ? 1 : request.PageNumber, request.PageSize <= 0 ? defaultSize : request.PageSize);
        }

        /// <summary>
        /// Bills that still have money owed as of today. The aging clock starts at the due date (or bill date).
        /// </summary>
        public static IQueryable<Bill> OutstandingBills(IQueryable<Bill> query, RevenueReportFilter filter)
        {
            (_, DateOnly to) = Range(filter);
            query = query.Where(b =>
                b.OutstandingAmount > 0 &&
                b.BillDate <= to &&
                b.PaymentStatus != PaymentStatus.Cancelled &&
                b.PaymentStatus != PaymentStatus.Waived);
            return ApplyBillDimensions(query, filter);
        }

        public static int DaysOverdue(DateOnly? dueDate, DateOnly billDate)
        {
            DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);
            return Math.Max(0, today.DayNumber - (dueDate ?? billDate).DayNumber);
        }

        public static (DateOnly From, DateOnly To) Range(RevenueReportFilter filter)
        {
            DateOnly from = DateOnly.FromDateTime(filter.Start);
            DateOnly to = DateOnly.FromDateTime(filter.End);
            return from <= to ? (from, to) : (to, from);
        }

        /// <summary>
        /// The window of equal length immediately before the selected range (used for growth %).
        /// </summary>
        public static (DateOnly From, DateOnly To) PreviousRange(RevenueReportFilter filter)
        {
            (DateOnly from, DateOnly to) = Range(filter);
            int days = to.DayNumber - from.DayNumber + 1;
            return (from.AddDays(-days), from.AddDays(-1));
        }

        public static IQueryable<Payment> PaidPaymentsIn(IQueryable<Payment> query, RevenueReportFilter filter, DateOnly from, DateOnly to)
        {
            query = query.Where(p => p.Status == PaymentStatus.Paid && p.PaymentDate >= from && p.PaymentDate <= to);
            return ApplyPaymentDimensions(query, filter);
        }

        public static IQueryable<Payment> RefundsIn(IQueryable<Payment> query, RevenueReportFilter filter, DateOnly from, DateOnly to)
        {
            DateTime fromDt = from.ToDateTime(TimeOnly.MinValue);
            DateTime toExclusive = to.AddDays(1).ToDateTime(TimeOnly.MinValue);
            query = query.Where(p => p.RefundAmount > 0 && p.RefundDate >= fromDt && p.RefundDate < toExclusive);
            return ApplyPaymentDimensions(query, filter);
        }

        public static IQueryable<Payment> ApplyPaymentDimensions(IQueryable<Payment> query, RevenueReportFilter filter)
        {
            List<PaymentMethod> methods = ParseMethods(filter.PaymentMethods);
            if (methods.Count > 0)
                query = query.Where(p => methods.Contains(p.Method));

            if (filter.DepartmentIds is { Count: > 0 })
                query = query.Where(p => p.Bill != null && filter.DepartmentIds.Contains(p.Bill.DepartmentId));

            if (filter.DoctorIds is { Count: > 0 })
                query = query.Where(p => p.Bill != null && p.Bill.Appointment != null && filter.DoctorIds.Contains(p.Bill.Appointment.DoctorId));

            if (filter.InsuranceProviderIds is { Count: > 0 })
                query = query.Where(p => p.Bill != null && p.Bill.InsuranceCompanyId != null && filter.InsuranceProviderIds.Contains(p.Bill.InsuranceCompanyId.Value));

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                string pattern = $"%{filter.Search.Trim()}%";
                query = query.Where(p =>
                    EF.Functions.ILike(p.PaymentNumber, pattern) ||
                    (p.Bill != null && EF.Functions.ILike(p.Bill.BillNumber, pattern)) ||
                    (p.Patient != null && EF.Functions.ILike(p.Patient.PatientNumber, pattern)));
            }

            return query;
        }

        public static IQueryable<Bill> BillsIn(IQueryable<Bill> query, RevenueReportFilter filter, DateOnly from, DateOnly to)
        {
            query = query.Where(b => b.BillDate >= from && b.BillDate <= to);
            return ApplyBillDimensions(query, filter);
        }

        public static IQueryable<Bill> ApplyBillDimensions(IQueryable<Bill> query, RevenueReportFilter filter)
        {
            List<PaymentMethod> methods = ParseMethods(filter.PaymentMethods);
            if (methods.Count > 0)
                query = query.Where(b => b.Payments.Any(p => methods.Contains(p.Method)));

            if (filter.DepartmentIds is { Count: > 0 })
                query = query.Where(b => filter.DepartmentIds.Contains(b.DepartmentId));

            if (filter.DoctorIds is { Count: > 0 })
                query = query.Where(b => b.Appointment != null && filter.DoctorIds.Contains(b.Appointment.DoctorId));

            if (filter.InsuranceProviderIds is { Count: > 0 })
                query = query.Where(b => b.InsuranceCompanyId != null && filter.InsuranceProviderIds.Contains(b.InsuranceCompanyId.Value));

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                string pattern = $"%{filter.Search.Trim()}%";
                query = query.Where(b =>
                    EF.Functions.ILike(b.BillNumber, pattern) ||
                    (b.Patient != null && EF.Functions.ILike(b.Patient.PatientNumber, pattern)));
            }

            return query;
        }

        public static List<PaymentMethod> ParseMethods(List<string>? methods)
        {
            if (methods == null) return new List<PaymentMethod>();

            return methods
                .Select(m => Enum.TryParse(m, true, out PaymentMethod parsed) ? parsed : (PaymentMethod?)null)
                .Where(m => m.HasValue)
                .Select(m => m!.Value)
                .Distinct()
                .ToList();
        }

        public static string MethodLabel(PaymentMethod method) => method switch
        {
            PaymentMethod.Upi => "UPI",
            PaymentMethod.NetBanking => "Net Banking",
            PaymentMethod.DemandDraft => "Demand Draft",
            PaymentMethod.Qr => "QR",
            _ => method.ToString()
        };

        public static string TransactionStatus(PaymentStatus status) => status switch
        {
            PaymentStatus.Paid => "Paid",
            PaymentStatus.Partial => "Partial",
            PaymentStatus.Refunded => "Refunded",
            PaymentStatus.Cancelled or PaymentStatus.Waived => "Void",
            _ => "Pending"
        };

        public static string AgingBucket(int daysOverdue) => daysOverdue switch
        {
            <= 30 => "0-30",
            <= 60 => "31-60",
            <= 90 => "61-90",
            _ => "90+"
        };

        public static double GrowthPct(decimal current, decimal previous)
        {
            if (previous == 0) return current > 0 ? 100 : 0;
            return Math.Round((double)((current - previous) / previous * 100), 1);
        }

        /// <summary>
        /// Buckets payments by day / week (Monday start) / month, emitting empty buckets so charts stay continuous.
        /// </summary>
        public static List<RevenueTrendPointViewModel> BuildTrend(
            IEnumerable<(DateOnly Date, PaymentMethod Method, decimal Amount)> payments,
            DateOnly from,
            DateOnly to,
            string? granularity
        )
        {
            string unit = (granularity ?? "day").ToLowerInvariant();

            DateOnly BucketStart(DateOnly d) => unit switch
            {
                "week" => d.AddDays(-(((int)d.DayOfWeek + 6) % 7)),
                "month" => new DateOnly(d.Year, d.Month, 1),
                _ => d
            };

            DateOnly Next(DateOnly d) => unit switch
            {
                "week" => d.AddDays(7),
                "month" => d.AddMonths(1),
                _ => d.AddDays(1)
            };

            string Label(DateOnly d) => unit switch
            {
                "week" => $"Wk {d:dd MMM}",
                "month" => d.ToString("MMM yyyy"),
                _ => d.ToString("dd MMM")
            };

            Dictionary<DateOnly, RevenueTrendPointViewModel> buckets = new();
            for (DateOnly cursor = BucketStart(from); cursor <= to; cursor = Next(cursor))
            {
                buckets[cursor] = new RevenueTrendPointViewModel { Label = Label(cursor), Date = cursor.ToString("yyyy-MM-dd") };
            }

            foreach ((DateOnly date, PaymentMethod method, decimal amount) in payments)
            {
                if (!buckets.TryGetValue(BucketStart(date), out RevenueTrendPointViewModel? point)) continue;

                switch (method)
                {
                    case PaymentMethod.Cash: point.CashPayments += amount; break;
                    case PaymentMethod.Card: point.CardPayments += amount; break;
                    case PaymentMethod.Insurance: point.InsurancePayments += amount; break;
                    case PaymentMethod.Upi: point.UpiPayments += amount; break;
                    default: point.OtherPayments += amount; break;
                }

                point.Total += amount;
            }

            return buckets.Values.ToList();
        }

        public static string FullName(string? firstName, string? middleName, string? lastName) =>
            $"{firstName} {(string.IsNullOrEmpty(middleName) ? "" : middleName + " ")}{lastName}".Trim();

        public static string PatientName(Bill? bill) => bill?.Patient?.Profile?.FullName ?? string.Empty;

        public static string DoctorName(Bill? bill) => bill?.Appointment?.Doctor?.User?.Profile?.FullName ?? string.Empty;

        public static RevenueTransactionViewModel ToTransaction(Bill bill)
        {
            List<Payment> paid = bill.Payments.Where(p => p.Status == PaymentStatus.Paid).ToList();
            List<string> methods = paid.Select(p => MethodLabel(p.Method)).Distinct().ToList();

            return new RevenueTransactionViewModel
            {
                Id = bill.Id,
                BillNo = bill.BillNumber,
                Datetime = bill.BillDate.ToDateTime(bill.BillTime),
                PatientName = PatientName(bill),
                Department = bill.Department?.Name ?? string.Empty,
                DoctorName = DoctorName(bill),
                PaymentMethod = methods.Count switch { 0 => "-", 1 => methods[0], _ => "Mixed" },
                Amount = bill.TotalAmount,
                Discount = bill.DiscountAmount,
                Refund = bill.Payments.Sum(p => p.RefundAmount),
                Status = TransactionStatus(bill.PaymentStatus)
            };
        }
    }
}
