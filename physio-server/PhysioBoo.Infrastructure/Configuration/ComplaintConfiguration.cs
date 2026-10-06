using PhysioBoo.Domain.Entities.Crm;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ComplaintConfiguration : IEntityTypeConfiguration<Complaint>
    {
        public void Configure(EntityTypeBuilder<Complaint> builder)
        {
            // Naming
            builder.ToTable("Complaints");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            // Ticket numbers are generated per tenant, so uniqueness is per tenant.
            builder.HasIndex(c => new { c.TenantId, c.TicketNumber }).IsUnique();
            builder.HasIndex(c => c.Status);
            builder.HasIndex(c => c.Priority);
            builder.HasIndex(c => c.Category);
            builder.HasIndex(c => c.PatientId);

            // Relationships
            // Optional link to a patient. The complaint keeps its own contact details, so it survives the patient.
            builder.HasOne<Patient>()
                   .WithMany()
                   .HasForeignKey(c => c.PatientId)
                   .OnDelete(DeleteBehavior.SetNull);

            // Properties
            builder.Property(c => c.TicketNumber)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(c => c.PatientName)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(c => c.PatientId);

            builder.Property(c => c.Email)
                   .IsRequired()
                   .HasMaxLength(254);

            builder.Property(c => c.Phone)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(c => c.Category)
                   .HasConversion<string>()
                   .HasMaxLength(32)
                   .IsRequired();

            builder.Property(c => c.Priority)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.Subject)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(c => c.Description)
                   .IsRequired()
                   .HasMaxLength(4000);

            builder.Property(c => c.AssignedTo)
                   .HasMaxLength(120);

            builder.Property(c => c.ResolvedAt);
        }
    }
}
