using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppointmentTypes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    DefaultDuration = table.Column<int>(type: "integer", nullable: false),
                    BufferTime = table.Column<int>(type: "integer", nullable: false),
                    IsEmergency = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresPreparation = table.Column<bool>(type: "boolean", nullable: false),
                    PreparationInstructions = table.Column<string>(type: "text", nullable: true),
                    IsFollowUp = table.Column<bool>(type: "boolean", nullable: false),
                    ConsultationFee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ColorCode = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HospitalGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    HeadquartersAddress = table.Column<string>(type: "text", nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EstablishedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LicenseNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AccreditationDetails = table.Column<string>(type: "jsonb", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HospitalGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ImagingModalities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RequiresContrast = table.Column<bool>(type: "boolean", nullable: false),
                    PreparationRequired = table.Column<bool>(type: "boolean", nullable: false),
                    PreparationInstructions = table.Column<string>(type: "text", nullable: true),
                    AverageDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    RadiationDose = table.Column<decimal>(type: "numeric(8,4)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImagingModalities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InsuranceCompanies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContactPerson = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CashlessFacility = table.Column<bool>(type: "boolean", nullable: false),
                    ReimbursementFacility = table.Column<bool>(type: "boolean", nullable: false),
                    NetworkHospitals = table.Column<string>(type: "jsonb", nullable: true),
                    MaximumCoverageAmount = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    ClaimSettlementRatio = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    AverageClaimSettlementTime = table.Column<int>(type: "integer", nullable: false),
                    RequiredDocuments = table.Column<string[]>(type: "text[]", nullable: false),
                    TermAndConditions = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InsuranceCompanies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LabTestCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabTestCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Manufacturers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CompanyCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LicenseNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GmpCertified = table.Column<bool>(type: "boolean", nullable: false),
                    IsoCertified = table.Column<bool>(type: "boolean", nullable: false),
                    FdaApproved = table.Column<bool>(type: "boolean", nullable: false),
                    EstablishedYear = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manufacturers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicalSpecialties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    RequiredQualifications = table.Column<string>(type: "text", nullable: true),
                    AverageConsultationDuration = table.Column<int>(type: "integer", nullable: false),
                    IsSurgical = table.Column<bool>(type: "boolean", nullable: false),
                    IsDiagnostic = table.Column<bool>(type: "boolean", nullable: false),
                    ParentSpecialtyId = table.Column<Guid>(type: "uuid", nullable: true),
                    IconUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalSpecialties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicalSpecialties_MedicalSpecialties_ParentSpecialtyId",
                        column: x => x.ParentSpecialtyId,
                        principalTable: "MedicalSpecialties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicinesCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ParentCategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsControlled = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresPrescription = table.Column<bool>(type: "boolean", nullable: false),
                    StorageConditions = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicinesCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicinesCategories_MedicinesCategories_ParentCategoryId",
                        column: x => x.ParentCategoryId,
                        principalTable: "MedicinesCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: false),
                    Gender = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    BloodGroup = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    MaritalStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Nationality = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IdentificationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IdentificationNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IdentificationExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmergencyContactName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    EmergencyContactRelationship = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PreferredCommunication = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Supplier",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    SupplierCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContactPerson = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AlternatePhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Address = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StateProvince = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BusinessRegistrationNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TaxIdentificationNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GstNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PanNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DrugLicenseNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DrugLicenseExpiry = table.Column<DateOnly>(type: "date", nullable: true),
                    FdaRegistrationNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsoCertification = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GmpCertified = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentTerms = table.Column<string>(type: "text", nullable: true),
                    CreditLimit = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    BankAccountDetails = table.Column<string>(type: "jsonb", nullable: true),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: false),
                    MinimumOrderValue = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    DeliveryReliabilityScore = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    QualityRating = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    ServiceRating = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    TotalOrders = table.Column<int>(type: "integer", nullable: false),
                    TotalPurchaseValue = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    LastOrderDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Supplier", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AlternatePhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    EmailVerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PhoneVerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FailedLoginAttempts = table.Column<int>(type: "integer", nullable: false),
                    AccountLockedUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorSecret = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ProfilePicture = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PreferredLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TimeZone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Users_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Hospitals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalGroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    HospitalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    HospitalType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BedCapacity = table.Column<int>(type: "integer", nullable: false),
                    IcuCapacity = table.Column<int>(type: "integer", nullable: false),
                    EmergencyCapacity = table.Column<int>(type: "integer", nullable: false),
                    OperationTheaters = table.Column<int>(type: "integer", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StateProvince = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Fax = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EmergencyPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AmbulancePhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric(10,8)", nullable: true),
                    Longtitude = table.Column<decimal>(type: "numeric(11,8)", nullable: true),
                    EstablishedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LicenseNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LicenseExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AccreditationBody = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AccreditationExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InsuranceAccepted = table.Column<string[]>(type: "text[]", nullable: false),
                    LanguagesSupported = table.Column<string[]>(type: "text[]", nullable: false),
                    Facilities = table.Column<string>(type: "jsonb", nullable: true),
                    OperatingHours = table.Column<string>(type: "jsonb", nullable: true),
                    Is24Hours = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Images = table.Column<string>(type: "jsonb", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    MissionStatement = table.Column<string>(type: "text", nullable: true),
                    VisionStatement = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hospitals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Hospitals_HospitalGroups_HospitalGroupId",
                        column: x => x.HospitalGroupId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LabTests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TestName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TestCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    SampleType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SampleVolume = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CollectionInstructions = table.Column<string>(type: "text", nullable: true),
                    PreparationRequired = table.Column<bool>(type: "boolean", nullable: false),
                    PreparationInstructions = table.Column<string>(type: "text", nullable: true),
                    FastingRequired = table.Column<bool>(type: "boolean", nullable: false),
                    FastingHours = table.Column<int>(type: "integer", nullable: false),
                    NormalRangeMale = table.Column<string>(type: "text", nullable: true),
                    NormalRangeFemale = table.Column<string>(type: "text", nullable: true),
                    NormalPediatric = table.Column<string>(type: "text", nullable: true),
                    UnitOfMeasurement = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Methodology = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReportingTimeHours = table.Column<int>(type: "integer", nullable: false),
                    Cost = table.Column<decimal>(type: "numeric(8,2)", nullable: false),
                    IsProfile = table.Column<bool>(type: "boolean", nullable: false),
                    IsUrgentAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    UrgentCost = table.Column<decimal>(type: "numeric(8,2)", nullable: false),
                    UrgentReportingTimeHours = table.Column<int>(type: "integer", nullable: false),
                    IsHomeCollectionAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    HomeCollectionCharge = table.Column<decimal>(type: "numeric(8,2)", nullable: false),
                    RequiresAppoinment = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabTests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabTests_LabTestCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "LabTestCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Medicines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    GenericName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    BrandName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    ManufacturerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Composition = table.Column<string>(type: "text", nullable: true),
                    Strength = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DosageForm = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RouteOfAdministration = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PackSize = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Mrp = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    PurchasePrice = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    SellingPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    HsnCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DrugCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BatchNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ManufacturingDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsPrescriptionRequired = table.Column<bool>(type: "boolean", nullable: false),
                    IsControlledSubstance = table.Column<bool>(type: "boolean", nullable: false),
                    ControlledSubstanceSchedule = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    MinimumAge = table.Column<int>(type: "integer", nullable: false),
                    MaximumAge = table.Column<int>(type: "integer", nullable: true),
                    PregnancyCategory = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    StorageTemperatureMin = table.Column<int>(type: "integer", nullable: true),
                    StorageTemperatureMax = table.Column<int>(type: "integer", nullable: true),
                    StorageConditions = table.Column<string>(type: "text", nullable: true),
                    SideEffects = table.Column<string>(type: "text", nullable: true),
                    Contraindications = table.Column<string>(type: "text", nullable: true),
                    DrugInteractions = table.Column<string>(type: "text", nullable: true),
                    OverdoseSymptoms = table.Column<string>(type: "text", nullable: true),
                    UsageInstructions = table.Column<string>(type: "text", nullable: true),
                    WarningLabels = table.Column<string[]>(type: "text[]", nullable: false),
                    Barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    QrCode = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsGeneric = table.Column<bool>(type: "boolean", nullable: false),
                    IsBanned = table.Column<bool>(type: "boolean", nullable: false),
                    BanReason = table.Column<string>(type: "text", nullable: true),
                    TherapeuticClass = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PharmacologicalClass = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ApprovalNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ApprovalDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Medicines_Manufacturers_ManufacturerId",
                        column: x => x.ManufacturerId,
                        principalTable: "Manufacturers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Medicines_MedicinesCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "MedicinesCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddressType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Street = table.Column<string>(type: "text", nullable: false),
                    ApartmentUnit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StateProvince = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Latitude = table.Column<decimal>(type: "numeric(10,8)", nullable: false),
                    Longitude = table.Column<decimal>(type: "numeric(11,8)", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Addresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DepartmentCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    HeadOfDepartment = table.Column<Guid>(type: "uuid", nullable: true),
                    FloorNumber = table.Column<int>(type: "integer", nullable: true),
                    Wing = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BudgetAllocated = table.Column<decimal>(type: "numeric(15,2)", nullable: true),
                    BedCount = table.Column<int>(type: "integer", nullable: false),
                    IsEmergency = table.Column<bool>(type: "boolean", nullable: false),
                    IsCriticalCare = table.Column<bool>(type: "boolean", nullable: false),
                    IsOutPatient = table.Column<bool>(type: "boolean", nullable: false),
                    IsInPatient = table.Column<bool>(type: "boolean", nullable: false),
                    OperationHours = table.Column<string>(type: "jsonb", nullable: true),
                    EquipmentList = table.Column<string>(type: "jsonb", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departments_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Departments_Users_HeadOfDepartment",
                        column: x => x.HeadOfDepartment,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicinesInventories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    BatchNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    QuantityReceived = table.Column<int>(type: "integer", nullable: false),
                    QuantityAvailable = table.Column<int>(type: "integer", nullable: false),
                    QuantitySold = table.Column<int>(type: "integer", nullable: false),
                    QuantityExpired = table.Column<int>(type: "integer", nullable: false),
                    QuantityDamaged = table.Column<int>(type: "integer", nullable: false),
                    UnitPurchasePrice = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    UnitSellingPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    TotalPurchaseValue = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    StorageLocation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MinimumStockLevel = table.Column<int>(type: "integer", nullable: false),
                    MaximumStockLevel = table.Column<int>(type: "integer", nullable: false),
                    ReorderLevel = table.Column<int>(type: "integer", nullable: false),
                    IsExpired = table.Column<bool>(type: "boolean", nullable: false),
                    IsNearExpiry = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicinesInventories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicinesInventories_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicinesInventories_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicinesInventories_Supplier_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Supplier",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HospitalStaffs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    StaffType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Position = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EmploymentType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Salary = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    HourlyRate = table.Column<decimal>(type: "numeric(8,2)", nullable: true),
                    JoiningDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ProbationEndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    TerminationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EmploymentStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ShiftPattern = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReportingManger = table.Column<Guid>(type: "uuid", nullable: true),
                    EmergencyContactName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    BloodGroup = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    MedicalFitnessExpiry = table.Column<DateOnly>(type: "date", nullable: true),
                    PoliceVerificationStatus = table.Column<bool>(type: "boolean", nullable: false),
                    BankAccountDetails = table.Column<string>(type: "jsonb", nullable: true),
                    PanNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    EsiNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PfNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HospitalStaffs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HospitalStaffs_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HospitalStaffs_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HospitalStaffs_Users_ReportingManger",
                        column: x => x.ReportingManger,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentTypeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ScheduledTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    ScheduledEndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    ActualStartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    ActualEndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    AppointmentStatus = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    ConsultationType = table.Column<string>(type: "text", nullable: false),
                    ChiefComplaint = table.Column<string>(type: "text", nullable: true),
                    Symptoms = table.Column<string>(type: "text", nullable: true),
                    ReasonForVisit = table.Column<string>(type: "text", nullable: true),
                    ReferralReason = table.Column<string>(type: "text", nullable: true),
                    ReferringDoctorId = table.Column<Guid>(type: "uuid", nullable: true),
                    PreAppointmentNotes = table.Column<string>(type: "text", nullable: true),
                    PostAppointmentNotes = table.Column<string>(type: "text", nullable: true),
                    Diagnosis = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    PrescriptionsGiven = table.Column<string>(type: "text", nullable: true),
                    InvestigationsOrdered = table.Column<string>(type: "text", nullable: true),
                    FollowUpRequired = table.Column<bool>(type: "boolean", nullable: false),
                    FollowUpDate = table.Column<DateOnly>(type: "date", nullable: true),
                    FollowUpInstructions = table.Column<string>(type: "text", nullable: true),
                    ConsultationFee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    AdditionalCharges = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "text", nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    InsuranceClaimAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    RoomNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    QueueNumber = table.Column<int>(type: "integer", nullable: false),
                    EstimatedWaitTime = table.Column<int>(type: "integer", nullable: false),
                    PatientSatisfactionRating = table.Column<int>(type: "integer", nullable: false),
                    PatientFeedback = table.Column<string>(type: "text", nullable: true),
                    CancellationReason = table.Column<string>(type: "text", nullable: true),
                    CancelledBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RescheduledFromAppointmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_AppointmentTypes_AppointmentTypeId",
                        column: x => x.AppointmentTypeId,
                        principalTable: "AppointmentTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Appointments_RescheduledFromAppointmentId",
                        column: x => x.RescheduledFromAppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Users_CancelledBy",
                        column: x => x.CancelledBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReviewType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    OverallRating = table.Column<int>(type: "integer", nullable: false),
                    DoctorPunctuality = table.Column<int>(type: "integer", nullable: false),
                    DoctorBehavior = table.Column<int>(type: "integer", nullable: false),
                    TreatmentSatisfaction = table.Column<int>(type: "integer", nullable: false),
                    FacilityCleanliness = table.Column<int>(type: "integer", nullable: false),
                    StaffBehavior = table.Column<int>(type: "integer", nullable: false),
                    ValueForMoney = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    Pros = table.Column<string>(type: "text", nullable: true),
                    Cons = table.Column<string>(type: "text", nullable: true),
                    WouldRecommend = table.Column<bool>(type: "boolean", nullable: false),
                    VisitedFor = table.Column<string>(type: "text", nullable: true),
                    WaitTimeMinutes = table.Column<int>(type: "integer", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    IsAnonymous = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    HelpfulCount = table.Column<int>(type: "integer", nullable: false),
                    NotHelpfulCount = table.Column<int>(type: "integer", nullable: false),
                    ReportedCount = table.Column<int>(type: "integer", nullable: false),
                    ModerationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ModerationNotes = table.Column<string>(type: "text", nullable: true),
                    ModeratedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ModeratedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResponseText = table.Column<string>(type: "text", nullable: true),
                    ResponseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RespondedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_ModeratedBy",
                        column: x => x.ModeratedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_RespondedBy",
                        column: x => x.RespondedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BillItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BillId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ItemCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ItemName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    TaxPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    PerformedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    PerformedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReferenceId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsInsuranceCovered = table.Column<bool>(type: "boolean", nullable: false),
                    InsuranceCopayPercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillItems_Users_PerformedBy",
                        column: x => x.PerformedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Bills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BillNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BillDate = table.Column<DateOnly>(type: "date", nullable: false),
                    BillTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Subtotal = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    OutstandingAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaymentTerms = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "numeric(12,4)", nullable: false),
                    InsuranceCompanyId = table.Column<Guid>(type: "uuid", nullable: true),
                    InsuranceClaimNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InsuranceApprovedAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    InsurancePaidAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    PatientCopayAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    TermsAndConditions = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    ApprovedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bills_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bills_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bills_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bills_InsuranceCompanies_InsuranceCompanyId",
                        column: x => x.InsuranceCompanyId,
                        principalTable: "InsuranceCompanies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bills_Users_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bills_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorAwards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    AwardName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AwardCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AwardingOrganization = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AwardLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AwardDate = table.Column<DateOnly>(type: "date", nullable: true),
                    AwardYear = table.Column<int>(type: "integer", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    MonetaryValue = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    CertificateUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MediaCoverageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorAwards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DoctorCertifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    CertificationName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CertificationType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IssuingOrganization = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CertificationNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IssueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsLifetime = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    VerificationUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CertificateDocumentUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorCertifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DoctorEducations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    DegreeType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DegreeName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Specialization = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    InstitutionName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    UniversityName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Location = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CompletionDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DurationYears = table.Column<decimal>(type: "numeric(3,2)", nullable: true),
                    GradePercentage = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    GradeGPA = table.Column<decimal>(type: "numeric(3,2)", nullable: true),
                    GradeClass = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ThesisTitle = table.Column<string>(type: "text", nullable: true),
                    ThesisGuide = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerificationDocumentUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorEducations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DoctorLeaves",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    LeaveType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    TotalDays = table.Column<decimal>(type: "numeric(3,1)", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ApprovedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SubstituteDoctorId = table.Column<Guid>(type: "uuid", nullable: true),
                    EmergencyContact = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DocumentsUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorLeaves", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorLeaves_Users_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorPublications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    PublicationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    JournalName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ConferenceName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Publisher = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PublicationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Volume = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Issue = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Pages = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Doi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Pmid = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Isbm = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ImpactFactor = table.Column<decimal>(type: "numeric(5,3)", nullable: true),
                    CitationCount = table.Column<int>(type: "integer", nullable: false),
                    CoAuthors = table.Column<string>(type: "text", nullable: true),
                    Abstract = table.Column<string>(type: "text", nullable: true),
                    Keywords = table.Column<string[]>(type: "text[]", nullable: false),
                    IsPeerReviewed = table.Column<bool>(type: "boolean", nullable: false),
                    PublicationUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PdfUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorPublications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Doctors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MedicalLicenseNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MedicalLicenseExpiry = table.Column<DateOnly>(type: "date", nullable: false),
                    MedicalLicenseIssuingAuthority = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PrimarySpecialtyId = table.Column<Guid>(type: "uuid", nullable: true),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    YearsOfPractice = table.Column<int>(type: "integer", nullable: false),
                    ConsultationFeeMin = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ConsultationFeeMax = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    FollowUpFee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    EmergencyConsultationFee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    HomeVisitFee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    VideoConsultationFee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    LanguagesSpoken = table.Column<string[]>(type: "text[]", nullable: false),
                    SuccessRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    PatientSatisfactionScore = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    AverageRating = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    TotalReviews = table.Column<int>(type: "integer", nullable: false),
                    TotalPatientTreated = table.Column<int>(type: "integer", nullable: false),
                    TotalSurgeriesPerformed = table.Column<int>(type: "integer", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: true),
                    About = table.Column<string>(type: "text", nullable: true),
                    Archivements = table.Column<string>(type: "text", nullable: true),
                    ResearchInterests = table.Column<string>(type: "text", nullable: true),
                    PublicationsCount = table.Column<int>(type: "integer", nullable: false),
                    ConferencePresentations = table.Column<int>(type: "integer", nullable: false),
                    IsAvailableOnline = table.Column<bool>(type: "boolean", nullable: false),
                    IsAvailableHomeVisit = table.Column<bool>(type: "boolean", nullable: false),
                    IsAvailableEmergency = table.Column<bool>(type: "boolean", nullable: false),
                    ConsultationDuration = table.Column<int>(type: "integer", nullable: false),
                    BufferTime = table.Column<int>(type: "integer", nullable: false),
                    AdvanceBookingDays = table.Column<int>(type: "integer", nullable: false),
                    CancellationPolicy = table.Column<string>(type: "text", nullable: true),
                    PaymentMethods = table.Column<string[]>(type: "text[]", nullable: false),
                    BankAccountDetails = table.Column<string>(type: "text", nullable: true),
                    PanNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Gstin = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    JoiningDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TerminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmploymentStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerificationDate = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    VerifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Doctors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Doctors_Users_VerifiedBy",
                        column: x => x.VerifiedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    BreakStartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    BreakEndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    MaxPatientsPerSlot = table.Column<int>(type: "integer", nullable: false),
                    SlotDuration = table.Column<int>(type: "integer", nullable: false),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ScheduleType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConsultationFee = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorSchedules_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DoctorSchedules_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DoctorSchedules_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorSpecialtys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpecialtyId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProficiencyLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    CertificationNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CertificationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CertificationExpiry = table.Column<DateOnly>(type: "date", nullable: true),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorSpecialtys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorSpecialtys_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DoctorSpecialtys_MedicalSpecialties_SpecialtyId",
                        column: x => x.SpecialtyId,
                        principalTable: "MedicalSpecialties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DoctorWorkExperiences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    PositionTitle = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    EmploymentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OrganizationName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    OrganizationType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Location = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsCurrent = table.Column<bool>(type: "boolean", nullable: false),
                    Responsibilities = table.Column<string>(type: "text", nullable: true),
                    Archievements = table.Column<string>(type: "text", nullable: true),
                    SalaryRange = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReasonForLeaving = table.Column<string>(type: "text", nullable: true),
                    SupervisorName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SupervisorContact = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoctorWorkExperiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DoctorWorkExperiences_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RegistrationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    PatientType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PrimaryDoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferredBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReferralHospitalId = table.Column<Guid>(type: "uuid", nullable: true),
                    InssuranceProvider = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    InssurancePolicyNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InssuranceExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    InssuranceCoverageAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    IsVip = table.Column<bool>(type: "boolean", nullable: false),
                    IsSeniorCitizen = table.Column<bool>(type: "boolean", nullable: false),
                    IsChronicPatient = table.Column<bool>(type: "boolean", nullable: false),
                    MedicalHistory = table.Column<string>(type: "text", nullable: true),
                    FamilyHistory = table.Column<string>(type: "text", nullable: true),
                    SurgicalHistory = table.Column<string>(type: "text", nullable: true),
                    AllergyInformation = table.Column<string>(type: "text", nullable: true),
                    CurrentMedications = table.Column<string>(type: "text", nullable: true),
                    LifestyleNotes = table.Column<string>(type: "text", nullable: true),
                    Occupation = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AnnualIncomeRange = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PreferredHospitalId = table.Column<Guid>(type: "uuid", nullable: true),
                    PreferredDoctorId = table.Column<Guid>(type: "uuid", nullable: true),
                    PreferredAppointmentTime = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CommunicationPreferences = table.Column<string>(type: "jsonb", nullable: true),
                    ConsentForResearch = table.Column<bool>(type: "boolean", nullable: false),
                    ConsentForMarketing = table.Column<bool>(type: "boolean", nullable: false),
                    DataSharingConsent = table.Column<bool>(type: "boolean", nullable: false),
                    LastVisitDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextFollowUpDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalVisits = table.Column<int>(type: "integer", nullable: false),
                    TotalAmountSpent = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    OutstandingBalance = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    LoyaltyPoints = table.Column<int>(type: "integer", nullable: false),
                    RiskLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Patients_Doctors_PreferredDoctorId",
                        column: x => x.PreferredDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Patients_Doctors_PrimaryDoctorId",
                        column: x => x.PrimaryDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Patients_Doctors_ReferredBy",
                        column: x => x.ReferredBy,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Patients_Hospitals_PreferredHospitalId",
                        column: x => x.PreferredHospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Patients_Hospitals_ReferralHospitalId",
                        column: x => x.ReferralHospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ImagingOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModalityId = table.Column<Guid>(type: "uuid", nullable: false),
                    BodyPart = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ClinicalIndication = table.Column<string>(type: "text", nullable: true),
                    ClinicalHistory = table.Column<string>(type: "text", nullable: true),
                    ProvisionalDiagnosis = table.Column<string>(type: "text", nullable: true),
                    SpecificQuestions = table.Column<string>(type: "text", nullable: true),
                    ContrastRequired = table.Column<bool>(type: "boolean", nullable: false),
                    ContrastType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LabPriority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ScheduledTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    EstimatedDuration = table.Column<int>(type: "integer", nullable: false),
                    PreparationGiven = table.Column<bool>(type: "boolean", nullable: false),
                    PatientWeight = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    PatientHeight = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    AllergiesNoted = table.Column<string>(type: "text", nullable: true),
                    PregnancyStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ImplantsPresent = table.Column<bool>(type: "boolean", nullable: false),
                    ImplantDetails = table.Column<string>(type: "text", nullable: true),
                    Claustrophobia = table.Column<bool>(type: "boolean", nullable: false),
                    TotalCost = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TechnicianId = table.Column<Guid>(type: "uuid", nullable: true),
                    RadiologistId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImagingOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_ImagingModalities_ModalityId",
                        column: x => x.ModalityId,
                        principalTable: "ImagingModalities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_Users_RadiologistId",
                        column: x => x.RadiologistId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingOrders_Users_TechnicianId",
                        column: x => x.TechnicianId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LabOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderDate = table.Column<DateOnly>(type: "date", nullable: false),
                    OrderTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    ClinicalHistory = table.Column<string>(type: "text", nullable: true),
                    PrivisionalDiagnosis = table.Column<string>(type: "text", nullable: true),
                    LabPriority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CollectionType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CollectionDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CollectionTime = table.Column<TimeOnly>(type: "time without time zone", nullable: true),
                    CollectionAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SpecialInstructions = table.Column<string>(type: "text", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    FinalAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    OrderStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ReportDeliveryMethod = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabOrders_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrders_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrders_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrders_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrders_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicalRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecordNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecordDate = table.Column<DateOnly>(type: "date", nullable: false),
                    RecordType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ChiefComplaint = table.Column<string>(type: "text", nullable: true),
                    HistoryOfPresentIllness = table.Column<string>(type: "text", nullable: true),
                    PastMedicalHistory = table.Column<string>(type: "text", nullable: true),
                    FamilyHistory = table.Column<string>(type: "text", nullable: true),
                    SocialHistory = table.Column<string>(type: "text", nullable: true),
                    ReviewOfSystems = table.Column<string>(type: "text", nullable: true),
                    PhysicalExamination = table.Column<string>(type: "text", nullable: true),
                    VitalSigns = table.Column<string>(type: "text", nullable: true),
                    ClinicalFindings = table.Column<string>(type: "text", nullable: true),
                    ProvisionalDiagnosis = table.Column<string>(type: "text", nullable: true),
                    FinalDiagnosis = table.Column<string>(type: "text", nullable: true),
                    Icd10Codes = table.Column<string[]>(type: "text[]", nullable: false),
                    DifferencentialDiagnosis = table.Column<string>(type: "text", nullable: true),
                    TreatmentPlan = table.Column<string>(type: "text", nullable: true),
                    MedicationsPrescribed = table.Column<string>(type: "text", nullable: true),
                    ProceduresPerformed = table.Column<string>(type: "text", nullable: true),
                    InvestigationsOrdered = table.Column<string>(type: "text", nullable: true),
                    FollowUpInstructions = table.Column<string>(type: "text", nullable: true),
                    Prognosis = table.Column<string>(type: "text", nullable: true),
                    DoctorNotes = table.Column<string>(type: "text", nullable: true),
                    PatientEducationProvided = table.Column<string>(type: "text", nullable: true),
                    DischargeSummary = table.Column<string>(type: "text", nullable: true),
                    IsConfidential = table.Column<bool>(type: "boolean", nullable: false),
                    AccessLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PatientAllergies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    AllergenName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AllergenType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReactionType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FirstOccurenceDate = table.Column<DateOnly>(type: "date", nullable: true),
                    LastOccurenceDate = table.Column<DateOnly>(type: "date", nullable: true),
                    TreatmentGiven = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientAllergies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientAllergies_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PatientMedicalHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConditionName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ConditionCategory = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Icd10Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    DiagnosedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DiagnosedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    DiagnosisHospitalId = table.Column<Guid>(type: "uuid", nullable: true),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CurrentStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TreatmentSummary = table.Column<string>(type: "text", nullable: true),
                    MedicationsPrescribed = table.Column<string>(type: "text", nullable: true),
                    FollowUpRequired = table.Column<bool>(type: "boolean", nullable: false),
                    NextReviewDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientMedicalHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientMedicalHistories_Doctors_DiagnosedBy",
                        column: x => x.DiagnosedBy,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientMedicalHistories_Hospitals_DiagnosisHospitalId",
                        column: x => x.DiagnosisHospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientMedicalHistories_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BillId = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PaymentTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BankName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CashLastFour = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    GatewayResponse = table.Column<string>(type: "jsonb", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FailureReason = table.Column<string>(type: "text", nullable: true),
                    ProcessedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    ReceiptGenerated = table.Column<bool>(type: "boolean", nullable: false),
                    ReceiptUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RefundAmount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    RefundDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RefundReason = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Bills_BillId",
                        column: x => x.BillId,
                        principalTable: "Bills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_Users_ProcessedBy",
                        column: x => x.ProcessedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ImagingReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReportNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ImagingOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudyDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StudyTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    RadiologistId = table.Column<Guid>(type: "uuid", nullable: true),
                    Technique = table.Column<string>(type: "text", nullable: true),
                    Findings = table.Column<string>(type: "text", nullable: true),
                    Impression = table.Column<string>(type: "text", nullable: true),
                    Recommendations = table.Column<string>(type: "text", nullable: true),
                    ComparisonStudies = table.Column<string>(type: "text", nullable: true),
                    Limitations = table.Column<string>(type: "text", nullable: true),
                    CriticalFindings = table.Column<string>(type: "text", nullable: true),
                    IsCritical = table.Column<bool>(type: "boolean", nullable: false),
                    IsNormal = table.Column<bool>(type: "boolean", nullable: false),
                    IsFinal = table.Column<bool>(type: "boolean", nullable: false),
                    IsAmended = table.Column<bool>(type: "boolean", nullable: false),
                    AmendmentReason = table.Column<string>(type: "text", nullable: true),
                    DictatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TranscribedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ImagesCount = table.Column<int>(type: "integer", nullable: false),
                    DicomStudyUid = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ReportPdfUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ImagesUrl = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImagingReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImagingReports_ImagingOrders_ImagingOrderId",
                        column: x => x.ImagingOrderId,
                        principalTable: "ImagingOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingReports_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ImagingReports_Users_RadiologistId",
                        column: x => x.RadiologistId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LabOrdersItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LabOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    LabTestId = table.Column<Guid>(type: "uuid", nullable: false),
                    TestName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsUrgent = table.Column<bool>(type: "boolean", nullable: false),
                    SampleCollected = table.Column<bool>(type: "boolean", nullable: false),
                    SampleCollectionTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SampleCollectorId = table.Column<Guid>(type: "uuid", nullable: true),
                    TestCost = table.Column<decimal>(type: "numeric(8,2)", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ResultValue = table.Column<string>(type: "text", nullable: true),
                    ResultUnit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceRange = table.Column<string>(type: "text", nullable: true),
                    AbnormalFlag = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    CritialFlag = table.Column<bool>(type: "boolean", nullable: false),
                    TechnicianId = table.Column<Guid>(type: "uuid", nullable: true),
                    VerifiedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabOrdersItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabOrdersItem_LabOrders_LabOrderId",
                        column: x => x.LabOrderId,
                        principalTable: "LabOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrdersItem_LabTests_LabTestId",
                        column: x => x.LabTestId,
                        principalTable: "LabTests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrdersItem_Users_SampleCollectorId",
                        column: x => x.SampleCollectorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrdersItem_Users_TechnicianId",
                        column: x => x.TechnicianId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabOrdersItem_Users_VerifiedBy",
                        column: x => x.VerifiedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LabReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReportNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LabOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReportDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ReportTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    OverallImpression = table.Column<string>(type: "text", nullable: true),
                    ClinicalCorrelation = table.Column<string>(type: "text", nullable: true),
                    Recommendations = table.Column<string>(type: "text", nullable: true),
                    CriticalValues = table.Column<string>(type: "text", nullable: true),
                    PathologistId = table.Column<Guid>(type: "uuid", nullable: false),
                    PathologistSignature = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsFinal = table.Column<bool>(type: "boolean", nullable: false),
                    IsAmended = table.Column<bool>(type: "boolean", nullable: false),
                    AmendmentReason = table.Column<string>(type: "text", nullable: true),
                    OriginalReportId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReportPdfUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DeliveredToPatient = table.Column<bool>(type: "boolean", nullable: false),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeliveryMethod = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabReports_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabReports_LabOrders_LabOrderId",
                        column: x => x.LabOrderId,
                        principalTable: "LabOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabReports_LabReports_OriginalReportId",
                        column: x => x.OriginalReportId,
                        principalTable: "LabReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabReports_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LabReports_Users_PathologistId",
                        column: x => x.PathologistId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Prescriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrescriptionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppoinmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicalRecordId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrescriptionDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Diagnosis = table.Column<string>(type: "text", nullable: true),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ValidUntil = table.Column<DateOnly>(type: "date", nullable: true),
                    RefillCount = table.Column<int>(type: "integer", nullable: false),
                    MaxRefills = table.Column<int>(type: "integer", nullable: false),
                    IsDigital = table.Column<bool>(type: "boolean", nullable: false),
                    IsPrinted = table.Column<bool>(type: "boolean", nullable: false),
                    PharmacistNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prescriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Appointments_AppoinmentId",
                        column: x => x.AppoinmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prescriptions_MedicalRecords_MedicalRecordId",
                        column: x => x.MedicalRecordId,
                        principalTable: "MedicalRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prescriptions_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrescriptionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrescriptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    GenericName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Strength = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DosageForm = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    QuantityPrescribed = table.Column<int>(type: "integer", nullable: false),
                    QuantityDispensed = table.Column<int>(type: "integer", nullable: false),
                    DosageInstructions = table.Column<string>(type: "text", nullable: false),
                    Frequency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DurationInDays = table.Column<int>(type: "integer", nullable: false),
                    RouteOfAdministration = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SpecialInstructions = table.Column<string>(type: "text", nullable: true),
                    PricePerUnit = table.Column<decimal>(type: "numeric(8,2)", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    SubtituteAllowed = table.Column<bool>(type: "boolean", nullable: false),
                    IsControlledSubstance = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrescriptionItems_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionItems_Prescriptions_PrescriptionId",
                        column: x => x.PrescriptionId,
                        principalTable: "Prescriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_UserId",
                table: "Addresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_AppointmentNumber",
                table: "Appointments",
                column: "AppointmentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_AppointmentTypeId",
                table: "Appointments",
                column: "AppointmentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CancelledBy",
                table: "Appointments",
                column: "CancelledBy");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CreatedBy",
                table: "Appointments",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DepartmentId",
                table: "Appointments",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DoctorId",
                table: "Appointments",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_HospitalId",
                table: "Appointments",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PatientId",
                table: "Appointments",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ReferringDoctorId",
                table: "Appointments",
                column: "ReferringDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_RescheduledFromAppointmentId",
                table: "Appointments",
                column: "RescheduledFromAppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentTypes_Code",
                table: "AppointmentTypes",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentTypes_IsActive",
                table: "AppointmentTypes",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentTypes_Name",
                table: "AppointmentTypes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_BillItems_BillId",
                table: "BillItems",
                column: "BillId");

            migrationBuilder.CreateIndex(
                name: "IX_BillItems_PerformedBy",
                table: "BillItems",
                column: "PerformedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_AppointmentId",
                table: "Bills",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_ApprovedBy",
                table: "Bills",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_BillNumber",
                table: "Bills",
                column: "BillNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bills_CreatedBy",
                table: "Bills",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_DepartmentId",
                table: "Bills",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_HospitalId",
                table: "Bills",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_InsuranceCompanyId",
                table: "Bills",
                column: "InsuranceCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_PatientId",
                table: "Bills",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_DepartmentCode",
                table: "Departments",
                column: "DepartmentCode");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_HeadOfDepartment",
                table: "Departments",
                column: "HeadOfDepartment");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_HospitalId",
                table: "Departments",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorAwards_DoctorId",
                table: "DoctorAwards",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorCertifications_DoctorId",
                table: "DoctorCertifications",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorEducations_DoctorId",
                table: "DoctorEducations",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_ApprovedBy",
                table: "DoctorLeaves",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_DoctorId",
                table: "DoctorLeaves",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_SubstituteDoctorId",
                table: "DoctorLeaves",
                column: "SubstituteDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorPublications_DoctorId",
                table: "DoctorPublications",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorPublications_Doi",
                table: "DoctorPublications",
                column: "Doi");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorPublications_Pmid",
                table: "DoctorPublications",
                column: "Pmid");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_EmployeeId",
                table: "Doctors",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_MedicalLicenseNumber",
                table: "Doctors",
                column: "MedicalLicenseNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_PrimarySpecialtyId",
                table: "Doctors",
                column: "PrimarySpecialtyId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_VerifiedBy",
                table: "Doctors",
                column: "VerifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_DepartmentId",
                table: "DoctorSchedules",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_DoctorId",
                table: "DoctorSchedules",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_HospitalId",
                table: "DoctorSchedules",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSpecialtys_DoctorId",
                table: "DoctorSpecialtys",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSpecialtys_SpecialtyId",
                table: "DoctorSpecialtys",
                column: "SpecialtyId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorWorkExperiences_DoctorId",
                table: "DoctorWorkExperiences",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalGroups_Name",
                table: "HospitalGroups",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Hospitals_HospitalCode",
                table: "Hospitals",
                column: "HospitalCode");

            migrationBuilder.CreateIndex(
                name: "IX_Hospitals_HospitalGroupId",
                table: "Hospitals",
                column: "HospitalGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Hospitals_Name",
                table: "Hospitals",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalStaffs_DepartmentId",
                table: "HospitalStaffs",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalStaffs_EmployeeId",
                table: "HospitalStaffs",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HospitalStaffs_HospitalId",
                table: "HospitalStaffs",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalStaffs_ReportingManger",
                table: "HospitalStaffs",
                column: "ReportingManger");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingModalities_Code",
                table: "ImagingModalities",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingModalities_Name",
                table: "ImagingModalities",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_AppointmentId",
                table: "ImagingOrders",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_CreatedBy",
                table: "ImagingOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_DoctorId",
                table: "ImagingOrders",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_HospitalId",
                table: "ImagingOrders",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_ModalityId",
                table: "ImagingOrders",
                column: "ModalityId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_OrderNumber",
                table: "ImagingOrders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_PatientId",
                table: "ImagingOrders",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_RadiologistId",
                table: "ImagingOrders",
                column: "RadiologistId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_TechnicianId",
                table: "ImagingOrders",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_ImagingOrderId",
                table: "ImagingReports",
                column: "ImagingOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_PatientId",
                table: "ImagingReports",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_RadiologistId",
                table: "ImagingReports",
                column: "RadiologistId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_ReportNumber",
                table: "ImagingReports",
                column: "ReportNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InsuranceCompanies_Code",
                table: "InsuranceCompanies",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_InsuranceCompanies_Name",
                table: "InsuranceCompanies",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_AppointmentId",
                table: "LabOrders",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_CreatedBy",
                table: "LabOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_DoctorId",
                table: "LabOrders",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_HospitalId",
                table: "LabOrders",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_OrderNumber",
                table: "LabOrders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_PatientId",
                table: "LabOrders",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrdersItem_LabOrderId",
                table: "LabOrdersItem",
                column: "LabOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrdersItem_LabTestId",
                table: "LabOrdersItem",
                column: "LabTestId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrdersItem_SampleCollectorId",
                table: "LabOrdersItem",
                column: "SampleCollectorId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrdersItem_TechnicianId",
                table: "LabOrdersItem",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrdersItem_VerifiedBy",
                table: "LabOrdersItem",
                column: "VerifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_DoctorId",
                table: "LabReports",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_LabOrderId",
                table: "LabReports",
                column: "LabOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_OriginalReportId",
                table: "LabReports",
                column: "OriginalReportId");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_PathologistId",
                table: "LabReports",
                column: "PathologistId");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_PatientId",
                table: "LabReports",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_ReportNumber",
                table: "LabReports",
                column: "ReportNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LabTestCategories_Code",
                table: "LabTestCategories",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_LabTestCategories_Name",
                table: "LabTestCategories",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_LabTests_CategoryId",
                table: "LabTests",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_LabTests_TestCode",
                table: "LabTests",
                column: "TestCode");

            migrationBuilder.CreateIndex(
                name: "IX_LabTests_TestName",
                table: "LabTests",
                column: "TestName");

            migrationBuilder.CreateIndex(
                name: "IX_Manufacturers_CompanyCode",
                table: "Manufacturers",
                column: "CompanyCode");

            migrationBuilder.CreateIndex(
                name: "IX_Manufacturers_Name",
                table: "Manufacturers",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_AppointmentId",
                table: "MedicalRecords",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_CreatedBy",
                table: "MedicalRecords",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_DoctorId",
                table: "MedicalRecords",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_HospitalId",
                table: "MedicalRecords",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_PatientId",
                table: "MedicalRecords",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_RecordNumber",
                table: "MedicalRecords",
                column: "RecordNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalSpecialties_Code",
                table: "MedicalSpecialties",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalSpecialties_Name",
                table: "MedicalSpecialties",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalSpecialties_ParentSpecialtyId",
                table: "MedicalSpecialties",
                column: "ParentSpecialtyId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_Barcode",
                table: "Medicines",
                column: "Barcode");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_BrandName",
                table: "Medicines",
                column: "BrandName");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_CategoryId",
                table: "Medicines",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_DrugCode",
                table: "Medicines",
                column: "DrugCode");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_GenericName",
                table: "Medicines",
                column: "GenericName");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_ManufacturerId",
                table: "Medicines",
                column: "ManufacturerId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_Name",
                table: "Medicines",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_QrCode",
                table: "Medicines",
                column: "QrCode");

            migrationBuilder.CreateIndex(
                name: "IX_MedicinesCategories_Code",
                table: "MedicinesCategories",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_MedicinesCategories_Name",
                table: "MedicinesCategories",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_MedicinesCategories_ParentCategoryId",
                table: "MedicinesCategories",
                column: "ParentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicinesInventories_HospitalId",
                table: "MedicinesInventories",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicinesInventories_MedicineId",
                table: "MedicinesInventories",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicinesInventories_MedicineId_HospitalId_BatchNumber",
                table: "MedicinesInventories",
                columns: new[] { "MedicineId", "HospitalId", "BatchNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_MedicinesInventories_SupplierId",
                table: "MedicinesInventories",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientAllergies_AllergenName",
                table: "PatientAllergies",
                column: "AllergenName");

            migrationBuilder.CreateIndex(
                name: "IX_PatientAllergies_PatientId",
                table: "PatientAllergies",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicalHistories_ConditionName",
                table: "PatientMedicalHistories",
                column: "ConditionName");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicalHistories_DiagnosedBy",
                table: "PatientMedicalHistories",
                column: "DiagnosedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicalHistories_DiagnosisHospitalId",
                table: "PatientMedicalHistories",
                column: "DiagnosisHospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicalHistories_Icd10Code",
                table: "PatientMedicalHistories",
                column: "Icd10Code");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicalHistories_PatientId",
                table: "PatientMedicalHistories",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_PatientNumber",
                table: "Patients",
                column: "PatientNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Patients_PreferredDoctorId",
                table: "Patients",
                column: "PreferredDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_PreferredHospitalId",
                table: "Patients",
                column: "PreferredHospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_PrimaryDoctorId",
                table: "Patients",
                column: "PrimaryDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_ReferralHospitalId",
                table: "Patients",
                column: "ReferralHospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_ReferredBy",
                table: "Patients",
                column: "ReferredBy");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_BillId",
                table: "Payments",
                column: "BillId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PatientId",
                table: "Payments",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments",
                column: "PaymentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ProcessedBy",
                table: "Payments",
                column: "ProcessedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionItems_MedicineId",
                table: "PrescriptionItems",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionItems_PrescriptionId",
                table: "PrescriptionItems",
                column: "PrescriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_AppoinmentId",
                table: "Prescriptions",
                column: "AppoinmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_DoctorId",
                table: "Prescriptions",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_HospitalId",
                table: "Prescriptions",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_MedicalRecordId",
                table: "Prescriptions",
                column: "MedicalRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_PatientId",
                table: "Prescriptions",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_PrescriptionNumber",
                table: "Prescriptions",
                column: "PrescriptionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_FirstName_LastName",
                table: "Profiles",
                columns: new[] { "FirstName", "LastName" });

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_IdentificationNumber",
                table: "Profiles",
                column: "IdentificationNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_AppointmentId",
                table: "Reviews",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_EntityId",
                table: "Reviews",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ModeratedBy",
                table: "Reviews",
                column: "ModeratedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_RespondedBy",
                table: "Reviews",
                column: "RespondedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReviewerId",
                table: "Reviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_Email",
                table: "Supplier",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_Phone",
                table: "Supplier",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_SupplierCode",
                table: "Supplier",
                column: "SupplierCode");

            migrationBuilder.CreateIndex(
                name: "IX_Supplier_SupplierName",
                table: "Supplier",
                column: "SupplierName");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedBy",
                table: "Users",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_IsActive",
                table: "Users",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Phone",
                table: "Users",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role",
                table: "Users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_Users_UpdatedBy",
                table: "Users",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Doctors_DoctorId",
                table: "Appointments",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Doctors_ReferringDoctorId",
                table: "Appointments",
                column: "ReferringDoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Patients_PatientId",
                table: "Appointments",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BillItems_Bills_BillId",
                table: "BillItems",
                column: "BillId",
                principalTable: "Bills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bills_Patients_PatientId",
                table: "Bills",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorAwards_Doctors_DoctorId",
                table: "DoctorAwards",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorCertifications_Doctors_DoctorId",
                table: "DoctorCertifications",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorEducations_Doctors_DoctorId",
                table: "DoctorEducations",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorLeaves_Doctors_DoctorId",
                table: "DoctorLeaves",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorLeaves_Doctors_SubstituteDoctorId",
                table: "DoctorLeaves",
                column: "SubstituteDoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorPublications_Doctors_DoctorId",
                table: "DoctorPublications",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_DoctorSpecialtys_PrimarySpecialtyId",
                table: "Doctors",
                column: "PrimarySpecialtyId",
                principalTable: "DoctorSpecialtys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Users_VerifiedBy",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialtys_Doctors_DoctorId",
                table: "DoctorSpecialtys");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "BillItems");

            migrationBuilder.DropTable(
                name: "DoctorAwards");

            migrationBuilder.DropTable(
                name: "DoctorCertifications");

            migrationBuilder.DropTable(
                name: "DoctorEducations");

            migrationBuilder.DropTable(
                name: "DoctorLeaves");

            migrationBuilder.DropTable(
                name: "DoctorPublications");

            migrationBuilder.DropTable(
                name: "DoctorSchedules");

            migrationBuilder.DropTable(
                name: "DoctorWorkExperiences");

            migrationBuilder.DropTable(
                name: "HospitalStaffs");

            migrationBuilder.DropTable(
                name: "ImagingReports");

            migrationBuilder.DropTable(
                name: "LabOrdersItem");

            migrationBuilder.DropTable(
                name: "LabReports");

            migrationBuilder.DropTable(
                name: "MedicinesInventories");

            migrationBuilder.DropTable(
                name: "PatientAllergies");

            migrationBuilder.DropTable(
                name: "PatientMedicalHistories");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "PrescriptionItems");

            migrationBuilder.DropTable(
                name: "Profiles");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "ImagingOrders");

            migrationBuilder.DropTable(
                name: "LabTests");

            migrationBuilder.DropTable(
                name: "LabOrders");

            migrationBuilder.DropTable(
                name: "Supplier");

            migrationBuilder.DropTable(
                name: "Bills");

            migrationBuilder.DropTable(
                name: "Medicines");

            migrationBuilder.DropTable(
                name: "Prescriptions");

            migrationBuilder.DropTable(
                name: "ImagingModalities");

            migrationBuilder.DropTable(
                name: "LabTestCategories");

            migrationBuilder.DropTable(
                name: "InsuranceCompanies");

            migrationBuilder.DropTable(
                name: "Manufacturers");

            migrationBuilder.DropTable(
                name: "MedicinesCategories");

            migrationBuilder.DropTable(
                name: "MedicalRecords");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "AppointmentTypes");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Patients");

            migrationBuilder.DropTable(
                name: "Hospitals");

            migrationBuilder.DropTable(
                name: "HospitalGroups");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Doctors");

            migrationBuilder.DropTable(
                name: "DoctorSpecialtys");

            migrationBuilder.DropTable(
                name: "MedicalSpecialties");
        }
    }
}
