using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Add_StockTake_Module : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StockTakes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedTo = table.Column<Guid>(type: "uuid", nullable: true),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RejectionReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTakes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockTakes_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakes_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakes_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakes_Users_AssignedTo",
                        column: x => x.AssignedTo,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakes_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakes_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockTakeActivities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockTakeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Actor = table.Column<Guid>(type: "uuid", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTakeActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockTakeActivities_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeActivities_StockTakes_StockTakeId",
                        column: x => x.StockTakeId,
                        principalTable: "StockTakes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeActivities_Users_Actor",
                        column: x => x.Actor,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeActivities_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeActivities_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockTakeItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StockTakeId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineInventoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    SystemQty = table.Column<int>(type: "integer", nullable: false),
                    ActualQty = table.Column<int>(type: "integer", nullable: true),
                    Reason = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    IsCounted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockTakeItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockTakeItems_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeItems_MedicineInventories_MedicineInventoryId",
                        column: x => x.MedicineInventoryId,
                        principalTable: "MedicineInventories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeItems_StockTakes_StockTakeId",
                        column: x => x.StockTakeId,
                        principalTable: "StockTakes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeItems_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockTakeItems_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeActivities_Actor",
                table: "StockTakeActivities",
                column: "Actor");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeActivities_CreatedBy",
                table: "StockTakeActivities",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeActivities_OccurredAt",
                table: "StockTakeActivities",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeActivities_StockTakeId",
                table: "StockTakeActivities",
                column: "StockTakeId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeActivities_TenantId",
                table: "StockTakeActivities",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeActivities_UpdatedBy",
                table: "StockTakeActivities",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeItems_CreatedBy",
                table: "StockTakeItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeItems_MedicineInventoryId",
                table: "StockTakeItems",
                column: "MedicineInventoryId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeItems_StockTakeId",
                table: "StockTakeItems",
                column: "StockTakeId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeItems_TenantId",
                table: "StockTakeItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakeItems_UpdatedBy",
                table: "StockTakeItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_AssignedTo",
                table: "StockTakes",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_Code",
                table: "StockTakes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_CreatedBy",
                table: "StockTakes",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_DepartmentId",
                table: "StockTakes",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_HospitalId",
                table: "StockTakes",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_Status",
                table: "StockTakes",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_TenantId",
                table: "StockTakes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockTakes_UpdatedBy",
                table: "StockTakes",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StockTakeActivities");

            migrationBuilder.DropTable(
                name: "StockTakeItems");

            migrationBuilder.DropTable(
                name: "StockTakes");
        }
    }
}
