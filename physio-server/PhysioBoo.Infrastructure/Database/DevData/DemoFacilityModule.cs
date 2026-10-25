namespace PhysioBoo.Infrastructure.Database.DevData
{
    /// <summary>
    /// The one-click entry point: builds a complete, connected demo facility for the tenant by running the other modules
    /// in dependency order. "Rows" is the number of patients; every other size is derived from it. A step whose data
    /// already exists is reused, so running it again on a populated tenant creates nothing.
    /// </summary>
    internal sealed class DemoFacilityModule : IDevDataCompositeModule
    {
        public const string ModuleKey = "demo-facility";

        private const int MaxAppointments = 1000;

        public string Key => ModuleKey;

        public string Label => "Complete demo facility";

        public string Description =>
            "Branches, departments, rooms, doctors, staff, services, schedules, patients and appointments in one run. Rows is the number of patients; steps that already have data are reused.";

        public IReadOnlyList<string> DependsOn => new[]
        {
            HospitalStructureModule.ModuleKey,
            MasterDataModule.ModuleKey,
            ProvidersModule.ModuleKey,
            StaffModule.ModuleKey,
            MedicalServicesModule.ModuleKey,
            SchedulesModule.ModuleKey,
            PatientsModule.ModuleKey,
            AppointmentsModule.ModuleKey,
        };

        /// <summary>Never "has data": the service runs the plan, which reuses the steps that are already populated.</summary>
        public Task<bool> HasDataAsync(DevDataContext context, CancellationToken ct) => Task.FromResult(false);

        public Task GenerateAsync(DevDataContext context, int count, CancellationToken ct) =>
            throw new InvalidOperationException("A composite module is run through its plan, not generated directly.");

        public IReadOnlyList<DevDataStep> Plan(int count) => new[]
        {
            new DevDataStep(HospitalStructureModule.ModuleKey, 12),
            new DevDataStep(MasterDataModule.ModuleKey, 1),
            new DevDataStep(ProvidersModule.ModuleKey, Math.Max(12, (int)Math.Ceiling(count / 4.0))),
            new DevDataStep(StaffModule.ModuleKey, Math.Max(16, (int)Math.Ceiling(count / 3.0))),
            new DevDataStep(MedicalServicesModule.ModuleKey, 16),
            new DevDataStep(SchedulesModule.ModuleKey, 1),
            new DevDataStep(PatientsModule.ModuleKey, count),
            new DevDataStep(AppointmentsModule.ModuleKey, Math.Min(count * 3, MaxAppointments)),
        };
    }
}
