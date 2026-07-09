namespace RecruitmentPlatform.Core.Interfaces;

public interface IRepository<T>
    where T : class
{
    Task<T?> GetByIdAsync(params object[] keyValues);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}