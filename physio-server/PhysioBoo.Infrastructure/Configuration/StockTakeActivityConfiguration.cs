

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class StockTakeActivityConfiguration : IEntityTypeConfiguration<StockTakeActivity>
    {
        public void Configure(EntityTypeBuilder<StockTakeActivity> builder)
        {
            // Naming
            builder.ToTable("StockTakeActivities");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes
            builder.HasIndex(a => a.StockTakeId);
            builder.HasIndex(a => a.OccurredAt);

            // Relationships
            builder.HasOne(a => a.StockTake)
                   .WithMany(s => s.StockTakeActivities)
                   .HasForeignKey(a => a.StockTakeId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.ActorUser)
                   .WithMany(u => u.ActedStockTakeActivities)
                   .HasForeignKey(a => a.Actor)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(a => a.Creator)
                   .WithMany(u => u.CreatedStockTakeActivities)
                   .HasForeignKey(a => a.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.Updater)
                   .WithMany(u => u.UpdatedStockTakeActivities)
                   .HasForeignKey(a => a.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(a => a.HospitalGroup)
                   .WithMany(hg => hg.StockTakeActivities)
                   .HasForeignKey(a => a.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(a => a.Type)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(a => a.Message)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.OccurredAt).IsRequired();
        }
    }
}
