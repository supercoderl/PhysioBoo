using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Bills
{
    public sealed record CreateBillItemInput(
        ItemType Type,
        string? ItemCode,
        string? ItemName,
        string? Description,
        int Quantity,
        decimal UnitPrice,
        decimal TaxPercentage,
        Guid? PerformedBy,
        DateTime? PerformedDate,
        Guid? ReferenceId,
        bool IsInsuranceCovered
    );

    public sealed record CreateBillViewModel
    (
        Guid Id,
        Guid PatientId,
        Guid? AppointmentId,
        BillSource Source,
        Guid HospitalId,
        Guid DepartmentId,
        BillType Type,
        DateOnly? DueDate,
        string? PaymentTerms,
        Guid? InsuranceCompanyId,
        string? InsuranceClaimNumber,
        string? Notes,
        string? TermsAndConditions,
        List<CreateBillItemInput> Items
    );
}
