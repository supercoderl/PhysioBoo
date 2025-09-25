using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PhysioBoo.Domain.DomainEvents;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Infrastructure.Email;
using PhysioBoo.Infrastructure.EventSourcing;
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
            services.AddScoped<INotificationHandler<DomainNotification>, DomainNotificationHandler>();
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

            return services;
        }

        public static IServiceCollection AddEmail(this IServiceCollection services)
        {
            services.AddScoped<IEmailSender, SmtpEmailSender>();
            services.AddScoped<IEmailTemplateProvider, FileEmailTemplateProvider>();
            services.AddScoped<IEmailTemplateRenderer, ScribanEmailTemplateRenderer>();

            return services;
        }
    }
}
