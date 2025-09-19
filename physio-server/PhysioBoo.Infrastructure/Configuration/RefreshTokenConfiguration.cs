using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            // PK
            builder.HasKey(rt => rt.Id);

            // Relationships
            builder.HasOne(u => u.User)
                .WithMany(rt => rt.RefreshTokens)
                .HasForeignKey(u => u.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(rt => rt.UserId).IsRequired();

            builder.Property(rt => rt.Token).IsRequired();

            builder.Property(rt => rt.ExpiresAt).IsRequired()
                .HasColumnType("timestamp without time zone");

            builder.Property(rt => rt.CreatedAt).IsRequired()
                .HasColumnType("timestamp without time zone");
        }
    }
}
