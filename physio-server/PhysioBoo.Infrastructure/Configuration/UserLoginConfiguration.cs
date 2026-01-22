using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class UserLoginConfiguration : IEntityTypeConfiguration<UserLogin>
    {
        public void Configure(EntityTypeBuilder<UserLogin> builder)
        {
            // Naming
            builder.ToTable("UserLogins");

            // PK
            builder.HasKey(ul => ul.Id);

            // Indexes
            builder.HasIndex(ul => new { ul.LoginProvider, ul.ProviderKey }).IsUnique();

            // Self-relationships
            builder.HasOne(u => u.User)
                   .WithMany(ul => ul.UserLogins)
                   .HasForeignKey(ul => ul.UserId);

            // Properties
            builder.Property(ul => ul.LoginProvider)
                   .IsRequired();

            builder.Property(ul => ul.ProviderKey)
                   .IsRequired();

            builder.Property(ul => ul.ProviderDisplayName);

            builder.Property(ul => ul.UserId)
                    .IsRequired()
                    .HasColumnType("uuid");
        }
    }
}
