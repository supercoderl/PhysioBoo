using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Update_Lab_Test_And_Category : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "LabTests",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"TestName\", '') || ' ' || coalesce(\"TestCode\", '')))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "LabTestCategories",
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
                table: "LabTests");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "LabTestCategories");
        }
    }
}
