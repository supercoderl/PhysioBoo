using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicalSpecialtyConfiguration : IEntityTypeConfiguration<MedicalSpecialty>
    {
        public void Configure(EntityTypeBuilder<MedicalSpecialty> builder)
        {
            // Naming
            builder.ToTable("MedicalSpecialties");

            // PK
            builder.HasKey(ms => ms.Id);

            // Indexes
            builder.HasIndex(ms => ms.Name);
            builder.HasIndex(ms => ms.Code).IsUnique(false);
            builder.HasIndex(ms => ms.SearchVector).HasMethod("GIN");

            // Self-relationship
            builder.HasOne(ms => ms.ParentSpecialty)
                   .WithMany(p => p.SubSpecialties)
                   .HasForeignKey(ms => ms.ParentSpecialtyId);

            // Properties
            builder.Property(ms => ms.Name)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(ms => ms.Code)
                   .HasMaxLength(100);

            builder.Property(ms => ms.Category)
                   .HasMaxLength(100);

            builder.Property(ms => ms.Description);

            builder.Property(ms => ms.RequiredQualifications);

            builder.Property(ms => ms.AverageConsultationDuration)
                   .IsRequired();

            builder.Property(ms => ms.IsSurgical).IsRequired();
            builder.Property(ms => ms.IsDiagnostic).IsRequired();

            builder.Property(ms => ms.IconUrl);

            builder.Property(ms => ms.CreatedAt).IsRequired();

            builder.Property(ms => ms.SearchVector)
                .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true)
                .ValueGeneratedOnAddOrUpdate();
        }
    }
}
