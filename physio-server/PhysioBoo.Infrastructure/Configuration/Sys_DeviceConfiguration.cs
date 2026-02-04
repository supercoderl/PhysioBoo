using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_DeviceConfiguration : IEntityTypeConfiguration<Sys_Device>
    {
        public void Configure(EntityTypeBuilder<Sys_Device> builder)
        {
            // Naming
            builder.ToTable("Sys_Devices");

            // PK
            builder.HasKey(sd => sd.Id);

            // Indexes

            // Relationships
            builder.HasOne(sd => sd.User)
                   .WithMany(u => u.Sys_Devices)
                   .HasForeignKey(sd => sd.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(sd => sd.UserId)
                   .IsRequired();

            builder.Property(sd => sd.DeviceId)
                   .IsRequired();

            builder.Property(sd => sd.FcmToken)
                   .IsRequired();

            builder.Property(sd => sd.Platform)
                   .HasConversion<string>()  // store enum as string
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(u => u.LastActiveAt)
                    .HasColumnType("timestamp without time zone");
        }
    }
}
