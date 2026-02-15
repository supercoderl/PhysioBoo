using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Add_SearchVector_Medical_Specialty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS unaccent;");

            migrationBuilder.Sql("ALTER FUNCTION unaccent(text) IMMUTABLE;");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:unaccent", ",,");

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "MedicalSpecialties",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '')))",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalSpecialties_SearchVector",
                table: "MedicalSpecialties",
                column: "SearchVector")
                .Annotation("Npgsql:IndexMethod", "GIN");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MedicalSpecialties_SearchVector",
                table: "MedicalSpecialties");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "MedicalSpecialties");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:unaccent", ",,");
        }
    }
}
