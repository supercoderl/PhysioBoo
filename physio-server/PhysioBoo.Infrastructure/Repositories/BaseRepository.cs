using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Caching.Memory;
using Npgsql;
using NpgsqlTypes;
using PhysioBoo.Domain.Entities;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Metadata;
using PhysioBoo.SharedKernel.Results;
using PhysioBoo.SharedKernel.Utils;
using PhysioBoo.SharedKernel.ViewModels;
using System.Data;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.Json;
using ColumnAttribute = PhysioBoo.SharedKernel.Attributes.ColumnAttribute;
using TableAttribute = PhysioBoo.SharedKernel.Attributes.TableAttribute;

namespace PhysioBoo.Infrastructure.Repositories
{
    public class BaseRepository<TEntity> : IRepository<TEntity> where TEntity : Entity
    {
        private readonly DbContext _dbContext;
        private readonly string _connectionString;
        protected readonly DbSet<TEntity> DbSet;
        private readonly Dictionary<Type, TableMetadata> _metadataCache = new();

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

        #region Method: Generic Single Insert

        /// <summary>
        /// Insert a single entity of any type
        /// </summary>
        public async Task<DbResult<TKey>> InsertAsync<T, TKey>(T entity) where T : class
        {
            try
            {
                var metadata = GetTableMetadata<T>();
                var sql = GenerateInsertSql<T>(metadata, returnsKey: true);

                using var connection = new NpgsqlConnection(_connectionString);
                var parameters = BuildParameters(entity, metadata);

                TKey id = await connection.QuerySingleAsync<TKey>(sql, parameters);

                return DbResult<TKey>.Ok(id);
            }
            catch (Exception ex)
            {
                return DbResult<TKey>.Fail(DbErrorMapper.Map(ex));
            }
        }

        /// <summary>
        /// Insert a single entity without returning key
        /// </summary>
        public async Task InsertAsync<T>(T entity) where T : class
        {
            var metadata = GetTableMetadata<T>();
            var sql = GenerateInsertSql<T>(metadata, returnsKey: false);

            using var connection = new NpgsqlConnection(_connectionString);
            var parameters = BuildParameters(entity, metadata);

            await connection.ExecuteAsync(sql, parameters);
        }

        #endregion

        #region Method: Generic Batch Insert

        /// <summary>
        /// Batch insert multiple entities
        /// </summary>
        public async Task<int> InsertBatchAsync<T>(IEnumerable<T> entities) where T : class
        {
            var entitiesList = entities.ToList();
            if (!entitiesList.Any()) return 0;

            var metadata = GetTableMetadata<T>();
            var sql = GenerateInsertSql<T>(metadata, returnsKey: false);

            using var connection = new NpgsqlConnection(_connectionString);

            var parametersList = entitiesList.Select(entity => BuildParameters(entity, metadata));

            return await connection.ExecuteAsync(sql, parametersList);
        }

        #endregion

        #region Method: Ultra-Fast Bulk Insert with COPY (For Big Data)

