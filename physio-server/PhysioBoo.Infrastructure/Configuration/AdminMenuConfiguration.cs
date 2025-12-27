using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class AdminMenuConfiguration : IEntityTypeConfiguration<AdminMenu>
    {
        public void Configure(EntityTypeBuilder<AdminMenu> builder)
        {
            // Naming
            builder.ToTable("AdminMenus");

            // Primary key
            builder.HasKey(am => am.Id);

            // Relationships
            builder.HasOne(am => am.ParentMenu)
                   .WithMany(am => am.SubMenus)
                   .HasForeignKey(am => am.ParentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(am => am.Creator)
                   .WithMany(u => u.CreatedMenus)
                   .HasForeignKey(am => am.CreatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(am => am.Updater)
                   .WithMany(u => u.UpdatedMenus)
                   .HasForeignKey(am => am.UpdatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(am => am.Label)
                   .IsRequired();

            builder.Property(am => am.Icon)
                   .IsRequired();

            builder.Property(am => am.ParentId)
                   .IsRequired(false);

            builder.Property(am => am.IsActive)
                   .IsRequired();

            builder.Property(am => am.Order)
                   .IsRequired();

            builder.Property(am => am.PermissionCode)
                   .IsRequired();

            builder.Property(am => am.Route)
                   .IsRequired();

            builder.Property(am => am.CreatedAt)
                   .IsRequired();

            builder.Property(am => am.CreatedBy)
                   .IsRequired();

            builder.Property(am => am.UpdatedAt)
                   .IsRequired(false);

            builder.Property(am => am.UpdatedBy)
                    .IsRequired(false);
        }
    }
}
