using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LabTestCategoryConfiguration : IEntityTypeConfiguration<LabTestCategory>
    {
        public void Configure(EntityTypeBuilder<LabTestCategory> builder)
        {
            // Naming
            builder.ToTable("LabTestCategories");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.Name);
            builder.HasIndex(c => c.Code).IsUnique(false);

            // Properties
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(c => c.Code)
                   .HasMaxLength(100);

            builder.Property(c => c.Description);

            builder.Property(c => c.Department)
                   .HasMaxLength(100);

            builder.Property(c => c.IsActive)
                   .IsRequired();

            builder.Property(c => c.SearchVector)
                .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true)
                .ValueGeneratedOnAddOrUpdate();
        }
    }
}
