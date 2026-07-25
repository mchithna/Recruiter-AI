using RecruitmentPlatform.Core.Entities;

namespace RecruitmentPlatform.Core.Interfaces;

public interface IPracticeQuestionGeneratorService
{
    Task<List<PracticeQuestion>> GenerateAndSaveQuestionsAsync(int skillId, string skillName, string difficulty, int count);
}
