using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Add_Transactions_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisposalReason",
                table: "MedicineInventories",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LockReason",
                table: "MedicineInventories",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReservedQuantity",
                table: "MedicineInventories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "MedicineInventories",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "WarehouseZoneId",
                table: "MedicineInventories",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InventoryAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: true),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Recommendation = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AcknowledgedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    AcknowledgedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryAlerts_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryAlerts_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryAlerts_Users_AcknowledgedBy",
                        column: x => x.AcknowledgedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryAlerts_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventoryAlerts_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MerchantReference = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InvoiceNo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RelatedEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    GatewayTransactionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GatewayProvider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    GatewayResultCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    GatewayResultMessage = table.Column<string>(type: "text", nullable: true),
                    PaymentMethod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    BankCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PaymentUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    QrCode = table.Column<string>(type: "text", nullable: true),
                    LinkExpTime = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WarehouseZones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarehouseZones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WarehouseZones_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarehouseZones_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarehouseZones_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WarehouseZones_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockMovements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineInventoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    WarehouseZoneId = table.Column<Guid>(type: "uuid", nullable: true),
                    PerformedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Reference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockMovements_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_MedicineInventories_MedicineInventoryId",
                        column: x => x.MedicineInventoryId,
                        principalTable: "MedicineInventories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_Users_PerformedBy",
                        column: x => x.PerformedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StockMovements_WarehouseZones_WarehouseZoneId",
                        column: x => x.WarehouseZoneId,
                        principalTable: "WarehouseZones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicineInventories_WarehouseZoneId",
                table: "MedicineInventories",
                column: "WarehouseZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAlerts_AcknowledgedBy",
                table: "InventoryAlerts",
                column: "AcknowledgedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAlerts_CreatedBy",
                table: "InventoryAlerts",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAlerts_MedicineId",
                table: "InventoryAlerts",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAlerts_Severity",
                table: "InventoryAlerts",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAlerts_TenantId",
                table: "InventoryAlerts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryAlerts_UpdatedBy",
                table: "InventoryAlerts",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_CreatedBy",
                table: "StockMovements",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_MedicineId",
                table: "StockMovements",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_MedicineInventoryId",
                table: "StockMovements",
                column: "MedicineInventoryId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_OccurredAt",
                table: "StockMovements",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_PerformedBy",
                table: "StockMovements",
                column: "PerformedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_TenantId",
                table: "StockMovements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_UpdatedBy",
                table: "StockMovements",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_WarehouseZoneId",
                table: "StockMovements",
                column: "WarehouseZoneId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_GatewayTransactionId",
                table: "Transactions",
                column: "GatewayTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_InvoiceNo",
                table: "Transactions",
                column: "InvoiceNo");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_MerchantReference",
                table: "Transactions",
                column: "MerchantReference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_RelatedEntityId",
                table: "Transactions",
                column: "RelatedEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_CreatedBy",
                table: "WarehouseZones",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_HospitalId",
                table: "WarehouseZones",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_TenantId",
                table: "WarehouseZones",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_UpdatedBy",
                table: "WarehouseZones",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicineInventories_WarehouseZones_WarehouseZoneId",
                table: "MedicineInventories",
                column: "WarehouseZoneId",
                principalTable: "WarehouseZones",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicineInventories_WarehouseZones_WarehouseZoneId",
                table: "MedicineInventories");

            migrationBuilder.DropTable(
                name: "InventoryAlerts");

            migrationBuilder.DropTable(
                name: "StockMovements");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "WarehouseZones");

            migrationBuilder.DropIndex(
                name: "IX_MedicineInventories_WarehouseZoneId",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "DisposalReason",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "LockReason",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "ReservedQuantity",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "MedicineInventories");

            migrationBuilder.DropColumn(
                name: "WarehouseZoneId",
                table: "MedicineInventories");
        }
    }
}
