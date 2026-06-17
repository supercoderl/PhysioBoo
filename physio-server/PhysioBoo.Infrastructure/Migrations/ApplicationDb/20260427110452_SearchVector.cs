using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class SearchVector : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Sys_AuditLogs",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Patients",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"PatientNumber\", '')))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "AdminMenus",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Label\", '') || ' ' || coalesce(\"Route\", '')))",
                stored: true);

            migrationBuilder.AddColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Addresses",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Street\", '') || ' ' || coalesce(\"Country\", '')))",
                stored: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "AdminMenus");

            migrationBuilder.DropColumn(
                name: "SearchVector",
                table: "Addresses");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "Sys_AuditLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
