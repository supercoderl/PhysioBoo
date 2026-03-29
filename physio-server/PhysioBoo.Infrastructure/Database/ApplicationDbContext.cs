using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Infrastructure.Configuration;
using PhysioBoo.Infrastructure.Entries;
using PhysioBoo.Infrastructure.Outbox;
using System.Reflection;

namespace PhysioBoo.Infrastructure.Database
{
    public partial class ApplicationDbContext : DbContext
    {
        private readonly IUser _user;
        private readonly IHttpContextAccessor _httpContextAccessor;

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
        public DbSet<DoctorSpecialty> DoctorSpecialties { get; set; } = null!;
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
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;
        public DbSet<UserRole> UserRoles { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<RolePermission> RolePermissions { get; set; } = null!;
        public DbSet<OutboxMessage> OutboxMessages { get; set; } = null!;
        public DbSet<AdminMenu> AdminMenus { get; set; } = null!;
        public DbSet<SystemSetting> SystemSettings { get; set; } = null!;
        public DbSet<UserLogin> UserLogins { get; set; } = null!;
        public DbSet<Sys_MediaFile> Sys_MediaFiles { get; set; } = null!;
        public DbSet<Sys_Language> Sys_Languages { get; set; } = null!;
        public DbSet<Sys_Resource> Sys_Resources { get; set; } = null!;
        public DbSet<Sys_Setting> Sys_Settings { get; set; } = null!;
        public DbSet<Sys_Device> Sys_Devices { get; set; } = null!;
        public DbSet<Sys_AppVersion> Sys_AppVersions { get; set; } = null!;
        public DbSet<Sys_AuditLog> Sys_AuditLogs { get; set; } = null!;
        public DbSet<Sys_SequenceTracker> Sys_SequenceTrackers { get; set; } = null!;
        public DbSet<PrintTemplate> PrintTemplates { get; set; } = null!;
        public DbSet<PrintTemplateVersion> PrintTemplateVersions { get; set; } = null!;
        public DbSet<PrintLog> PrintLogs { get; set; } = null!;
        #endregion

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            IUser user,
            IHttpContextAccessor httpContextAccessor
        ) : base(options)
        {
            _user = user;
            _httpContextAccessor = httpContextAccessor;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            foreach (Microsoft.EntityFrameworkCore.Metadata.IMutableEntityType entity in modelBuilder.Model.GetEntityTypes())
            {
                if (entity.ClrType == typeof(OutboxMessage))
                {
                    continue;
                }

                if (typeof(TenantEntity).IsAssignableFrom(entity.ClrType))
                {
                    MethodInfo? method = typeof(ApplicationDbContext).GetMethod(nameof(ApplyGlobalFilters), BindingFlags.NonPublic | BindingFlags.Instance)
                                                             ?.MakeGenericMethod(entity.ClrType);
                    method?.Invoke(this, new object[] { modelBuilder });
                }
            }

            base.OnModelCreating(modelBuilder);

            modelBuilder.HasPostgresExtension("unaccent");

            ApplyConfigurations(modelBuilder);

            foreach (Microsoft.EntityFrameworkCore.Metadata.IMutableForeignKey? relationship in modelBuilder.Model.GetEntityTypes().SelectMany(x => x.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }

        internal Task<int> SaveSeedChangesAsync(CancellationToken cancellationToken = default) => base.SaveChangesAsync(cancellationToken);

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Enable triggers
            optionsBuilder.EnableServiceProviderCaching(true);
            optionsBuilder.EnableSensitiveDataLogging(true);
            base.OnConfiguring(optionsBuilder);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            Guid userId = _user.GetUserId();
            OnTrackingTenant(_user.GetTenantId());

            List<AuditEntry> auditEntries = OnBeforeSaveChanges(userId);

            int result = await base.SaveChangesAsync(cancellationToken);

            await OnAfterSaveChanges(auditEntries);

            return result;
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
            builder.ApplyConfiguration(new DoctorSpecialtyConfiguration());
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
            builder.ApplyConfiguration(new MedicalSpecialtyConfiguration());
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
            builder.ApplyConfiguration(new UserRoleConfiguration());
            builder.ApplyConfiguration(new VerificationTokenConfiguration());
            builder.ApplyConfiguration(new RoleConfiguration());
            builder.ApplyConfiguration(new PermissionConfiguration());
            builder.ApplyConfiguration(new RolePermissionConfiguration());
            builder.ApplyConfiguration(new OutboxConfiguration());
            builder.ApplyConfiguration(new AdminMenuConfiguration());
            builder.ApplyConfiguration(new SystemSettingConfiguration());
            builder.ApplyConfiguration(new UserLoginConfiguration());
            builder.ApplyConfiguration(new Sys_MediaFileConfiguration());
            builder.ApplyConfiguration(new Sys_LanguageConfiguration());
            builder.ApplyConfiguration(new Sys_ResourceConfiguration());
            builder.ApplyConfiguration(new Sys_SettingConfiguration());
            builder.ApplyConfiguration(new Sys_DeviceConfiguration());
            builder.ApplyConfiguration(new Sys_AppVersionConfiguration());
            builder.ApplyConfiguration(new Sys_AuditLogConfiguration());
            builder.ApplyConfiguration(new Sys_SequenceTrackerConfiguration());
            builder.ApplyConfiguration(new PrintTemplateConfiguration());
            builder.ApplyConfiguration(new PrintTemplateVersionConfiguration());
            builder.ApplyConfiguration(new PrintLogConfiguration());
        }

        private List<AuditEntry> OnBeforeSaveChanges(Guid userId)
        {
            ChangeTracker.DetectChanges();
            List<AuditEntry> auditEntries = new List<AuditEntry>();

            HttpContext httpContext = _httpContextAccessor.HttpContext;

            string ipAddress = "N/A";
            string userAgent = "N/A";
            string requestId = "N/A";

            if (httpContext != null)
            {
                ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                userAgent = httpContext.Request.Headers["User-Agent"].ToString();
                requestId = httpContext.TraceIdentifier;
            }

            foreach (Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry in ChangeTracker.Entries())
            {
                if (
                    entry.Entity is Sys_AuditLog ||
                    entry.Entity is OutboxMessage ||
                    entry.State == EntityState.Detached ||
                    entry.State == EntityState.Unchanged
                )
                    continue;

                AuditEntry auditEntry = new AuditEntry(entry);
                auditEntry.TableName = entry.Metadata.GetTableName() ?? string.Empty;
                auditEntry.IpAddress = ipAddress;
                auditEntry.UserAgent = userAgent;
                auditEntry.RequestId = requestId;

                if (userId == Guid.Empty)
                {
                    Microsoft.EntityFrameworkCore.ChangeTracking.PropertyEntry? userIdProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "AggregateId");

                    if (userIdProp != null && userIdProp.CurrentValue != null)
                    {
                        auditEntry.UserId = Guid.Parse(userIdProp.CurrentValue.ToString() ?? string.Empty);
                    }
                }
                else
                {
                    auditEntry.UserId = userId;
                }

                if (entry.State == EntityState.Modified)
                {
                    Microsoft.EntityFrameworkCore.ChangeTracking.PropertyEntry? deleteProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "Deleted" || p.Metadata.Name == "DeletedAt");
                    if (deleteProp != null)
                    {
                        bool wasDeleted = deleteProp.OriginalValue != null;
                        bool isDeletedNow = deleteProp.CurrentValue != null;

                        if (!wasDeleted && isDeletedNow)
                        {
                            auditEntry.IsSoftDelete = true;
                        }
                    }
                }

                foreach (Microsoft.EntityFrameworkCore.ChangeTracking.PropertyEntry property in entry.Properties)
                {
                    if (property.IsTemporary)
                    {
                        auditEntry.TemporaryProperties.Add(property);
                        continue;
                    }

                    string propertyName = property.Metadata.Name;
                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[propertyName] = property.CurrentValue ?? string.Empty;
                        continue;
                    }

                    switch (entry.State)
                    {
                        case EntityState.Added:
                            auditEntry.NewValues[propertyName] = property.CurrentValue ?? string.Empty;
                            break;
                        case EntityState.Deleted:
                            auditEntry.OldValues[propertyName] = property.OriginalValue ?? string.Empty;
                            break;
                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                auditEntry.AffectedColumns.Add(propertyName);
                                auditEntry.OldValues[propertyName] = property.OriginalValue ?? string.Empty;
                                auditEntry.NewValues[propertyName] = property.CurrentValue ?? string.Empty;
                            }
                            break;
                    }
                }
                auditEntries.Add(auditEntry);
            }

            foreach (AuditEntry auditEntry in auditEntries)
            {
                if (auditEntry.TemporaryProperties.Count == 0)
                {
                    Sys_AuditLogs.Add(auditEntry.ToAudit());
                }
            }

            return auditEntries;
        }

        private async Task OnAfterSaveChanges(List<AuditEntry> auditEntries)
        {
            if (auditEntries == null || auditEntries.Count == 0) return;

            bool hasNewAuditLogs = false;

            foreach (AuditEntry auditEntry in auditEntries)
            {
                if (auditEntry.TemporaryProperties.Count == 0)
                    continue;

                foreach (Microsoft.EntityFrameworkCore.ChangeTracking.PropertyEntry prop in auditEntry.TemporaryProperties)
                {
                    if (prop.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue ?? string.Empty;
                    }
                    else
                    {
                        auditEntry.NewValues[prop.Metadata.Name] = prop.CurrentValue ?? string.Empty;
                    }
                }

                Sys_AuditLogs.Add(auditEntry.ToAudit());
                hasNewAuditLogs = true;
            }

            if (hasNewAuditLogs)
            {
                await base.SaveChangesAsync();
            }
        }

        private void OnTrackingTenant(Guid tenantId)
        {
            foreach (Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<TenantEntity> entry in ChangeTracker.Entries<TenantEntity>())
            {
                // 1. Audit Logging (Applies to EVERYTHING)
                if (entry.State == EntityState.Added)
                {
                    if (entry.Entity is TenantEntity tenantEntity)
                    {
                        if (tenantId == Guid.Empty)
                            throw new Exception("Cannot save patient data without an active hospital session!");

                        tenantEntity.TenantId = tenantId;
                    }
                }
            }
        }

        private void ApplyGlobalFilters<T>(ModelBuilder builder) where T : class
        {
            bool isTenant = typeof(TenantEntity).IsAssignableFrom(typeof(T));
            bool isSoftDelete = typeof(Entity).IsAssignableFrom(typeof(T));

            if (isTenant && isSoftDelete)
            {
                builder.Entity<T>().HasQueryFilter(e =>
                        ((TenantEntity)(object)e).TenantId == _user.GetTenantId() &&
                        ((Entity)(object)e).DeletedAt == null);
            }
            else if (isTenant)
            {
                builder.Entity<T>().HasQueryFilter(e => ((TenantEntity)(object)e).TenantId == _user.GetTenantId());
            }
            else if (isSoftDelete)
            {
                builder.Entity<T>().HasQueryFilter(e => ((Entity)(object)e).DeletedAt == null);
            }
        }
    }
}
