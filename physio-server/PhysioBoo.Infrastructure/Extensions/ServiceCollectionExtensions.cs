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
