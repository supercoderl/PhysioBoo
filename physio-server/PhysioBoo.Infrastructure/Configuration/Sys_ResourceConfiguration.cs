using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_ResourceConfiguration : IEntityTypeConfiguration<Sys_Resource>
    {
        public void Configure(EntityTypeBuilder<Sys_Resource> builder)
        {
            // Naming
            builder.ToTable("Sys_Resources");

            // PK
            builder.HasKey(sr => sr.Id);

            // Indexes


            // Self-relationships
            builder.HasOne(sr => sr.Language)
                   .WithMany(sl => sl.Sys_Resources)
                   .HasForeignKey(sr => sr.LanguageId);

            // Properties
            builder.Property(sr => sr.Key)
                   .IsRequired();

            builder.Property(sr => sr.LanguageId)
                   .IsRequired();

            builder.Property(sr => sr.Value)
                    .IsRequired();
        }
    }
}
