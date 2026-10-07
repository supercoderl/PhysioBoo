namespace PhysioBoo.Application.Queries.Patients.Resolve
{
    /// <param name="PatientKey">Patient id (GUID) or medical record number.</param>
    public sealed record ResolvePatientQuery(string PatientKey) : IRequest<Guid?>;
}
