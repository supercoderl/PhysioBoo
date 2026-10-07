using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Workspaces_Lab_Radiology_Cms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "RefreshTokens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "RefreshTokens",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Barcode",
                table: "LabOrderItems",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CollectorName",
                table: "LabOrderItems",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContainerType",
                table: "LabOrderItems",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProcessingStartedAt",
                table: "LabOrderItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReceivedAt",
                table: "LabOrderItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "LabOrderItems",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReleasedAt",
                table: "LabOrderItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResultEnteredAt",
                table: "LabOrderItems",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SampleStatus",
                table: "LabOrderItems",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "NotCollected");

            migrationBuilder.AddColumn<string>(
                name: "VerificationStatus",
                table: "LabOrderItems",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "PendingVerification");

            migrationBuilder.AddColumn<string>(
                name: "ClinicalIndication",
                table: "ImagingReports",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSavedAt",
                table: "ImagingReports",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "ImagingReports",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReleasedAt",
                table: "ImagingReports",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "VerifierId",
                table: "ImagingReports",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkflowStatus",
                table: "ImagingReports",
                type: "character varying(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "Reporting");

            migrationBuilder.AddColumn<DateTime>(
                name: "ArrivedAt",
                table: "ImagingOrders",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelReason",
                table: "ImagingOrders",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ImagingCompletedAt",
                table: "ImagingOrders",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ImagingStartedAt",
                table: "ImagingOrders",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "QueueCalledAt",
                table: "ImagingOrders",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QueueStatus",
                table: "ImagingOrders",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomName",
                table: "ImagingOrders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TechnicianName",
                table: "ImagingOrders",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            // Backfill the new workflow columns from data that existed before them.
            migrationBuilder.Sql(@"UPDATE ""LabOrderItems"" SET ""SampleStatus"" = 'Collected' WHERE ""SampleCollected"" = TRUE;");
            migrationBuilder.Sql(@"UPDATE ""LabOrderItems"" SET ""VerificationStatus"" = 'Verified', ""ReleasedAt"" = ""VerifiedAt"" WHERE ""VerifiedAt"" IS NOT NULL;");
            migrationBuilder.Sql(@"UPDATE ""ImagingReports"" SET ""WorkflowStatus"" = 'Verified', ""ReleasedAt"" = ""VerifiedAt"" WHERE ""IsFinal"" = TRUE OR ""VerifiedAt"" IS NOT NULL;");

            migrationBuilder.CreateTable(
                name: "HomeBanners",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Subtitle = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ButtonText = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    ButtonLink = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeBanners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HomeFeatures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Icon = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    Title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeFeatures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HomeTestimonials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Date = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeTestimonials", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LabAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Severity = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SuggestedAction = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    LabOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    LabOrderItemId = table.Column<Guid>(type: "uuid", nullable: true),
                    PatientName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RaisedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Acknowledged = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_LabAlerts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RadiologyAlerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Severity = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ImagingOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    PatientName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    OrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RaisedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Notified = table.Column<bool>(type: "boolean", nullable: false),
                    Acknowledged = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_RadiologyAlerts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ImagingReports_VerifierId",
                table: "ImagingReports",
                column: "VerifierId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeBanners_TenantId_Active_Order",
                table: "HomeBanners",
                columns: new[] { "TenantId", "Active", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_HomeFeatures_TenantId_Active_Order",
                table: "HomeFeatures",
                columns: new[] { "TenantId", "Active", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_HomeTestimonials_TenantId_Active_Date",
                table: "HomeTestimonials",
                columns: new[] { "TenantId", "Active", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_LabAlerts_LabOrderItemId",
                table: "LabAlerts",
                column: "LabOrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_LabAlerts_TenantId_Acknowledged_RaisedAt",
                table: "LabAlerts",
                columns: new[] { "TenantId", "Acknowledged", "RaisedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyAlerts_ImagingOrderId",
                table: "RadiologyAlerts",
                column: "ImagingOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_RadiologyAlerts_TenantId_Acknowledged_RaisedAt",
                table: "RadiologyAlerts",
                columns: new[] { "TenantId", "Acknowledged", "RaisedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_ImagingReports_Users_VerifierId",
                table: "ImagingReports",
                column: "VerifierId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ImagingReports_Users_VerifierId",
                table: "ImagingReports");

            migrationBuilder.DropTable(
                name: "HomeBanners");

            migrationBuilder.DropTable(
                name: "HomeFeatures");

            migrationBuilder.DropTable(
                name: "HomeTestimonials");

            migrationBuilder.DropTable(
                name: "LabAlerts");

            migrationBuilder.DropTable(
                name: "RadiologyAlerts");

            migrationBuilder.DropIndex(
                name: "IX_ImagingReports_VerifierId",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "Barcode",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "CollectorName",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "ContainerType",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "ProcessingStartedAt",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "ReceivedAt",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "ReleasedAt",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "ResultEnteredAt",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "SampleStatus",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "VerificationStatus",
                table: "LabOrderItems");

            migrationBuilder.DropColumn(
                name: "ClinicalIndication",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "LastSavedAt",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "ReleasedAt",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "VerifierId",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "WorkflowStatus",
                table: "ImagingReports");

            migrationBuilder.DropColumn(
                name: "ArrivedAt",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "ImagingCompletedAt",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "ImagingStartedAt",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "QueueCalledAt",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "QueueStatus",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "RoomName",
                table: "ImagingOrders");

            migrationBuilder.DropColumn(
                name: "TechnicianName",
                table: "ImagingOrders");
        }
    }
}
