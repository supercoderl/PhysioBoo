namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicalServiceDepartmentConfiguration : IEntityTypeConfiguration<MedicalServiceDepartment>
    {
        public void Configure(EntityTypeBuilder<MedicalServiceDepartment> builder)
        {
            builder.ToTable("MedicalServiceDepartments");
            builder.HasKey(x => new { x.MedicalServiceId, x.DepartmentId });
            builder.HasIndex(x => x.DepartmentId);

            builder.HasOne(x => x.MedicalService)
                .WithMany(s => s.Departments)
                .HasForeignKey(x => x.MedicalServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Department)
                .WithMany()
                .HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
