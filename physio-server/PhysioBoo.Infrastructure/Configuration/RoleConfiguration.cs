using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => r.Name).IsUnique();
            builder.HasIndex(r => r.Code).IsUnique();
            builder.HasIndex(r => r.IsActive);

            // Self-relationships
            builder.HasOne(r => r.Creator)
                   .WithMany(u => u.CreatedRoles)
                   .HasForeignKey(u => u.CreatedBy);

            builder.HasOne(r => r.Updater)
                   .WithMany(u => u.UpdatedRoles)
                   .HasForeignKey(u => u.UpdatedBy);

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

            builder.Property(r => r.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp without time zone");
            builder.Property(r => r.CreatedBy);

            builder.Property(r => r.UpdatedAt)
                .HasColumnType("timestamp without time zone");
            builder.Property(r => r.UpdatedBy);
        }
    }
}
