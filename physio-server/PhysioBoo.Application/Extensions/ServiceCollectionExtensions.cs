using MassTransit;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using OfficeOpenXml;
using PhysioBoo.Application.Commands.Addresses.CreateAddress;
using PhysioBoo.Application.Commands.Addresses.DeleteAddress;
using PhysioBoo.Application.Commands.Addresses.UpdateAddress;
using PhysioBoo.Application.Commands.AdminMenus.CreateAdminMenu;
using PhysioBoo.Application.Commands.AdminMenus.DeleteAdminMenu;
using PhysioBoo.Application.Commands.AdminMenus.UpdateAdminMenu;
using PhysioBoo.Application.Commands.Appointments.CreateAppointment;
using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Application.Commands.AppointmentTypes.DeleteAppointmentType;
using PhysioBoo.Application.Commands.AppointmentTypes.UpdateAppointmentType;
using PhysioBoo.Application.Commands.BillItems.CreateBillItem;
using PhysioBoo.Application.Commands.Bills.CreateBill;
using PhysioBoo.Application.Commands.Departments.CreateDepartment;
using PhysioBoo.Application.Commands.Departments.DeleteDepartment;
using PhysioBoo.Application.Commands.Departments.UpdateDepartment;
using PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward;
using PhysioBoo.Application.Commands.DoctorCertifications.CreateDoctorCertification;
using PhysioBoo.Application.Commands.DoctorEducations.CreateDoctorEducation;
using PhysioBoo.Application.Commands.DoctorLeaves.CreateDoctorLeave;
using PhysioBoo.Application.Commands.DoctorPublications.CreateDoctorPublication;
using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.Commands.Doctors.DeleteDoctor;
using PhysioBoo.Application.Commands.Doctors.UpdateDoctor;
using PhysioBoo.Application.Commands.DoctorSchedules.CreateDoctorSchedule;
using PhysioBoo.Application.Commands.DoctorSpecialties.CreateDoctorSpecialty;
using PhysioBoo.Application.Commands.DoctorWorkExperiences.CreateDoctorWorkExperience;
using PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup;
using PhysioBoo.Application.Commands.HospitalGroups.DeleteHospitalGroup;
using PhysioBoo.Application.Commands.HospitalGroups.UpdateHospitalGroup;
using PhysioBoo.Application.Commands.Hospitals.CreateHospital;
using PhysioBoo.Application.Commands.Hospitals.DeleteHospital;
using PhysioBoo.Application.Commands.Hospitals.UpdateHospital;
using PhysioBoo.Application.Commands.HospitalStaffs.CreateHospitalStaff;
using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Application.Commands.ImagingModalities.DeleteImagingModality;
using PhysioBoo.Application.Commands.ImagingModalities.UpdateImagingModality;
using PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder;
using PhysioBoo.Application.Commands.ImagingReports.CreateImagingReport;
using PhysioBoo.Application.Commands.InsuranceCompanies.CreateInsuranceCompany;
using PhysioBoo.Application.Commands.InsuranceCompanies.DeleteInsuranceCompany;
using PhysioBoo.Application.Commands.InsuranceCompanies.UpdateInsuranceCompany;
using PhysioBoo.Application.Commands.LabOrderItems.CreateLabOrderItem;
using PhysioBoo.Application.Commands.LabOrders.CreateLabOrder;
using PhysioBoo.Application.Commands.LabReports.CreateLabReport;
using PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory;
using PhysioBoo.Application.Commands.LabTestCategories.DeleteLabTestCategory;
using PhysioBoo.Application.Commands.LabTestCategories.UpdateLabTestCategory;
using PhysioBoo.Application.Commands.LabTests.CreateLabTest;
using PhysioBoo.Application.Commands.LabTests.DeleteLabTest.Commands.DeleteLabTestCommand;
using PhysioBoo.Application.Commands.LabTests.UpdateLabTest.Commands.UpdateLabTestCommand;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Application.Commands.Manufacturers.DeleteManufacturer;
using PhysioBoo.Application.Commands.Manufacturers.UpdateManufacturer;
using PhysioBoo.Application.Commands.Media.DeleteFile;
using PhysioBoo.Application.Commands.MedicalRecords.CreateMedicalRecord;
using PhysioBoo.Application.Commands.MedicalSpecialties.CreateMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicalSpecialties.DeleteMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicalSpecialties.UpdateMedicalSpecialty;
using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Application.Commands.MedicineCategories.DeleteMedicineCategory;
using PhysioBoo.Application.Commands.MedicineCategories.UpdateMedicineCategory;
using PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory;
using PhysioBoo.Application.Commands.Medicines.CreateMedicine;
using PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy;
using PhysioBoo.Application.Commands.PatientMedicalHistories.CreatePatientMedicalHistory;
using PhysioBoo.Application.Commands.Patients.CreatePatient;
using PhysioBoo.Application.Commands.Patients.DeletePatient;
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
using PhysioBoo.Application.Commands.Suppliers.DeleteSupplier;
using PhysioBoo.Application.Commands.Suppliers.UpdateSupplier;
using PhysioBoo.Application.Commands.Sys_Media.CreateMedia;
using PhysioBoo.Application.Commands.Sys_Resources.ImportLocalResource;
using PhysioBoo.Application.Commands.Sys_Resources.ImportRemoteResource;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.CreateSys_SequenceTracker;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.DeleteSys_SequenceTracker;
using PhysioBoo.Application.Commands.Sys_SequenceTrackers.UpdateSys_SequenceTracker;
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
using PhysioBoo.Application.Queries.Addresses.GetAll;
using PhysioBoo.Application.Queries.Addresses.GetById;
using PhysioBoo.Application.Queries.AdminMenus.GetAll;
using PhysioBoo.Application.Queries.AdminMenus.GetById;
using PhysioBoo.Application.Queries.AppointmentTypes.GetAll;
using PhysioBoo.Application.Queries.AppointmentTypes.GetById;
using PhysioBoo.Application.Queries.Configurations.GetInitData;
using PhysioBoo.Application.Queries.Departments.GetAll;
using PhysioBoo.Application.Queries.Departments.GetById;
using PhysioBoo.Application.Queries.Doctors.GetAll;
using PhysioBoo.Application.Queries.Doctors.GetById;
using PhysioBoo.Application.Queries.HospitalGroups.GetAll;
using PhysioBoo.Application.Queries.HospitalGroups.GetById;
using PhysioBoo.Application.Queries.Hospitals.GetAll;
using PhysioBoo.Application.Queries.Hospitals.GetById;
using PhysioBoo.Application.Queries.ImagingModalities.GetAll;
using PhysioBoo.Application.Queries.ImagingModalities.GetById;
using PhysioBoo.Application.Queries.InsuranceCompanies.GetAll;
using PhysioBoo.Application.Queries.InsuranceCompanies.GetById;
using PhysioBoo.Application.Queries.LabTestCategories.GetAll;
using PhysioBoo.Application.Queries.LabTestCategories.GetById;
using PhysioBoo.Application.Queries.LabTestCategories.GetLookup;
using PhysioBoo.Application.Queries.LabTests.GetAll;
using PhysioBoo.Application.Queries.LabTests.GetById;
using PhysioBoo.Application.Queries.Manufacturers.GetAll;
using PhysioBoo.Application.Queries.Manufacturers.GetById;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetAll;
using PhysioBoo.Application.Queries.MedicalSpecialties.GetById;
using PhysioBoo.Application.Queries.MedicineCategories.GetAll;
using PhysioBoo.Application.Queries.MedicineCategories.GetById;
using PhysioBoo.Application.Queries.Patients.GetAll;
using PhysioBoo.Application.Queries.Patients.GetById;
using PhysioBoo.Application.Queries.Permissions.GetAll;
using PhysioBoo.Application.Queries.RefreshTokens.GetByUserId;
using PhysioBoo.Application.Queries.Roles.GetAll;
using PhysioBoo.Application.Queries.Suppliers.GetAll;
using PhysioBoo.Application.Queries.Suppliers.GetById;
using PhysioBoo.Application.Queries.Sys_Languages.GetAllLanguages;
using PhysioBoo.Application.Queries.Sys_Resources.GetAllResources;
using PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetAll;
using PhysioBoo.Application.Queries.Sys_SequenceTrackers.GetById;
using PhysioBoo.Application.Queries.Sys_Settings.GetAll;
using PhysioBoo.Application.Queries.Users.GetAll;
using PhysioBoo.Application.Queries.Users.GetByEmail;
using PhysioBoo.Application.Queries.Users.GetById;
using PhysioBoo.Application.Queries.Users.GetProfile;
using PhysioBoo.Application.Queries.VerificationTokens.GetById;
using PhysioBoo.Application.Queries.VerificationTokens.GetByToken;
using PhysioBoo.Application.Services;
using PhysioBoo.Application.SortProviders;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.Application.ViewModels.Configurations;
using PhysioBoo.Application.ViewModels.Departments;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Application.ViewModels.InsuranceCompanies;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Application.ViewModels.LabTests;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.Application.ViewModels.Sys_Languages;
using PhysioBoo.Application.ViewModels.Sys_SequenceTrackers;
using PhysioBoo.Application.ViewModels.Sys_Settings;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Entities.System;
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

            // Cloudinary
            services.AddScoped<ICloudinaryService, CloudinaryService>();

            // Template Dictionary
            services.AddScoped<ITemplateDictionaryService, TemplateDictionaryService>();

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
            services.AddScoped<IRequestHandler<GetUserProfileQuery, UserProfileViewModel?>, GetUserProfileQueryHandler>();

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
            services.AddScoped<IRequestHandler<GetAdminMenuByIdQuery, AdminMenuViewModel?>, GetAdminMenuByIdQueryHandler>();

            // MedicalSpecialty
            services.AddScoped<IRequestHandler<GetAllMedicalSpecialtiesQuery, PagedResult<MedicalSpecialtyViewModel>>, GetAllMedicalSpecialtiesQueryHandler>();
            services.AddScoped<IRequestHandler<GetMedicalSpecialtyByIdQuery, MedicalSpecialtyViewModel?>, GetMedicalSpecialtyByIdQueryHandler>();

            // System Language
            services.AddScoped<IRequestHandler<GetAllLanguagesQuery, List<LanguageViewModel>>, GetAllLanguagesQueryHandler>();

            // System Resource
            services.AddScoped<IRequestHandler<GetAllResourceQuery, string>, GetAllResourceQueryHandler>();

            // System Setting
            services.AddScoped<IRequestHandler<GetAllSettingsQuery, PagedResult<SettingViewModel>>, GetAllSettingsQueryHandler>();

            // Department
            services.AddScoped<IRequestHandler<GetAllDepartmentsQuery, PagedResult<DepartmentViewModel>>, GetAllDepartmentsQueryHandler>();
            services.AddScoped<IRequestHandler<GetDepartmentByIdQuery, DepartmentViewModel?>, GetDepartmentByIdQueryHandler>();

            // Appointment Type
            services.AddScoped<IRequestHandler<GetAllAppointmentTypesQuery, PagedResult<AppointmentTypeViewModel>>, GetAllAppointmentTypesQueryHandler>();
            services.AddScoped<IRequestHandler<GetAppointmentTypeByIdQuery, AppointmentTypeViewModel?>, GetAppointmentTypeByIdQueryHandler>();

            // Imaging Modality
            services.AddScoped<IRequestHandler<GetAllImagingModalitiesQuery, PagedResult<ImagingModalityViewModel>>, GetAllImagingModalitiesQueryHandler>();
            services.AddScoped<IRequestHandler<GetImagingModalityByIdQuery, ImagingModalityViewModel?>, GetImagingModalityByIdQueryHandler>();

            // Medicine Category
            services.AddScoped<IRequestHandler<GetAllMedicineCategoriesQuery, PagedResult<MedicineCategoryViewModel>>, GetAllMedicineCategoriesQueryHandler>();
            services.AddScoped<IRequestHandler<GetMedicineCategoryByIdQuery, MedicineCategoryViewModel?>, GetMedicineCategoryByIdQueryHandler>();

            // Insurance Company
            services.AddScoped<IRequestHandler<GetAllInsuranceCompaniesQuery, PagedResult<InsuranceCompanyViewModel>>, GetAllInsuranceCompaniesQueryHandler>();
            services.AddScoped<IRequestHandler<GetInsuranceCompanyByIdQuery, InsuranceCompanyViewModel?>, GetInsuranceCompanyByIdQueryHandler>();

            // Manufacturer
            services.AddScoped<IRequestHandler<GetAllManufacturersQuery, PagedResult<ManufacturerViewModel>>, GetAllManufacturersQueryHandler>();
            services.AddScoped<IRequestHandler<GetManufacturerByIdQuery, ManufacturerViewModel?>, GetManufacturerByIdQueryHandler>();

            // Insurance Company
            services.AddScoped<IRequestHandler<GetAllSuppliersQuery, PagedResult<SupplierViewModel>>, GetAllSuppliersQueryHandler>();
            services.AddScoped<IRequestHandler<GetSupplierByIdQuery, SupplierViewModel?>, GetSupplierByIdQueryHandler>();

            // Lab Test Category
            services.AddScoped<IRequestHandler<GetAllLabTestCategoriesQuery, PagedResult<LabTestCategoryViewModel>>, GetAllLabTestCategoriesQueryHandler>();
            services.AddScoped<IRequestHandler<GetLabTestCategoryByIdQuery, LabTestCategoryViewModel?>, GetLabTestCategoryByIdQueryHandler>();
            services.AddScoped<IRequestHandler<GetLabTestCategoryLookupsQuery, PagedResult<LabTestCategoryLookupViewModel>>, GetLabTestCategoryLookupsQueryHandler>();

            // Lab Test 
            services.AddScoped<IRequestHandler<GetAllLabTestsQuery, PagedResult<LabTestViewModel>>, GetAllLabTestsQueryHandler>();
            services.AddScoped<IRequestHandler<GetLabTestByIdQuery, LabTestViewModel?>, GetLabTestByIdQueryHandler>();

            // Sequence Tracker
            services.AddScoped<IRequestHandler<GetAllSys_SequenceTrackersQuery, PagedResult<Sys_SequenceTrackerViewModel>>, GetAllSys_SequenceTrackersQueryHandler>();
            services.AddScoped<IRequestHandler<GetSys_SequenceTrackerByIdQuery, Sys_SequenceTrackerViewModel?>, GetSys_SequenceTrackerByIdQueryHandler>();

            // Doctor
            services.AddScoped<IRequestHandler<GetAllDoctorsQuery, PagedResult<DoctorViewModel>>, GetAllDoctorsQueryHandler>();
            services.AddScoped<IRequestHandler<GetDoctorByIdQuery, DoctorViewModel?>, GetDoctorByIdQueryHandler>();

            // Hospital Group
            services.AddScoped<IRequestHandler<GetAllHospitalGroupsQuery, PagedResult<HospitalGroupViewModel>>, GetAllHospitalGroupsQueryHandler>();
            services.AddScoped<IRequestHandler<GetHospitalGroupByIdQuery, HospitalGroupViewModel?>, GetHospitalGroupByIdQueryHandler>();

            // Hospital
            services.AddScoped<IRequestHandler<GetAllHospitalsQuery, PagedResult<HospitalViewModel>>, GetAllHospitalsQueryHandler>();
            services.AddScoped<IRequestHandler<GetHospitalByIdQuery, HospitalViewModel?>, GetHospitalByIdQueryHandler>();

            // Address
            services.AddScoped<IRequestHandler<GetAllAddressesQuery, PagedResult<AddressViewModel>>, GetAllAddressesQueryHandler>();
            services.AddScoped<IRequestHandler<GetAddressByIdQuery, AddressViewModel?>, GetAddressByIdQueryHandler>();

            // Patient
            services.AddScoped<IRequestHandler<GetAllPatientsQuery, PagedResult<PatientViewModel>>, GetAllPatientsQueryHandler>();
            services.AddScoped<IRequestHandler<GetPatientByIdQuery, PatientViewModel?>, GetPatientByIdQueryHandler>();

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
            services.AddScoped<IRequestHandler<UpdateMedicalSpecialtyCommand>, UpdateMedicalSpecialtyCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateDoctorCommand>, UpdateDoctorCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteDoctorCommand>, DeleteDoctorCommandHandler>();
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
            services.AddScoped<IRequestHandler<CreateAdminMenuCommand>, CreateAdminMenuCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateAdminMenuCommand>, UpdateAdminMenuCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteAdminMenuCommand>, DeleteAdminMenuCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteAddressCommand>, DeleteAddressCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateAddressCommand>, UpdateAddressCommandHandler>();
            #endregion

            #region Patient Flow
            services.AddScoped<IRequestHandler<CreatePatientCommand>, CreatePatientCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePatientAllergyCommand>, CreatePatientAllergyCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePatientMedicalHistoryCommand>, CreatePatientMedicalHistoryCommandHandler>();
            services.AddScoped<IRequestHandler<DeletePatientCommand>, DeletePatientCommandHandler>();
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
            services.AddScoped<IRequestHandler<DeleteAppointmentTypeCommand>, DeleteAppointmentTypeCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateAppointmentTypeCommand>, UpdateAppointmentTypeCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateHospitalCommand>, UpdateHospitalCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteHospitalCommand>, DeleteHospitalCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateHospitalGroupCommand>, UpdateHospitalGroupCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteHospitalGroupCommand>, DeleteHospitalGroupCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteDepartmentCommand>, DeleteDepartmentCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateDepartmentCommand>, UpdateDepartmentCommandHandler>();
            #endregion

            #region Support Flow
            services.AddScoped<IRequestHandler<CreateInsuranceCompanyCommand>, CreateInsuranceCompanyCommandHandler>();
            services.AddScoped<IRequestHandler<CreateManufacturerCommand>, CreateManufacturerCommandHandler>();
            services.AddScoped<IRequestHandler<CreateSupplierCommand>, CreateSupplierCommandHandler>();
            services.AddScoped<IRequestHandler<CreateReviewCommand>, CreateReviewCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteInsuranceCompanyCommand>, DeleteInsuranceCompanyCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateInsuranceCompanyCommand>, UpdateInsuranceCompanyCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteManufacturerCommand>, DeleteManufacturerCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateManufacturerCommand>, UpdateManufacturerCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteSupplierCommand>, DeleteSupplierCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateSupplierCommand>, UpdateSupplierCommandHandler>();
            #endregion

            #region Clinical Flow
            services.AddScoped<IRequestHandler<CreateMedicalRecordCommand>, CreateMedicalRecordCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePrescriptionCommand>, CreatePrescriptionCommandHandler>();
            services.AddScoped<IRequestHandler<CreatePrescriptionItemCommand>, CreatePrescriptionItemCommandHandler>();
            services.AddScoped<IRequestHandler<CreateMedicineCategoryCommand>, CreateMedicineCategoryCommandHandler>();
            services.AddScoped<IRequestHandler<CreateMedicineCommand>, CreateMedicineCommandHandler>();
            services.AddScoped<IRequestHandler<CreateMedicineInventoryCommand>, CreateMedicineInventoryCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteMedicineCategoryCommand>, DeleteMedicineCategoryCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateMedicineCategoryCommand>, UpdateMedicineCategoryCommandHandler>();
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
            services.AddScoped<IRequestHandler<DeleteImagingModalityCommand>, DeleteImagingModalityCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateImagingModalityCommand>, UpdateImagingModalityCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteLabTestCategoryCommand>, DeleteLabTestCategoryCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateLabTestCategoryCommand>, UpdateLabTestCategoryCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteLabTestCommand>, DeleteLabTestCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateLabTestCommand>, UpdateLabTestCommandHandler>();
            #endregion

            #region System Flow
            services.AddScoped<IRequestHandler<CreateMediaCommand>, CreateMediaCommandHandler>();
            services.AddScoped<IRequestHandler<ImportLocalResourceCommand>, ImportLocalResourceCommandHandler>();
            services.AddScoped<IRequestHandler<ImportRemoteResourceCommand>, ImportRemoteResourceCommandHandler>();
            services.AddScoped<IRequestHandler<BlockIpCommand>, SecurityCommandHandler>();
            services.AddScoped<IRequestHandler<UnblockIpCommand>, SecurityCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteFileCommand>, DeleteFileCommandHandler>();
            services.AddScoped<IRequestHandler<CreateSys_SequenceTrackerCommand>, CreateSys_SequenceTrackerCommandHandler>();
            services.AddScoped<IRequestHandler<UpdateSys_SequenceTrackerCommand>, UpdateSys_SequenceTrackerCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteSys_SequenceTrackerCommand>, DeleteSys_SequenceTrackerCommandHandler>();
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

        public static IServiceCollection AddSortProviders(this IServiceCollection services)
        {
            services.AddScoped<ISortingExpressionProvider<MedicalSpecialtyViewModel, MedicalSpecialty>, MedicalSpecialtyViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<DepartmentViewModel, Department>, DepartmentViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<AppointmentTypeViewModel, AppointmentType>, AppointmentTypeViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<ImagingModalityViewModel, ImagingModality>, ImagingModalityViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<MedicineCategoryViewModel, MedicineCategory>, MedicineCategoryViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<InsuranceCompanyViewModel, InsuranceCompany>, InsuranceCompanyViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<ManufacturerViewModel, Manufacturer>, ManufacturerViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<SupplierViewModel, Supplier>, SupplierViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<LabTestCategoryViewModel, LabTestCategory>, LabTestCategoryViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<LabTestViewModel, LabTest>, LabTestViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<Sys_SequenceTrackerViewModel, Sys_SequenceTracker>, Sys_SequenceTrackerViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<DoctorViewModel, Doctor>, DoctorViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<HospitalGroupViewModel, HospitalGroup>, HospitalGroupViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<HospitalViewModel, Hospital>, HospitalViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<AdminMenuViewModel, AdminMenu>, AdminMenuViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<AddressViewModel, Address>, AddressViewModelSortProvider>();
            services.AddScoped<ISortingExpressionProvider<PatientViewModel, Patient>, PatientViewModelSortProvider>();

            return services;
        }
    }
}
