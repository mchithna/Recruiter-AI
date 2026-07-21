using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace RecruitmentPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLiveInterviewCopilot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "interview_sessions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    interview_id = table.Column<int>(type: "integer", nullable: false),
                    application_id = table.Column<int>(type: "integer", nullable: false),
                    candidate_id = table.Column<int>(type: "integer", nullable: false),
                    job_id = table.Column<int>(type: "integer", nullable: false),
                    started_by_user_id = table.Column<int>(type: "integer", nullable: false),
                    started_by_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Live"),
                    question_mode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Adaptive"),
                    difficulty = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Intermediate"),
                    consent_recorded = table.Column<bool>(type: "boolean", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_interview_sessions", x => x.id);
                    table.ForeignKey(
                        name: "FK_interview_sessions_applications_application_id",
                        column: x => x.application_id,
                        principalTable: "applications",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_interview_sessions_interviews_interview_id",
                        column: x => x.interview_id,
                        principalTable: "interviews",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_interview_sessions_jobs_job_id",
                        column: x => x.job_id,
                        principalTable: "jobs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_interview_sessions_users_candidate_id",
                        column: x => x.candidate_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_interview_sessions_users_started_by_user_id",
                        column: x => x.started_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "interview_ai_insights",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    session_id = table.Column<int>(type: "integer", nullable: false),
                    insight_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_interview_ai_insights", x => x.id);
                    table.ForeignKey(
                        name: "FK_interview_ai_insights_interview_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "interview_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "interview_questions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    session_id = table.Column<int>(type: "integer", nullable: false),
                    question_text = table.Column<string>(type: "text", nullable: false),
                    question_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    skill = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    difficulty = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    expected_points_json = table.Column<string>(type: "text", nullable: true),
                    generated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    asked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Generated")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_interview_questions", x => x.id);
                    table.ForeignKey(
                        name: "FK_interview_questions_interview_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "interview_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "candidate_answers",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    question_id = table.Column<int>(type: "integer", nullable: false),
                    transcript = table.Column<string>(type: "text", nullable: true),
                    interviewer_notes = table.Column<string>(type: "text", nullable: true),
                    answer_summary = table.Column<string>(type: "text", nullable: true),
                    relevance_score = table.Column<int>(type: "integer", nullable: true),
                    depth_score = table.Column<int>(type: "integer", nullable: true),
                    clarity_score = table.Column<int>(type: "integer", nullable: true),
                    confidence = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    potential_concern = table.Column<string>(type: "text", nullable: true),
                    suggested_action = table.Column<string>(type: "text", nullable: true),
                    suggested_follow_up_question = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_candidate_answers", x => x.id);
                    table.ForeignKey(
                        name: "FK_candidate_answers_interview_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "interview_questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_candidate_answers_question_id",
                table: "candidate_answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "IX_interview_ai_insights_session_id",
                table: "interview_ai_insights",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_interview_questions_session_id",
                table: "interview_questions",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "IX_interview_sessions_application_id",
                table: "interview_sessions",
                column: "application_id");

            migrationBuilder.CreateIndex(
                name: "IX_interview_sessions_candidate_id",
                table: "interview_sessions",
                column: "candidate_id");

            migrationBuilder.CreateIndex(
                name: "IX_interview_sessions_interview_id",
                table: "interview_sessions",
                column: "interview_id");

            migrationBuilder.CreateIndex(
                name: "IX_interview_sessions_interview_id_status",
                table: "interview_sessions",
                columns: new[] { "interview_id", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_interview_sessions_job_id",
                table: "interview_sessions",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "IX_interview_sessions_started_by_user_id",
                table: "interview_sessions",
                column: "started_by_user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "candidate_answers");

            migrationBuilder.DropTable(
                name: "interview_ai_insights");

            migrationBuilder.DropTable(
                name: "interview_questions");

            migrationBuilder.DropTable(
                name: "interview_sessions");
        }
    }
}
