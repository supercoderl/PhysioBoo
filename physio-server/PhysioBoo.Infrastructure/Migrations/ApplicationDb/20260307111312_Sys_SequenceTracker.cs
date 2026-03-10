using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NpgsqlTypes;

#nullable disable

namespace PhysioBoo.Infrastructure.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class Sys_SequenceTracker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sys_SequenceTrackers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "text", nullable: false),
                    Prefix = table.Column<string>(type: "text", nullable: false),
                    UseDateFormating = table.Column<string>(type: "text", nullable: true),
                    SequenceLength = table.Column<int>(type: "integer", nullable: false),
                    CurrentSequence = table.Column<int>(type: "integer", nullable: false),
                    Suffix = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uuid", nullable: true),
                    SearchVector = table.Column<NpgsqlTsVector>(type: "tsvector", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sys_SequenceTrackers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sys_SequenceTrackers_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sys_SequenceTrackers_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SequenceTrackers_CreatedBy",
                table: "Sys_SequenceTrackers",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SequenceTrackers_UpdatedBy",
                table: "Sys_SequenceTrackers",
                column: "UpdatedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sys_SequenceTrackers");
        }
    }
}
