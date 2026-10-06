namespace PhysioBoo.Application.ViewModels.Nursing
{
    // Assigns an admitted patient to a nurse for one shift. NurseUserId defaults to the caller and
    // ShiftDate to the current date of that shift. Posting again for the same admission, shift and
    // date updates the nurse, acuity and fall risk.
    public sealed record CreateNursingAssignmentViewModel(
        Guid AdmissionId,
        string Shift,
        DateTime? ShiftDate,
        Guid? NurseUserId,
        string Acuity,
        bool FallRisk
    );
}
