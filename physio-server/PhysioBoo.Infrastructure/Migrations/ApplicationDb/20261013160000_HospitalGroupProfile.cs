using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PhysioBoo.Infrastructure.Database;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <summary>
    /// Adds the tenant profile fields the Super Admin form already collects: code, contact person and the headquarters location.
    /// </summary>
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20261013160000_HospitalGroupProfile")]
    public partial class HospitalGroupProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(name: "CityId", table: "HospitalGroups", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<string>(name: "Code", table: "HospitalGroups", type: "character varying(50)", maxLength: 50, nullable: true);
            migrationBuilder.AddColumn<string>(name: "ContactPerson", table: "HospitalGroups", type: "character varying(100)", maxLength: 100, nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "CountryId", table: "HospitalGroups", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "DistrictId", table: "HospitalGroups", type: "uuid", nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "WardId", table: "HospitalGroups", type: "uuid", nullable: true);

            migrationBuilder.CreateIndex(name: "IX_HospitalGroups_CityId", table: "HospitalGroups", column: "CityId");
            migrationBuilder.CreateIndex(
                name: "IX_HospitalGroups_Code",
                table: "HospitalGroups",
                column: "Code",
                unique: true,
                filter: "\"Code\" IS NOT NULL AND \"DeletedAt\" IS NULL");
            migrationBuilder.CreateIndex(name: "IX_HospitalGroups_CountryId", table: "HospitalGroups", column: "CountryId");
            migrationBuilder.CreateIndex(name: "IX_HospitalGroups_DistrictId", table: "HospitalGroups", column: "DistrictId");
            migrationBuilder.CreateIndex(name: "IX_HospitalGroups_WardId", table: "HospitalGroups", column: "WardId");

            migrationBuilder.AddForeignKey(
                name: "FK_HospitalGroups_Cities_CityId", table: "HospitalGroups", column: "CityId",
                principalTable: "Cities", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_HospitalGroups_Countries_CountryId", table: "HospitalGroups", column: "CountryId",
                principalTable: "Countries", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_HospitalGroups_Districts_DistrictId", table: "HospitalGroups", column: "DistrictId",
                principalTable: "Districts", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_HospitalGroups_GeoWards_WardId", table: "HospitalGroups", column: "WardId",
                principalTable: "GeoWards", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_HospitalGroups_Cities_CityId", table: "HospitalGroups");
            migrationBuilder.DropForeignKey(name: "FK_HospitalGroups_Countries_CountryId", table: "HospitalGroups");
            migrationBuilder.DropForeignKey(name: "FK_HospitalGroups_Districts_DistrictId", table: "HospitalGroups");
            migrationBuilder.DropForeignKey(name: "FK_HospitalGroups_GeoWards_WardId", table: "HospitalGroups");

            migrationBuilder.DropIndex(name: "IX_HospitalGroups_CityId", table: "HospitalGroups");
            migrationBuilder.DropIndex(name: "IX_HospitalGroups_Code", table: "HospitalGroups");
            migrationBuilder.DropIndex(name: "IX_HospitalGroups_CountryId", table: "HospitalGroups");
            migrationBuilder.DropIndex(name: "IX_HospitalGroups_DistrictId", table: "HospitalGroups");
            migrationBuilder.DropIndex(name: "IX_HospitalGroups_WardId", table: "HospitalGroups");

            migrationBuilder.DropColumn(name: "CityId", table: "HospitalGroups");
            migrationBuilder.DropColumn(name: "Code", table: "HospitalGroups");
            migrationBuilder.DropColumn(name: "ContactPerson", table: "HospitalGroups");
            migrationBuilder.DropColumn(name: "CountryId", table: "HospitalGroups");
            migrationBuilder.DropColumn(name: "DistrictId", table: "HospitalGroups");
            migrationBuilder.DropColumn(name: "WardId", table: "HospitalGroups");
        }
    }
}
