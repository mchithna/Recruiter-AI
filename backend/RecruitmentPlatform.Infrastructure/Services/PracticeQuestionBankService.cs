using RecruitmentPlatform.Core.Entities;
using RecruitmentPlatform.Core.Interfaces;

namespace RecruitmentPlatform.Infrastructure.Services;

public class PracticeQuestionBankService : IPracticeQuestionBankService
{
    private readonly IUnitOfWork _unitOfWork;

    public PracticeQuestionBankService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PracticeQuestion>> GetAvailableQuestionsAsync(int skillId, string difficulty, int count, int candidateId)
    {
        // 1. Get IDs of questions already used by this candidate
        var candidateSessions = await _unitOfWork.PracticeSessions
            .FindAsync(s => s.CandidateId == candidateId);
        
        var candidateSessionIds = candidateSessions.Select(s => s.Id).ToList();

        List<int> usedQuestionIds = new List<int>();
        if (candidateSessionIds.Any())
        {
            var usedQuestions = await _unitOfWork.PracticeSessionQuestions
                .FindAsync(psq => candidateSessionIds.Contains(psq.PracticeSessionId));
            usedQuestionIds = usedQuestions.Select(psq => psq.PracticeQuestionId).Distinct().ToList();
        }

        // 2. Query available active questions
        var availableQuestions = await _unitOfWork.PracticeQuestions
            .FindAsync(q => q.SkillId == skillId 
                            && q.Difficulty == difficulty 
                            && q.IsActive);

        // 3. Filter out used questions and take 'count'
        var result = availableQuestions
            .Where(q => !usedQuestionIds.Contains(q.Id))
            .Take(count)
            .ToList();

        return result;
    }
}
