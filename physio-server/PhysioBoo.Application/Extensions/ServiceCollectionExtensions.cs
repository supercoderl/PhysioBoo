using MassTransit;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Application.Commands.Appointments.CreateAppointment;
using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Application.Commands.BillItems.CreateBillItem;
using PhysioBoo.Application.Commands.Bills.CreateBill;
using PhysioBoo.Application.Commands.Departments.CreateDepartment;
using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup;
using PhysioBoo.Application.Commands.Hospitals.CreateHospital;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord;
using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory;
using PhysioBoo.Application.Commands.Medicines.CreateMedicine;
using PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy;
using PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory;
using PhysioBoo.Application.Commands.Patients.CreatePatient;
using PhysioBoo.Application.Commands.Payments.CreatePayment;
using PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem;
using PhysioBoo.Application.Commands.Prescriptions.CreatePrescription;
using PhysioBoo.Application.Commands.Profiles.CreateProfile;
using PhysioBoo.Application.Commands.RefreshTokens.CreateRefreshToken;
using PhysioBoo.Application.Commands.Reviews;
using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Application.Commands.Users.ChangePasswordUser;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.ForgotPassword;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Application.Commands.Users.LoginUser;
using PhysioBoo.Application.Commands.Users.LogoutUser;
using PhysioBoo.Application.Commands.Users.RefreshToken;
using PhysioBoo.Application.Commands.Users.ResendVerification;
using PhysioBoo.Application.Commands.Users.ResetPassword;
using PhysioBoo.Application.Commands.Users.UpdateUser;
using PhysioBoo.Application.Commands.Users.VerifyUser;
using PhysioBoo.Application.EventHandlers.Fanout;
using PhysioBoo.Application.EventHandlers.User;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.Queries.RefreshTokens.GetByUserId;
using PhysioBoo.Application.Queries.Users.GetByEmail;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Application.Queries.VerificationTokens.GetById;
using PhysioBoo.Application.Queries.VerificationTokens.GetByToken;
using PhysioBoo.Application.Services;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.EventHandlers;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddNotificationHandlers(this IServiceCollection services)
        {
            // Fanout
            services.AddScoped<IFanoutEventHandler, FanoutEventHandler>();

            // User
            services.AddScoped<INotificationHandler<UsersCreatedEvent>, UserCacheEventHandler>();
            services.AddScoped<INotificationHandler<UserLoggedEvent>, UserCacheEventHandler>();
            services.AddScoped<INotificationHandler<UserLoggedOutEvent>, UserCacheEventHandler>();
            services.AddScoped<INotificationHandler<UserVerifiedEvent>, UserCacheEventHandler>();

            return services;
        }

        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            // User
            services.AddScoped<IVerificationService, VerificationService>();

            return services;
        }

        public static IServiceCollection AddQueryHandlers(this IServiceCollection services)
        {
            // User
            services.AddScoped<IRequestHandler<GetUserByIdQuery, User?>, GetUserByIdQueryHandler>();
            services.AddScoped<IRequestHandler<GetUserByEmailQuery, User?>, GetUserByEmailQueryHandler>();

            // Verification Token
            services.AddScoped<IRequestHandler<GetVerificationTokenByIdQuery, VerificationTokenViewModel?>, GetVerificationTokenByIdQueryHandler>();
            services.AddScoped<IRequestHandler<GetVerificationTokenByTokenQuery, VerificationTokenViewModel?>, GetVerificationTokenByTokenQueryHandler>();

            // Refresh Token
            services.AddScoped<IRequestHandler<GetRefreshTokensByUserIdQuery, List<RefreshToken>>, GetRefreshTokensByUserIdQueryHandler>();

            return services;
        }

        public static IServiceCollection AddCommandHandlers(this IServiceCollection services)
        {
            // User
            services.AddScoped<IRequestHandler<CreateUserCommand>, CreateUserCommandHandler>();
            services.AddScoped<IRequestHandler<GenerateEmailVerificationTokenCommand>, GenerateEmailVerificationTokenCommandHandler>();
            services.AddScoped<IRequestHandler<ResendVerificationCommand>, ResendVerificationCommandHandler>();
            services.AddScoped<IRequestHandler<VerifyUserCommand>, VerifyUserCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateUserCommand>, UpdateUserCommandHandler>();
            services.AddScoped<IRequestHandler<LoginUserCommand>, LoginUserCommandHandler>();
            services.AddScoped<IRequestHandler<LogoutUserCommand>, LogoutUserCommandHandler>();
            services.AddScoped<IRequestHandler<ChangePasswordUserCommand>, ChangePasswordUserCommandHandler>();
            services.AddScoped<IRequestHandler<ForgotPasswordCommand>, ForgotPasswordCommandHandler>();
            services.AddScoped<IRequestHandler<ResetPasswordCommand>, ResetPasswordCommandHandler>();
            services.AddScoped<IRequestHandler<RefreshTokenCommand>, RefreshTokenCommandHandler>();

            // Refresh Token
            services.AddScoped<IRequestHandler<CreateRefreshTokenCommand>, CreateRefreshTokenCommandHandler>();

            // Patient
            services.AddScoped<IRequestHandler<CreatePatientCommand>, CreatePatientCommandHandler>();

            // Doctor
            services.AddScoped<IRequestHandler<CreateDoctorCommand>, CreateDoctorCommandHandler>();

            // Hospital
            services.AddScoped<IRequestHandler<CreateHospitalCommand>, CreateHospitalCommandHandler>();

            // Hospital Group
            services.AddScoped<IRequestHandler<CreateHospitalGroupCommand>, CreateHospitalGroupCommandHandler>();

            // Address
            services.AddScoped<IRequestHandler<CreateAddressCommand>, CreateAddressCommandHandler>();

            // Profile
            services.AddScoped<IRequestHandler<CreateProfileCommand>, CreateProfileCommandHandler>();

            // Patient Allergy
            services.AddScoped<IRequestHandler<CreatePatientAllergyCommand>, CreatePatientAllergyCommandHandler>();

            // Patient Medical History
            services.AddScoped<IRequestHandler<CreatePatientMedicalHistoryCommand>, CreatePatientMedicalHistoryCommandHandler>();

            // Department
            services.AddScoped<IRequestHandler<CreateDepartmentCommand>, CreateDepartmentCommandHandler>();

            // Appointment Type
            services.AddScoped<IRequestHandler<CreateAppointmentTypeCommand>, CreateAppointmentTypeCommandHandler>();

            // Appointment
            services.AddScoped<IRequestHandler<CreateAppointmentCommand>, CreateAppointmentCommandHandler>();

            // Bill
            services.AddScoped<IRequestHandler<CreateBillCommand>, CreateBillCommandHandler>();

            // Bill Item
            services.AddScoped<IRequestHandler<CreateBillItemCommand>, CreateBillItemCommandHandler>();

            // Payment
            services.AddScoped<IRequestHandler<CreatePaymentCommand>, CreatePaymentCommandHandler>();

            // Insurance Company
            services.AddScoped<IRequestHandler<CreateInsuranceCompanyCommand>, CreateInsuranceCompanyCommandHandler>();

            // Manufacturer
            services.AddScoped<IRequestHandler<CreateManufacturerCommand>, CreateManufacturerCommandHandler>();

            // Supplier
            services.AddScoped<IRequestHandler<CreateSupplierCommand>, CreateSupplierCommandHandler>();

            // Review
            services.AddScoped<IRequestHandler<CreateReviewCommand>, CreateReviewCommandHandler>();

            // Medicine Category
            services.AddScoped<IRequestHandler<CreateMedicineCategoryCommand>, CreateMedicineCategoryCommandHandler>();

            // Medicine
            services.AddScoped<IRequestHandler<CreateMedicineCommand>, CreateMedicineCommandHandler>();

            // Medicine Inventory
            services.AddScoped<IRequestHandler<CreateMedicineInventoryCommand>, CreateMedicineInventoryCommandHandler>();

            // Medical Record
            services.AddScoped<IRequestHandler<CreateMedicalRecordCommand>, CreateMedicalRecordCommandHandler>();

            // Prescription
            services.AddScoped<IRequestHandler<CreatePrescriptionCommand>, CreatePrescriptionCommandHandler>();

            // Prescription Item
            services.AddScoped<IRequestHandler<CreatePrescriptionItemCommand>, CreatePrescriptionItemCommandHandler>();

            return services;
        }

        public static IServiceCollection AddPhysioBooConsumers(
            this IServiceCollection services,
            string rabbitMqHost,
            string username = "guest",
            string password = "guest"
        )
        {
            services.AddMassTransit(x =>
            {
                // Auto scan all consumers in current assembly
                x.AddConsumers(typeof(ServiceCollectionExtensions).Assembly);

                // Set queue name format to kebab-case standard, prefix "phyo-boo"
                x.SetEndpointNameFormatter(
                    new KebabCaseEndpointNameFormatter("physio-boo", false)
                );

                x.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host(rabbitMqHost, "/", h =>
                    {
                        h.Username(username);
                        h.Password(password);
                    });

                    // Automatically configure all endpoints
                    cfg.ConfigureEndpoints(context);

                    cfg.ReceiveEndpoint("physio-boo-fanout-event_error", e =>
                    {
                        e.Handler<Fault>(async context =>
                        {
                            Console.WriteLine($"Error: {context.Message.Exceptions.FirstOrDefault()?.Message}");
                            await Task.CompletedTask;
                        });
                    });
                });
            });

            return services;
        }
    }
}
