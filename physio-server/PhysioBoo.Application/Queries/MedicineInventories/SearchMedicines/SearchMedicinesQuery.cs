
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicineInventories.SearchMedicines
{
    public sealed record SearchMedicinesQuery(PagedRequest<MedicineStockFilter> Request) : IRequest<PagedResult<MedicineStockViewModel>>;
}
