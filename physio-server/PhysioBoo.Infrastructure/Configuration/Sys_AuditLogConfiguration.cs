using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_AuditLogConfiguration : IEntityTypeConfiguration<Sys_AuditLog>
    {
        public void Configure(EntityTypeBuilder<Sys_AuditLog> builder)
        {
            // Naming
            builder.ToTable("Sys_AuditLogs");

            // PK
            builder.HasKey(sa => sa.Id);

            // Indexes

            // Self-relationships

            // Properties
            builder.Property(sa => sa.UserId);

            builder.Property(sa => sa.Action)
                    .IsRequired()
                    .HasConversion<string>();

            builder.Property(sa => sa.TableName)
                   .IsRequired();

            builder.Property(sa => sa.PrimaryKey)
                   .IsRequired();

            builder.Property(sa => sa.OldValues).HasColumnType("jsonb");
            builder.Property(sa => sa.NewValues).HasColumnType("jsonb");
            builder.Property(sa => sa.AffectedColumns).HasColumnType("jsonb");
            builder.Property(sa => sa.DateOccurred).IsRequired();
            builder.Property(sa => sa.IpAddress);
            builder.Property(sa => sa.UserAgent);
            builder.Property(sa => sa.RequestId);
        }
    }
}
