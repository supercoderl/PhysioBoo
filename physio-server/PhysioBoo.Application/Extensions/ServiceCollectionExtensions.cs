using MassTransit;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using OfficeOpenXml;
using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Application.Commands.Appointments.CreateAppointment;
using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Application.Commands.BillItems.CreateBillItem;
using PhysioBoo.Application.Commands.Bills.CreateBill;
using PhysioBoo.Application.Commands.Departments.CreateDepartment;
using PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward;
using PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification;
using PhysioBoo.Application.Commands.DoctorEducations.CreateDoctorEducation;
using PhysioBoo.Application.Commands.DoctorLeaves.CreateDoctorLeave;
using PhysioBoo.Application.Commands.DoctorPublications.CreateDoctorPublication;
using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.Commands.DoctorSchedules.CreateDoctorSchedule;
using PhysioBoo.Application.Commands.DoctorSpecialties.CreateDoctorSpecialty;
using PhysioBoo.Application.Commands.DoctorWorkExperiences.CreateDoctorWorkExperience;
using PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup;
using PhysioBoo.Application.Commands.Hospitals.CreateHospital;
using PhysioBoo.Application.Commands.HospitalStaffs.CreateHospitalStaff;
using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder;
using PhysioBoo.Application.Commands.ImagingReports.CreateImagingReport;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Application.Commands.LabOrderItems.CreateLabOrderItem;
using PhysioBoo.Application.Commands.LabOrders.CreateLabOrder;
using PhysioBoo.Application.Commands.LabReports.CreateLabReport;
using PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory;
using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord;
using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicalSpecialties.DeleteMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory;
using PhysioBoo.Application.Commands.Medicines.CreateMedicine;
using PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy;
using PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory;
using PhysioBoo.Application.Commands.Patients.CreatePatient;
using PhysioBoo.Application.Commands.Payments.CreatePayment;
using PhysioBoo.Application.Commands.Permissions.CreatePermission;
using PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem;
using PhysioBoo.Application.Commands.Prescriptions.CreatePrescription;
using PhysioBoo.Application.Commands.Profiles.CreateProfile;
using PhysioBoo.Application.Commands.RefreshTokens.CreateRefreshToken;
using PhysioBoo.Application.Commands.Reviews;
using PhysioBoo.Application.Commands.Roles.AssignPermissionToRole;
using PhysioBoo.Application.Commands.Roles.CreateRole;
using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Application.Commands.Sys_Media.CreateMedia;
using PhysioBoo.Application.Commands.Sys_Resources.ImportLocalResource;
using PhysioBoo.Application.Commands.Sys_Resources.ImportRemoteResource;
using PhysioBoo.Application.Commands.Systems.Ip;
using PhysioBoo.Application.Commands.Users.AssignRoleToUser;
using PhysioBoo.Application.Commands.Users.AssignRoleToUserUsingRoleId;
using PhysioBoo.Application.Commands.Users.ChangePasswordUser;
using PhysioBoo.Application.Commands.Users.CreateUser;
using PhysioBoo.Application.Commands.Users.ForgotPassword;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Application.Commands.Users.LoginUser;
using PhysioBoo.Application.Commands.Users.LogoutUser;
using PhysioBoo.Application.Commands.Users.OAuthLoginUser;
using PhysioBoo.Application.Commands.Users.RefreshToken;
using PhysioBoo.Application.Commands.Users.ResendVerification;
using PhysioBoo.Application.Commands.Users.ResetPassword;
using PhysioBoo.Application.Commands.Users.UpdateUser;
using PhysioBoo.Application.Commands.Users.VerifyUser;
using PhysioBoo.Application.EventHandlers.Fanout;
using PhysioBoo.Application.EventHandlers.User;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.Queries.AdminMenus.GetAll;
using PhysioBoo.Application.Queries.Configurations.GetInitData;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetAll;
using PhysioBoo.Application.Queries.Permissions.GetAll;
using PhysioBoo.Application.Queries.RefreshTokens.GetByUserId;
using PhysioBoo.Application.Queries.Roles.GetAll;
using PhysioBoo.Application.Queries.Sys_Languages.GetAllLanguages;
using PhysioBoo.Application.Queries.Sys_Resources.GetAllResources;
using PhysioBoo.Application.Queries.Sys_Settings.GetAll;
using PhysioBoo.Application.Queries.Users.GetAll;
using PhysioBoo.Application.Queries.Users.GetByEmail;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Application.Queries.VerificationTokens.GetById;
using PhysioBoo.Application.Queries.VerificationTokens.GetByToken;
using PhysioBoo.Application.Services;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Application.ViewModels.Configurations;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Application.ViewModels.Sys_Languages;
using PhysioBoo.Application.ViewModels.Sys_Settings;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.EventHandlers;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Common;

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

            // Sys Resource
            services.AddScoped<IResourceExcelProcessor, ResourceExcelProcessor>();

            return services;
        }

        public static IServiceCollection AddQueryHandlers(this IServiceCollection services)
        {
            // Init
            services.AddScoped<IRequestHandler<GetInitDataQuery, InitDataViewModel>, GetInitDataQueryHandler>();
            // User
            services.AddScoped<IRequestHandler<GetUserByIdQuery, UserViewModel?>, GetUserByIdQueryHandler>();
            services.AddScoped<IRequestHandler<GetUserByEmailQuery, User?>, GetUserByEmailQueryHandler>();
            services.AddScoped<IRequestHandler<GetAllUsersQuery, PagedResult<UserViewModel>>, GetAllUsersQueryHandler>();

            // Verification Token
            services.AddScoped<IRequestHandler<GetVerificationTokenByIdQuery, VerificationTokenViewModel?>, GetVerificationTokenByIdQueryHandler>();
            services.AddScoped<IRequestHandler<GetVerificationTokenByTokenQuery, VerificationTokenViewModel?>, GetVerificationTokenByTokenQueryHandler>();

            // Refresh Token
            services.AddScoped<IRequestHandler<GetRefreshTokensByUserIdQuery, List<RefreshToken>>, GetRefreshTokensByUserIdQueryHandler>();

            // Role
            services.AddScoped<IRequestHandler<GetAllRolesQuery, PagedResult<RoleViewModel>>, GetAllRolesQueryHandler>();

            // Permission
            services.AddScoped<IRequestHandler<GetAllPermissionsQuery, PagedResult<PermissionViewModel>>, GetAllPermissionsQueryHandler>();

            // Admin Menu
            services.AddScoped<IRequestHandler<GetAllAdminMenusQuery, PagedResult<AdminMenuViewModel>>, GetAllAdminMenusQueryHandler>();

            // MedicalSpecialty
            services.AddScoped<IRequestHandler<GetAllMedicalSpecialtiesQuery, PagedResult<MedicalSpecialtyViewModel>>, GetAllMedicalSpecialtiesQueryHandler>();

            // System Language
            services.AddScoped<IRequestHandler<GetAllLanguagesQuery, List<LanguageViewModel>>, GetAllLanguagesQueryHandler>();

            // System Resource
            services.AddScoped<IRequestHandler<GetAllResourceQuery, string>, GetAllResourceQueryHandler>();

            // System Setting
            services.AddScoped<IRequestHandler<GetAllSettingsQuery, PagedResult<SettingViewModel>>, GetAllSettingsQueryHandler>();

            return services;
        }

        public static IServiceCollection AddCommandHandlers(this IServiceCollection services)
        {
            #region Medical Staff Flow
            services.AddScoped<IRequestHandler<CreateDoctorCommand>, CreateDoctorCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorAwardCommand>, CreateDoctorAwardCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorCertificationCommand>, CreateDoctorCertificationCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorEducationCommand>, CreateDoctorEducationCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorLeaveCommand>, CreateDoctorLeaveCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorPublicationCommand>, CreateDoctorPublicationCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorScheduleCommand>, CreateDoctorScheduleCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorSpecialtyCommand>, CreateDoctorSpecialtyCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDoctorWorkExperienceCommand>, CreateDoctorWorkExperienceCommandHandler>();
            services.AddScoped<IRequestHandler<CreateHospitalStaffCommand>, CreateHospitalStaffCommandHandler>();
            services.AddScoped<IRequestHandler<CreateMedicalSpecialtyCommand>, CreateMedicalSpecialtyCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteMedicalSpecialtyCommand>, DeleteMedicalSpecialtyCommandHandler>();
            #endregion

            #region Core Flow
            services.AddScoped<IRequestHandler<CreateAddressCommand>, CreateAddressCommandHandler>();
            services.AddScoped<IRequestHandler<CreateProfileCommand>, CreateProfileCommandHandler>();
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
            services.AddScoped<IRequestHandler<CreateRefreshTokenCommand>, CreateRefreshTokenCommandHandler>();
            services.AddScoped<IRequestHandler<CreateRoleCommand>, CreateRoleCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePermissionCommand>, CreatePermissionCommandHandler>();
            services.AddScoped<IRequestHandler<AssignPermissionToRoleCommand>, AssignPermissionToRoleCommandHandler>();
            services.AddScoped<IRequestHandler<AssignRoleToUserCommand>, AssignRoleToUserCommandHandler>();
            services.AddScoped<IRequestHandler<AssignRoleToUserUsingRoleIdCommand>, AssignRoleToUserUsingRoleIdCommandHandler>();
            services.AddScoped<IRequestHandler<OAuthLoginUserCommand>, OAuthLoginUserCommandHandler>();
            #endregion

            #region Patient Flow
            services.AddScoped<IRequestHandler<CreatePatientCommand>, CreatePatientCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePatientAllergyCommand>, CreatePatientAllergyCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePatientMedicalHistoryCommand>, CreatePatientMedicalHistoryCommandHandler>();
            #endregion

            #region Operation Flow
            services.AddScoped<IRequestHandler<CreateHospitalCommand>, CreateHospitalCommandHandler>();
            services.AddScoped<IRequestHandler<CreateHospitalGroupCommand>, CreateHospitalGroupCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDepartmentCommand>, CreateDepartmentCommandHandler>();
            services.AddScoped<IRequestHandler<CreateAppointmentTypeCommand>, CreateAppointmentTypeCommandHandler>();
            services.AddScoped<IRequestHandler<CreateAppointmentCommand>, CreateAppointmentCommandHandler>();
            services.AddScoped<IRequestHandler<CreateBillCommand>, CreateBillCommandHandler>();
            services.AddScoped<IRequestHandler<CreateBillItemCommand>, CreateBillItemCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePaymentCommand>, CreatePaymentCommandHandler>();
            #endregion

            #region Support Flow
            services.AddScoped<IRequestHandler<CreateInsuranceCompanyCommand>, CreateInsuranceCompanyCommandHandler>();
            services.AddScoped<IRequestHandler<CreateManufacturerCommand>, CreateManufacturerCommandHandler>();
            services.AddScoped<IRequestHandler<CreateSupplierCommand>, CreateSupplierCommandHandler>();
            services.AddScoped<IRequestHandler<CreateReviewCommand>, CreateReviewCommandHandler>();
            #endregion

            #region Clinical Flow
            services.AddScoped<IRequestHandler<CreateMedicalRecordCommand>, CreateMedicalRecordCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePrescriptionCommand>, CreatePrescriptionCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePrescriptionItemCommand>, CreatePrescriptionItemCommandHandler>();
            services.AddScoped<IRequestHandler<CreateMedicineCategoryCommand>, CreateMedicineCategoryCommandHandler>();
            services.AddScoped<IRequestHandler<CreateMedicineCommand>, CreateMedicineCommandHandler>();
            services.AddScoped<IRequestHandler<CreateMedicineInventoryCommand>, CreateMedicineInventoryCommandHandler>();
            #endregion

            #region Laboratory Imaging Flow
            services.AddScoped<IRequestHandler<CreateImagingModalityCommand>, CreateImagingModalityCommandHandler>();
            services.AddScoped<IRequestHandler<CreateImagingOrderCommand>, CreateImagingOrderCommandHandler>();
            services.AddScoped<IRequestHandler<CreateImagingReportCommand>, CreateImagingReportCommandHandler>();
            services.AddScoped<IRequestHandler<CreateLabOrderCommand>, CreateLabOrderCommandHandler>();
            services.AddScoped<IRequestHandler<CreateLabOrderItemCommand>, CreateLabOrderItemCommandHandler>();
            services.AddScoped<IRequestHandler<CreateLabReportCommand>, CreateLabReportCommandHandler>();
            services.AddScoped<IRequestHandler<CreateLabTestCommand>, CreateLabTestCommandHandler>();
            services.AddScoped<IRequestHandler<CreateLabTestCategoryCommand>, CreateLabTestCategoryCommandHandler>();
            #endregion

            #region System Flow
            services.AddScoped<IRequestHandler<CreateMediaCommand>, CreateMediaCommandHandler>();
            services.AddScoped<IRequestHandler<ImportLocalResourceCommand>, ImportLocalResourceCommandHandler>();
            services.AddScoped<IRequestHandler<ImportRemoteResourceCommand>, ImportRemoteResourceCommandHandler>();
            services.AddScoped<IRequestHandler<BlockIpCommand>, SecurityCommandHandler>();
            services.AddScoped<IRequestHandler<UnblockIpCommand>, SecurityCommandHandler>();
            #endregion

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

        public static IServiceCollection AddRegisterEPPlus(this IServiceCollection services)
        {
            ExcelPackage.License.SetNonCommercialPersonal("PhysioBoo Application - NonCommercial Use");
            return services;
        }
    }
}
