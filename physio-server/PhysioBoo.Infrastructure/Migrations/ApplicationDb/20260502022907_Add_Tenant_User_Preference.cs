using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Add_Tenant_User_Preference : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserPreferences_TenantId",
                table: "UserPreferences",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserPreferences_HospitalGroups_TenantId",
                table: "UserPreferences",
                column: "TenantId",
                principalTable: "HospitalGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserPreferences_HospitalGroups_TenantId",
                table: "UserPreferences");

            migrationBuilder.DropIndex(
                name: "IX_UserPreferences_TenantId",
                table: "UserPreferences");
        }
    }
}
