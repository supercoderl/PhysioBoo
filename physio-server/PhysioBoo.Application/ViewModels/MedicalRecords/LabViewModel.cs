using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class LabViewModel
    {
        public sealed class LabResultRow
        {
            public Guid Id { get; set; }
            public Guid LabOrderId { get; set; }
            public string? PanelName { get; set; }
            public string TestName { get; set; } = string.Empty;
            public string? ResultValue { get; set; }
            public string? ResultUnit { get; set; }
            public string? ReferenceRange { get; set; }
            public string? AbnormalFlag { get; set; }
            public bool IsCritical { get; set; }
            public ItemStatus Status { get; set; }
            public string? CollectedAt { get; set; }
            public string? ResultedAt { get; set; }
            public string OrderingDoctorName { get; set; } = string.Empty;
            public string? VerifiedByName { get; set; }

            public static LabResultRow FromEntity(LabOrderItem labOrderItem)
            {
                return new LabResultRow
                {
                    Id = labOrderItem.Id,
                    LabOrderId = labOrderItem.LabOrderId,
                    PanelName = labOrderItem.TestName,
                    TestName = labOrderItem.TestName,
                    ResultValue = labOrderItem.ResultValue,
                    ResultUnit = labOrderItem.ResultUnit,
                    ReferenceRange = labOrderItem.ReferenceRange,
                    AbnormalFlag = labOrderItem.AbnormalFlag,
                    IsCritical = false,
                    Status = labOrderItem.Status,
                    CollectedAt = TimeZoneHelper.ConvertDateTimeToString(labOrderItem.SampleCollectionTime, DateFormats.IsoDate),
                    ResultedAt = TimeZoneHelper.ConvertDateTimeToString(labOrderItem.VerifiedAt, DateFormats.IsoDate),
                    OrderingDoctorName = labOrderItem.Verifier?.Profile?.FullName ?? string.Empty,
                    VerifiedByName = labOrderItem.Verifier?.Profile?.FullName ?? string.Empty,
                };
            }
        }

        public sealed class LabReportRow
        {
            public Guid Id { get; set; }
            public string ReportNumber { get; set; } = string.Empty;
            public Guid LabOrderId { get; set; }
            public string ReportedAt { get; set; } = string.Empty;
            public string? PathologistName { get; set; }
            public string? OverallImpression { get; set; }
            public string? Recommendations { get; set; }
            public string? CriticalValues { get; set; }
            public bool IsFinal { get; set; }
            public string? ReportPdfUrl { get; set; }

            public static LabReportRow FromEntity(LabReport labReport)
            {
                return new LabReportRow
                {
                    Id = labReport.Id,
                    ReportNumber = labReport.ReportNumber,
                    LabOrderId = labReport.LabOrderId,
                    ReportedAt = TimeZoneHelper.ConvertDateTimeToString(labReport.ReportDate, DateFormats.IsoDate),
                    PathologistName = labReport.Pathologist?.Profile?.FullName ?? string.Empty,
                    OverallImpression = labReport.OverallImpression,
                    Recommendations = labReport.Recommendations,
                    CriticalValues = labReport.CriticalValues,
                    IsFinal = labReport.IsFinal,
                    ReportPdfUrl = labReport.ReportPdfUrl
                };
            }
        }

        public IReadOnlyList<LabResultRow> Results { get; set; } = Array.Empty<LabResultRow>();
        public IReadOnlyList<LabReportRow> Reports { get; set; } = Array.Empty<LabReportRow>();

        public static LabViewModel FromEntity(IReadOnlyList<LabResultRow> results, IReadOnlyList<LabReportRow> reports)
        {
            return new LabViewModel
            {
                Results = results,
                Reports = reports
            };
        }
    }
}
