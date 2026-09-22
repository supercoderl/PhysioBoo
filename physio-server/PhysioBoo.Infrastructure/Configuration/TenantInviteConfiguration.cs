using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class TenantInviteConfiguration : IEntityTypeConfiguration<TenantInvite>
    {
        public void Configure(EntityTypeBuilder<TenantInvite> builder)
        {
            // Naming
            builder.ToTable("TenantInvites");

            // PK
            builder.HasKey(v => v.Id);

            // Self-relationships

            // Properties
            builder.Property(v => v.Token).IsRequired();

            builder.Property(v => v.TenantId).IsRequired();

            builder.Property(v => v.HospitalId).IsRequired(false);

            builder.Property(builder => builder.IntendedRole)
                .HasConversion<string>()
                .IsRequired();

            builder.Property(v => v.Email).IsRequired(false);

            builder.Property(v => v.ExpiresAt).IsRequired()
                .HasColumnType("timestamp without time zone");

            builder.Property(v => v.IsUsed).IsRequired();

            builder.Property(v => v.CreatedBy).IsRequired();

            builder.Property(v => v.UsedByUserId).IsRequired(false);
        }
    }
}
