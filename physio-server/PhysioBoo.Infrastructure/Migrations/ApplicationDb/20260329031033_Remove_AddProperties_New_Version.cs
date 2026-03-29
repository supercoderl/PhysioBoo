using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Remove_AddProperties_New_Version : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hospitals_HospitalGroups_HospitalGroupId",
                table: "Hospitals");

            migrationBuilder.DropForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_CreatedBy",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_UpdatedBy",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropIndex(
                name: "IX_Sys_SequenceTrackers_CreatedBy",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropIndex(
                name: "IX_Sys_SequenceTrackers_UpdatedBy",
                table: "Sys_SequenceTrackers");

            migrationBuilder.RenameColumn(
                name: "HospitalGroupId",
                table: "Hospitals",
                newName: "TenantId");

            migrationBuilder.RenameIndex(
                name: "IX_Hospitals_HospitalGroupId",
                table: "Hospitals",
                newName: "IX_Hospitals_TenantId");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "SystemSettings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatorId",
                table: "SystemSettings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "SystemSettings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdaterId",
                table: "SystemSettings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "Sys_SequenceTrackers",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatorId",
                table: "Sys_SequenceTrackers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdaterId",
                table: "Sys_SequenceTrackers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "Roles",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "HospitalGroupId",
                table: "Roles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Reviews",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Reviews",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Reviews",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Profiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Profiles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Profiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "PrintTemplateVersions",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "PrintTemplates",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Prescriptions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Prescriptions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Prescriptions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "PrescriptionItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "PrescriptionItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "PrescriptionItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "PrescriptionItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Payments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Payments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Payments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Patients",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Patients",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Patients",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "PatientMedicals",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "PatientMedicals",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "PatientMedicals",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "PatientAllergies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "PatientAllergies",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "PatientAllergies",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "PatientAllergies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Medicines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Medicines",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Medicines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "MedicineInventories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "MedicineInventories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "MedicineInventories",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "MedicineInventories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "MedicineCategories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "MedicineCategories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "MedicineCategories",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "MedicineCategories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "MedicalRecords",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "MedicalRecords",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "MedicalRecords",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "LabReports",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "LabReports",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LabReports",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "LabReports",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "LabOrders",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "LabOrders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "LabOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "LabOrderItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "LabOrderItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LabOrderItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "LabOrderItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "ImagingReports",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "ImagingReports",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "ImagingReports",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "ImagingReports",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "ImagingOrders",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "ImagingOrders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "ImagingOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdaterId",
                table: "ImagingOrders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "HospitalStaffs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "HospitalStaffs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "HospitalStaffs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Hospitals",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Hospitals",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "HospitalGroups",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "HospitalGroups",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorWorkExperiences",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorWorkExperiences",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "DoctorWorkExperiences",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorWorkExperiences",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorSpecialties",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorSpecialties",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "DoctorSpecialties",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorSpecialties",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorSchedules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorSchedules",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorSchedules",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Doctors",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Doctors",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Doctors",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorPublications",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorPublications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "DoctorPublications",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorPublications",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorLeaves",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorLeaves",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorLeaves",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorEducations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorEducations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "DoctorEducations",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorEducations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorCertifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorCertifications",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "DoctorCertifications",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorCertifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "DoctorAwards",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "DoctorAwards",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "DoctorAwards",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "DoctorAwards",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Departments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Departments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Departments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "Bills",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Bills",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdaterId",
                table: "Bills",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "BillItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "BillItems",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "BillItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "BillItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Appointments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Appointments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "AdminMenus",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Addresses",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Addresses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedBy",
                table: "Addresses",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Hospitals",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"HospitalCode\", '')))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "HospitalGroups",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '')))",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId",
                table: "Users",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_CreatorId",
                table: "SystemSettings",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_UpdaterId",
                table: "SystemSettings",
                column: "UpdaterId");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SequenceTrackers_CreatorId",
                table: "Sys_SequenceTrackers",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SequenceTrackers_UpdaterId",
                table: "Sys_SequenceTrackers",
                column: "UpdaterId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_HospitalGroupId",
                table: "Roles",
                column: "HospitalGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CreatedBy",
                table: "Reviews",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_TenantId",
                table: "Reviews",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UpdatedBy",
                table: "Reviews",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_CreatedBy",
                table: "Profiles",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_TenantId",
                table: "Profiles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_UpdatedBy",
                table: "Profiles",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_CreatedBy",
                table: "Prescriptions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_TenantId",
                table: "Prescriptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Prescriptions_UpdatedBy",
                table: "Prescriptions",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionItems_CreatedBy",
                table: "PrescriptionItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionItems_TenantId",
                table: "PrescriptionItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescriptionItems_UpdatedBy",
                table: "PrescriptionItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CreatedBy",
                table: "Payments",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId",
                table: "Payments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_UpdatedBy",
                table: "Payments",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_CreatedBy",
                table: "Patients",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_TenantId",
                table: "Patients",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Patients_UpdatedBy",
                table: "Patients",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicals_CreatedBy",
                table: "PatientMedicals",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicals_TenantId",
                table: "PatientMedicals",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedicals_UpdatedBy",
                table: "PatientMedicals",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PatientAllergies_CreatedBy",
                table: "PatientAllergies",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PatientAllergies_TenantId",
                table: "PatientAllergies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientAllergies_UpdatedBy",
                table: "PatientAllergies",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_CreatedBy",
                table: "Medicines",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_TenantId",
                table: "Medicines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_UpdatedBy",
                table: "Medicines",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineInventories_CreatedBy",
                table: "MedicineInventories",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineInventories_TenantId",
                table: "MedicineInventories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineInventories_UpdatedBy",
                table: "MedicineInventories",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineCategories_CreatedBy",
                table: "MedicineCategories",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineCategories_TenantId",
                table: "MedicineCategories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineCategories_UpdatedBy",
                table: "MedicineCategories",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_TenantId",
                table: "MedicalRecords",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_UpdatedBy",
                table: "MedicalRecords",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_CreatedBy",
                table: "LabReports",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_TenantId",
                table: "LabReports",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LabReports_UpdatedBy",
                table: "LabReports",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrders_TenantId",
                table: "LabOrders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrderItems_CreatedBy",
                table: "LabOrderItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrderItems_TenantId",
                table: "LabOrderItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LabOrderItems_UpdatedBy",
                table: "LabOrderItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_CreatedBy",
                table: "ImagingReports",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_TenantId",
                table: "ImagingReports",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_UpdatedBy",
                table: "ImagingReports",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_TenantId",
                table: "ImagingOrders",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ImagingOrders_UpdaterId",
                table: "ImagingOrders",
                column: "UpdaterId");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalStaffs_CreatedBy",
                table: "HospitalStaffs",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalStaffs_TenantId",
                table: "HospitalStaffs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalStaffs_UpdatedBy",
                table: "HospitalStaffs",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Hospitals_CreatedBy",
                table: "Hospitals",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Hospitals_UpdatedBy",
                table: "Hospitals",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalGroups_CreatedBy",
                table: "HospitalGroups",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_HospitalGroups_UpdatedBy",
                table: "HospitalGroups",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorWorkExperiences_CreatedBy",
                table: "DoctorWorkExperiences",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorWorkExperiences_TenantId",
                table: "DoctorWorkExperiences",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorWorkExperiences_UpdatedBy",
                table: "DoctorWorkExperiences",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSpecialties_CreatedBy",
                table: "DoctorSpecialties",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSpecialties_TenantId",
                table: "DoctorSpecialties",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSpecialties_UpdatedBy",
                table: "DoctorSpecialties",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_CreatedBy",
                table: "DoctorSchedules",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_TenantId",
                table: "DoctorSchedules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorSchedules_UpdatedBy",
                table: "DoctorSchedules",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_CreatedBy",
                table: "Doctors",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_TenantId",
                table: "Doctors",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_UpdatedBy",
                table: "Doctors",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorPublications_CreatedBy",
                table: "DoctorPublications",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorPublications_TenantId",
                table: "DoctorPublications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorPublications_UpdatedBy",
                table: "DoctorPublications",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_CreatedBy",
                table: "DoctorLeaves",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_TenantId",
                table: "DoctorLeaves",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorLeaves_UpdatedBy",
                table: "DoctorLeaves",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorEducations_CreatedBy",
                table: "DoctorEducations",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorEducations_TenantId",
                table: "DoctorEducations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorEducations_UpdatedBy",
                table: "DoctorEducations",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorCertifications_CreatedBy",
                table: "DoctorCertifications",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorCertifications_TenantId",
                table: "DoctorCertifications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorCertifications_UpdatedBy",
                table: "DoctorCertifications",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorAwards_CreatedBy",
                table: "DoctorAwards",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorAwards_TenantId",
                table: "DoctorAwards",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DoctorAwards_UpdatedBy",
                table: "DoctorAwards",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_CreatedBy",
                table: "Departments",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId",
                table: "Departments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_UpdatedBy",
                table: "Departments",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_TenantId",
                table: "Bills",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_UpdaterId",
                table: "Bills",
                column: "UpdaterId");

            migrationBuilder.CreateIndex(
                name: "IX_BillItems_CreatedBy",
                table: "BillItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_BillItems_TenantId",
                table: "BillItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BillItems_UpdatedBy",
                table: "BillItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId",
                table: "Appointments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_UpdatedBy",
                table: "Appointments",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CreatedBy",
                table: "Addresses",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_TenantId",
                table: "Addresses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_UpdatedBy",
                table: "Addresses",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_HospitalGroups_TenantId",
                table: "Addresses",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Users_CreatedBy",
                table: "Addresses",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Users_UpdatedBy",
                table: "Addresses",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_HospitalGroups_TenantId",
                table: "Appointments",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Users_UpdatedBy",
                table: "Appointments",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BillItems_HospitalGroups_TenantId",
                table: "BillItems",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BillItems_Users_CreatedBy",
                table: "BillItems",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BillItems_Users_UpdatedBy",
                table: "BillItems",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bills_HospitalGroups_TenantId",
                table: "Bills",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bills_Users_UpdaterId",
                table: "Bills",
                column: "UpdaterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_HospitalGroups_TenantId",
                table: "Departments",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Users_CreatedBy",
                table: "Departments",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Users_UpdatedBy",
                table: "Departments",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorAwards_HospitalGroups_TenantId",
                table: "DoctorAwards",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorAwards_Users_CreatedBy",
                table: "DoctorAwards",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorAwards_Users_UpdatedBy",
                table: "DoctorAwards",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorCertifications_HospitalGroups_TenantId",
                table: "DoctorCertifications",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorCertifications_Users_CreatedBy",
                table: "DoctorCertifications",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorCertifications_Users_UpdatedBy",
                table: "DoctorCertifications",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorEducations_HospitalGroups_TenantId",
                table: "DoctorEducations",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorEducations_Users_CreatedBy",
                table: "DoctorEducations",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorEducations_Users_UpdatedBy",
                table: "DoctorEducations",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorLeaves_HospitalGroups_TenantId",
                table: "DoctorLeaves",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorLeaves_Users_CreatedBy",
                table: "DoctorLeaves",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorLeaves_Users_UpdatedBy",
                table: "DoctorLeaves",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorPublications_HospitalGroups_TenantId",
                table: "DoctorPublications",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorPublications_Users_CreatedBy",
                table: "DoctorPublications",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorPublications_Users_UpdatedBy",
                table: "DoctorPublications",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_HospitalGroups_TenantId",
                table: "Doctors",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Users_CreatedBy",
                table: "Doctors",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Users_UpdatedBy",
                table: "Doctors",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSchedules_HospitalGroups_TenantId",
                table: "DoctorSchedules",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSchedules_Users_CreatedBy",
                table: "DoctorSchedules",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSchedules_Users_UpdatedBy",
                table: "DoctorSchedules",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSpecialties_HospitalGroups_TenantId",
                table: "DoctorSpecialties",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSpecialties_Users_CreatedBy",
                table: "DoctorSpecialties",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSpecialties_Users_UpdatedBy",
                table: "DoctorSpecialties",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorWorkExperiences_HospitalGroups_TenantId",
                table: "DoctorWorkExperiences",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorWorkExperiences_Users_CreatedBy",
                table: "DoctorWorkExperiences",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorWorkExperiences_Users_UpdatedBy",
                table: "DoctorWorkExperiences",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HospitalGroups_Users_CreatedBy",
                table: "HospitalGroups",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HospitalGroups_Users_UpdatedBy",
                table: "HospitalGroups",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hospitals_HospitalGroups_TenantId",
                table: "Hospitals",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hospitals_Users_CreatedBy",
                table: "Hospitals",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Hospitals_Users_UpdatedBy",
                table: "Hospitals",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HospitalStaffs_HospitalGroups_TenantId",
                table: "HospitalStaffs",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HospitalStaffs_Users_CreatedBy",
                table: "HospitalStaffs",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HospitalStaffs_Users_UpdatedBy",
                table: "HospitalStaffs",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ImagingOrders_HospitalGroups_TenantId",
                table: "ImagingOrders",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ImagingOrders_Users_UpdaterId",
                table: "ImagingOrders",
                column: "UpdaterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ImagingReports_HospitalGroups_TenantId",
                table: "ImagingReports",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ImagingReports_Users_CreatedBy",
                table: "ImagingReports",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ImagingReports_Users_UpdatedBy",
                table: "ImagingReports",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_HospitalGroups_TenantId",
                table: "LabOrderItems",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_Users_CreatedBy",
                table: "LabOrderItems",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_Users_UpdatedBy",
                table: "LabOrderItems",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrders_HospitalGroups_TenantId",
                table: "LabOrders",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabReports_HospitalGroups_TenantId",
                table: "LabReports",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabReports_Users_CreatedBy",
                table: "LabReports",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabReports_Users_UpdatedBy",
                table: "LabReports",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalRecords_HospitalGroups_TenantId",
                table: "MedicalRecords",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicalRecords_Users_UpdatedBy",
                table: "MedicalRecords",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineCategories_HospitalGroups_TenantId",
                table: "MedicineCategories",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineCategories_Users_CreatedBy",
                table: "MedicineCategories",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineCategories_Users_UpdatedBy",
                table: "MedicineCategories",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineInventories_HospitalGroups_TenantId",
                table: "MedicineInventories",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineInventories_Users_CreatedBy",
                table: "MedicineInventories",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineInventories_Users_UpdatedBy",
                table: "MedicineInventories",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_HospitalGroups_TenantId",
                table: "Medicines",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_Users_CreatedBy",
                table: "Medicines",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_Users_UpdatedBy",
                table: "Medicines",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientAllergies_HospitalGroups_TenantId",
                table: "PatientAllergies",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientAllergies_Users_CreatedBy",
                table: "PatientAllergies",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientAllergies_Users_UpdatedBy",
                table: "PatientAllergies",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicals_HospitalGroups_TenantId",
                table: "PatientMedicals",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicals_Users_CreatedBy",
                table: "PatientMedicals",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicals_Users_UpdatedBy",
                table: "PatientMedicals",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Patients_HospitalGroups_TenantId",
                table: "Patients",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Patients_Users_CreatedBy",
                table: "Patients",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Patients_Users_UpdatedBy",
                table: "Patients",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_HospitalGroups_TenantId",
                table: "Payments",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Users_CreatedBy",
                table: "Payments",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Users_UpdatedBy",
                table: "Payments",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionItems_HospitalGroups_TenantId",
                table: "PrescriptionItems",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionItems_Users_CreatedBy",
                table: "PrescriptionItems",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PrescriptionItems_Users_UpdatedBy",
                table: "PrescriptionItems",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_HospitalGroups_TenantId",
                table: "Prescriptions",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_Users_CreatedBy",
                table: "Prescriptions",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_Users_UpdatedBy",
                table: "Prescriptions",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Profiles_HospitalGroups_TenantId",
                table: "Profiles",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Profiles_Users_CreatedBy",
                table: "Profiles",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Profiles_Users_UpdatedBy",
                table: "Profiles",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_HospitalGroups_TenantId",
                table: "Reviews",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_CreatedBy",
                table: "Reviews",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UpdatedBy",
                table: "Reviews",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Roles_HospitalGroups_HospitalGroupId",
                table: "Roles",
                column: "HospitalGroupId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_CreatorId",
                table: "Sys_SequenceTrackers",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_UpdaterId",
                table: "Sys_SequenceTrackers",
                column: "UpdaterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SystemSettings_Users_CreatorId",
                table: "SystemSettings",
                column: "CreatorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SystemSettings_Users_UpdaterId",
                table: "SystemSettings",
                column: "UpdaterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_HospitalGroups_TenantId",
                table: "Users",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_HospitalGroups_TenantId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Users_CreatedBy",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Users_UpdatedBy",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_HospitalGroups_TenantId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Users_UpdatedBy",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_BillItems_HospitalGroups_TenantId",
                table: "BillItems");

            migrationBuilder.DropForeignKey(
                name: "FK_BillItems_Users_CreatedBy",
                table: "BillItems");

            migrationBuilder.DropForeignKey(
                name: "FK_BillItems_Users_UpdatedBy",
                table: "BillItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Bills_HospitalGroups_TenantId",
                table: "Bills");

            migrationBuilder.DropForeignKey(
                name: "FK_Bills_Users_UpdaterId",
                table: "Bills");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_HospitalGroups_TenantId",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Users_CreatedBy",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Users_UpdatedBy",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorAwards_HospitalGroups_TenantId",
                table: "DoctorAwards");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorAwards_Users_CreatedBy",
                table: "DoctorAwards");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorAwards_Users_UpdatedBy",
                table: "DoctorAwards");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorCertifications_HospitalGroups_TenantId",
                table: "DoctorCertifications");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorCertifications_Users_CreatedBy",
                table: "DoctorCertifications");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorCertifications_Users_UpdatedBy",
                table: "DoctorCertifications");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorEducations_HospitalGroups_TenantId",
                table: "DoctorEducations");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorEducations_Users_CreatedBy",
                table: "DoctorEducations");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorEducations_Users_UpdatedBy",
                table: "DoctorEducations");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorLeaves_HospitalGroups_TenantId",
                table: "DoctorLeaves");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorLeaves_Users_CreatedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorLeaves_Users_UpdatedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorPublications_HospitalGroups_TenantId",
                table: "DoctorPublications");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorPublications_Users_CreatedBy",
                table: "DoctorPublications");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorPublications_Users_UpdatedBy",
                table: "DoctorPublications");

            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_HospitalGroups_TenantId",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Users_CreatedBy",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Users_UpdatedBy",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSchedules_HospitalGroups_TenantId",
                table: "DoctorSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSchedules_Users_CreatedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSchedules_Users_UpdatedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialties_HospitalGroups_TenantId",
                table: "DoctorSpecialties");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialties_Users_CreatedBy",
                table: "DoctorSpecialties");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialties_Users_UpdatedBy",
                table: "DoctorSpecialties");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorWorkExperiences_HospitalGroups_TenantId",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorWorkExperiences_Users_CreatedBy",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorWorkExperiences_Users_UpdatedBy",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropForeignKey(
                name: "FK_HospitalGroups_Users_CreatedBy",
                table: "HospitalGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_HospitalGroups_Users_UpdatedBy",
                table: "HospitalGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_Hospitals_HospitalGroups_TenantId",
                table: "Hospitals");

            migrationBuilder.DropForeignKey(
                name: "FK_Hospitals_Users_CreatedBy",
                table: "Hospitals");

            migrationBuilder.DropForeignKey(
                name: "FK_Hospitals_Users_UpdatedBy",
                table: "Hospitals");

            migrationBuilder.DropForeignKey(
                name: "FK_HospitalStaffs_HospitalGroups_TenantId",
                table: "HospitalStaffs");

            migrationBuilder.DropForeignKey(
                name: "FK_HospitalStaffs_Users_CreatedBy",
                table: "HospitalStaffs");

            migrationBuilder.DropForeignKey(
                name: "FK_HospitalStaffs_Users_UpdatedBy",
                table: "HospitalStaffs");

            migrationBuilder.DropForeignKey(
                name: "FK_ImagingOrders_HospitalGroups_TenantId",
                table: "ImagingOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_ImagingOrders_Users_UpdaterId",
                table: "ImagingOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_ImagingReports_HospitalGroups_TenantId",
                table: "ImagingReports");

            migrationBuilder.DropForeignKey(
                name: "FK_ImagingReports_Users_CreatedBy",
                table: "ImagingReports");

            migrationBuilder.DropForeignKey(
                name: "FK_ImagingReports_Users_UpdatedBy",
                table: "ImagingReports");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_HospitalGroups_TenantId",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_Users_CreatedBy",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_Users_UpdatedBy",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrders_HospitalGroups_TenantId",
                table: "LabOrders");

            migrationBuilder.DropForeignKey(
                name: "FK_LabReports_HospitalGroups_TenantId",
                table: "LabReports");

            migrationBuilder.DropForeignKey(
                name: "FK_LabReports_Users_CreatedBy",
                table: "LabReports");

            migrationBuilder.DropForeignKey(
                name: "FK_LabReports_Users_UpdatedBy",
                table: "LabReports");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalRecords_HospitalGroups_TenantId",
                table: "MedicalRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicalRecords_Users_UpdatedBy",
                table: "MedicalRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineCategories_HospitalGroups_TenantId",
                table: "MedicineCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineCategories_Users_CreatedBy",
                table: "MedicineCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineCategories_Users_UpdatedBy",
                table: "MedicineCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineInventories_HospitalGroups_TenantId",
                table: "MedicineInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineInventories_Users_CreatedBy",
                table: "MedicineInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineInventories_Users_UpdatedBy",
                table: "MedicineInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_HospitalGroups_TenantId",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_Users_CreatedBy",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_Users_UpdatedBy",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientAllergies_HospitalGroups_TenantId",
                table: "PatientAllergies");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientAllergies_Users_CreatedBy",
                table: "PatientAllergies");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientAllergies_Users_UpdatedBy",
                table: "PatientAllergies");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicals_HospitalGroups_TenantId",
                table: "PatientMedicals");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicals_Users_CreatedBy",
                table: "PatientMedicals");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicals_Users_UpdatedBy",
                table: "PatientMedicals");

            migrationBuilder.DropForeignKey(
                name: "FK_Patients_HospitalGroups_TenantId",
                table: "Patients");

            migrationBuilder.DropForeignKey(
                name: "FK_Patients_Users_CreatedBy",
                table: "Patients");

            migrationBuilder.DropForeignKey(
                name: "FK_Patients_Users_UpdatedBy",
                table: "Patients");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_HospitalGroups_TenantId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Users_CreatedBy",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Users_UpdatedBy",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionItems_HospitalGroups_TenantId",
                table: "PrescriptionItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionItems_Users_CreatedBy",
                table: "PrescriptionItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PrescriptionItems_Users_UpdatedBy",
                table: "PrescriptionItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_HospitalGroups_TenantId",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_Users_CreatedBy",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_Users_UpdatedBy",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_Profiles_HospitalGroups_TenantId",
                table: "Profiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Profiles_Users_CreatedBy",
                table: "Profiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Profiles_Users_UpdatedBy",
                table: "Profiles");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_HospitalGroups_TenantId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_CreatedBy",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UpdatedBy",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_HospitalGroups_HospitalGroupId",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_CreatorId",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_UpdaterId",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropForeignKey(
                name: "FK_SystemSettings_Users_CreatorId",
                table: "SystemSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_SystemSettings_Users_UpdaterId",
                table: "SystemSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_HospitalGroups_TenantId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_TenantId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_SystemSettings_CreatorId",
                table: "SystemSettings");

            migrationBuilder.DropIndex(
                name: "IX_SystemSettings_UpdaterId",
                table: "SystemSettings");

            migrationBuilder.DropIndex(
                name: "IX_Sys_SequenceTrackers_CreatorId",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropIndex(
                name: "IX_Sys_SequenceTrackers_UpdaterId",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropIndex(
                name: "IX_Roles_HospitalGroupId",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_CreatedBy",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_TenantId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_UpdatedBy",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Profiles_CreatedBy",
                table: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Profiles_TenantId",
                table: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Profiles_UpdatedBy",
                table: "Profiles");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_CreatedBy",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_TenantId",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_Prescriptions_UpdatedBy",
                table: "Prescriptions");

            migrationBuilder.DropIndex(
                name: "IX_PrescriptionItems_CreatedBy",
                table: "PrescriptionItems");

            migrationBuilder.DropIndex(
                name: "IX_PrescriptionItems_TenantId",
                table: "PrescriptionItems");

            migrationBuilder.DropIndex(
                name: "IX_PrescriptionItems_UpdatedBy",
                table: "PrescriptionItems");

            migrationBuilder.DropIndex(
                name: "IX_Payments_CreatedBy",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_TenantId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_UpdatedBy",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Patients_CreatedBy",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Patients_TenantId",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_Patients_UpdatedBy",
                table: "Patients");

            migrationBuilder.DropIndex(
                name: "IX_PatientMedicals_CreatedBy",
                table: "PatientMedicals");

            migrationBuilder.DropIndex(
                name: "IX_PatientMedicals_TenantId",
                table: "PatientMedicals");

            migrationBuilder.DropIndex(
                name: "IX_PatientMedicals_UpdatedBy",
                table: "PatientMedicals");

            migrationBuilder.DropIndex(
                name: "IX_PatientAllergies_CreatedBy",
                table: "PatientAllergies");

            migrationBuilder.DropIndex(
                name: "IX_PatientAllergies_TenantId",
                table: "PatientAllergies");

            migrationBuilder.DropIndex(
                name: "IX_PatientAllergies_UpdatedBy",
                table: "PatientAllergies");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_CreatedBy",
                table: "Medicines");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_TenantId",
                table: "Medicines");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_UpdatedBy",
                table: "Medicines");

            migrationBuilder.DropIndex(
                name: "IX_MedicineInventories_CreatedBy",
                table: "MedicineInventories");

            migrationBuilder.DropIndex(
                name: "IX_MedicineInventories_TenantId",
                table: "MedicineInventories");

            migrationBuilder.DropIndex(
                name: "IX_MedicineInventories_UpdatedBy",
                table: "MedicineInventories");

            migrationBuilder.DropIndex(
                name: "IX_MedicineCategories_CreatedBy",
                table: "MedicineCategories");

            migrationBuilder.DropIndex(
                name: "IX_MedicineCategories_TenantId",
                table: "MedicineCategories");

            migrationBuilder.DropIndex(
                name: "IX_MedicineCategories_UpdatedBy",
                table: "MedicineCategories");

            migrationBuilder.DropIndex(
                name: "IX_MedicalRecords_TenantId",
                table: "MedicalRecords");

            migrationBuilder.DropIndex(
                name: "IX_MedicalRecords_UpdatedBy",
                table: "MedicalRecords");

            migrationBuilder.DropIndex(
                name: "IX_LabReports_CreatedBy",
                table: "LabReports");

            migrationBuilder.DropIndex(
                name: "IX_LabReports_TenantId",
                table: "LabReports");

            migrationBuilder.DropIndex(
                name: "IX_LabReports_UpdatedBy",
                table: "LabReports");

            migrationBuilder.DropIndex(
                name: "IX_LabOrders_TenantId",
                table: "LabOrders");

            migrationBuilder.DropIndex(
                name: "IX_LabOrderItems_CreatedBy",
                table: "LabOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_LabOrderItems_TenantId",
                table: "LabOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_LabOrderItems_UpdatedBy",
                table: "LabOrderItems");

            migrationBuilder.DropIndex(
                name: "IX_ImagingReports_CreatedBy",
                table: "ImagingReports");

            migrationBuilder.DropIndex(
                name: "IX_ImagingReports_TenantId",
                table: "ImagingReports");

            migrationBuilder.DropIndex(
                name: "IX_ImagingReports_UpdatedBy",
                table: "ImagingReports");

            migrationBuilder.DropIndex(
                name: "IX_ImagingOrders_TenantId",
                table: "ImagingOrders");

            migrationBuilder.DropIndex(
                name: "IX_ImagingOrders_UpdaterId",
                table: "ImagingOrders");

            migrationBuilder.DropIndex(
                name: "IX_HospitalStaffs_CreatedBy",
                table: "HospitalStaffs");

            migrationBuilder.DropIndex(
                name: "IX_HospitalStaffs_TenantId",
                table: "HospitalStaffs");

            migrationBuilder.DropIndex(
                name: "IX_HospitalStaffs_UpdatedBy",
                table: "HospitalStaffs");

            migrationBuilder.DropIndex(
                name: "IX_Hospitals_CreatedBy",
                table: "Hospitals");

            migrationBuilder.DropIndex(
                name: "IX_Hospitals_UpdatedBy",
                table: "Hospitals");

            migrationBuilder.DropIndex(
                name: "IX_HospitalGroups_CreatedBy",
                table: "HospitalGroups");

            migrationBuilder.DropIndex(
                name: "IX_HospitalGroups_UpdatedBy",
                table: "HospitalGroups");

            migrationBuilder.DropIndex(
                name: "IX_DoctorWorkExperiences_CreatedBy",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropIndex(
                name: "IX_DoctorWorkExperiences_TenantId",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropIndex(
                name: "IX_DoctorWorkExperiences_UpdatedBy",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSpecialties_CreatedBy",
                table: "DoctorSpecialties");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSpecialties_TenantId",
                table: "DoctorSpecialties");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSpecialties_UpdatedBy",
                table: "DoctorSpecialties");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSchedules_CreatedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSchedules_TenantId",
                table: "DoctorSchedules");

            migrationBuilder.DropIndex(
                name: "IX_DoctorSchedules_UpdatedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_CreatedBy",
                table: "Doctors");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_TenantId",
                table: "Doctors");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_UpdatedBy",
                table: "Doctors");

            migrationBuilder.DropIndex(
                name: "IX_DoctorPublications_CreatedBy",
                table: "DoctorPublications");

            migrationBuilder.DropIndex(
                name: "IX_DoctorPublications_TenantId",
                table: "DoctorPublications");

            migrationBuilder.DropIndex(
                name: "IX_DoctorPublications_UpdatedBy",
                table: "DoctorPublications");

            migrationBuilder.DropIndex(
                name: "IX_DoctorLeaves_CreatedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropIndex(
                name: "IX_DoctorLeaves_TenantId",
                table: "DoctorLeaves");

            migrationBuilder.DropIndex(
                name: "IX_DoctorLeaves_UpdatedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropIndex(
                name: "IX_DoctorEducations_CreatedBy",
                table: "DoctorEducations");

            migrationBuilder.DropIndex(
                name: "IX_DoctorEducations_TenantId",
                table: "DoctorEducations");

            migrationBuilder.DropIndex(
                name: "IX_DoctorEducations_UpdatedBy",
                table: "DoctorEducations");

            migrationBuilder.DropIndex(
                name: "IX_DoctorCertifications_CreatedBy",
                table: "DoctorCertifications");

            migrationBuilder.DropIndex(
                name: "IX_DoctorCertifications_TenantId",
                table: "DoctorCertifications");

            migrationBuilder.DropIndex(
                name: "IX_DoctorCertifications_UpdatedBy",
                table: "DoctorCertifications");

            migrationBuilder.DropIndex(
                name: "IX_DoctorAwards_CreatedBy",
                table: "DoctorAwards");

            migrationBuilder.DropIndex(
                name: "IX_DoctorAwards_TenantId",
                table: "DoctorAwards");

            migrationBuilder.DropIndex(
                name: "IX_DoctorAwards_UpdatedBy",
                table: "DoctorAwards");

            migrationBuilder.DropIndex(
                name: "IX_Departments_CreatedBy",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_UpdatedBy",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Bills_TenantId",
                table: "Bills");

            migrationBuilder.DropIndex(
                name: "IX_Bills_UpdaterId",
                table: "Bills");

            migrationBuilder.DropIndex(
                name: "IX_BillItems_CreatedBy",
                table: "BillItems");

            migrationBuilder.DropIndex(
                name: "IX_BillItems_TenantId",
                table: "BillItems");

            migrationBuilder.DropIndex(
                name: "IX_BillItems_UpdatedBy",
                table: "BillItems");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_TenantId",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_UpdatedBy",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CreatedBy",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_TenantId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_UpdatedBy",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "HospitalGroups");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "UpdaterId",
                table: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "CreatorId",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropColumn(
                name: "UpdaterId",
                table: "Sys_SequenceTrackers");

            migrationBuilder.DropColumn(
                name: "HospitalGroupId",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Prescriptions");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "PrescriptionItems");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PatientMedicals");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "PatientMedicals");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "PatientMedicals");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "PatientAllergies");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "PatientAllergies");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "PatientAllergies");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "PatientAllergies");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "MedicineCategories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "MedicineCategories");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "MedicineCategories");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "MedicineCategories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "LabReports");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "LabReports");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LabReports");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "LabReports");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "LabOrders");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "LabOrders");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "UpdaterId",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "HospitalStaffs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "HospitalStaffs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "HospitalStaffs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "HospitalGroups");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "HospitalGroups");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorWorkExperiences");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorSpecialties");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorSpecialties");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "DoctorSpecialties");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorSpecialties");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorSchedules");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorPublications");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorPublications");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "DoctorPublications");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorPublications");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorLeaves");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorEducations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorEducations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "DoctorEducations");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorEducations");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorCertifications");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorCertifications");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "DoctorCertifications");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorCertifications");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "DoctorAwards");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "DoctorAwards");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "DoctorAwards");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "DoctorAwards");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "UpdaterId",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "BillItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "BillItems");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "BillItems");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "BillItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Addresses");

            migrationBuilder.RenameColumn(
                name: "TenantId",
                table: "Hospitals",
                newName: "HospitalGroupId");

            migrationBuilder.RenameIndex(
                name: "IX_Hospitals_TenantId",
                table: "Hospitals",
                newName: "IX_Hospitals_HospitalGroupId");

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "Sys_SequenceTrackers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "Roles",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "PrintTemplateVersions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "PrintTemplates",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "MedicalRecords",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "LabOrders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "ImagingOrders",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "Bills",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CreatedBy",
                table: "AdminMenus",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("d9a3f2c5-4f2e-4d0f-9c77-83a1b17c1b2a"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SequenceTrackers_CreatedBy",
                table: "Sys_SequenceTrackers",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SequenceTrackers_UpdatedBy",
                table: "Sys_SequenceTrackers",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Hospitals_HospitalGroups_HospitalGroupId",
                table: "Hospitals",
                column: "HospitalGroupId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_CreatedBy",
                table: "Sys_SequenceTrackers",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Sys_SequenceTrackers_Users_UpdatedBy",
                table: "Sys_SequenceTrackers",
                column: "UpdatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
