using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Add_Profile_Direct_Links : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Profiles_Users_Id",
                table: "Profiles");

            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "Users",
                type: "uuid",
                nullable: true);

            // Added nullable first so existing rows can be backfilled before the
            // NOT NULL constraint is enforced below.
            migrationBuilder.AddColumn<Guid>(
                name: "ProfileId",
                table: "Patients",
                type: "uuid",
                nullable: true);

            // Historically every Profile/User/Patient triplet was created with the
            // same Guid (see the old CreatePatientCommandHandler), so Profile.Id
            // already equals both User.Id and Patient.Id for all existing rows.
            migrationBuilder.Sql(
                @"UPDATE ""Users"" u
                  SET ""ProfileId"" = p.""Id""
                  FROM ""Profiles"" p
                  WHERE p.""Id"" = u.""Id"";");

            migrationBuilder.Sql(
                @"UPDATE ""Patients"" pt
                  SET ""ProfileId"" = p.""Id""
                  FROM ""Profiles"" p
                  WHERE p.""Id"" = pt.""Id"";");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProfileId",
                table: "Patients",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ProfileId",
                table: "Users",
                column: "ProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Patients_ProfileId",
                table: "Patients",
                column: "ProfileId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Patients_Profiles_ProfileId",
                table: "Patients",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Profiles_ProfileId",
                table: "Users",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Patients_Profiles_ProfileId",
                table: "Patients");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Profiles_ProfileId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_ProfileId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Patients_ProfileId",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Patients");

            migrationBuilder.AddForeignKey(
                name: "FK_Profiles_Users_Id",
                table: "Profiles",
                column: "Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
