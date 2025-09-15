using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicalSpecialityConfiguration : IEntityTypeConfiguration<MedicalSpecialty>
    {
        public void Configure(EntityTypeBuilder<MedicalSpecialty> builder)
        {
            // PK
            builder.HasKey(s => s.Id);

            // Indexes
            builder.HasIndex(s => s.Name);
            builder.HasIndex(s => s.Code).IsUnique(false);

            // Self-relationship
            builder.HasOne(s => s.ParentSpecialty)
                   .WithMany(p => p.SubSpecialties)
                   .HasForeignKey(s => s.ParentSpecialtyId);

            // Properties
            builder.Property(s => s.Name)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(s => s.Code)
                   .HasMaxLength(20);

            builder.Property(s => s.Category)
                   .HasMaxLength(100);

            builder.Property(s => s.Description);

            builder.Property(s => s.RequiredQualifications);

            builder.Property(s => s.AverageConsultationDuration)
                   .IsRequired();

            builder.Property(s => s.IsSurgical).IsRequired();
            builder.Property(s => s.IsDiagnostic).IsRequired();

            builder.Property(s => s.IconUrl)
                   .HasMaxLength(500);

            builder.Property(s => s.CreatedAt).IsRequired();
        }
    }
}
