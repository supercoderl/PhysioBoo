using PhysioBoo.Domain.Entities.Finance;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class InsuranceClaimActivityConfiguration : IEntityTypeConfiguration<InsuranceClaimActivity>
    {
        public void Configure(EntityTypeBuilder<InsuranceClaimActivity> builder)
        {
            // Naming
            builder.ToTable("InsuranceClaimActivities");

            // PK (assigned in code so new rows added through the claim navigation are inserted)
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).ValueGeneratedNever();

            // Indexes
            builder.HasIndex(a => new { a.ClaimId, a.Kind });

            // Properties
            builder.Property(a => a.EventType).HasMaxLength(32);
            builder.Property(a => a.Direction).HasMaxLength(16);
            builder.Property(a => a.Actor).IsRequired().HasMaxLength(255);
            builder.Property(a => a.Message).HasMaxLength(4000);
            builder.Property(a => a.Details).HasMaxLength(2000);

            builder.Property(a => a.Kind)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
