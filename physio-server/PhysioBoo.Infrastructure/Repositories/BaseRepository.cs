using Ardalis.Specification;
using Ardalis.Specification.EntityFrameworkCore;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Caching.Memory;
using Npgsql;
using NpgsqlTypes;
using PhysioBoo.Domain.Entities;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using PhysioBoo.SharedKernel.Metadata;
using PhysioBoo.SharedKernel.Results;
using PhysioBoo.SharedKernel.Utils;
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

            foreach (string includeProperty in includeProperties.Split(
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
            CancellationToken ct = default)
        {
            IQueryable<TEntity> query = GetAllNoTracking(filter, orderBy, includeProperties);

            int totalCount = await query.CountAsync(ct);
            List<TEntity> items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return new PagedResult<TEntity>(totalCount, items, pageNumber, pageSize);
        }

        public virtual async Task<PagedResult<TEntity>> ListAsync(
            ISpecification<TEntity> spec,
            int pageNumber,
            int pageSize,
            CancellationToken ct = default
        )
        {
            IQueryable<TEntity> specificationResult = ApplySpecification(spec);
            int totalCount = await specificationResult.CountAsync(ct);
            List<TEntity> items = await specificationResult
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);
            return new PagedResult<TEntity>(totalCount, items, pageNumber, pageSize);
        }

        public virtual async Task<int> CountAsync(ISpecification<TEntity> spec, CancellationToken ct = default)
        {
            IQueryable<TEntity> specificationResult = ApplySpecification(spec);
            return await specificationResult.CountAsync(ct);
        }

        public virtual async Task<TEntity?> FirstOrDefaultAsync(ISpecification<TEntity> spec, CancellationToken ct = default)
        {
            IQueryable<TEntity> specificationResult = ApplySpecification(spec);
            return await specificationResult.FirstOrDefaultAsync(ct);
        }

        #region Method: Generic Single Insert

        /// <summary>
        /// Insert a single entity of any type
        /// </summary>
        public async Task<DbResult<TKey>> InsertAsync<T, TKey>(T entity) where T : class
        {
            try
            {
                TableMetadata metadata = GetTableMetadata<T>();
                string sql = GenerateInsertSql<T>(metadata, returnsKey: true);

                using NpgsqlConnection connection = new NpgsqlConnection(_connectionString);
                DynamicParameters parameters = BuildParameters(entity, metadata);

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
            TableMetadata metadata = GetTableMetadata<T>();
            string sql = GenerateInsertSql<T>(metadata, returnsKey: false);

            using NpgsqlConnection connection = new NpgsqlConnection(_connectionString);
            DynamicParameters parameters = BuildParameters(entity, metadata);

            await connection.ExecuteAsync(sql, parameters);
        }

        #endregion

        #region Method: Generic Batch Insert

        /// <summary>
        /// Batch insert multiple entities
        /// </summary>
        public async Task<int> InsertBatchAsync<T>(IEnumerable<T> entities) where T : class
        {
            List<T> entitiesList = entities.ToList();
            if (!entitiesList.Any()) return 0;

            TableMetadata metadata = GetTableMetadata<T>();
            string sql = GenerateInsertSql<T>(metadata, returnsKey: false);

            using NpgsqlConnection connection = new NpgsqlConnection(_connectionString);

            IEnumerable<DynamicParameters> parametersList = entitiesList.Select(entity => BuildParameters(entity, metadata));

            return await connection.ExecuteAsync(sql, parametersList);
        }

        #endregion

        #region Method: Ultra-Fast Bulk Insert with COPY (For Big Data)

        /// <summary>
        /// Ultra-fast bulk insert using PostgreSQL COPY
        /// </summary>
        public async Task<int> BulkInsertAsync<T>(IEnumerable<T> entities) where T : class
        {
            List<T> entitiesList = entities.ToList();
            if (!entitiesList.Any()) return 0;

            TableMetadata metadata = GetTableMetadata<T>();

            using NpgsqlConnection connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            using NpgsqlTransaction transaction = await connection.BeginTransactionAsync();

            try
            {
                // Create staging table
                string createStagingTableSql = GenerateCreateStagingTableSql(metadata);
                await connection.ExecuteAsync(createStagingTableSql, transaction: transaction);

                // COPY data to staging table using text format
                string copyCommand = GenerateCopyCommand(metadata);
                using (TextWriter writer = await connection.BeginTextImportAsync(copyCommand))
                {
                    foreach (T? entity in entitiesList)
                    {
                        string csvLine = GenerateCsvLine(entity, metadata);
                        await writer.WriteLineAsync(csvLine);
                    }
                } // TextWriter disposal completes the COPY operation

                // Move from staging to main table
                string moveSql = GenerateMoveStagingToMainSql(metadata);
                int insertedCount = await connection.QuerySingleAsync<int>(moveSql, transaction: transaction);

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
            CancellationToken ct = default)
        {
            return await DbSet.AsNoTracking().AnyAsync(predicate, ct);
        }

        public virtual async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default)
        {
            return await DbSet.AsNoTracking().AnyAsync(entity => entity.Id == id, ct);
        }

        // OPTIMIZED SINGLE ENTITY RETRIEVAL
        public virtual async Task<TEntity?> GetByIdAsync(
            Guid id,
            string includeProperties = "",
            CancellationToken ct = default)
        {
            IQueryable<TEntity> query = DbSet;

            foreach (string includeProperty in includeProperties.Split(
                new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }

            return await query.FirstOrDefaultAsync(e => e.Id == id, ct);
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
            CancellationToken ct = default)
            where T : class
        {
            List<T> results = new List<T>();
            using NpgsqlConnection connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync(ct);

            // Build parameter list with proper PostgreSQL named parameter syntax
            string parameterList = string.Join(", ", parameters.Keys.Select((k, i) => $"{k} => ${i + 1}"));
            string sql = $"SELECT * FROM {functionName}({parameterList})";

            using NpgsqlCommand command = new NpgsqlCommand(sql, connection);

            // Add parameters correctly - don't use $ in parameter name, only in SQL
            int paramIndex = 1;
            foreach (object param in parameters.Values)
            {
                // Parameter name should NOT include the $, only the SQL should
                command.Parameters.Add(new NpgsqlParameter { Value = param ?? DBNull.Value });
                paramIndex++;
            }

            using NpgsqlDataReader reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                T item = mapFunction(reader);
                results.Add(item);
            }
            return results;
        }

        // OPTIMIZED SOFT DELETE WITH BULK OPERATIONS
        public virtual async Task BulkSoftDeleteAsync(
            Expression<Func<TEntity, bool>> predicate,
            bool hardDelete = false,
            CancellationToken ct = default)
        {
            List<TEntity> entities = await DbSet.Where(predicate).ToListAsync(ct);

            if (hardDelete)
            {
                DbSet.RemoveRange(entities);
            }
            else
            {
                foreach (TEntity? entity in entities)
                {
                    entity.Delete();
                }
            }
        }

        public virtual void SoftDeleteSingle(
            TEntity entity,
            bool hardDelete = false,
            CancellationToken ct = default
        )
        {
            if (hardDelete)
            {
                DbSet.Remove(entity);
            }
            else
            {
                entity.Delete();
                DbSet.Update(entity);
            }
        }

        public virtual async Task<int> BatchDeleteAsync(
            Expression<Func<TEntity, bool>> predicate,
            CancellationToken ct = default)
        {
            return await DbSet
                .Where(predicate)
                .ExecuteDeleteAsync(ct);
        }

        public virtual async Task<int> BatchUpdateAsync<TUpdateDto>(
            Expression<Func<TEntity, bool>> predicate,
            TUpdateDto updateDto,
            CancellationToken ct = default)
        {
            Expression<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>> setPropertiesExpression = EFCoreUpdateHelper
                .BuildSetPropertiesExpression<TEntity, TUpdateDto>(updateDto);

            return await DbSet
                .Where(predicate)
                .ExecuteUpdateAsync(setPropertiesExpression, ct);
        }

        // Overload for direct entity updates
        public virtual async Task<int> UpdateTrackedAsync(
            TEntity entity,
            CancellationToken ct = default)
        {
            DbSet.Update(entity);
            return await _dbContext.SaveChangesAsync(ct);
        }

        // BATCH OPERATIONS
        public virtual async Task<int> BatchUpdateMultipleAsync(
            Expression<Func<TEntity, bool>> predicate,
            Expression<Func<SetPropertyCalls<TEntity>, SetPropertyCalls<TEntity>>> setterExpression,
            CancellationToken ct = default)
        {
            return await DbSet
                .Where(predicate)
                .ExecuteUpdateAsync(setterExpression, ct);
        }

        // CACHING SUPPORT
        public virtual async Task<TEntity?> GetByIdWithCacheAsync(
            Guid id,
            IMemoryCache cache,
            TimeSpan? expiration = null,
            CancellationToken ct = default)
        {
            string cacheKey = $"{typeof(TEntity).Name}:{id}";

            if (cache.TryGetValue(cacheKey, out TEntity? cachedEntity))
            {
                return cachedEntity;
            }

            TEntity? entity = await GetByIdAsync(id, ct: ct);

            if (entity != null)
            {
                MemoryCacheEntryOptions options = new MemoryCacheEntryOptions
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
            Type type = typeof(T);

            if (_metadataCache.TryGetValue(type, out TableMetadata? cachedMetadata))
                return cachedMetadata;

            TableAttribute? tableAttribute = type.GetCustomAttribute<TableAttribute>();
            string tableName = tableAttribute?.Name ?? TextHelper.Pluralize(type.Name);

            List<PropertyInfo> properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => SqlHelper.ShouldIncludeProperty(p))
                .ToList();

            List<ColumnMetadata> columns = properties.Select(p => new ColumnMetadata
            {
                PropertyName = p.Name,
                ColumnName = p.GetCustomAttribute<ColumnAttribute>()?.Name ?? p.Name,
                PropertyType = p.PropertyType,
                IsKey = (p.GetCustomAttribute<ColumnAttribute>()?.Name ?? p.Name) == "Id",
                IsGenerated = SqlHelper.IsGeneratedColumn(p),
                IsComputed = SqlHelper.IsComputedColumn(p),
                Property = p
            }).ToList();

            TableMetadata metadata = new TableMetadata
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
            string columns = string.Join(", ", metadata.InsertableColumns.Select(c => QuoteIdentifier(c.ColumnName)));
            string parameters = string.Join(", ", metadata.InsertableColumns.Select(c =>
            {
                return SqlHelper.IsJsonbType(c) ? $"@{c.PropertyName}::jsonb" : $"@{c.PropertyName}";
            }));

            string sql = $"INSERT INTO {QuoteIdentifier(metadata.TableName)} ({columns}) VALUES ({parameters})";

            if (returnsKey && metadata.KeyColumn != null)
            {
                sql += $" RETURNING {QuoteIdentifier(metadata.KeyColumn.ColumnName)}";
            }

            return sql;
        }

        private DynamicParameters BuildParameters<T>(T entity, TableMetadata metadata)
        {
            DynamicParameters parameters = new DynamicParameters();

            foreach (ColumnMetadata column in metadata.InsertableColumns)
            {
                object? value = column.Property?.GetValue(entity);
                string columnName = column.ColumnName;

                // Handle null values first
                if (value == null)
                {
                    parameters.Add($"@{columnName}", null);
                    continue;
                }

                Type valueType = value.GetType();

                // Handle Jsonb types
                if (SqlHelper.IsJsonbType(column))
                {
                    string jsonValue = value is string s ? s : JsonSerializer.Serialize(value);
                    parameters.Add($"@{column.PropertyName}", jsonValue, DbType.String);
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
                        NpgsqlDbType npgsqlDbType = SqlHelper.GetArrayNpgsqlDbType(valueType);

                        // For empty arrays, ensure we pass the correct empty array type
                        if (SqlHelper.IsEmptyArray(value))
                        {
                            Type? elementType = SqlHelper.GetArrayElementType(valueType);
                            object emptyArray = SqlHelper.CreateTypedEmptyArray(elementType);
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
                        string arrayText = SqlHelper.ConvertArrayToPostgreSqlFormat(value);
                        parameters.Add($"@{columnName}", arrayText, DbType.String);
                    }
                    continue;
                }

                if (valueType.IsEnum)
                {
                    parameters.Add($"@{columnName}", value.ToString(), DbType.String);
                    continue;
                }

                // Handle regular types
                DbType? dbType = SqlHelper.GetDbTypeForValue(value);
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
            string columns = string.Join(", ", metadata.InsertableColumns.Select(c => QuoteIdentifier(c.ColumnName)));
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
            string columns = string.Join(", ", metadata.InsertableColumns.Select(c => QuoteIdentifier(c.ColumnName)));
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

        private IQueryable<TEntity> ApplySpecification(ISpecification<TEntity> spec)
        {
            return SpecificationEvaluator.Default.GetQuery(DbSet.AsQueryable(), spec);
        }
        #endregion
    }
}
