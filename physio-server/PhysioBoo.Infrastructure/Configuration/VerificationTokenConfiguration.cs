using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class VerificationTokenConfiguration : IEntityTypeConfiguration<VerificationToken>
    {
        public void Configure(EntityTypeBuilder<VerificationToken> builder)
        {
            // PK
            builder.HasKey(v => v.Id);

            // Self-relationships
            builder.HasOne(u => u.User)
                   .WithMany(v => v.VerificationTokens)
                   .HasForeignKey(u => u.UserId);

            // Properties
            builder.Property(v => v.UserId).IsRequired();

            builder.Property(v => v.Token).IsRequired();

            builder.Property(v => v.ExpiresAt).IsRequired()
                .HasColumnType("timestamp without time zone");

            builder.Property(v => v.IsUsed).IsRequired();

            builder.Property(v => v.Type)
                .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();
        }
    }
}
