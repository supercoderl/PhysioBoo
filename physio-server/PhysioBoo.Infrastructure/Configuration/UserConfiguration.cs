using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // PK
            builder.HasKey(u => u.Id);

            // Indexes
            builder.HasIndex(u => u.Email).IsUnique();
            builder.HasIndex(u => u.Phone).IsUnique();
            builder.HasIndex(u => u.Role);
            builder.HasIndex(u => u.IsActive);

            // Self-relationships
            builder.HasOne(u => u.Creator)
                   .WithMany(c => c.CreatedUsers)
                   .HasForeignKey(u => u.CreatedBy);

            builder.HasOne(u => u.Updater)
                   .WithMany(c => c.UpdatedUsers)
                   .HasForeignKey(u => u.UpdatedBy);

            // Properties
            builder.Property(u => u.Email)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(u => u.Phone)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(u => u.AlternatePhone)
                   .HasMaxLength(20);

            builder.Property(u => u.PasswordHash)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(u => u.Role)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(u => u.IsActive).IsRequired();
            builder.Property(u => u.IsVerified).IsRequired();

            builder.Property(u => u.EmailVerifiedAt);
            builder.Property(u => u.PhoneVerifiedAt);
            builder.Property(u => u.LastLoginAt)
                .HasColumnType("timestamp without time zone");

            builder.Property(u => u.FailedLoginAttempts).IsRequired();

            builder.Property(u => u.AccountLockedUntil);

            builder.Property(u => u.TwoFactorEnabled).IsRequired();
            builder.Property(u => u.TwoFactorSecret)
                   .HasMaxLength(255);

            builder.Property(u => u.ProfilePicture)
                   .HasMaxLength(500);

            builder.Property(u => u.PreferredLanguage)
                   .IsRequired()
                   .HasMaxLength(10);

            builder.Property(u => u.TimeZone)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(u => u.CreatedAt)
                .IsRequired()
                .HasColumnType("timestamp without time zone");
            builder.Property(u => u.CreatedBy);

            builder.Property(u => u.UpdatedAt)
                .HasColumnType("timestamp without time zone");
            builder.Property(u => u.UpdatedBy);
        }
    }
}
