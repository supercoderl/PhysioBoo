using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Bills
{
    public sealed record CreateBillViewModel
    (
        Guid Id,
        Guid PatientId,
        Guid AppointmentId,
        Guid HospitalId,
        Guid DepartmentId,
        BillType Type,
        DateOnly? DueDate,
        string? PaymentTerms,
        Guid? InsuranceCompanyId,
        string? InsuranceClaimNumber,
        string? Notes,
        string? TermsAndConditions
    );
}
