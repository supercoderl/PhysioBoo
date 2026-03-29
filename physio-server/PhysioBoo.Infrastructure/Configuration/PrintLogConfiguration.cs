using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrintLogConfiguration : IEntityTypeConfiguration<PrintLog>
    {
        public void Configure(EntityTypeBuilder<PrintLog> builder)
        {
            // Naming
            builder.ToTable("PrintLogs");

            // PK
            builder.HasKey(pl => pl.Id);

            // Self-relationships
            builder.HasOne(pl => pl.PrintedByUser)
                .WithMany(u => u.PrintLogs)
                .HasForeignKey(pl => pl.PrintedBy);

            // Indexes

            // Properties
            builder.Property(pl => pl.TemplateVersionId)
                   .IsRequired();

            builder.Property(pl => pl.PrintedBy)
                   .IsRequired();

            builder.Property(pl => pl.PrintedAt)
                   .IsRequired();

            builder.Property(pl => pl.EntityType)
                   .IsRequired();

            builder.Property(pl => pl.EntityId)
                   .IsRequired();
        }
    }
}
