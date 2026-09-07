using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Add_Retail_Module : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QrContent",
                table: "Transactions",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RetailCarts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerType = table.Column<string>(type: "text", nullable: true),
                    CustomerPatientId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerFullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CustomerMrn = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerInsuranceProvider = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerInsuranceCoverageAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    CustomerLoyaltyPoints = table.Column<int>(type: "integer", nullable: true),
                    CustomerPrescriptionReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CustomerAllergyInformation = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetailCarts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetailCarts_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCarts_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCarts_Patients_CustomerPatientId",
                        column: x => x.CustomerPatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCarts_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCarts_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RetailTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CashierId = table.Column<Guid>(type: "uuid", nullable: false),
                    HospitalId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerType = table.Column<string>(type: "text", nullable: true),
                    CustomerPatientId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomerFullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CustomerPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CustomerMrn = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CustomerInsuranceProvider = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Subtotal = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    DiscountTotal = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    InsuranceCoverage = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Vat = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    AmountTendered = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    ChangeDue = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetailTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetailTransactions_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactions_Hospitals_HospitalId",
                        column: x => x.HospitalId,
                        principalTable: "Hospitals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactions_Patients_CustomerPatientId",
                        column: x => x.CustomerPatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactions_Users_CashierId",
                        column: x => x.CashierId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactions_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactions_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RetailCartLineItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RetailCartId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    InsuranceCoveredAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetailCartLineItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetailCartLineItems_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCartLineItems_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCartLineItems_RetailCarts_RetailCartId",
                        column: x => x.RetailCartId,
                        principalTable: "RetailCarts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCartLineItems_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailCartLineItems_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RetailPaymentSplits",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RetailTransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Method = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetailPaymentSplits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetailPaymentSplits_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailPaymentSplits_RetailTransactions_RetailTransactionId",
                        column: x => x.RetailTransactionId,
                        principalTable: "RetailTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailPaymentSplits_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailPaymentSplits_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RetailTransactionLineItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RetailTransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicineNameSnapshot = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPriceSnapshot = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    InsuranceCoveredAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Total = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetailTransactionLineItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetailTransactionLineItems_HospitalGroups_TenantId",
                        column: x => x.TenantId,
                        principalTable: "HospitalGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactionLineItems_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactionLineItems_RetailTransactions_RetailTransac~",
                        column: x => x.RetailTransactionId,
                        principalTable: "RetailTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactionLineItems_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetailTransactionLineItems_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RetailCartLineItems_CreatedBy",
                table: "RetailCartLineItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCartLineItems_MedicineId",
                table: "RetailCartLineItems",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCartLineItems_RetailCartId",
                table: "RetailCartLineItems",
                column: "RetailCartId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCartLineItems_TenantId",
                table: "RetailCartLineItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCartLineItems_UpdatedBy",
                table: "RetailCartLineItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCarts_CreatedBy",
                table: "RetailCarts",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCarts_CustomerPatientId",
                table: "RetailCarts",
                column: "CustomerPatientId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCarts_HospitalId",
                table: "RetailCarts",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCarts_Status",
                table: "RetailCarts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCarts_TenantId",
                table: "RetailCarts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailCarts_UpdatedBy",
                table: "RetailCarts",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailPaymentSplits_CreatedBy",
                table: "RetailPaymentSplits",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailPaymentSplits_RetailTransactionId",
                table: "RetailPaymentSplits",
                column: "RetailTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailPaymentSplits_TenantId",
                table: "RetailPaymentSplits",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailPaymentSplits_UpdatedBy",
                table: "RetailPaymentSplits",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactionLineItems_CreatedBy",
                table: "RetailTransactionLineItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactionLineItems_MedicineId",
                table: "RetailTransactionLineItems",
                column: "MedicineId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactionLineItems_RetailTransactionId",
                table: "RetailTransactionLineItems",
                column: "RetailTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactionLineItems_TenantId",
                table: "RetailTransactionLineItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactionLineItems_UpdatedBy",
                table: "RetailTransactionLineItems",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_CashierId",
                table: "RetailTransactions",
                column: "CashierId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_CompletedAt",
                table: "RetailTransactions",
                column: "CompletedAt");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_CreatedBy",
                table: "RetailTransactions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_CustomerPatientId",
                table: "RetailTransactions",
                column: "CustomerPatientId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_HospitalId",
                table: "RetailTransactions",
                column: "HospitalId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_TenantId",
                table: "RetailTransactions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_TransactionNumber",
                table: "RetailTransactions",
                column: "TransactionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RetailTransactions_UpdatedBy",
                table: "RetailTransactions",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RetailCartLineItems");

            migrationBuilder.DropTable(
                name: "RetailPaymentSplits");

            migrationBuilder.DropTable(
                name: "RetailTransactionLineItems");

            migrationBuilder.DropTable(
                name: "RetailCarts");

            migrationBuilder.DropTable(
                name: "RetailTransactions");

            migrationBuilder.DropColumn(
                name: "QrContent",
                table: "Transactions");
        }
    }
}
