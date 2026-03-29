using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_MediaFileConfiguration : IEntityTypeConfiguration<Sys_MediaFile>
    {
        public void Configure(EntityTypeBuilder<Sys_MediaFile> builder)
        {
            // Naming
            builder.ToTable("Sys_MediaFiles");

            // PK
            builder.HasKey(sm => sm.Id);

            // Relationships

            // Properties
            builder.Property(sm => sm.PublicId).IsRequired();

            builder.Property(sm => sm.Url).IsRequired();

            builder.Property(sm => sm.RefType).IsRequired();

            builder.Property(sm => sm.RefId);

            builder.Property(sm => sm.IsTemporary).IsRequired();
        }
    }
}
