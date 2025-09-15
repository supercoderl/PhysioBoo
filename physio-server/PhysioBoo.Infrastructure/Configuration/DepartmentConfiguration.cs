using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DepartmentConfiguration : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            // PK
            builder.HasKey(d => d.Id);

            // Indexes
            builder.HasIndex(d => d.HospitalId);
            builder.HasIndex(d => d.DepartmentCode).IsUnique(false);

            // Relationships
            builder.HasOne(d => d.Hospital)
                   .WithMany(h => h.Departments)
                   .HasForeignKey(d => d.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(d => d.HeadOfDeptUser)
                   .WithMany(u => u.HeadedDepartments)
                   .HasForeignKey(d => d.HeadOfDepartment);

            // Properties
            builder.Property(d => d.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(d => d.DepartmentCode)
                   .HasMaxLength(20);

            builder.Property(d => d.Description);

            builder.Property(d => d.FloorNumber);

            builder.Property(d => d.Wing)
                   .HasMaxLength(50);

            builder.Property(d => d.Phone)
                   .HasMaxLength(20);

            builder.Property(d => d.Email)
                   .HasMaxLength(100);

            builder.Property(d => d.BudgetAllocated)
                   .HasColumnType("numeric(15,2)");

            builder.Property(d => d.BedCount).IsRequired();

            builder.Property(d => d.IsEmergency).IsRequired();
            builder.Property(d => d.IsCriticalCare).IsRequired();
            builder.Property(d => d.IsOutPatient).IsRequired();
            builder.Property(d => d.IsInPatient).IsRequired();

            builder.Property(d => d.OperationHours).HasColumnType("jsonb");
            builder.Property(d => d.EquipmentList).HasColumnType("jsonb");

            builder.Property(d => d.IsActive).IsRequired();

            builder.Property(d => d.CreatedAt).IsRequired();
            builder.Property(d => d.UpdatedAt).IsRequired(false);
        }
    }
}
