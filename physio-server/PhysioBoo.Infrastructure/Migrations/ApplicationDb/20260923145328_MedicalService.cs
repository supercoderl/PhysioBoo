using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class MedicalService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MedicalServices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: true),
                    Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    ShortName = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CoverImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Tags = table.Column<string>(type: "jsonb", nullable: true),
                    Status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Availability = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    VatIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    RequiresAppointment = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresReferral = table.Column<bool>(type: "boolean", nullable: false),
                    PrimaryDoctorId = table.Column<Guid>(type: "uuid", nullable: true),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    SearchVector = table.Column<NpgsqlTsVector>(type: "tsvector", nullable: true, computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"Name\", '') || ' ' || coalesce(\"Code\", '') || ' ' || coalesce(\"ShortName\", '')))", stored: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicalServices_Doctors_PrimaryDoctorId",
                        column: x => x.PrimaryDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicalServiceDepartments",
                columns: table => new
                {
                    MedicalServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalServiceDepartments", x => new { x.MedicalServiceId, x.DepartmentId });
                    table.ForeignKey(
                        name: "FK_MedicalServiceDepartments_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalServiceDepartments_MedicalServices_MedicalServiceId",
                        column: x => x.MedicalServiceId,
                        principalTable: "MedicalServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicalServiceDoctors",
                columns: table => new
                {
                    MedicalServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalServiceDoctors", x => new { x.MedicalServiceId, x.DoctorId });
                    table.ForeignKey(
                        name: "FK_MedicalServiceDoctors_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicalServiceDoctors_MedicalServices_MedicalServiceId",
                        column: x => x.MedicalServiceId,
                        principalTable: "MedicalServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HomeSettings_TenantId",
                table: "HomeSettings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalServiceDepartments_DepartmentId",
                table: "MedicalServiceDepartments",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalServiceDoctors_DoctorId",
                table: "MedicalServiceDoctors",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalServices_HospitalId",
                table: "MedicalServices",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalServices_PrimaryDoctorId",
                table: "MedicalServices",
                column: "PrimaryDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalServices_Status",
                table: "MedicalServices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalServices_TenantId_Code",
                table: "MedicalServices",
                columns: new[] { "TenantId", "Code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicalServiceDepartments");

            migrationBuilder.DropTable(
                name: "MedicalServiceDoctors");

            migrationBuilder.DropTable(
                name: "MedicalServices");

            migrationBuilder.DropIndex(
                name: "IX_HomeSettings_TenantId",
                table: "HomeSettings");
        }
    }
}
