using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicineCategoryConfiguration : IEntityTypeConfiguration<MedicineCategory>
    {
        public void Configure(EntityTypeBuilder<MedicineCategory> builder)
        {
            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.Name);
            builder.HasIndex(c => c.Code).IsUnique(false);

            // Self-relationship
            builder.HasOne(c => c.ParentCategory)
                   .WithMany(p => p.SubCategories)
                   .HasForeignKey(c => c.ParentCategoryId);

            // Properties
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(c => c.Code)
                   .HasMaxLength(20);

            builder.Property(c => c.Description);

            builder.Property(c => c.IsControlled)
                   .IsRequired();

            builder.Property(c => c.RequiresPrescription)
                   .IsRequired();

            builder.Property(c => c.StorageConditions);

            builder.Property(c => c.CreatedAt)
                   .IsRequired();
        }
    }
}
