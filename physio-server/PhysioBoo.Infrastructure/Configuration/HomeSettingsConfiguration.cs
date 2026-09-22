using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HomeSettingsConfiguration : IEntityTypeConfiguration<HomeSetting>
    {
        public void Configure(EntityTypeBuilder<HomeSetting> builder)
        {
            // Naming
            builder.ToTable("HomeSettings");

            // PK
            builder.HasKey(h => h.Id);

            // Self-relationships

            // Indexes
            builder.HasIndex(h => h.TenantId).IsUnique();

            // Properties
            builder.Property(h => h.HospitalName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(h => h.TagLine)
                .HasMaxLength(500);

            builder.Property(h => h.WelcomeMessage)
                .HasMaxLength(1000);

            builder.Property(h => h.ContactPhone)
                .HasMaxLength(20);

            builder.Property(h => h.ContactEmail)
                .HasMaxLength(100);

            builder.Property(h => h.Address)
                .HasMaxLength(500);

            builder.Property(h => h.ShowEmergencyBanner)
                .IsRequired();
        }
    }
}
