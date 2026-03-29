using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class Sys_SequenceTrackerConfiguration : IEntityTypeConfiguration<Sys_SequenceTracker>
    {
        public void Configure(EntityTypeBuilder<Sys_SequenceTracker> builder)
        {
            // Naming
            builder.ToTable("Sys_SequenceTrackers");

            // PK
            builder.HasKey(ss => ss.Id);

            // Self-relationships
            builder.HasOne(ss => ss.Creator)
                .WithMany(u => u.CreatedSequenceTrackers)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ss => ss.Updater)
                .WithMany(u => u.UpdatedSequenceTrackers)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            builder.HasIndex(ss => ss.EntityType).IsUnique(false);

            // Properties
            builder.Property(ss => ss.EntityType)
                   .IsRequired();

            builder.Property(ss => ss.Prefix)
                   .IsRequired();

            builder.Property(ss => ss.UseDateFormating);

            builder.Property(ss => ss.SequenceLength)
                   .IsRequired();

            builder.Property(ss => ss.CurrentSequence)
                   .IsRequired();

            builder.Property(ss => ss.Suffix);

            builder.Property(ms => ms.SearchVector)
                   .HasComputedColumnSql("to_tsvector('english', unaccent(coalesce(\"EntityType\", '')))", stored: true)
                   .ValueGeneratedOnAddOrUpdate();
        }
    }
}
