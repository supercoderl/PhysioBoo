using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrintTemplateVersionConfiguration : IEntityTypeConfiguration<PrintTemplateVersion>
    {
        public void Configure(EntityTypeBuilder<PrintTemplateVersion> builder)
        {
            // Naming
            builder.ToTable("PrintTemplateVersions");

            // PK
            builder.HasKey(ptv => ptv.Id);

            // Self-relationships
            builder.HasOne(ptv => ptv.PrintTemplate)
               .WithMany(pt => pt.PrintTemplateVersions)
               .HasForeignKey(ptv => ptv.TemplateId);

            builder.HasOne(ptv => ptv.Creator)
                .WithMany(u => u.CreatedPrintTemplateVersions)
                .HasForeignKey(ptv => ptv.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(ptv => ptv.Updater)
                .WithMany(u => u.UpdatedPrintTemplateVersions)
                .HasForeignKey(ptv => ptv.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes

            // Properties
            builder.Property(ptv => ptv.TemplateId)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(ptv => ptv.VersionNumber)
                   .IsRequired();

            builder.Property(ptv => ptv.PaperSize)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(ptv => ptv.Orientation)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(ptv => ptv.HeaderHtml)
                   .IsRequired();

            builder.Property(ptv => ptv.BodyHtml)
                   .IsRequired();

            builder.Property(ptv => ptv.FooterHtml)
                   .IsRequired();

            builder.Property(ptv => ptv.CustomCss)
                   .IsRequired();
        }
    }
}
