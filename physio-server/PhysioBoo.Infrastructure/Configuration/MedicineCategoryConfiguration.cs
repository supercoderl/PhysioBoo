using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class MedicineCategoryConfiguration : IEntityTypeConfiguration<MedicineCategory>
    {
        public void Configure(EntityTypeBuilder<MedicineCategory> builder)
        {
            // Naming
            builder.ToTable("MedicineCategories");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.Name);
            builder.HasIndex(c => c.Code).IsUnique(false);

            // Self-relationship
            builder.HasOne(c => c.ParentCategory)
                   .WithMany(p => p.SubCategories)
                   .HasForeignKey(c => c.ParentCategoryId);

            builder.HasOne(c => c.Creator)
                   .WithMany(u => u.CreatedMedicineCategories)
                   .HasForeignKey(c => c.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(c => c.Updater)
                   .WithMany(u => u.UpdatedMedicineCategories)
                   .HasForeignKey(c => c.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(c => c.HospitalGroup)
                   .WithMany(hg => hg.MedicineCategories)
                   .HasForeignKey(c => c.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);
            // Properties
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(c => c.Code)
                   .HasMaxLength(100);

            builder.Property(c => c.Description);

            builder.Property(c => c.IsControlled)
                   .IsRequired();

            builder.Property(c => c.RequiresPrescription)
                   .IsRequired();

            builder.Property(c => c.StorageConditions);

            builder.Property(ms => ms.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
