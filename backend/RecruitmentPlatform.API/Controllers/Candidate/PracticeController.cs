using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentPlatform.Core.DTOs;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.API.Controllers.Candidate;

[Authorize(Roles = "Candidate")]
[ApiController]
[Route("api/candidate/practice")]
public class PracticeController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPracticeQuestionBankService _questionBankService;
    private readonly IPracticeQuestionGeneratorService _generatorService;
    private readonly ILogger<PracticeController> _logger;

    public PracticeController(
        IUnitOfWork unitOfWork,
        IPracticeQuestionBankService questionBankService,
        IPracticeQuestionGeneratorService generatorService,
        ILogger<PracticeController> logger)
    {
        _unitOfWork = unitOfWork;
        _questionBankService = questionBankService;
        _generatorService = generatorService;
        _logger = logger;
    }

    private int GetCandidateId()
    {
        var value = User.FindFirst("app_user_id")?.Value;
        if (int.TryParse(value, out var id)) return id;
        throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
    }

    [HttpGet("sources")]
    public async Task<ActionResult<PracticeSourcesResponseDto>> GetSources()
    {
        var candidateId = GetCandidateId();

        var today = DateTime.UtcNow.Date;
        var usedToday = await _unitOfWork.PracticeSessions.Query()
            .CountAsync(s => s.CandidateId == candidateId && s.StartedAt >= today);

        var sources = new List<PracticeSourceDto>();

        // 1. Candidate's own profile skills
        var candidateSkills = await _unitOfWork.Skills.Query()
            .Where(s => s.CandidateSkills.Any(cs => cs.CandidateId == candidateId))
            .Select(s => new SkillDto { Id = s.Id, Name = s.Name })
            .ToListAsync();

        if (candidateSkills.Any())
        {
            sources.Add(new PracticeSourceDto
            {
                SourceId = 0,
                SourceType = "Profile",
                Title = "My Skills",
                CompanyName = "Your Profile",
                Skills = candidateSkills
            });
        }

        // 2. Application-based sources (jobs the candidate applied to)
        var applications = await _unitOfWork.Applications.Query()
            .Where(a => a.CandidateId == candidateId)
            .Include(a => a.Job).ThenInclude(j => j.Department).ThenInclude(d => d.Company)
            .Include(a => a.Job).ThenInclude(j => j.JobSkills).ThenInclude(js => js.Skill)
            .OrderByDescending(a => a.AppliedAt)
            .Take(10)
            .ToListAsync();

        foreach (var app in applications)
        {
            var jobSkills = app.Job.JobSkills
                .Select(js => new SkillDto { Id = js.SkillId, Name = js.Skill.Name })
                .ToList();

            if (jobSkills.Any())
            {
                sources.Add(new PracticeSourceDto
                {
                    SourceId = app.Id,
                    SourceType = "Application",
                    Title = app.Job.Title,
                    CompanyName = app.Job.Department?.Company?.Name ?? "Unknown",
                    Skills = jobSkills
                });
            }
        }

        // 3. If no skills found at all, fall back to a general source with popular skills
        if (!sources.Any())
        {
            var popularSkills = await _unitOfWork.Skills.Query()
                .OrderBy(s => s.Name)
                .Take(20)
                .Select(s => new SkillDto { Id = s.Id, Name = s.Name })
                .ToListAsync();

            sources.Add(new PracticeSourceDto
            {
                SourceId = 1,
                SourceType = "Platform",
                Title = "General Practice",
                CompanyName = "Platform",
                Skills = popularSkills
            });
        }

        return Ok(new PracticeSourcesResponseDto
        {
            UsedToday = usedToday,
            DailyQuota = 5,
            Sources = sources
        });
    }

    [HttpPost("start")]
    public async Task<ActionResult<PracticeSessionResponseDto>> StartSession([FromBody] StartPracticeRequestDto request)
    {
        var candidateId = GetCandidateId();

        // Ensure quota not exceeded (5 per day)
        var today = DateTime.UtcNow.Date;
        var todaySessions = await _unitOfWork.PracticeSessions
            .FindAsync(s => s.CandidateId == candidateId && s.StartedAt >= today);
            
        if (todaySessions.Count() >= 5)
        {
            return BadRequest(new { message = "Daily practice quota (5 sessions) reached." });
        }

        var skill = await _unitOfWork.Skills.GetByIdAsync(request.SkillId);
        if (skill == null) return NotFound("Skill not found");

        int targetQuestionCount = 12;

        // 1. Get questions from bank
        var bankQuestions = await _questionBankService.GetAvailableQuestionsAsync(
            request.SkillId, request.Difficulty, targetQuestionCount, candidateId);

        var questionsToUse = new List<PracticeQuestion>(bankQuestions);

        // 2. If short, generate more
        if (questionsToUse.Count < targetQuestionCount)
        {
            int shortFall = targetQuestionCount - questionsToUse.Count;
            var generatedQuestions = await _generatorService.GenerateAndSaveQuestionsAsync(
                request.SkillId, skill.Name, request.Difficulty, shortFall);
                
            questionsToUse.AddRange(generatedQuestions);
        }
        
        // Truncate to target length if we generated too many somehow, but it shouldn't happen.
        questionsToUse = questionsToUse.Take(targetQuestionCount).ToList();
        
        if (!questionsToUse.Any())
        {
            return BadRequest(new { message = "Could not prepare questions for this practice session." });
        }

        // 3. Create Session
        var session = new PracticeSession
        {
            CandidateId = candidateId,
            SourceType = request.SourceType,
            SourceApplicationId = request.SourceApplicationId,
            SourceInterviewId = request.SourceInterviewId,
            SourceSkillId = request.SkillId,
            Difficulty = request.Difficulty,
            QuestionCount = questionsToUse.Count,
            Status = "InProgress",
            StartedAt = DateTime.UtcNow
        };

        await _unitOfWork.PracticeSessions.AddAsync(session);
        await _unitOfWork.SaveChangesAsync(); // Get Session Id

        // 4. Create Session Questions
        var sessionQuestions = new List<PracticeSessionQuestion>();
        for (int i = 0; i < questionsToUse.Count; i++)
        {
            var sq = new PracticeSessionQuestion
            {
                PracticeSessionId = session.Id,
                PracticeQuestionId = questionsToUse[i].Id,
                QuestionOrder = i + 1,
            };
            await _unitOfWork.PracticeSessionQuestions.AddAsync(sq);
            sessionQuestions.Add(sq);
        }

        await _unitOfWork.SaveChangesAsync();

        // 5. Map to Response (Do not reveal correct options yet)
        var responseDto = new PracticeSessionResponseDto
        {
            Id = session.Id,
            Difficulty = session.Difficulty,
            QuestionCount = session.QuestionCount,
            Status = session.Status,
            StartedAt = session.StartedAt,
            Questions = questionsToUse.Select((q, index) => new PracticeSessionQuestionDto
            {
                Id = sessionQuestions[index].Id,
                PracticeQuestionId = q.Id,
                QuestionOrder = sessionQuestions[index].QuestionOrder,
                QuestionText = q.QuestionText,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
            }).ToList()
        };

        return Ok(responseDto);
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<List<object>>> GetSessions()
    {
        var candidateId = GetCandidateId();
        
        var sessions = await _unitOfWork.PracticeSessions
            .FindAsync(s => s.CandidateId == candidateId);

        var skillIds = sessions.Select(s => s.SourceSkillId).Distinct().ToList();
        var skills = await _unitOfWork.Skills.FindAsync(sk => skillIds.Contains(sk.Id));
        
        var result = sessions.OrderByDescending(s => s.StartedAt).Select(s => new
        {
            Id = s.Id,
            SourceType = s.SourceType,
            SkillName = skills.FirstOrDefault(sk => sk.Id == s.SourceSkillId)?.Name ?? "Unknown",
            Difficulty = s.Difficulty,
            QuestionCount = s.QuestionCount,
            Score = s.Score,
            Status = s.Status,
            StartedAt = s.StartedAt,
            CompletedAt = s.CompletedAt
        }).ToList();

        return Ok(result);
    }

    [HttpGet("sessions/{id}")]
    public async Task<ActionResult<PracticeSessionResponseDto>> GetSession(int id)
    {
        var candidateId = GetCandidateId();
        var session = await _unitOfWork.PracticeSessions.GetByIdAsync(id);
        
        if (session == null || session.CandidateId != candidateId) return NotFound();

        var sessionQuestions = await _unitOfWork.PracticeSessionQuestions
            .FindAsync(sq => sq.PracticeSessionId == session.Id);

        var qIds = sessionQuestions.Select(sq => sq.PracticeQuestionId).ToList();
        var questions = await _unitOfWork.PracticeQuestions.FindAsync(q => qIds.Contains(q.Id));

        var responseDto = new PracticeSessionResponseDto
        {
            Id = session.Id,
            Difficulty = session.Difficulty,
            QuestionCount = session.QuestionCount,
            Status = session.Status,
            Score = session.Score,
            StartedAt = session.StartedAt,
            CompletedAt = session.CompletedAt,
            Questions = sessionQuestions.OrderBy(sq => sq.QuestionOrder).Select(sq => 
            {
                var q = questions.First(x => x.Id == sq.PracticeQuestionId);
                var dto = new PracticeSessionQuestionDto
                {
                    Id = sq.Id,
                    PracticeQuestionId = q.Id,
                    QuestionOrder = sq.QuestionOrder,
                    QuestionText = q.QuestionText,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    CandidateAnswer = sq.CandidateAnswer,
                    AnsweredAt = sq.AnsweredAt,
                    IsCorrect = sq.IsCorrect
                };
                
                // Reveal answers if completed or if candidate answered
                if (session.Status == "Completed" || !string.IsNullOrEmpty(sq.CandidateAnswer))
                {
                    dto.CorrectOption = q.CorrectOption;
                    dto.ExplanationText = q.ExplanationText;
                }
                
                return dto;
            }).ToList()
        };

        return Ok(responseDto);
    }

    [HttpPost("sessions/{id}/answer")]
    public async Task<IActionResult> SubmitAnswer(int id, [FromBody] SubmitAnswerRequestDto request)
    {
        var candidateId = GetCandidateId();
        var session = await _unitOfWork.PracticeSessions.GetByIdAsync(id);
        
        if (session == null || session.CandidateId != candidateId) return NotFound();
        if (session.Status == "Completed") return BadRequest("Session already completed.");

        var sessionQuestion = (await _unitOfWork.PracticeSessionQuestions
            .FindAsync(sq => sq.PracticeSessionId == session.Id && sq.PracticeQuestionId == request.PracticeQuestionId))
            .FirstOrDefault();

        if (sessionQuestion == null) return NotFound("Question not part of this session.");
        if (!string.IsNullOrEmpty(sessionQuestion.CandidateAnswer)) return BadRequest("Already answered.");

        var question = await _unitOfWork.PracticeQuestions.GetByIdAsync(request.PracticeQuestionId);
        if (question == null) return NotFound();

        var normalizedAnswer = request.CandidateAnswer.Trim().ToUpper();
        if (normalizedAnswer.Length > 1) normalizedAnswer = normalizedAnswer.Substring(0,1);

        sessionQuestion.CandidateAnswer = normalizedAnswer;
        sessionQuestion.AnsweredAt = DateTime.UtcNow;
        sessionQuestion.IsCorrect = normalizedAnswer == question.CorrectOption;

        _unitOfWork.PracticeSessionQuestions.Update(sessionQuestion);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new 
        { 
            isCorrect = sessionQuestion.IsCorrect,
            correctOption = question.CorrectOption,
            explanationText = question.ExplanationText
        });
    }

    [HttpPost("sessions/{id}/complete")]
    public async Task<IActionResult> CompleteSession(int id)
    {
        var candidateId = GetCandidateId();
        var session = await _unitOfWork.PracticeSessions.GetByIdAsync(id);
        
        if (session == null || session.CandidateId != candidateId) return NotFound();
        if (session.Status == "Completed") return Ok(); // Idempotent

        var sessionQuestions = await _unitOfWork.PracticeSessionQuestions
            .FindAsync(sq => sq.PracticeSessionId == session.Id);

        int correctCount = sessionQuestions.Count(sq => sq.IsCorrect == true);
        
        session.Status = "Completed";
        session.Score = correctCount;
        session.CompletedAt = DateTime.UtcNow;

        _unitOfWork.PracticeSessions.Update(session);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { score = session.Score, total = session.QuestionCount });
    }

    [HttpPost("questions/{id}/report")]
    public async Task<IActionResult> ReportQuestion(int id)
    {
        // Candidate reporting a question
        var candidateId = GetCandidateId();
        
        var question = await _unitOfWork.PracticeQuestions.GetByIdAsync(id);
        if (question == null) return NotFound();

        question.ReportCount++;
        
        if (question.ReportCount >= 3)
        {
            question.IsActive = false;
        }

        _unitOfWork.PracticeQuestions.Update(question);
        await _unitOfWork.SaveChangesAsync();

        return Ok();
    }
}
