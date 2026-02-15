using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Update_Sys_Language : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FlagUrl",
                table: "Sys_Languages",
                type: "character varying(2083)",
                maxLength: 2083,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Index",
                table: "Sys_Languages",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "Sys_Languages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "NativeName",
                table: "Sys_Languages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FlagUrl",
                table: "Sys_Languages");

            migrationBuilder.DropColumn(
                name: "Index",
                table: "Sys_Languages");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "Sys_Languages");

            migrationBuilder.DropColumn(
                name: "NativeName",
                table: "Sys_Languages");
        }
    }
}
