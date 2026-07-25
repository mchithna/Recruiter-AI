using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class PracticeQuestionGeneratorService : IPracticeQuestionGeneratorService
{
    private readonly IAiStructuredService _geminiService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PracticeQuestionGeneratorService> _logger;

    public PracticeQuestionGeneratorService(
        IAiStructuredService geminiService,
        IUnitOfWork unitOfWork,
        ILogger<PracticeQuestionGeneratorService> logger)
    {
        _geminiService = geminiService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<List<PracticeQuestion>> GenerateAndSaveQuestionsAsync(int skillId, string skillName, string difficulty, int count)
    {
        var systemInstruction = $@"
You are an expert technical interviewer and instructional designer.
Your task is to generate {count} multiple-choice questions for a candidate practicing their skills.
The skill is '{skillName}' and the target difficulty level is '{difficulty}'.
Each question must have exactly 4 options (A, B, C, D), exactly one correct answer, and a short explanation of why the answer is correct.
Return a JSON object with a ""questions"" key containing an array of objects matching this exact structure:
{{
  ""questions"": [
    {{
      ""questionText"": ""Question text..."",
      ""optionA"": ""Option A"",
      ""optionB"": ""Option B"",
      ""optionC"": ""Option C"",
      ""optionD"": ""Option D"",
      ""correctOption"": ""A"",
      ""explanationText"": ""Explanation...""
    }}
  ]
}}
Do not include markdown blocks or any other text outside the JSON object.";

        var userPrompt = $"Generate {count} {difficulty}-level multiple-choice practice questions for {skillName}.";

        GeneratedQuestionsResponse? response = null;
        try
        {
            response = await _geminiService.GenerateJsonAsync<GeneratedQuestionsResponse>(
                systemInstruction: systemInstruction,
                userPrompt: userPrompt,
                maxOutputTokens: 3500);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate practice questions via Gemini for skill {SkillName}", skillName);
        }

        var savedQuestions = new List<PracticeQuestion>();

        if (response?.Questions != null && response.Questions.Any())
        {
            foreach (var q in response.Questions)
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(q.QuestionText) ||
                        string.IsNullOrWhiteSpace(q.OptionA) ||
                        string.IsNullOrWhiteSpace(q.OptionB) ||
                        string.IsNullOrWhiteSpace(q.OptionC) ||
                        string.IsNullOrWhiteSpace(q.OptionD) ||
                        string.IsNullOrWhiteSpace(q.CorrectOption) ||
                        string.IsNullOrWhiteSpace(q.ExplanationText))
                    {
                        continue;
                    }

                    var normalizedCorrectOption = q.CorrectOption.Trim().ToUpper();
                    if (normalizedCorrectOption.Length > 1) 
                        normalizedCorrectOption = normalizedCorrectOption.Substring(0, 1);
                    
                    if (normalizedCorrectOption != "A" && normalizedCorrectOption != "B" && 
                        normalizedCorrectOption != "C" && normalizedCorrectOption != "D")
                    {
                        continue;
                    }

                    var entity = new PracticeQuestion
                    {
                        SkillId = skillId,
                        Difficulty = difficulty,
                        QuestionText = q.QuestionText,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        CorrectOption = normalizedCorrectOption,
                        ExplanationText = q.ExplanationText,
                        IsActive = true,
                        ReportCount = 0,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.PracticeQuestions.AddAsync(entity);
                    savedQuestions.Add(entity);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse a generated question for skill {SkillName}", skillName);
                }
            }
        }

        // If AI generation was rate-limited or didn't produce enough valid questions, produce fallback questions
        if (savedQuestions.Count < count)
        {
            int remainingNeeded = count - savedQuestions.Count;
            _logger.LogInformation("Generating {Count} fallback practice questions for skill {SkillName}", remainingNeeded, skillName);
            
            var fallbacks = GenerateFallbackQuestions(skillId, skillName, difficulty, remainingNeeded);
            foreach (var fq in fallbacks)
            {
                await _unitOfWork.PracticeQuestions.AddAsync(fq);
                savedQuestions.Add(fq);
            }
        }

        if (savedQuestions.Any())
        {
            await _unitOfWork.SaveChangesAsync();
        }

        return savedQuestions;
    }

    private List<PracticeQuestion> GenerateFallbackQuestions(int skillId, string skillName, string difficulty, int count)
    {
        var list = new List<PracticeQuestion>();
        
        var templates = new[]
        {
            new {
                Question = $"What is a fundamental core concept when working with {skillName} at a {difficulty} level?",
                A = $"Proper modularization and adhering to standard design patterns in {skillName}",
                B = $"Avoiding all asynchronous operations completely",
                C = $"Hardcoding configuration values directly into source files",
                D = $"Disabling exception handling during production runtime",
                Correct = "A",
                Explanation = $"In {skillName}, adhering to modular design patterns and clean architecture ensures maintainable, testable, and scalable software."
            },
            new {
                Question = $"When optimizing performance for {skillName} applications, which approach is considered best practice?",
                A = $"Executing blocking synchronous operations on the primary thread",
                B = $"Profiling execution bottlenecks and leveraging caching/indexing strategies",
                C = $"Increasing memory limits without analyzing code execution patterns",
                D = $"Ignoring network latency and third-party dependency timeouts",
                Correct = "B",
                Explanation = $"Performance optimization in {skillName} requires empirical profiling to identify true bottlenecks before applying targeted caching or indexing."
            },
            new {
                Question = $"In {skillName}, how should security and authentication credentials ideally be managed?",
                A = $"Committed directly to public version control repositories",
                B = $"Stored in environment variables or a secret management service",
                C = $"Embedded in client-side bundles accessible to end users",
                D = $"Written in plain text files in the web root directory",
                Correct = "B",
                Explanation = $"Secrets and API keys in {skillName} projects must be kept outside source control using secure environment variables or vault services."
            },
            new {
                Question = $"What is the primary benefit of automated testing when developing with {skillName}?",
                A = $"It eliminates the need for code reviews",
                B = $"It prevents regressions and verifies system contracts continuously",
                C = $"It replaces the need for deployment pipelines",
                D = $"It guarantees 100% bug-free software in all edge cases",
                Correct = "B",
                Explanation = $"Automated unit and integration testing provides rapid feedback and prevents regressions when refactoring {skillName} codebases."
            },
            new {
                Question = $"Which architectural practice improves maintainability in a {skillName} project?",
                A = $"Separation of concerns and dependency inversion",
                B = $"Tight coupling between user interface and database layers",
                C = $"Writing large monolithic functions with hundreds of lines of code",
                D = $"Global mutable state shared across all application components",
                Correct = "A",
                Explanation = $"Separation of concerns ensures components in {skillName} remain decoupled, making unit testing and maintenance significantly easier."
            },
            new {
                Question = $"When handling errors and exceptions in {skillName}, what is the recommended pattern?",
                A = $"Silently swallowing exceptions without logging",
                B = $"Catching specific exceptions, logging details, and returning meaningful responses",
                C = $"Crashing the application process immediately without user feedback",
                D = $"Relying solely on frontend try-catch blocks for database errors",
                Correct = "B",
                Explanation = $"Structured error handling captures contextual log data while providing friendly error messages without exposing sensitive stack traces."
            },
            new {
                Question = $"How does concurrency and async execution benefit {skillName} applications?",
                A = $"It reduces memory usage to zero",
                B = $"It allows non-blocking I/O operations, improving application throughput",
                C = $"It forces sequential execution of all background tasks",
                D = $"It guarantees threads will never enter race conditions",
                Correct = "B",
                Explanation = $"Asynchronous non-blocking I/O allows {skillName} applications to serve high concurrency without blocking threads on disk/network operations."
            },
            new {
                Question = $"What is a common pitfall when scaling {skillName} applications?",
                A = $"Using horizontal scaling with stateless services",
                B = $"Creating stateful tightly-coupled singletons that prevent load balancing",
                C = $"Implementing rate limiting on external API endpoints",
                D = $"Utilizing database connection pooling",
                Correct = "B",
                Explanation = $"Stateful singletons bind sessions to specific servers, preventing seamless horizontal scaling across load-balanced instances."
            },
            new {
                Question = $"Which logging practice is recommended for enterprise {skillName} deployment?",
                A = $"Console print statements without timestamps or severity levels",
                B = $"Structured JSON logging with correlation IDs for tracing across microservices",
                C = $"Writing log files directly to local transient containers without persistence",
                D = $"Disabling logging entirely in production to maximize performance",
                Correct = "B",
                Explanation = $"Structured logging with correlation IDs enables log aggregation tools to trace requests across distributed {skillName} services."
            },
            new {
                Question = $"What role does continuous integration (CI) play in modern {skillName} workflows?",
                A = $"Automatically building, linting, and running tests on every code push",
                B = $"Replacing software developers with AI code generators",
                C = $"Managing database schema migrations manually during off-peak hours",
                D = $"Bypassing test suites when emergency hotfixes are created",
                Correct = "A",
                Explanation = $"CI pipelines automatically build and validate {skillName} pull requests to ensure code quality standards before merging."
            },
            new {
                Question = $"When designing APIs with {skillName}, why is API versioning important?",
                A = $"It forces all clients to update simultaneously on release day",
                B = $"It allows backward-compatible updates without breaking existing integrations",
                C = $"It reduces the number of HTTP endpoints required",
                D = $"It encrypts payload data automatically in transit",
                Correct = "B",
                Explanation = $"Versioning APIs ensures existing client applications continue functioning while new features are introduced for {skillName} endpoints."
            },
            new {
                Question = $"What is the main objective of code refactoring in {skillName}?",
                A = $"Adding new user-facing features to the product",
                B = $"Improving internal structure and readability without altering external behavior",
                C = $"Rewriting the entire application from scratch in a different language",
                D = $"Removing unit tests to speed up the build pipeline",
                Correct = "B",
                Explanation = $"Refactoring enhances code quality, readability, and maintainability while keeping the existing functional behavior intact."
            }
        };

        for (int i = 0; i < count; i++)
        {
            var t = templates[i % templates.Length];
            list.Add(new PracticeQuestion
            {
                SkillId = skillId,
                Difficulty = difficulty,
                QuestionText = count > templates.Length ? $"{t.Question} (Part {i + 1})" : t.Question,
                OptionA = t.A,
                OptionB = t.B,
                OptionC = t.C,
                OptionD = t.D,
                CorrectOption = t.Correct,
                ExplanationText = t.Explanation,
                IsActive = true,
                ReportCount = 0,
                CreatedAt = DateTime.UtcNow
            });
        }

        return list;
    }

    private class GeneratedQuestionsResponse
    {
        [JsonPropertyName("questions")]
        public List<GeneratedQuestion> Questions { get; set; } = new();
    }

    private class GeneratedQuestion
    {
        [JsonPropertyName("questionText")]
        public string? QuestionText { get; set; }

        [JsonPropertyName("optionA")]
        public string? OptionA { get; set; }

        [JsonPropertyName("optionB")]
        public string? OptionB { get; set; }

        [JsonPropertyName("optionC")]
        public string? OptionC { get; set; }

        [JsonPropertyName("optionD")]
        public string? OptionD { get; set; }

        [JsonPropertyName("correctOption")]
        public string? CorrectOption { get; set; }

        [JsonPropertyName("explanationText")]
        public string? ExplanationText { get; set; }
    }
}
