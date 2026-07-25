using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Core.Interfaces;

public interface IPracticeQuestionBankService
{
    Task<List<PracticeQuestion>> GetAvailableQuestionsAsync(int skillId, string difficulty, int count, int candidateId);
}
