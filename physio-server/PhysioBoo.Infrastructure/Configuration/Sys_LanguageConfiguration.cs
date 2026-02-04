using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_LanguageConfiguration : IEntityTypeConfiguration<Sys_Language>
    {
        public void Configure(EntityTypeBuilder<Sys_Language> builder)
        {
            // Naming
            builder.ToTable("Sys_Languages");

            // PK
            builder.HasKey(sl => sl.Id);

            // Indexes
            builder.HasIndex(sl => sl.Code).IsUnique();

            // Relationships

            // Properties
            builder.Property(sl => sl.Code)
                   .IsRequired();

            builder.Property(sl => sl.Name)
                    .IsRequired();

            builder.Property(sl => sl.IsActive)
                    .IsRequired();
        }
    }
}
