using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using OfficeOpenXml;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Services
{
    public sealed class ResourceExcelProcessor : IResourceExcelProcessor
    {
        private readonly IDistributedCache _cache;
        private readonly ISys_ResourceRepository _sys_ResourceRepository;
        private readonly ISys_LanguageRepository _sys_LanguageRepository;

        public ResourceExcelProcessor(
            IDistributedCache cache,
            ISys_ResourceRepository sys_ResourceRepository,
            ISys_LanguageRepository sys_LanguageRepository
        )
        {
            _cache = cache;
            _sys_ResourceRepository = sys_ResourceRepository;
            _sys_LanguageRepository = sys_LanguageRepository;
        }

        public async Task<(int Inserted, int Updated)> ProcessAsync(Stream stream, CancellationToken cancellationToken)
        {
            int inserted = 0;
            int updated = 0;
            List<Sys_Resource> newResources = new List<Sys_Resource>();
            HashSet<string> languagesToClearCache = new HashSet<string>();

            Dictionary<string, Sys_Resource> resources = await _sys_ResourceRepository
                .GetAllNoTracking()
                .ToDictionaryAsync(x => $"{x.Key}_{x.LanguageId}", x => x);

            Dictionary<string, Guid> languageMap = await _sys_LanguageRepository
                .GetAllNoTracking()
                .ToDictionaryAsync(x => x.Code, x => x.Id);

            using (ExcelPackage package = new ExcelPackage(stream))
            {
                ExcelWorksheet sheet = package.Workbook.Worksheets[0];
                if (sheet != null)
                {
                    int rowCount = sheet.Dimension.Rows;
                    int colCount = sheet.Dimension.Columns;

                    Dictionary<int, (Guid Id, string Code)> colMap = new Dictionary<int, (Guid Id, string Code)>();
                    for (int col = 2; col <= colCount; col++)
                    {
                        string? langCode = sheet.Cells[1, col].Value?.ToString()?.Trim();
                        if (!string.IsNullOrEmpty(langCode) && languageMap.ContainsKey(langCode))
                        {
                            Guid langId = languageMap[langCode];
                            colMap.Add(col, (langId, langCode));
                            languagesToClearCache.Add(langCode);
                        }
                    }

                    for (int row = 2; row <= rowCount; row++)
                    {
                        string? key = sheet.Cells[row, 1].Value?.ToString()?.Trim();
                        if (string.IsNullOrEmpty(key)) continue;
                        foreach (KeyValuePair<int, (Guid Id, string Code)> map in colMap)
                        {
                            int colIndex = map.Key;
                            Guid langId = map.Value.Id;
                            string langCode = map.Value.Code;

                            string? cellValue = sheet.Cells[row, colIndex].Value?.ToString()?.Trim();
                            if (string.IsNullOrEmpty(cellValue)) continue;

                            string uniqueKey = $"{key}_{langId}";
                            if (resources.ContainsKey(uniqueKey))
                            {
                                Sys_Resource entity = resources[uniqueKey];
                                if (entity.Value != cellValue)
                                {
                                    entity.SetValue(cellValue);
                                    await _sys_ResourceRepository.UpdateTrackedAsync(entity);
                                    updated++;
                                }
                            }
                            else
                            {
                                Sys_Resource newEntity = new Sys_Resource(
                                    Guid.NewGuid(),
                                    key,
                                    langId,
                                    cellValue
                                );
                                newResources.Add(newEntity);
                                resources[uniqueKey] = newEntity;
                                inserted++;
                            }
                        }
                    }
                }
            }

            if (newResources.Any()) await _sys_ResourceRepository.InsertBatchAsync(newResources);
            foreach (string lang in languagesToClearCache)
            {
                await _cache.RemoveAsync($"i18n_{lang}");
            }

            return (inserted, updated);
        }
    }
}
