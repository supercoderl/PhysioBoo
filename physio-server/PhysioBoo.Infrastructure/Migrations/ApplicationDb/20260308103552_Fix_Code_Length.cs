using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Fix_Code_Length : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            string[] tables = { "Suppliers", "MedicineCategories", "MedicalSpecialties", "Manufacturers", "LabTests", "LabTestCategories", "InsuranceCompanies", "ImagingModalities", "AppointmentTypes" };
            foreach (string table in tables)
            {
                migrationBuilder.DropColumn(name: "SearchVector", table: table);
            }

            migrationBuilder.AlterColumn<string>(name: "SupplierCode", table: "Suppliers", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(50)", oldMaxLength: 50, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "MedicineCategories", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "MedicalSpecialties", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "CompanyCode", table: "Manufacturers", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "TestCode", table: "LabTests", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "LabTestCategories", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "InsuranceCompanies", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "ImagingModalities", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "AppointmentTypes", type: "character varying(100)", maxLength: 100, nullable: true, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);

            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "Suppliers", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"SupplierName\", '') || ' ' || coalesce(\"SupplierCode\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "MedicineCategories", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "MedicalSpecialties", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "Manufacturers", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"CompanyCode\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "LabTests", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"TestName\", '') || ' ' || coalesce(\"TestCode\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "LabTestCategories", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "InsuranceCompanies", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "ImagingModalities", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "AppointmentTypes", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            string[] tables = { "Suppliers", "MedicineCategories", "MedicalSpecialties", "Manufacturers", "LabTests", "LabTestCategories", "InsuranceCompanies", "ImagingModalities", "AppointmentTypes" };
            foreach (string table in tables)
            {
                migrationBuilder.DropColumn(name: "SearchVector", table: table);
            }

            migrationBuilder.AlterColumn<string>(name: "SupplierCode", table: "Suppliers", type: "character varying(50)", maxLength: 50, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "MedicineCategories", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "MedicalSpecialties", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "CompanyCode", table: "Manufacturers", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "TestCode", table: "LabTests", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "LabTestCategories", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "InsuranceCompanies", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "ImagingModalities", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);
            migrationBuilder.AlterColumn<string>(name: "Code", table: "AppointmentTypes", type: "character varying(20)", maxLength: 20, nullable: true, oldClrType: typeof(string), oldType: "character varying(100)", oldMaxLength: 100, oldNullable: true);

            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "Suppliers", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"SupplierName\", '') || ' ' || coalesce(\"SupplierCode\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "MedicineCategories", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "MedicalSpecialties", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "Manufacturers", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"CompanyCode\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "LabTests", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"TestName\", '') || ' ' || coalesce(\"TestCode\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "LabTestCategories", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "InsuranceCompanies", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "ImagingModalities", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
            migrationBuilder.AddColumn<string>(name: "SearchVector", table: "AppointmentTypes", type: "tsvector", computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))", stored: true);
        }
    }
}
