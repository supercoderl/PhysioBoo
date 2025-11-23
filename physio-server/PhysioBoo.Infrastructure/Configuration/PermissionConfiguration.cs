using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PermissionConfiguration : IEntityTypeConfiguration<Permission>
    {
        public void Configure(EntityTypeBuilder<Permission> builder)
        {
            // Naming
            builder.ToTable("Permissions");

            // PK
            builder.HasKey(p => p.Id);

            // Indexes
            builder.HasIndex(p => p.Name).IsUnique();
            builder.HasIndex(p => p.Code).IsUnique();

            // Properties
            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(p => p.Code)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(p => p.Description);
        }
    }
}
