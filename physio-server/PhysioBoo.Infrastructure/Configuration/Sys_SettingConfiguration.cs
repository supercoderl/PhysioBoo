using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_SettingConfiguration : IEntityTypeConfiguration<Sys_Setting>
    {
        public void Configure(EntityTypeBuilder<Sys_Setting> builder)
        {
            // Naming
            builder.ToTable("Sys_Settings");

            // PK
            builder.HasKey(ss => ss.Id);

            // Indexes
            builder.HasIndex(ss => ss.Key).IsUnique();

            // Relationships

            // Properties
            builder.Property(ss => ss.Key)
                   .IsRequired();

            builder.Property(ss => ss.Value)
                   .IsRequired();

            builder.Property(ss => ss.Description);
            builder.Property(ss => ss.Group).IsRequired();
            builder.Property(ss => ss.IsSystem).IsRequired();
            builder.Property(ss => ss.InputType).IsRequired();
            builder.Property(ss => ss.IsEncrypted).IsRequired();
        }
    }
}