        /// <summary>
        /// Ultra-fast bulk insert using PostgreSQL COPY
        /// </summary>
        public async Task<int> BulkInsertAsync<T>(IEnumerable<T> entities) where T : class
        {
            var entitiesList = entities.ToList();
            if (!entitiesList.Any()) return 0;

            var metadata = GetTableMetadata<T>();

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using var transaction = await connection.BeginTransactionAsync();

            try
            {
                // Create staging table
                var createStagingTableSql = GenerateCreateStagingTableSql(metadata);
                await connection.ExecuteAsync(createStagingTableSql, transaction: transaction);

                // COPY data to staging table using text format
                var copyCommand = GenerateCopyCommand(metadata);
                using (var writer = await connection.BeginTextImportAsync(copyCommand))
                {
                    foreach (var entity in entitiesList)
                    {
                        var csvLine = GenerateCsvLine(entity, metadata);
                        await writer.WriteLineAsync(csvLine);
                    }
                } // TextWriter disposal completes the COPY operation

                // Move from staging to main table
                var moveSql = GenerateMoveStagingToMainSql(metadata);
                var insertedCount = await connection.QuerySingleAsync<int>(moveSql, transaction: transaction);

                // Clean up staging table
                await connection.ExecuteAsync($"DROP TABLE {metadata.StagingTableName}", transaction: transaction);

                await transaction.CommitAsync();
                return insertedCount;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        #endregion

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

        // RAW SQL COMMANDS FOR COMPLEX OPERATIONS
        public virtual async Task<int> ExecuteNonQueryAsync(string sql, NpgsqlParameter[] parameters)
        {
            return await _dbContext.Database.ExecuteSqlRawAsync(sql, parameters);
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

        #region Dispose
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
        #endregion

        #region Metadata and SQL Generation
        private TableMetadata GetTableMetadata<T>()
        {
            var type = typeof(T);

            if (_metadataCache.TryGetValue(type, out var cachedMetadata))
                return cachedMetadata;

            var tableAttribute = type.GetCustomAttribute<TableAttribute>();
            var tableName = tableAttribute?.Name ?? type.Name + "s";

            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => SqlHelper.ShouldIncludeProperty(p))
                .ToList();

            var columns = properties.Select(p => new ColumnMetadata
            {
                PropertyName = p.Name,
                ColumnName = p.GetCustomAttribute<ColumnAttribute>()?.Name ?? p.Name,
                PropertyType = p.PropertyType,
                IsKey = (p.GetCustomAttribute<ColumnAttribute>()?.Name ?? p.Name) == "Id",
                IsGenerated = SqlHelper.IsGeneratedColumn(p),
                IsComputed = SqlHelper.IsComputedColumn(p),
                Property = p
            }).ToList();

            var metadata = new TableMetadata
            {
                TableName = tableName,
                StagingTableName = $"{tableName}_staging_{Guid.NewGuid():N}",
                Columns = columns,
                InsertableColumns = columns.Where(c => !c.IsGenerated && !c.IsComputed).ToList(),
                KeyColumn = columns.FirstOrDefault(c => c.IsKey)
            };

            _metadataCache[type] = metadata;
            return metadata;
        }

        private string GenerateInsertSql<T>(TableMetadata metadata, bool returnsKey)
        {
            var columns = string.Join(", ", metadata.InsertableColumns.Select(c => QuoteIdentifier(c.ColumnName)));
            var parameters = string.Join(", ", metadata.InsertableColumns.Select(c => $"@{c.PropertyName}"));

            var sql = $"INSERT INTO {QuoteIdentifier(metadata.TableName)} ({columns}) VALUES ({parameters})";

            if (returnsKey && metadata.KeyColumn != null)
            {
                sql += $" RETURNING {QuoteIdentifier(metadata.KeyColumn.ColumnName)}";
            }

            return sql;
        }

        private DynamicParameters BuildParameters<T>(T entity, TableMetadata metadata)
        {
            var parameters = new DynamicParameters();

            foreach (var column in metadata.InsertableColumns)
            {
                var value = column.Property?.GetValue(entity);
                var columnName = column.ColumnName;

                // Handle null values first
                if (value == null)
                {
                    parameters.Add($"@{columnName}", null);
                    continue;
                }

                var valueType = value.GetType();

                // Handle Jsonb types
                if (SqlHelper.IsJsonbType(column))
                {
                    var jsonString = value is string s ? s : JsonSerializer.Serialize(value);
                    parameters.Add($"@{columnName}", new NpgsqlParameter
                    {
                        ParameterName = $"@{columnName}",
                        NpgsqlDbType = NpgsqlDbType.Jsonb,
                        Value = (object?)value ?? DBNull.Value
                    });
                    continue;
                }

                // Handle DateOnly types
                if (value is DateOnly dateOnly)
                {
                    parameters.Add($"@{columnName}", dateOnly.ToDateTime(TimeOnly.MinValue), DbType.Date);
                    continue;
                }

                // Handle TimeOnly types
                if (value is TimeOnly timeOnly)
                {
                    parameters.Add($"@{columnName}", timeOnly.ToTimeSpan(), DbType.Time);
                    continue;
                }

                // Handle array types for PostgreSQL
                if (SqlHelper.IsArrayType(valueType))
                {
                    try
                    {
                        var npgsqlDbType = SqlHelper.GetArrayNpgsqlDbType(valueType);

                        // For empty arrays, ensure we pass the correct empty array type
                        if (SqlHelper.IsEmptyArray(value))
                        {
                            var elementType = SqlHelper.GetArrayElementType(valueType);
                            var emptyArray = SqlHelper.CreateTypedEmptyArray(elementType);
                            parameters.AddNpgsql($"@{columnName}", emptyArray, npgsqlDbType);
                        }
                        else
                        {
                            parameters.AddNpgsql($"@{columnName}", value, npgsqlDbType);
                        }
                    }
                    catch (Exception)
                    {
                        // Fallback: convert array to PostgreSQL text format
                        var arrayText = SqlHelper.ConvertArrayToPostgreSqlFormat(value);
                        parameters.Add($"@{columnName}", arrayText, DbType.String);
                    }
                    continue;
                }

                // Handle regular types
                var dbType = SqlHelper.GetDbTypeForValue(value);
                parameters.Add($"@{columnName}", value, dbType);
            }

            return parameters;
        }

        private string GenerateCreateStagingTableSql(TableMetadata metadata)
        {
            return $@"
            CREATE UNLOGGED TABLE {QuoteIdentifier(metadata.StagingTableName)} (
                LIKE {QuoteIdentifier(metadata.TableName)} INCLUDING DEFAULTS
            )";
        }

        private string GenerateMoveStagingToMainSql(TableMetadata metadata)
        {
            var columns = string.Join(", ", metadata.InsertableColumns.Select(c => QuoteIdentifier(c.ColumnName)));
            return $@"
            WITH moved AS (
                INSERT INTO {QuoteIdentifier(metadata.TableName)} ({columns}) 
                SELECT {columns} FROM {QuoteIdentifier(metadata.StagingTableName)}
                RETURNING 1
            )
            SELECT COUNT(*) FROM moved";
        }

        private string GenerateCopyCommand(TableMetadata metadata)
        {
            var columns = string.Join(", ", metadata.InsertableColumns.Select(c => QuoteIdentifier(c.ColumnName)));
            return $"COPY {QuoteIdentifier(metadata.StagingTableName)} ({columns}) FROM STDIN (FORMAT CSV, DELIMITER ',', NULL '')";
        }

        private string GenerateCsvLine<T>(T entity, TableMetadata metadata)
        {
            return string.Empty;
        }

        private string EscapeCsvValue(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";

            if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }

            return value;
        }

        private string QuoteIdentifier(string identifier)
        {
            return $"\"{identifier}\"";
        }
        #endregion
    }
}
