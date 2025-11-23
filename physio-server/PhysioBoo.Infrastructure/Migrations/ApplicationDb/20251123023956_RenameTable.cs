using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class RenameTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_DoctorSpecialtys_PrimarySpecialtyId",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialtys_Doctors_DoctorId",
                table: "DoctorSpecialtys");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialtys_MedicalSpecialties_SpecialtyId",
                table: "DoctorSpecialtys");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrdersItem_LabOrders_LabOrderId",
                table: "LabOrdersItem");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrdersItem_LabTests_LabTestId",
                table: "LabOrdersItem");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrdersItem_Users_SampleCollectorId",
                table: "LabOrdersItem");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrdersItem_Users_TechnicianId",
                table: "LabOrdersItem");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrdersItem_Users_VerifiedBy",
                table: "LabOrdersItem");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_MedicinesCategories_CategoryId",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicinesCategories_MedicinesCategories_ParentCategoryId",
                table: "MedicinesCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicinesInventories_Hospitals_HospitalId",
                table: "MedicinesInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicinesInventories_Medicines_MedicineId",
                table: "MedicinesInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicinesInventories_Supplier_SupplierId",
                table: "MedicinesInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicalHistories_Doctors_DiagnosedBy",
                table: "PatientMedicalHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicalHistories_Hospitals_DiagnosisHospitalId",
                table: "PatientMedicalHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicalHistories_Patients_PatientId",
                table: "PatientMedicalHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Supplier",
                table: "Supplier");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PatientMedicalHistories",
                table: "PatientMedicalHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OutboxMessages",
                table: "OutboxMessages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicinesInventories",
                table: "MedicinesInventories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicinesCategories",
                table: "MedicinesCategories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LabOrdersItem",
                table: "LabOrdersItem");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DoctorSpecialtys",
                table: "DoctorSpecialtys");

            migrationBuilder.RenameTable(
                name: "Supplier",
                newName: "Suppliers");

            migrationBuilder.RenameTable(
                name: "PatientMedicalHistories",
                newName: "PatientMedicals");

            migrationBuilder.RenameTable(
                name: "OutboxMessages",
                newName: "Outboxes");

            migrationBuilder.RenameTable(
                name: "MedicinesInventories",
                newName: "MedicineInventories");

            migrationBuilder.RenameTable(
                name: "MedicinesCategories",
                newName: "MedicineCategories");

            migrationBuilder.RenameTable(
                name: "LabOrdersItem",
                newName: "LabOrderItems");

            migrationBuilder.RenameTable(
                name: "DoctorSpecialtys",
                newName: "DoctorSpecialties");

            migrationBuilder.RenameIndex(
                name: "IX_Supplier_SupplierName",
                table: "Suppliers",
                newName: "IX_Suppliers_SupplierName");

            migrationBuilder.RenameIndex(
                name: "IX_Supplier_SupplierCode",
                table: "Suppliers",
                newName: "IX_Suppliers_SupplierCode");

            migrationBuilder.RenameIndex(
                name: "IX_Supplier_Phone",
                table: "Suppliers",
                newName: "IX_Suppliers_Phone");

            migrationBuilder.RenameIndex(
                name: "IX_Supplier_Email",
                table: "Suppliers",
                newName: "IX_Suppliers_Email");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicalHistories_PatientId",
                table: "PatientMedicals",
                newName: "IX_PatientMedicals_PatientId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicalHistories_Icd10Code",
                table: "PatientMedicals",
                newName: "IX_PatientMedicals_Icd10Code");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicalHistories_DiagnosisHospitalId",
                table: "PatientMedicals",
                newName: "IX_PatientMedicals_DiagnosisHospitalId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicalHistories_DiagnosedBy",
                table: "PatientMedicals",
                newName: "IX_PatientMedicals_DiagnosedBy");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicalHistories_ConditionName",
                table: "PatientMedicals",
                newName: "IX_PatientMedicals_ConditionName");

            migrationBuilder.RenameIndex(
                name: "IX_OutboxMessages_ProcessedOn_RetryCount",
                table: "Outboxes",
                newName: "IX_Outboxes_ProcessedOn_RetryCount");

            migrationBuilder.RenameIndex(
                name: "IX_OutboxMessages_OccurredOn",
                table: "Outboxes",
                newName: "IX_Outboxes_OccurredOn");

            migrationBuilder.RenameIndex(
                name: "IX_MedicinesInventories_SupplierId",
                table: "MedicineInventories",
                newName: "IX_MedicineInventories_SupplierId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicinesInventories_MedicineId_HospitalId_BatchNumber",
                table: "MedicineInventories",
                newName: "IX_MedicineInventories_MedicineId_HospitalId_BatchNumber");

            migrationBuilder.RenameIndex(
                name: "IX_MedicinesInventories_MedicineId",
                table: "MedicineInventories",
                newName: "IX_MedicineInventories_MedicineId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicinesInventories_HospitalId",
                table: "MedicineInventories",
                newName: "IX_MedicineInventories_HospitalId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicinesCategories_ParentCategoryId",
                table: "MedicineCategories",
                newName: "IX_MedicineCategories_ParentCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicinesCategories_Name",
                table: "MedicineCategories",
                newName: "IX_MedicineCategories_Name");

            migrationBuilder.RenameIndex(
                name: "IX_MedicinesCategories_Code",
                table: "MedicineCategories",
                newName: "IX_MedicineCategories_Code");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrdersItem_VerifiedBy",
                table: "LabOrderItems",
                newName: "IX_LabOrderItems_VerifiedBy");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrdersItem_TechnicianId",
                table: "LabOrderItems",
                newName: "IX_LabOrderItems_TechnicianId");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrdersItem_SampleCollectorId",
                table: "LabOrderItems",
                newName: "IX_LabOrderItems_SampleCollectorId");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrdersItem_LabTestId",
                table: "LabOrderItems",
                newName: "IX_LabOrderItems_LabTestId");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrdersItem_LabOrderId",
                table: "LabOrderItems",
                newName: "IX_LabOrderItems_LabOrderId");

            migrationBuilder.RenameIndex(
                name: "IX_DoctorSpecialtys_SpecialtyId",
                table: "DoctorSpecialties",
                newName: "IX_DoctorSpecialties_SpecialtyId");

            migrationBuilder.RenameIndex(
                name: "IX_DoctorSpecialtys_DoctorId",
                table: "DoctorSpecialties",
                newName: "IX_DoctorSpecialties_DoctorId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Suppliers",
                table: "Suppliers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PatientMedicals",
                table: "PatientMedicals",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Outboxes",
                table: "Outboxes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicineInventories",
                table: "MedicineInventories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicineCategories",
                table: "MedicineCategories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LabOrderItems",
                table: "LabOrderItems",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DoctorSpecialties",
                table: "DoctorSpecialties",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_DoctorSpecialties_PrimarySpecialtyId",
                table: "Doctors",
                column: "PrimarySpecialtyId",
                principalTable: "DoctorSpecialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSpecialties_Doctors_DoctorId",
                table: "DoctorSpecialties",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSpecialties_MedicalSpecialties_SpecialtyId",
                table: "DoctorSpecialties",
                column: "SpecialtyId",
                principalTable: "MedicalSpecialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_LabOrders_LabOrderId",
                table: "LabOrderItems",
                column: "LabOrderId",
                principalTable: "LabOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_LabTests_LabTestId",
                table: "LabOrderItems",
                column: "LabTestId",
                principalTable: "LabTests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_Users_SampleCollectorId",
                table: "LabOrderItems",
                column: "SampleCollectorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_Users_TechnicianId",
                table: "LabOrderItems",
                column: "TechnicianId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrderItems_Users_VerifiedBy",
                table: "LabOrderItems",
                column: "VerifiedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineCategories_MedicineCategories_ParentCategoryId",
                table: "MedicineCategories",
                column: "ParentCategoryId",
                principalTable: "MedicineCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineInventories_Hospitals_HospitalId",
                table: "MedicineInventories",
                column: "HospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineInventories_Medicines_MedicineId",
                table: "MedicineInventories",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineInventories_Suppliers_SupplierId",
                table: "MedicineInventories",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_MedicineCategories_CategoryId",
                table: "Medicines",
                column: "CategoryId",
                principalTable: "MedicineCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicals_Doctors_DiagnosedBy",
                table: "PatientMedicals",
                column: "DiagnosedBy",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicals_Hospitals_DiagnosisHospitalId",
                table: "PatientMedicals",
                column: "DiagnosisHospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicals_Patients_PatientId",
                table: "PatientMedicals",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_DoctorSpecialties_PrimarySpecialtyId",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialties_Doctors_DoctorId",
                table: "DoctorSpecialties");

            migrationBuilder.DropForeignKey(
                name: "FK_DoctorSpecialties_MedicalSpecialties_SpecialtyId",
                table: "DoctorSpecialties");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_LabOrders_LabOrderId",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_LabTests_LabTestId",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_Users_SampleCollectorId",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_Users_TechnicianId",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_LabOrderItems_Users_VerifiedBy",
                table: "LabOrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineCategories_MedicineCategories_ParentCategoryId",
                table: "MedicineCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineInventories_Hospitals_HospitalId",
                table: "MedicineInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineInventories_Medicines_MedicineId",
                table: "MedicineInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicineInventories_Suppliers_SupplierId",
                table: "MedicineInventories");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_MedicineCategories_CategoryId",
                table: "Medicines");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicals_Doctors_DiagnosedBy",
                table: "PatientMedicals");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicals_Hospitals_DiagnosisHospitalId",
                table: "PatientMedicals");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientMedicals_Patients_PatientId",
                table: "PatientMedicals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Suppliers",
                table: "Suppliers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PatientMedicals",
                table: "PatientMedicals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Outboxes",
                table: "Outboxes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicineInventories",
                table: "MedicineInventories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MedicineCategories",
                table: "MedicineCategories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LabOrderItems",
                table: "LabOrderItems");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DoctorSpecialties",
                table: "DoctorSpecialties");

            migrationBuilder.RenameTable(
                name: "Suppliers",
                newName: "Supplier");

            migrationBuilder.RenameTable(
                name: "PatientMedicals",
                newName: "PatientMedicalHistories");

            migrationBuilder.RenameTable(
                name: "Outboxes",
                newName: "OutboxMessages");

            migrationBuilder.RenameTable(
                name: "MedicineInventories",
                newName: "MedicinesInventories");

            migrationBuilder.RenameTable(
                name: "MedicineCategories",
                newName: "MedicinesCategories");

            migrationBuilder.RenameTable(
                name: "LabOrderItems",
                newName: "LabOrdersItem");

            migrationBuilder.RenameTable(
                name: "DoctorSpecialties",
                newName: "DoctorSpecialtys");

            migrationBuilder.RenameIndex(
                name: "IX_Suppliers_SupplierName",
                table: "Supplier",
                newName: "IX_Supplier_SupplierName");

            migrationBuilder.RenameIndex(
                name: "IX_Suppliers_SupplierCode",
                table: "Supplier",
                newName: "IX_Supplier_SupplierCode");

            migrationBuilder.RenameIndex(
                name: "IX_Suppliers_Phone",
                table: "Supplier",
                newName: "IX_Supplier_Phone");

            migrationBuilder.RenameIndex(
                name: "IX_Suppliers_Email",
                table: "Supplier",
                newName: "IX_Supplier_Email");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicals_PatientId",
                table: "PatientMedicalHistories",
                newName: "IX_PatientMedicalHistories_PatientId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicals_Icd10Code",
                table: "PatientMedicalHistories",
                newName: "IX_PatientMedicalHistories_Icd10Code");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicals_DiagnosisHospitalId",
                table: "PatientMedicalHistories",
                newName: "IX_PatientMedicalHistories_DiagnosisHospitalId");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicals_DiagnosedBy",
                table: "PatientMedicalHistories",
                newName: "IX_PatientMedicalHistories_DiagnosedBy");

            migrationBuilder.RenameIndex(
                name: "IX_PatientMedicals_ConditionName",
                table: "PatientMedicalHistories",
                newName: "IX_PatientMedicalHistories_ConditionName");

            migrationBuilder.RenameIndex(
                name: "IX_Outboxes_ProcessedOn_RetryCount",
                table: "OutboxMessages",
                newName: "IX_OutboxMessages_ProcessedOn_RetryCount");

            migrationBuilder.RenameIndex(
                name: "IX_Outboxes_OccurredOn",
                table: "OutboxMessages",
                newName: "IX_OutboxMessages_OccurredOn");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineInventories_SupplierId",
                table: "MedicinesInventories",
                newName: "IX_MedicinesInventories_SupplierId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineInventories_MedicineId_HospitalId_BatchNumber",
                table: "MedicinesInventories",
                newName: "IX_MedicinesInventories_MedicineId_HospitalId_BatchNumber");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineInventories_MedicineId",
                table: "MedicinesInventories",
                newName: "IX_MedicinesInventories_MedicineId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineInventories_HospitalId",
                table: "MedicinesInventories",
                newName: "IX_MedicinesInventories_HospitalId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineCategories_ParentCategoryId",
                table: "MedicinesCategories",
                newName: "IX_MedicinesCategories_ParentCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineCategories_Name",
                table: "MedicinesCategories",
                newName: "IX_MedicinesCategories_Name");

            migrationBuilder.RenameIndex(
                name: "IX_MedicineCategories_Code",
                table: "MedicinesCategories",
                newName: "IX_MedicinesCategories_Code");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrderItems_VerifiedBy",
                table: "LabOrdersItem",
                newName: "IX_LabOrdersItem_VerifiedBy");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrderItems_TechnicianId",
                table: "LabOrdersItem",
                newName: "IX_LabOrdersItem_TechnicianId");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrderItems_SampleCollectorId",
                table: "LabOrdersItem",
                newName: "IX_LabOrdersItem_SampleCollectorId");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrderItems_LabTestId",
                table: "LabOrdersItem",
                newName: "IX_LabOrdersItem_LabTestId");

            migrationBuilder.RenameIndex(
                name: "IX_LabOrderItems_LabOrderId",
                table: "LabOrdersItem",
                newName: "IX_LabOrdersItem_LabOrderId");

            migrationBuilder.RenameIndex(
                name: "IX_DoctorSpecialties_SpecialtyId",
                table: "DoctorSpecialtys",
                newName: "IX_DoctorSpecialtys_SpecialtyId");

            migrationBuilder.RenameIndex(
                name: "IX_DoctorSpecialties_DoctorId",
                table: "DoctorSpecialtys",
                newName: "IX_DoctorSpecialtys_DoctorId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Supplier",
                table: "Supplier",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PatientMedicalHistories",
                table: "PatientMedicalHistories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_OutboxMessages",
                table: "OutboxMessages",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicinesInventories",
                table: "MedicinesInventories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MedicinesCategories",
                table: "MedicinesCategories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LabOrdersItem",
                table: "LabOrdersItem",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DoctorSpecialtys",
                table: "DoctorSpecialtys",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_DoctorSpecialtys_PrimarySpecialtyId",
                table: "Doctors",
                column: "PrimarySpecialtyId",
                principalTable: "DoctorSpecialtys",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSpecialtys_Doctors_DoctorId",
                table: "DoctorSpecialtys",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DoctorSpecialtys_MedicalSpecialties_SpecialtyId",
                table: "DoctorSpecialtys",
                column: "SpecialtyId",
                principalTable: "MedicalSpecialties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrdersItem_LabOrders_LabOrderId",
                table: "LabOrdersItem",
                column: "LabOrderId",
                principalTable: "LabOrders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrdersItem_LabTests_LabTestId",
                table: "LabOrdersItem",
                column: "LabTestId",
                principalTable: "LabTests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrdersItem_Users_SampleCollectorId",
                table: "LabOrdersItem",
                column: "SampleCollectorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrdersItem_Users_TechnicianId",
                table: "LabOrdersItem",
                column: "TechnicianId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LabOrdersItem_Users_VerifiedBy",
                table: "LabOrdersItem",
                column: "VerifiedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_MedicinesCategories_CategoryId",
                table: "Medicines",
                column: "CategoryId",
                principalTable: "MedicinesCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicinesCategories_MedicinesCategories_ParentCategoryId",
                table: "MedicinesCategories",
                column: "ParentCategoryId",
                principalTable: "MedicinesCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicinesInventories_Hospitals_HospitalId",
                table: "MedicinesInventories",
                column: "HospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicinesInventories_Medicines_MedicineId",
                table: "MedicinesInventories",
                column: "MedicineId",
                principalTable: "Medicines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicinesInventories_Supplier_SupplierId",
                table: "MedicinesInventories",
                column: "SupplierId",
                principalTable: "Supplier",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicalHistories_Doctors_DiagnosedBy",
                table: "PatientMedicalHistories",
                column: "DiagnosedBy",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicalHistories_Hospitals_DiagnosisHospitalId",
                table: "PatientMedicalHistories",
                column: "DiagnosisHospitalId",
                principalTable: "Hospitals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientMedicalHistories_Patients_PatientId",
                table: "PatientMedicalHistories",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
