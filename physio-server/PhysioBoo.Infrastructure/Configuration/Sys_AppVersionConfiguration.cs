using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_AppVersionConfiguration : IEntityTypeConfiguration<Sys_AppVersion>
    {
        public void Configure(EntityTypeBuilder<Sys_AppVersion> builder)
        {
            // Naming
            builder.ToTable("Sys_AppVersions");

            // PK
            builder.HasKey(sa => sa.Id);

            // Indexes
            builder.HasIndex(sa => sa.AppId);

            // Relationships

            // Properties
            builder.Property(sa => sa.AppId)
                   .IsRequired();

            builder.Property(sa => sa.Platform)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(sa => sa.VersionNo).IsRequired();
            builder.Property(sa => sa.Title).IsRequired();
            builder.Property(sa => sa.Message).IsRequired();
            builder.Property(sa => sa.IsForceUpdate).IsRequired();
            builder.Property(sa => sa.StoreUrl).IsRequired();
            builder.Property(sa => sa.IsActive).IsRequired();
        }
    }
}
