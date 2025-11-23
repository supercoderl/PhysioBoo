using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> builder)
        {
            // Naming
            builder.ToTable("UserRoles");

            // PK
            builder.HasKey(ur => ur.Id);

            // Indexes
            builder.HasIndex(ur => new { ur.UserId, ur.RoleId });

            // Self-relationships
            builder.HasOne(u => u.User)
                   .WithMany(ur => ur.UserRoles)
                   .HasForeignKey(ur => ur.UserId);

            builder.HasOne(r => r.Role)
                   .WithMany(ur => ur.UserRoles)
                   .HasForeignKey(ur => ur.RoleId);

            builder.HasOne(u => u.Assigner)
                 .WithMany(ur => ur.AssignedUserRoles)
                 .HasForeignKey(ur => ur.AssignedBy);

            // Properties
            builder.Property(ur => ur.RoleId)
                   .IsRequired();

            builder.Property(ur => ur.UserId)
                   .IsRequired();

            builder.Property(ur => ur.AssignedAt)
                .IsRequired()
                .HasColumnType("timestamp without time zone");
            builder.Property(ur => ur.AssignedBy);
        }
    }
}
