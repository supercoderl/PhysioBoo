using System.Globalization;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Laboratory
{
    /// <summary>
    /// Shared mapping for the laboratory workspace. A LabOrderItem is one test of an order and
    /// carries both its specimen (sample tracking) and its result (verification).
    /// Order-level statuses are derived from the items, so they never drift out of sync.
    /// </summary>
    public static class LabWorkspace
    {
        // No lazy loading: every name shown in the workspace must be included here (gotcha 3).
        public const string ItemIncludes =
            "LabOrder.Patient.Profile," +
            "LabOrder.Doctor.User.Profile," +
            "LabOrder.Doctor.Department," +
            "LabOrder.Appointment.Department," +
            "LabTest.Category," +
            "Technician.Profile," +
            "Verifier.Profile";

        public const string OrderIncludes =
            "Patient.Profile," +
            "Doctor.User.Profile," +
            "Doctor.Department," +
            "Appointment.Department," +
            "LabOrderItems.LabTest.Category";

        public const int DefaultPageSize = 500;


        #region Names
        public static string PatientName(LabOrder? order) => order?.Patient?.Profile?.FullName ?? "Unknown patient";

        public static string Mrn(LabOrder? order) => order?.Patient?.PatientNumber ?? string.Empty;

        public static string DoctorName(LabOrder? order) => order?.Doctor?.User?.Profile?.FullName ?? string.Empty;

        public static string DepartmentName(LabOrder? order) =>
            order?.Appointment?.Department?.Name ?? order?.Doctor?.Department?.Name ?? string.Empty;

        public static string VisitNumber(LabOrder? order) => order?.Appointment?.AppointmentNumber ?? string.Empty;

        public static DateTime OrderedAt(LabOrder order) => order.OrderDate.ToDateTime(order.OrderTime);

        public static string Priority(LabPriority priority) => priority == LabPriority.Emergency ? nameof(LabPriority.Stat) : priority.ToString();

        public static string SampleType(LabOrderItem item) => item.LabTest?.SampleType ?? "Blood";

        public static string ContainerType(LabOrderItem item)
        {
            if (!string.IsNullOrWhiteSpace(item.ContainerType)) return item.ContainerType;

            string sample = SampleType(item).ToLowerInvariant();
            if (sample.Contains("urine")) return "Urine container";
            if (sample.Contains("stool")) return "Stool container";
            if (sample.Contains("serum")) return "SST (gold top)";
            if (sample.Contains("plasma")) return "Citrate (blue top)";
            if (sample.Contains("swab")) return "Swab tube";
            if (sample.Contains("blood")) return "EDTA (lavender top)";
            return "Standard container";
        }

        public static string Barcode(LabOrderItem item) =>
            item.Barcode ?? $"{item.LabOrder?.OrderNumber ?? "LAB"}-{item.Id.ToString("N")[..6].ToUpperInvariant()}";
        #endregion

        #region Statuses
        public static string ItemCollectionStatus(LabOrderItem item) => item.SampleStatus.ToString();

        public static string OrderCollectionStatus(LabOrder order, IReadOnlyCollection<LabOrderItem> items)
        {
            if (items.Count == 0) return nameof(LabSampleStatus.NotCollected);
            if (items.All(i => i.SampleStatus == LabSampleStatus.Rejected)) return nameof(LabSampleStatus.Rejected);
            if (items.Any(i => i.SampleStatus == LabSampleStatus.NotCollected)) return nameof(LabSampleStatus.NotCollected);
            if (items.Any(i => i.SampleStatus == LabSampleStatus.Rejected)) return nameof(LabSampleStatus.Rejected);
            if (items.All(i => i.SampleStatus == LabSampleStatus.Received)) return nameof(LabSampleStatus.Received);
            return nameof(LabSampleStatus.Collected);
        }

        public static string OrderLabStatus(LabOrder order, IReadOnlyCollection<LabOrderItem> items)
        {
            if (order.OrderStatus == OrderStatus.Cancelled) return "Cancelled";
            if (items.Count == 0) return "Ordered";
            if (items.All(i => i.VerificationStatus == LabVerificationStatus.Verified)) return "Completed";
            if (items.Any(i => i.ResultValue != null)) return "QualityCheck";
            if (items.Any(i => i.ProcessingStartedAt != null)) return "Processing";
            if (items.All(i => i.SampleStatus == LabSampleStatus.Received)) return "Received";
            if (items.Any(i => i.SampleCollected)) return "Collected";
            return "Ordered";
        }

        public static string OrderVerificationStatus(IReadOnlyCollection<LabOrderItem> items)
        {
            if (items.Any(i => i.VerificationStatus == LabVerificationStatus.Rejected)) return nameof(LabVerificationStatus.Rejected);
            if (items.Any(i => i.VerificationStatus == LabVerificationStatus.ReturnedForReview)) return nameof(LabVerificationStatus.ReturnedForReview);
            if (items.Count > 0 && items.All(i => i.VerificationStatus == LabVerificationStatus.Verified)) return nameof(LabVerificationStatus.Verified);
            return nameof(LabVerificationStatus.PendingVerification);
        }
        #endregion

        #region Result flagging
        /// <summary>
        /// Reference range for the item: the stored one, else the test's range for the patient
        /// (paediatric under 18, otherwise by gender).
        /// </summary>
        public static string? ReferenceRange(LabOrderItem item)
        {
            if (!string.IsNullOrWhiteSpace(item.ReferenceRange)) return item.ReferenceRange;

            LabTest? test = item.LabTest;
            if (test == null) return null;

            Domain.Entities.Core.Profile? profile = item.LabOrder?.Patient?.Profile;
            if (profile != null)
            {
                int age = DateTime.Today.Year - profile.DateOfBirth.Year;
                if (age < 18 && !string.IsNullOrWhiteSpace(test.NormalPediatric)) return test.NormalPediatric;
                if (profile.Gender == Gender.Female && !string.IsNullOrWhiteSpace(test.NormalRangeFemale)) return test.NormalRangeFemale;
            }

            return test.NormalRangeMale ?? test.NormalRangeFemale;
        }

        /// <summary>
        /// Flags a numeric value against a "low-high" range: L/H outside it, LL/HH (critical) when
        /// below half the low limit or above twice the high limit. Non-numeric values are N.
        /// </summary>
        public static (string Flag, bool Critical) Flag(string value, string? referenceRange)
        {
            if (!TryParseNumber(value, out double v) || !TryParseRange(referenceRange, out double low, out double high))
                return ("N", false);

            if (v < low) return low > 0 && v < low / 2 ? ("LL", true) : ("L", false);
            if (v > high) return high > 0 && v > high * 2 ? ("HH", true) : ("H", false);
            return ("N", false);
        }

        private static bool TryParseNumber(string? text, out double value) =>
            double.TryParse(text?.Trim(), NumberStyles.Float, CultureInfo.InvariantCulture, out value);

        private static bool TryParseRange(string? range, out double low, out double high)
        {
            low = high = 0;
            if (string.IsNullOrWhiteSpace(range)) return false;

            string[] parts = range.Split(new[] { '-', '–' }, 2, StringSplitOptions.TrimEntries);
            if (parts.Length != 2) return false;

            string highText = new string(parts[1].TakeWhile(c => char.IsDigit(c) || c == '.').ToArray());
            return TryParseNumber(parts[0], out low) && TryParseNumber(highText, out high) && high >= low;
        }

        public static string FlagOf(LabOrderItem item) =>
            string.IsNullOrWhiteSpace(item.AbnormalFlag) ? "N" : item.AbnormalFlag;
        #endregion

        #region Row builders
        public static async Task<Dictionary<Guid, string>> LoadWardNamesAsync(
            IBedAssignmentRepository bedAssignments,
            IEnumerable<Guid> patientIds,
            CancellationToken ct)
        {
            List<Guid> ids = patientIds.Distinct().ToList();
            if (ids.Count == 0) return new Dictionary<Guid, string>();

            List<BedAssignment> active = await bedAssignments
                .GetAllNoTracking(b => ids.Contains(b.PatientId) && b.DischargedAt == null, includeProperties: "Bed.Ward")
                .ToListAsync(ct);

            return active
                .GroupBy(b => b.PatientId)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(b => b.AdmittedAt).First().Bed?.Ward?.Name ?? string.Empty);
        }

        public static LabOrderRowViewModel ToOrderRow(LabOrder order, IReadOnlyCollection<LabOrderItem> items, IReadOnlyDictionary<Guid, string> wards)
        {
            return new LabOrderRowViewModel(
                order.Id,
                order.OrderNumber,
                PatientName(order),
                Mrn(order),
                VisitNumber(order),
                DepartmentName(order),
                wards.TryGetValue(order.PatientId, out string? ward) ? ward : string.Empty,
                items.Select(i => new LabOrderTestViewModel(
                    i.Id,
                    i.TestName,
                    i.LabTest?.Category?.Name ?? string.Empty,
                    SampleType(i))).ToList(),
                DoctorName(order),
                Priority(order.LabPriority),
                OrderCollectionStatus(order, items),
                OrderLabStatus(order, items),
                OrderVerificationStatus(items),
                OrderedAt(order)
            );
        }

        /// <summary>Groups items (loaded with <see cref="ItemIncludes"/>) into order rows, newest first.</summary>
        public static List<LabOrderRowViewModel> ToOrderRows(IEnumerable<LabOrderItem> items, IReadOnlyDictionary<Guid, string> wards)
        {
            return items
                .Where(i => i.LabOrder != null)
                .GroupBy(i => i.LabOrderId)
                .Select(g => ToOrderRow(g.First().LabOrder!, g.ToList(), wards))
                .OrderByDescending(r => r.OrderTime)
                .ToList();
        }

        public static LabSampleViewModel ToSample(LabOrderItem item)
        {
            LabOrder? order = item.LabOrder;
            bool verified = item.VerificationStatus == LabVerificationStatus.Verified;

            return new LabSampleViewModel(
                item.Id,
                item.LabOrderId,
                order?.OrderNumber ?? string.Empty,
                PatientName(order),
                item.TestName,
                Barcode(item),
                SampleType(item),
                ContainerType(item),
                item.SampleCollectionTime,
                item.CollectorName,
                ItemCollectionStatus(item),
                new List<LabSampleTimelineEventViewModel>
                {
                    new("Ordered", order != null ? OrderedAt(order) : item.CreatedAt),
                    new("Collected", item.SampleCollectionTime),
                    new("Received", item.ReceivedAt),
                    new("Processing", item.ProcessingStartedAt),
                    new("QualityCheck", item.ResultEnteredAt),
                    new("Completed", verified ? item.VerifiedAt : null),
                    new("Verified", verified ? item.VerifiedAt : null),
                    new("ReportReleased", item.ReleasedAt),
                }
            );
        }

        public static LabResultEntryViewModel ToResult(LabOrderItem item)
        {
            LabOrder? order = item.LabOrder;

            return new LabResultEntryViewModel(
                item.Id,
                item.LabOrderId,
                order?.OrderNumber ?? string.Empty,
                PatientName(order),
                Mrn(order),
                item.TestName,
                item.ResultValue ?? string.Empty,
                item.ResultUnit ?? item.LabTest?.UnitOfMeasurement,
                ReferenceRange(item),
                FlagOf(item),
                item.Notes,
                new List<string>(),
                item.Technician?.Profile?.FullName,
                item.Verifier?.Profile?.FullName,
                item.VerificationStatus.ToString(),
                item.VerifiedAt
            );
        }
        #endregion
    }
}
