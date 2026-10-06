using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SurgeryTeamMemberConfiguration : IEntityTypeConfiguration<SurgeryTeamMember>
    {
        public void Configure(EntityTypeBuilder<SurgeryTeamMember> builder)
        {
            // Naming
            builder.ToTable("SurgeryTeamMembers");

            // PK
            builder.HasKey(t => t.Id);

            // Indexes
            builder.HasIndex(t => t.SurgeryCaseId);
            builder.HasIndex(t => t.StaffUserId);

            // Relationships
            builder.HasOne(t => t.SurgeryCase)
                   .WithMany(c => c.Team)
                   .HasForeignKey(t => t.SurgeryCaseId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.StaffUser)
                   .WithMany()
                   .HasForeignKey(t => t.StaffUserId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(t => t.Role)
                   .HasConversion<string>()
                   .HasMaxLength(24)
                   .IsRequired();

            builder.Property(t => t.Availability)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();
        }
    }
}
