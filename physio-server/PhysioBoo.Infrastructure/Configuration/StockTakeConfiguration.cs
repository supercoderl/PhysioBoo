

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class StockTakeConfiguration : IEntityTypeConfiguration<StockTake>
    {
        public void Configure(EntityTypeBuilder<StockTake> builder)
        {
            // Naming
            builder.ToTable("StockTakes");

            // PK
            builder.HasKey(s => s.Id);

            // Indexes
            builder.HasIndex(s => s.Code).IsUnique();
            builder.HasIndex(s => s.HospitalId);
            builder.HasIndex(s => s.DepartmentId);
            builder.HasIndex(s => s.Status);

            // Relationships
            builder.HasOne(s => s.Hospital)
                   .WithMany(h => h.StockTakes)
                   .HasForeignKey(s => s.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Department)
                   .WithMany(d => d.StockTakes)
                   .HasForeignKey(s => s.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.AssignedToUser)
                   .WithMany(u => u.AssignedStockTakes)
                   .HasForeignKey(s => s.AssignedTo)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(s => s.Creator)
                   .WithMany(u => u.CreatedStockTakes)
                   .HasForeignKey(s => s.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(s => s.Updater)
                   .WithMany(u => u.UpdatedStockTakes)
                   .HasForeignKey(s => s.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(s => s.HospitalGroup)
                   .WithMany(hg => hg.StockTakes)
                   .HasForeignKey(s => s.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(s => s.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(s => s.ScheduledDate).IsRequired();

            builder.Property(s => s.Status)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(s => s.Notes).HasMaxLength(1000);
            builder.Property(s => s.RejectionReason).HasMaxLength(1000);
        }
    }
}
