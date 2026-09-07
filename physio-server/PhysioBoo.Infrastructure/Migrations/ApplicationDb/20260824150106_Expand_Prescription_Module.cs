using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Expand_Prescription_Module : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Profiles",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "Profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "Prescriptions",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "IssuedAt",
                table: "Prescriptions",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReasonCancel",
                table: "Prescriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BeforeAfterMeal",
                table: "PrescriptionItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsCatalogVerified",
                table: "PrescriptionItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsInsuranceCovered",
                table: "PrescriptionItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPrn",
                table: "PrescriptionItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "RefillCount",
                table: "PrescriptionItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "TimingAfternoon",
                table: "PrescriptionItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "TimingEvening",
                table: "PrescriptionItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "TimingMorning",
                table: "PrescriptionItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "TimingNoon",
                table: "PrescriptionItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "PrescriptionItems",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                table: "Doctors",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                table: "Doctors",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckedInAt",
                table: "Appointments",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FavoriteMedications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultDose = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DefaultFrequency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DefaultDurationInDays = table.Column<int>(type: "integer", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteMedications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FavoriteMedications_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FavoriteMedications_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FavoriteMedications_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FavoriteMedications_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FavoriteMedications_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrescriptionClinicalWarnings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrescriptionItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    RecommendedAction = table.Column<string>(type: "text", nullable: true),
                    AcknowledgedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    AcknowledgedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionClinicalWarnings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrescriptionClinicalWarnings_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionClinicalWarnings_PrescriptionItems_Prescription~",
                        column: x => x.PrescriptionItemId,
                        principalTable: "PrescriptionItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionClinicalWarnings_Users_AcknowledgedBy",
                        column: x => x.AcknowledgedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionClinicalWarnings_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionClinicalWarnings_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrescriptionTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplates_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplates_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplates_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplates_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    RoomNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    RoomType = table.Column<string>(type: "text", nullable: false),
                    FloorNumber = table.Column<int>(type: "integer", nullable: true),
                    Wing = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Capacity = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rooms_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rooms_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rooms_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rooms_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rooms_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrescriptionTemplateItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PrescriptionTemplateId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: false),
                    DefaultQuantity = table.Column<int>(type: "integer", nullable: false),
                    DefaultDosageInstructions = table.Column<string>(type: "text", nullable: false),
                    DefaultFrequency = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DefaultDurationInDays = table.Column<int>(type: "integer", nullable: false),
                    DefaultRouteOfAdministration = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TimingMorning = table.Column<bool>(type: "boolean", nullable: false),
                    TimingNoon = table.Column<bool>(type: "boolean", nullable: false),
                    TimingAfternoon = table.Column<bool>(type: "boolean", nullable: false),
                    TimingEvening = table.Column<bool>(type: "boolean", nullable: false),
                    IsPrn = table.Column<bool>(type: "boolean", nullable: false),
                    BeforeAfterMeal = table.Column<string>(type: "text", nullable: false),
                    Unit = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescriptionTemplateItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplateItems_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplateItems_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplateItems_PrescriptionTemplates_Prescriptio~",
                        column: x => x.PrescriptionTemplateId,
                        principalTable: "PrescriptionTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplateItems_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrescriptionTemplateItems_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_DepartmentId",
                table: "Doctors",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_RoomId",
                table: "Doctors",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteMedications_CreatedBy",
                table: "FavoriteMedications",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteMedications_DoctorId",
                table: "FavoriteMedications",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteMedications_DoctorId_MedicineId",
                table: "FavoriteMedications",
                columns: new[] { "DoctorId", "MedicineId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteMedications_MedicineId",
                table: "FavoriteMedications",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteMedications_TenantId",
                table: "FavoriteMedications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteMedications_UpdatedBy",
                table: "FavoriteMedications",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionClinicalWarnings_AcknowledgedBy",
                table: "PrescriptionClinicalWarnings",
                column: "AcknowledgedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionClinicalWarnings_CreatedBy",
                table: "PrescriptionClinicalWarnings",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionClinicalWarnings_PrescriptionItemId",
                table: "PrescriptionClinicalWarnings",
                column: "PrescriptionItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionClinicalWarnings_TenantId",
                table: "PrescriptionClinicalWarnings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionClinicalWarnings_UpdatedBy",
                table: "PrescriptionClinicalWarnings",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplateItems_CreatedBy",
                table: "PrescriptionTemplateItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplateItems_MedicineId",
                table: "PrescriptionTemplateItems",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplateItems_PrescriptionTemplateId",
                table: "PrescriptionTemplateItems",
                column: "PrescriptionTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplateItems_TenantId",
                table: "PrescriptionTemplateItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplateItems_UpdatedBy",
                table: "PrescriptionTemplateItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplates_CreatedBy",
                table: "PrescriptionTemplates",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplates_DoctorId",
                table: "PrescriptionTemplates",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplates_TenantId",
                table: "PrescriptionTemplates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionTemplates_UpdatedBy",
                table: "PrescriptionTemplates",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_CreatedBy",
                table: "Rooms",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_DepartmentId",
                table: "Rooms",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_HospitalId",
                table: "Rooms",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_HospitalId_RoomNumber",
                table: "Rooms",
                columns: new[] { "HospitalId", "RoomNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_TenantId",
                table: "Rooms",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_UpdatedBy",
                table: "Rooms",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Departments_DepartmentId",
                table: "Doctors",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Rooms_RoomId",
                table: "Doctors",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Departments_DepartmentId",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Rooms_RoomId",
                table: "Doctors");

            migrationBuilder.DropTable(
                name: "FavoriteMedications");

            migrationBuilder.DropTable(
                name: "PrescriptionClinicalWarnings");

            migrationBuilder.DropTable(
                name: "PrescriptionTemplateItems");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropTable(
                name: "PrescriptionTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_DepartmentId",
                table: "Doctors");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_RoomId",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "IssuedAt",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "ReasonCancel",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "BeforeAfterMeal",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "IsCatalogVerified",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "IsInsuranceCovered",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "IsPrn",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "RefillCount",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "TimingAfternoon",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "TimingEvening",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "TimingMorning",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "TimingNoon",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "CheckedInAt",
                table: "Appointments");
        }
    }
}
