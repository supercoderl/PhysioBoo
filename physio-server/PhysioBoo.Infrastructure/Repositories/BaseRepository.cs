using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Caching.Memory;
using Npgsql;
using PhysioBoo.Domain.Entities;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Utils;
using PhysioBoo.SharedKernel.ViewModels;
using System.Linq.Expressions;
using System.Reflection;

namespace PhysioBoo.Infrastructure.Repositories
{
    public class BaseRepository<TEntity> : IRepository<TEntity> where TEntity : Entity
    {
        private readonly DbContext _dbContext;
        private readonly string _connectionString;
        protected readonly DbSet<TEntity> DbSet;

        protected BaseRepository(DbContext context)
        {
            _dbContext = context;
            DbSet = _dbContext.Set<TEntity>();
            _connectionString = _dbContext.Database.GetConnectionString() ?? throw new ArgumentException("Connection does not exists.");
        }

        // OPTIMIZED QUERY METHODS WITH PAGINATION AND FILTERING
        public virtual IQueryable<TEntity> GetAll(
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            string includeProperties = "")
        {
            IQueryable<TEntity> query = DbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            foreach (var includeProperty in includeProperties.Split(
                new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            if (orderBy != null)
            {
                return orderBy(query);
            }

            return query;
        }

        public virtual IQueryable<TEntity> GetAllNoTracking(
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            string includeProperties = "")
        {
            return GetAll(filter, orderBy, includeProperties).AsNoTracking();
        }

        // PAGINATED QUERIES FOR BETTER PERFORMANCE
        public virtual async Task<PagedResult<TEntity>> GetPagedAsync(
            int pageNumber = 1,
            int pageSize = 10,
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            string includeProperties = "",
            CancellationToken cancellationToken = default)
        {
            var query = GetAllNoTracking(filter, orderBy, includeProperties);

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<TEntity>(totalCount, items, pageNumber, pageSize);
        }

        // OPTIMIZED BULK OPERATIONS
        public async Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
        {
            await DbSet.AddRangeAsync(entities, cancellationToken);
        }

        public async Task BulkInsertAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
        {
            // For large datasets, consider using EF Core bulk extensions
            const int batchSize = 1000;
            var batches = entities.Batch(batchSize);

            foreach (var batch in batches)
            {
                await DbSet.AddRangeAsync(batch, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);
                _dbContext.ChangeTracker.Clear(); // Clear tracking to save memory
            }
        }

        // OPTIMIZED EXISTENCE CHECK
        public virtual async Task<bool> ExistsAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken cancellationToken = default)
        {
            return await DbSet.AsNoTracking().AnyAsync(predicate, cancellationToken);
        }

        public virtual async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await DbSet.AsNoTracking().AnyAsync(entity => entity.Id == id, cancellationToken);
        }

        // OPTIMIZED SINGLE ENTITY RETRIEVAL
        public virtual async Task<TEntity?> GetByIdAsync(
            Guid id,
            string includeProperties = "",
            CancellationToken cancellationToken = default)
        {
            IQueryable<TEntity> query = DbSet;

            foreach (var includeProperty in includeProperties.Split(
                new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            return await query.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        }

        // COMPILED QUERIES FOR FREQUENTLY USED OPERATIONS
        private static readonly Func<DbContext, Guid, Task<TEntity?>> GetByIdCompiledQuery =
            EF.CompileAsyncQuery((DbContext context, Guid id) =>
                context.Set<TEntity>().FirstOrDefault(e => e.Id == id));

        public virtual async Task<TEntity?> GetByIdCompiledAsync(Guid id)
        {
            return await GetByIdCompiledQuery(_dbContext, id);
        }

        // RAW SQL QUERIES FOR COMPLEX OPERATIONS
        public virtual async Task<IEnumerable<TEntity>> ExecuteRawSqlAsync(
            string sql,
            params object[] parameters)
        {
            return await DbSet.FromSqlRaw(sql, parameters).ToListAsync();
        }

        // STORED PROCEDURE EXECUTION
        public virtual async Task<List<T>> ExecutePostgresFunctionAsync<T>(
            string functionName,
            Dictionary<string, object> parameters,
            Func<NpgsqlDataReader, T> mapFunction,
            CancellationToken cancellationToken = default)
            where T : class
        {
            var results = new List<T>();
            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken);

            // Build parameter list with proper PostgreSQL named parameter syntax
            var parameterList = string.Join(", ", parameters.Keys.Select((k, i) => $"{k} => ${i + 1}"));
            var sql = $"SELECT * FROM {functionName}({parameterList})";

            using var command = new NpgsqlCommand(sql, connection);

            // Add parameters correctly - don't use $ in parameter name, only in SQL
            int paramIndex = 1;
            foreach (var param in parameters.Values)
            {
                // Parameter name should NOT include the $, only the SQL should
                command.Parameters.Add(new NpgsqlParameter { Value = param ?? DBNull.Value });
                paramIndex++;
            }

            using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                var item = mapFunction(reader);
                results.Add(item);
            }
            return results;
        }

