using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicalServiceConfiguration : IEntityTypeConfiguration<MedicalService>
    {
        public void Configure(EntityTypeBuilder<MedicalService> builder)
        {
            // Naming
            builder.ToTable("MedicalServices");

            // PK
            builder.HasKey(s => s.Id);

            // Indexes
            builder.HasIndex(s => new { s.TenantId, s.Code }).IsUnique();
            builder.HasIndex(s => s.HospitalId);
            builder.HasIndex(s => s.PrimaryDoctorId);
            builder.HasIndex(s => s.Status);

            // Relationships
            builder.HasOne(s => s.PrimaryDoctor)
                   .WithMany()
                   .HasForeignKey(s => s.PrimaryDoctorId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(s => s.Code)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(s => s.Name)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(s => s.ShortName)
                   .HasMaxLength(60);

            builder.Property(s => s.Description);

            builder.Property(s => s.CoverImage)
                   .HasMaxLength(500);

            builder.Property(s => s.CategoryId);

            builder.Property(s => s.Tags)
                   .HasColumnType("jsonb");

            builder.Property(s => s.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(s => s.Availability)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(s => s.BasePrice)
                   .HasColumnType("numeric(15,2)")
                   .IsRequired();

            builder.Property(s => s.Currency)
                   .HasMaxLength(3)
                   .IsRequired();

            builder.Property(s => s.VatIncluded).IsRequired();

            builder.Property(s => s.DurationMinutes).IsRequired();

            builder.Property(s => s.RequiresAppointment).IsRequired();
            builder.Property(s => s.RequiresReferral).IsRequired();

            builder.Property(s => s.ArchivedAt);

            builder.Property(s => s.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '') || ' ' || coalesce(\"ShortName\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
