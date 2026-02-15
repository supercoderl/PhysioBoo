using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class AuditLogRemoveRelationShip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sys_AuditLogs_Users_UserId",
                table: "Sys_AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_Sys_AuditLogs_UserId",
                table: "Sys_AuditLogs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Sys_AuditLogs_UserId",
                table: "Sys_AuditLogs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sys_AuditLogs_Users_UserId",
                table: "Sys_AuditLogs",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
