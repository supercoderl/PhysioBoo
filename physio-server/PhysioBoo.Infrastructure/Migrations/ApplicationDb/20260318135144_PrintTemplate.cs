using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class PrintTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Sys_SequenceTrackers",
                type: "tsvector",
                nullable: true,
                computedColumnSql: "to_tsvector('english', unaccent(coalesce(\"EntityType\", '')))",
                stored: true,
                oldClrType: typeof(NpgsqlTsVector),
                oldType: "tsvector",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "PrintLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrintedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    PrintedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    EntityType = table.Column<string>(type: "text", nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintLogs_Users_PrintedBy",
                        column: x => x.PrintedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrintTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Module = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DocumentType = table.Column<string>(type: "text", nullable: false),
                    IsSystemDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CurrentVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    SearchVector = table.Column<NpgsqlTsVector>(type: "tsvector", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintTemplates_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintTemplates_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrintTemplateVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", maxLength: 100, nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    PaperSize = table.Column<string>(type: "text", nullable: false),
                    Orientation = table.Column<string>(type: "text", nullable: false),
                    HeaderHtml = table.Column<string>(type: "text", nullable: false),
                    BodyHtml = table.Column<string>(type: "text", nullable: false),
                    FooterHtml = table.Column<string>(type: "text", nullable: false),
                    CustomCss = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrintTemplateVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrintTemplateVersions_PrintTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "PrintTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintTemplateVersions_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrintTemplateVersions_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SequenceTrackers_EntityType",
                table: "Sys_SequenceTrackers",
                column: "EntityType");

            migrationBuilder.CreateIndex(
                name: "IX_PrintLogs_PrintedBy",
                table: "PrintLogs",
                column: "PrintedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrintTemplates_CreatedBy",
                table: "PrintTemplates",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrintTemplates_CurrentVersionId",
                table: "PrintTemplates",
                column: "CurrentVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintTemplates_Name_Code",
                table: "PrintTemplates",
                columns: new[] { "Name", "Code" });

            migrationBuilder.CreateIndex(
                name: "IX_PrintTemplates_UpdatedBy",
                table: "PrintTemplates",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrintTemplateVersions_CreatedBy",
                table: "PrintTemplateVersions",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PrintTemplateVersions_TemplateId",
                table: "PrintTemplateVersions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_PrintTemplateVersions_UpdatedBy",
                table: "PrintTemplateVersions",
                column: "UpdatedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_PrintTemplates_PrintTemplateVersions_CurrentVersionId",
                table: "PrintTemplates",
                column: "CurrentVersionId",
                principalTable: "PrintTemplateVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrintTemplates_PrintTemplateVersions_CurrentVersionId",
                table: "PrintTemplates");

            migrationBuilder.DropTable(
                name: "PrintLogs");

            migrationBuilder.DropTable(
                name: "PrintTemplateVersions");

            migrationBuilder.DropTable(
                name: "PrintTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Sys_SequenceTrackers_EntityType",
                table: "Sys_SequenceTrackers");

            migrationBuilder.AlterColumn<NpgsqlTsVector>(
                name: "SearchVector",
                table: "Sys_SequenceTrackers",
                type: "tsvector",
                nullable: true,
                oldClrType: typeof(NpgsqlTsVector),
                oldType: "tsvector",
                oldNullable: true,
                oldComputedColumnSql: "to_tsvector('english', unaccent(coalesce(\"EntityType\", '')))");
        }
    }
}
