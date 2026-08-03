using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Naming
            builder.ToTable("Users");

            // PK
            builder.HasKey(u => u.Id);

            // Indexes
            builder.HasIndex(u => u.Email).IsUnique();
            builder.HasIndex(u => u.Phone).IsUnique();
            builder.HasIndex(u => u.IsActive);
            builder.HasIndex(u => u.ProfileId).IsUnique();

            // Self-relationships
            builder.HasOne(u => u.Creator)
                   .WithMany(c => c.CreatedUsers)
                   .HasForeignKey(u => u.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(u => u.Updater)
                   .WithMany(c => c.UpdatedUsers)
                   .HasForeignKey(u => u.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(u => u.HospitalGroup)
                   .WithMany(h => h.Users)
                   .HasForeignKey(u => u.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(u => u.Profile)
                   .WithOne(p => p.User)
                   .HasForeignKey<User>(u => u.ProfileId)
                   .IsRequired(false)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(u => u.Email)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(u => u.EmailNormalized)
                    .HasMaxLength(255)
                    .ValueGeneratedOnAddOrUpdate()
                    .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            builder.Property(u => u.Phone)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(u => u.AlternatePhone)
                   .HasMaxLength(20);

            builder.Property(u => u.PasswordHash)
                   .IsRequired()
                   .HasMaxLength(255);

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
        }
    }
}
