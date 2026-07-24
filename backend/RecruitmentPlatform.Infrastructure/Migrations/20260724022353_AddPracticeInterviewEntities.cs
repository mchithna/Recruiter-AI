using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace RecruitmentPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeInterviewEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "practice_questions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    skill_id = table.Column<int>(type: "integer", nullable: false),
                    difficulty = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    question_text = table.Column<string>(type: "text", nullable: false),
                    option_a = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    option_b = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    option_c = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    option_d = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    correct_option = table.Column<string>(type: "char(1)", nullable: false),
                    explanation_text = table.Column<string>(type: "text", nullable: false),
                    report_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_practice_questions", x => x.id);
                    table.ForeignKey(
                        name: "FK_practice_questions_skills_skill_id",
                        column: x => x.skill_id,
                        principalTable: "skills",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "practice_sessions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    candidate_id = table.Column<int>(type: "integer", nullable: false),
                    source_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    source_interview_id = table.Column<int>(type: "integer", nullable: true),
                    source_application_id = table.Column<int>(type: "integer", nullable: true),
                    source_skill_id = table.Column<int>(type: "integer", nullable: true),
                    difficulty = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    question_count = table.Column<int>(type: "integer", nullable: false, defaultValue: 12),
                    score = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "InProgress"),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_practice_sessions", x => x.id);
                    table.ForeignKey(
                        name: "FK_practice_sessions_applications_source_application_id",
                        column: x => x.source_application_id,
                        principalTable: "applications",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_practice_sessions_skills_source_skill_id",
                        column: x => x.source_skill_id,
                        principalTable: "skills",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_practice_sessions_users_candidate_id",
                        column: x => x.candidate_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "practice_session_questions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    practice_session_id = table.Column<int>(type: "integer", nullable: false),
                    practice_question_id = table.Column<int>(type: "integer", nullable: false),
                    question_order = table.Column<int>(type: "integer", nullable: false),
                    candidate_answer = table.Column<string>(type: "char(1)", nullable: true),
                    is_correct = table.Column<bool>(type: "boolean", nullable: true),
                    answered_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_practice_session_questions", x => x.id);
                    table.ForeignKey(
                        name: "FK_practice_session_questions_practice_questions_practice_ques~",
                        column: x => x.practice_question_id,
                        principalTable: "practice_questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_practice_session_questions_practice_sessions_practice_sessi~",
                        column: x => x.practice_session_id,
                        principalTable: "practice_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_practice_questions_skill_id",
                table: "practice_questions",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_practice_session_questions_practice_question_id",
                table: "practice_session_questions",
                column: "practice_question_id");

            migrationBuilder.CreateIndex(
                name: "IX_practice_session_questions_practice_session_id_practice_que~",
                table: "practice_session_questions",
                columns: new[] { "practice_session_id", "practice_question_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_practice_session_questions_practice_session_id_question_ord~",
                table: "practice_session_questions",
                columns: new[] { "practice_session_id", "question_order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_practice_sessions_candidate_id",
                table: "practice_sessions",
                column: "candidate_id");

            migrationBuilder.CreateIndex(
                name: "IX_practice_sessions_source_application_id",
                table: "practice_sessions",
                column: "source_application_id");

            migrationBuilder.CreateIndex(
                name: "IX_practice_sessions_source_skill_id",
                table: "practice_sessions",
                column: "source_skill_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "practice_session_questions");

            migrationBuilder.DropTable(
                name: "practice_questions");

            migrationBuilder.DropTable(
                name: "practice_sessions");
        }
    }
}
