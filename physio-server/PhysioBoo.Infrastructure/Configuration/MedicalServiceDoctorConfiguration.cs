namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicalServiceDoctorConfiguration : IEntityTypeConfiguration<MedicalServiceDoctor>
    {
        public void Configure(EntityTypeBuilder<MedicalServiceDoctor> builder)
        {
            builder.ToTable("MedicalServiceDoctors");
            builder.HasKey(x => new { x.MedicalServiceId, x.DoctorId });
            builder.HasIndex(x => x.DoctorId);

            builder.HasOne(x => x.MedicalService)
                .WithMany(s => s.Doctors)
                .HasForeignKey(x => x.MedicalServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Doctor)
                .WithMany()
                .HasForeignKey(x => x.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
