using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
    {
        public void Configure(EntityTypeBuilder<RolePermission> builder)
        {
            // Naming
            builder.ToTable("RolePermissions");

            // PK
            builder.HasKey(rp => rp.Id);

            // Indexes
            builder.HasIndex(rp => new { rp.RoleId, rp.PermissionId }).IsUnique();

            // Self-relationships
            builder.HasOne(r => r.Role)
                   .WithMany(rp => rp.RolePermissions)
                   .HasForeignKey(rp => rp.RoleId);

            builder.HasOne(p => p.Permission)
                 .WithMany(rp => rp.RolePermissions)
                 .HasForeignKey(rp => rp.PermissionId);

            // Properties
            builder.Property(rp => rp.RoleId)
                   .IsRequired();

            builder.Property(rp => rp.PermissionId)
                   .IsRequired();

            builder.Property(rp => rp.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp without time zone");
        }
    }
}
