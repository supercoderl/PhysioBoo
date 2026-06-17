using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
    {
        public void Configure(EntityTypeBuilder<UserPreference> builder)
        {
            // Naming
            builder.ToTable("UserPreferences");

            // Primary key
            builder.HasKey(up => up.Id);

            // Indexes
            builder.HasIndex(up => new { up.UserId, up.Key })
                   .IsUnique();

            // Relationships
            builder.HasOne(up => up.User)
                   .WithMany(u => u.UserPreferences)
                   .HasForeignKey(up => up.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(up => up.HospitalGroup)
                   .WithMany(hg => hg.UserPreferences)
                   .HasForeignKey(up => up.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(up => up.UserId)
                   .IsRequired();

            builder.Property(up => up.Key)
                   .IsRequired();

            builder.Property(up => up.Value)
                   .IsRequired();

            builder.Property(up => up.Group)
                   .IsRequired();
        }
    }
}
