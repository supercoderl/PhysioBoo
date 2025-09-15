using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Infrastructure.Configuration;

namespace PhysioBoo.Infrastructure.Database
{
    public partial class ApplicationDbContext : DbContext
    {
        #region DbSet
        public DbSet<Address> Addresses { get; set; } = null!;
        public DbSet<Appointment> Appointments { get; set; } = null!;
        public DbSet<AppointmentType> AppointmentTypes { get; set; } = null!;
        public DbSet<Bill> Bills { get; set; } = null!;
        public DbSet<BillItem> BillItems { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Doctor> Doctors { get; set; } = null!;
        public DbSet<DoctorAward> DoctorAwards { get; set; } = null!;
        public DbSet<DoctorCertification> DoctorCertifications { get; set; } = null!;
        public DbSet<DoctorEducation> DoctorEducations { get; set; } = null!;
        public DbSet<DoctorLeave> DoctorLeaves { get; set; } = null!;
        public DbSet<DoctorPublication> DoctorPublications { get; set; } = null!;
        public DbSet<DoctorSchedule> DoctorSchedules { get; set; } = null!;
        public DbSet<DoctorSpecialty> DoctorSpecialtys { get; set; } = null!;
        public DbSet<DoctorWorkExperience> DoctorWorkExperiences { get; set; } = null!;
        public DbSet<Hospital> Hospitals { get; set; } = null!;
        public DbSet<HospitalGroup> HospitalGroups { get; set; } = null!;
        public DbSet<HospitalStaff> HospitalStaffs { get; set; } = null!;
        public DbSet<ImagingModality> ImagingModalities { get; set; } = null!;
        public DbSet<ImagingOrder> ImagingOrders { get; set; } = null!;
        public DbSet<ImagingReport> ImagingReports { get; set; } = null!;
        public DbSet<InsuranceCompany> InsuranceCompanies { get; set; } = null!;
        public DbSet<LabOrder> LabOrders { get; set; } = null!;
        public DbSet<LabOrderItem> LabOrdersItem { get; set; } = null!;
        public DbSet<LabReport> LabReports { get; set; } = null!;
        public DbSet<LabTest> LabTests { get; set; } = null!;
        public DbSet<LabTestCategory> LabTestCategories { get; set; } = null!;
        public DbSet<Manufacturer> Manufacturers { get; set; } = null!;
        public DbSet<MedicalRecord> MedicalRecords { get; set; } = null!;
        public DbSet<MedicalSpecialty> MedicalSpecialties { get; set; } = null!;
        public DbSet<Medicine> Medicines { get; set; } = null!;
        public DbSet<MedicineCategory> MedicinesCategories { get; set; } = null!;
        public DbSet<MedicineInventory> MedicinesInventories { get; set; } = null!;
        public DbSet<Patient> Patients { get; set; } = null!;
        public DbSet<PatientAllergy> PatientAllergies { get; set; } = null!;
        public DbSet<PatientMedicalHistory> PatientMedicalHistories { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Prescription> Prescriptions { get; set; } = null!;
        public DbSet<PrescriptionItem> PrescriptionItems { get; set; } = null!;
        public DbSet<Profile> Profiles { get; set; } = null!;
        public DbSet<Review> Reviews { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<VerificationToken> VerificationTokens { get; set; } = null!;
        #endregion

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach(var entity in modelBuilder.Model.GetEntityTypes())
            {
                modelBuilder.Entity(entity.ClrType).HasQueryFilter(DbContextUtility.GetIsDeletedRestriction(entity.ClrType));
            }

            base.OnModelCreating(modelBuilder);

            ApplyConfigurations(modelBuilder);

            foreach(var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(x => x.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Enable triggers
            optionsBuilder.EnableServiceProviderCaching(true);
            optionsBuilder.EnableSensitiveDataLogging(true);
            base.OnConfiguring(optionsBuilder);
        }

        private static void ApplyConfigurations(ModelBuilder builder)
        {
            // Apply configurations for each entity type
            builder.ApplyConfiguration(new AddressConfiguration());
            builder.ApplyConfiguration(new AppointmentConfiguration());
            builder.ApplyConfiguration(new AppointmentTypeConfiguration());
            builder.ApplyConfiguration(new BillConfiguration());
            builder.ApplyConfiguration(new BillItemConfiguration());
            builder.ApplyConfiguration(new DepartmentConfiguration());
            builder.ApplyConfiguration(new DoctorAwardConfiguration());
            builder.ApplyConfiguration(new DoctorCertificationConfiguration());
            builder.ApplyConfiguration(new DoctorConfiguration());
            builder.ApplyConfiguration(new DoctorEducationConfiguration());
            builder.ApplyConfiguration(new DoctorLeaveConfiguration());
            builder.ApplyConfiguration(new DoctorPublicationConfiguration());
            builder.ApplyConfiguration(new DoctorScheduleConfiguration());
            builder.ApplyConfiguration(new DoctorSpecialityConfiguration());
            builder.ApplyConfiguration(new DoctorWorkExperienceConfiguration());
            builder.ApplyConfiguration(new HospitalConfiguration());
            builder.ApplyConfiguration(new HospitalGroupConfiguration());
            builder.ApplyConfiguration(new HospitalStaffConfiguration());
            builder.ApplyConfiguration(new ImagingModalityConfiguration());
            builder.ApplyConfiguration(new ImagingOrderConfiguration());
            builder.ApplyConfiguration(new ImagingReportConfiguration());
            builder.ApplyConfiguration(new InsuranceCompanyConfiguration());
            builder.ApplyConfiguration(new LabOrderConfiguration());
            builder.ApplyConfiguration(new LabOrderItemConfiguration());
            builder.ApplyConfiguration(new LabReportConfiguration());
            builder.ApplyConfiguration(new LabTestConfiguration());
            builder.ApplyConfiguration(new LabTestCategoryConfiguration());
            builder.ApplyConfiguration(new ManufacturerConfiguration());
            builder.ApplyConfiguration(new MedicalRecordConfiguration());
            builder.ApplyConfiguration(new MedicalSpecialityConfiguration());
            builder.ApplyConfiguration(new MedicineCategoryConfiguration());
            builder.ApplyConfiguration(new MedicineConfiguration());
            builder.ApplyConfiguration(new MedicineInventoryConfiguration());
            builder.ApplyConfiguration(new PatientAllergyConfiguration());
            builder.ApplyConfiguration(new PatientConfiguration());
            builder.ApplyConfiguration(new PatientMedicalHistoryConfiguration());
            builder.ApplyConfiguration(new PaymentConfiguration());
            builder.ApplyConfiguration(new PrescriptionConfiguration());
            builder.ApplyConfiguration(new PrescriptionItemConfiguration());
            builder.ApplyConfiguration(new ProfileConfiguration());
            builder.ApplyConfiguration(new ReviewConfiguration());
            builder.ApplyConfiguration(new SupplierConfiguration());
            builder.ApplyConfiguration(new UserConfiguration());
            builder.ApplyConfiguration(new VerificationTokenConfiguration());
        }
    }
}
