using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            // Naming
            builder.ToTable("Roles");

            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => r.Name).IsUnique();
            builder.HasIndex(r => r.Code).IsUnique();
            builder.HasIndex(r => r.IsActive);

            // Self-relationships
            builder.HasOne(r => r.Creator)
                   .WithMany(u => u.CreatedRoles)
                   .HasForeignKey(r => r.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(r => r.Updater)
                   .WithMany(u => u.UpdatedRoles)
                   .HasForeignKey(r => r.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(r => r.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(r => r.Code)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(r => r.Description);

            builder.Property(r => r.Color)
                   .HasMaxLength(255);

            builder.Property(r => r.Icon)
                   .HasMaxLength(255);

            builder.Property(r => r.IsSystemRole)
                   .IsRequired();

            builder.Property(r => r.IsActive)
                   .IsRequired();

            builder.Property(r => r.IsPublicForRegistration)
                    .IsRequired();
        }
    }
}