        // OPTIMIZED SOFT DELETE WITH BULK OPERATIONS
        public virtual async Task BulkSoftDeleteAsync(
            Expression<Func<TEntity, bool>> predicate,
            bool hardDelete = false,
            CancellationToken cancellationToken = default)
        {
            var entities = await DbSet.Where(predicate).ToListAsync(cancellationToken);

            if (hardDelete)
            {
                DbSet.RemoveRange(entities);
            }

            foreach (var entity in entities)
            {
                entity.Delete();
            }
        }

        public virtual async Task<int> BatchDeleteAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .Where(predicate)
                .ExecuteDeleteAsync(cancellationToken);
        }

        public virtual async Task<int> BatchUpdateAsync<TUpdateDto>(
            Expression<Func<TEntity, bool>> predicate,
            TUpdateDto updateDto,
            CancellationToken cancellationToken = default)
        {
            var setPropertiesExpression = EFCoreUpdateHelper
                .BuildSetPropertiesExpression<TEntity, TUpdateDto>(updateDto);

            return await DbSet
                .Where(predicate)
                .ExecuteUpdateAsync(setPropertiesExpression, cancellationToken);
        }

        // Overload for direct entity updates
        public virtual async Task<int> UpdateTrackedAsync(
            TEntity entity,
            CancellationToken cancellationToken = default)
        {
            DbSet.Update(entity);
            return await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // BATCH OPERATIONS
        public virtual async Task<int> BatchUpdateMultipleAsync(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>> setterExpression,
            CancellationToken cancellationToken = default)
        {
            return await DbSet
                .Where(predicate)
                .ExecuteUpdateAsync(setterExpression, cancellationToken);
        }

        // CACHING SUPPORT
        public virtual async Task<TEntity?> GetByIdWithCacheAsync(
            Guid id,
            IMemoryCache cache,
            TimeSpan? expiration = null,
            CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{typeof(TEntity).Name}:{id}";

            if (cache.TryGetValue(cacheKey, out TEntity? cachedEntity))
            {
                return cachedEntity;
            }

            var entity = await GetByIdAsync(id, cancellationToken: cancellationToken);

            if (entity != null)
            {
                var options = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(15)
                };
                cache.Set(cacheKey, entity, options);
            }

            return entity;
        }

        // HELPER METHODS
        private static PropertyInfo GetPropertyInfo<TSource, TProperty>(
            Expression<Func<TSource, TProperty>> propertyLambda)
        {
            if (propertyLambda.Body is not MemberExpression member)
                throw new ArgumentException($"Expression '{propertyLambda}' refers to a method, not a property.");

            if (member.Member is not PropertyInfo propInfo)
                throw new ArgumentException($"Expression '{propertyLambda}' refers to a field, not a property.");

            return propInfo;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _dbContext.Dispose();
            }
        }
    }
}
