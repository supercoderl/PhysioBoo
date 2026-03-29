using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
    {
        public void Configure(EntityTypeBuilder<SystemSetting> builder)
        {
            // Naming
            builder.ToTable("SystemSettings");

            // Primary key
            builder.HasKey(ss => ss.Id);

            // Properties
            builder.Property(ss => ss.Key)
                   .IsRequired();

            builder.Property(ss => ss.Group)
                   .IsRequired();

            builder.Property(ss => ss.Value)
                   .IsRequired();

            builder.Property(ss => ss.ValueType)
                   .IsRequired()
                   .HasConversion<string>();     // store enum as string

            builder.Property(ss => ss.Description);

            builder.Property(ss => ss.IsEditable)
                   .IsRequired();

            builder.Property(ss => ss.IsActive)
                   .IsRequired();
        }
    }
}
