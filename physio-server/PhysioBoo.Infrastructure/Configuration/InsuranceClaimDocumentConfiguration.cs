using PhysioBoo.Domain.Entities.Finance;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class InsuranceClaimDocumentConfiguration : IEntityTypeConfiguration<InsuranceClaimDocument>
    {
        public void Configure(EntityTypeBuilder<InsuranceClaimDocument> builder)
        {
            // Naming
            builder.ToTable("InsuranceClaimDocuments");

            // PK (assigned in code so new rows added through the claim navigation are inserted)
            builder.HasKey(d => d.Id);
            builder.Property(d => d.Id).ValueGeneratedNever();

            // Indexes
            builder.HasIndex(d => d.ClaimId);

            // Properties
            builder.Property(d => d.Name).IsRequired().HasMaxLength(255);
            builder.Property(d => d.Type).IsRequired().HasMaxLength(32);
            builder.Property(d => d.Url).HasMaxLength(1000);
            builder.Property(d => d.PublicId).HasMaxLength(255);
            builder.Property(d => d.UploadedBy).HasMaxLength(255);

            builder.Property(d => d.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
