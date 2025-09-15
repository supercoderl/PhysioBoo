using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class AppointmentTypeConfiguration : IEntityTypeConfiguration<AppointmentType>
    {
        public void Configure(EntityTypeBuilder<AppointmentType> builder)
        {
            // PK
            builder.HasKey(a => a.Id);

            // Properties
            builder.Property(a => a.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.Code)
                   .HasMaxLength(20);

            builder.Property(a => a.Description);

            builder.Property(a => a.DefaultDuration)
                   .IsRequired();

            builder.Property(a => a.BufferTime)
                   .IsRequired();

            builder.Property(a => a.IsEmergency)
                   .IsRequired();

            builder.Property(a => a.RequiresPreparation)
                   .IsRequired();

            builder.Property(a => a.PreparationInstructions);

            builder.Property(a => a.IsFollowUp)
                   .IsRequired();

            builder.Property(a => a.ConsultationFee)
                   .HasColumnType("numeric(10,2)");

            builder.Property(a => a.ColorCode)
                   .HasMaxLength(7);

            builder.Property(a => a.IsActive)
                   .IsRequired();

            builder.Property(a => a.CreatedAt)
                   .IsRequired();

            // Optional: Indexes for searching/filtering
            builder.HasIndex(a => a.Name);
            builder.HasIndex(a => a.Code);
            builder.HasIndex(a => a.IsActive);
        }
    }
}
