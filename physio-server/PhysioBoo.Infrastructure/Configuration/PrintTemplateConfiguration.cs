using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrintTemplateConfiguration : IEntityTypeConfiguration<PrintTemplate>
    {
        public void Configure(EntityTypeBuilder<PrintTemplate> builder)
        {
            // Naming
            builder.ToTable("PrintTemplates");

            // PK
            builder.HasKey(pt => pt.Id);

            // Self-relationships
            builder.HasOne(pt => pt.Creator)
                .WithMany(u => u.CreatedPrintTemplates)
                .HasForeignKey(pt => pt.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(pt => pt.Updater)
                .WithMany(u => u.UpdatedPrintTemplates)
                .HasForeignKey(pt => pt.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(pt => pt.PrintTemplateVersion)
                .WithMany(ptv => ptv.PrintTemplates)
                .HasForeignKey(pt => pt.CurrentVersionId);

            // Indexes
            builder.HasIndex(pt => new { pt.Name, pt.Code });

            // Properties
            builder.Property(pt => pt.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(pt => pt.Code)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(pt => pt.Module)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(pt => pt.DocumentType)
                   .IsRequired();

            builder.Property(pt => pt.IsSystemDefault)
                   .IsRequired();

            builder.Property(pt => pt.IsActive)
                   .IsRequired();

            builder.Property(pt => pt.CurrentVersionId)
                   .IsRequired();
        }
    }
}
