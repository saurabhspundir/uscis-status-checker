using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UscisApi.Migrations
{
    /// <inheritdoc />
    public partial class InviteAndCustomerSchema : Migration
    {
        // Seed code used in Up — kept here so Down can clean it up if needed.
        private static readonly Guid SeedInviteId = Guid.Parse("11111111-0000-0000-0000-000000000001");
        private static readonly Guid SeedInviteCode = Guid.Parse("22222222-0000-0000-0000-000000000002");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── users table already exists in the DB; just drop the old InvitationCode column ──
            migrationBuilder.DropColumn(
                name: "InvitationCode",
                table: "users");

            // ── invitation_codes ─────────────────────────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "invitation_codes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invitation_codes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_invitation_codes_Code",
                table: "invitation_codes",
                column: "Code",
                unique: true);

            // Seed one initial invitation code (ExpiresAt = null → active indefinitely)
            migrationBuilder.InsertData(
                table: "invitation_codes",
                columns: ["Id", "Code", "CreatedAt"],
                values: [SeedInviteId, SeedInviteCode, DateTimeOffset.UtcNow]);

            // ── customers ────────────────────────────────────────────────────────────────────
            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    InvitedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ConvertedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ConvertedUserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_customers_users_ConvertedUserId",
                        column: x => x.ConvertedUserId,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_customers_Email",
                table: "customers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_customers_ConvertedUserId",
                table: "customers",
                column: "ConvertedUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "customers");

            migrationBuilder.DeleteData(
                table: "invitation_codes",
                keyColumn: "Id",
                keyValue: SeedInviteId);

            migrationBuilder.DropTable(name: "invitation_codes");

            // Restore the InvitationCode column (nullable on rollback — existing rows have no value)
            migrationBuilder.AddColumn<Guid>(
                name: "InvitationCode",
                table: "users",
                type: "uuid",
                nullable: true);
        }
    }
}
