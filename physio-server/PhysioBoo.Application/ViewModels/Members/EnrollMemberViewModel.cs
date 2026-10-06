namespace PhysioBoo.Application.ViewModels.Members
{
    public sealed record EnrollMemberViewModel(
        Guid PatientId,
        string Tier
    );
}
