using CloudinaryDotNet;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PhysioBoo.Domain.DomainEvents;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Interfaces.Seeding;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Infrastructure.BackgroundJobs;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Infrastructure.Database.Seeding;
using PhysioBoo.Infrastructure.Email;
using PhysioBoo.Infrastructure.EventSourcing;
using PhysioBoo.Infrastructure.Outbox;
using PhysioBoo.Infrastructure.Repositories;

namespace PhysioBoo.Infrastructure.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration,
            string migrationAssemblyName,
            string connectionStringName = "DefaultConnection"
        )
        {
            services.AddDbContext<EventStoreDbContext>(options =>
            {
                options.UseNpgsql(configuration.GetConnectionString(connectionStringName),
                b => b.MigrationsAssembly(migrationAssemblyName));
            });

            services.AddDbContext<DomainNotificationStoreDbContext>(options =>
            {
                options.UseNpgsql(configuration.GetConnectionString(connectionStringName),
                b => b.MigrationsAssembly(migrationAssemblyName));
            });

            // Core Infrastructure
            services.AddScoped<IUnitOfWork, UnitOfWork<ApplicationDbContext>>();
            services.AddScoped<IEventStoreContext, EventStoreContext>();
            services.AddScoped<DomainNotificationHandler>();
            services.AddScoped<INotificationHandler<DomainNotification>>(provider => provider.GetRequiredService<DomainNotificationHandler>());
            services.AddScoped<IDomainEventStore, DomainEventStore>();
            services.AddScoped<IMediatorHandler, InMemoryBus>();

            // Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IVerificationTokenRepository, VerificationTokenRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IHospitalRepository, HospitalRepository>();
            services.AddScoped<IPatientRepository, PatientRepository>();
            services.AddScoped<IDoctorRepository, DoctorRepository>();
            services.AddScoped<IHospitalGroupRepository, HospitalGroupRepository>();
            services.AddScoped<IAddressRepository, AddressRepository>();
            services.AddScoped<IProfileRepository, ProfileRepository>();
            services.AddScoped<IPatientAllergyRepository, PatientAllergyRepository>();
            services.AddScoped<IPatientMedicalHistoryRepository, PatientMedicalHistoryRepository>();
            services.AddScoped<IDepartmentRepository, DepartmentRepository>();
            services.AddScoped<IAppointmentTypeRepository, AppointmentTypeRepository>();
            services.AddScoped<IAppointmentRepository, AppointmentRepository>();
            services.AddScoped<IBillRepository, BillRepository>();
            services.AddScoped<IBillItemRepository, BillItemRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IInsuranceCompanyRepository, InsuranceCompanyRepository>();
            services.AddScoped<IManufacturerRepository, ManufacturerRepository>();
            services.AddScoped<ISupplierRepository, SupplierRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();
            services.AddScoped<IMedicineCategoryRepository, MedicineCategoryRepository>();
            services.AddScoped<IMedicineRepository, MedicineRepository>();
            services.AddScoped<IMedicineInventoryRepository, MedicineInventoryRepository>();
            services.AddScoped<IMedicalRecordRepository, MedicalRecordRepository>();
            services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
            services.AddScoped<IPrescriptionItemRepository, PrescriptionItemRepository>();
            services.AddScoped<IImagingModalityRepository, ImagingModalityRepository>();
            services.AddScoped<IImagingOrderRepository, ImagingOrderRepository>();
            services.AddScoped<IImagingReportRepository, ImagingReportRepository>();
            services.AddScoped<ILabOrderRepository, LabOrderRepository>();
            services.AddScoped<ILabOrderItemRepository, LabOrderItemRepository>();
            services.AddScoped<ILabReportRepository, LabReportRepository>();
            services.AddScoped<ILabTestRepository, LabTestRepository>();
            services.AddScoped<ILabTestCategoryRepository, LabTestCategoryRepository>();
            services.AddScoped<IDoctorAwardRepository, DoctorAwardRepository>();
            services.AddScoped<IDoctorCertificationRepository, DoctorCertificationRepository>();
            services.AddScoped<IDoctorEducationRepository, DoctorEducationRepository>();
            services.AddScoped<IDoctorLeaveRepository, DoctorLeaveRepository>();
            services.AddScoped<IDoctorPublicationRepository, DoctorPublicationRepository>();
            services.AddScoped<IDoctorScheduleRepository, DoctorScheduleRepository>();
            services.AddScoped<IDoctorSpecialtyRepository, DoctorSpecialtyRepository>();
            services.AddScoped<IDoctorWorkExperienceRepository, DoctorWorkExperienceRepository>();
            services.AddScoped<IHospitalStaffRepository, HospitalStaffRepository>();
            services.AddScoped<IMedicalSpecialtyRepository, MedicalSpecialtyRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IUserRoleRepository, UserRoleRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
            services.AddScoped<IOutboxRepository, OutboxRepository>();
            services.AddScoped<IAdminMenuRepository, AdminMenuRepository>();
            services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();
            services.AddScoped<IUserLoginRepository, UserLoginRepository>();
            services.AddScoped<ISys_MediaFileRepository, Sys_MediaFileRepository>();
            services.AddScoped<ISys_LanguageRepository, Sys_LanguageRepository>();
            services.AddScoped<ISys_ResourceRepository, Sys_ResourceRepository>();
            services.AddScoped<ISys_SettingRepository, Sys_SettingRepository>();
            services.AddScoped<ISys_DeviceRepository, Sys_DeviceRepository>();
            services.AddScoped<ISys_AppVersionRepository, Sys_AppVersionRepository>();
            services.AddScoped<ISys_SequenceTrackerRepository, Sys_SequenceTrackerRepository>();
            services.AddScoped<IPrintTemplateRepository, PrintTemplateRepository>();
            services.AddScoped<IPrintTemplateVersionRepository, PrintTemplateVersionRepository>();
            services.AddScoped<IPrintLogRepository, PrintLogRepository>();

            return services;
        }

        public static IServiceCollection AddEmail(this IServiceCollection services)
        {
            services.AddScoped<IEmailSender, SmtpEmailSender>();
            services.AddScoped<IEmailTemplateProvider, FileEmailTemplateProvider>();
            services.AddScoped<IEmailTemplateRenderer, ScribanEmailTemplateRenderer>();

            return services;
        }

        public static IServiceCollection AddHostedInfrastructureService(this IServiceCollection services)
        {
            services.AddHostedService<OutboxProcessor>();
            services.AddHostedService<CloudinaryCleanupJob>();

            return services;
        }

        public static IServiceCollection AddRegisterThirdPartyService(this IServiceCollection services, IConfiguration configuration)
        {
            #region Cloudinary
            IConfigurationSection cloudSection = configuration.GetSection("ThirdParty:Cloudinary");
            if (!cloudSection.Exists())
            {
                throw new Exception("The 'ThirdParty:Cloudinary' configuration is missing from your appsettings.json!");
            }

            Account account = new Account(
                cloudSection["CloudName"],
                cloudSection["ApiKey"],
                cloudSection["SecretKey"]
            );

            services.AddSingleton(new Cloudinary(account));
            #endregion

            return services;
        }

        public static IServiceCollection AddSeedingSerivce(this IServiceCollection services)
        {
            services.AddScoped<IDatabaseSeeder, DatabaseSeeder>();
            return services;
        }
    }
}
