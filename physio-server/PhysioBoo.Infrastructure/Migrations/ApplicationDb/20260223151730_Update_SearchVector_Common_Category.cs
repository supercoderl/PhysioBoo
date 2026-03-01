using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Update_SearchVector_Common_Category : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Suppliers",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"SupplierName\", '') || ' ' || coalesce(\"SupplierCode\", '')))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "MedicineCategories",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Manufacturers",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"CompanyCode\", '')))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "InsuranceCompanies",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))",
                stored: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "MedicineCategories");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Manufacturers");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "InsuranceCompanies");
        }
    }
}
