using Microsoft.Extensions.Caching.Memory;
using PhysioBoo.Domain.Entities;
using PhysioBoo.SharedKenel.ViewModels;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.Query;
using Npgsql;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IRepository<TEntity> : IDisposable where TEntity : Entity
    {
        #region Insert Methods
        Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);

        Task BulkInsertAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);
        #endregion

        #region Get Methods
        IQueryable<TEntity> GetAll(
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            string includeProperties = ""
        );

        IQueryable<TEntity> GetAllNoTracking(
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            string includeProperties = ""
        );

        Task<PagedResult<TEntity>> GetPagedAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            string includeProperties = "",
            CancellationToken cancellationToken = default
        );

        Task<TEntity?> GetByIdAsync(
            Guid id,
            string includeProperties = "",
            CancellationToken cancellationToken = default
        );

        Task<TEntity?> GetByIdCompiledAsync(Guid id);

        Task<TEntity?> GetByIdWithCacheAsync(
            Guid id,
            IMemoryCache cache,
            TimeSpan? expiration = null,
            CancellationToken cancellationToken = default
        );
        #endregion

        #region Update Methods
        Task BatchUpdatePropertyAsync<TProperty>(
                Expression<Func<TEntity, bool>> predicate,
                Expression<Func<TEntity, TProperty>> propertySelector,
                TProperty newValue,
                CancellationToken cancellationToken = default
        );

        Task<int> BatchUpdateMultipleAsync(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>> setterExpression,
            CancellationToken cancellationToken = default
        );
        #endregion

        #region Check Methods
        Task<bool> ExistsAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken cancellationToken = default
        );

        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        #endregion

        #region Delete Methods
        Task BulkSoftDeleteAsync(
            Expression<Func<TEntity, bool>> predicate,
            bool hardDelete = false,
            CancellationToken cancellationToken = default
        );

        Task<int> BatchDeleteAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken cancellationToken = default
        );
        #endregion

        #region SQL Methods
        Task<IEnumerable<TEntity>> ExecuteRawSqlAsync(
            string sql,
            params object[] parameters
        );

        Task<List<T>> ExecutePostgresFunctionAsync<T>(
            string functionName,
            Dictionary<string, object> parameters,
            Func<NpgsqlDataReader, T> mapFunction,
            CancellationToken cancellationToken = default
        ) where T : class;
        #endregion
    }
}
