using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Services
{
    public class PrintContextEnricher : IPrintContextEnricher
    {
        private readonly IUser _user;

        public PrintContextEnricher(
            IUser user
        )
        {
            _user = user;
        }

        public Task<IReadOnlyDictionary<string, object?>> EnrichAsync(IReadOnlyDictionary<string, object?> userProvided, CancellationToken ct)
        {
            Dictionary<string, object?> merged = new Dictionary<string, object?>(userProvided, StringComparer.OrdinalIgnoreCase);

            merged.TryAdd("date", TimeZoneHelper.GetLocalTimeNow().ToString("yyyy-MM-dd"));
            merged.TryAdd("documentNumber", "");

            //if (!merged.ContainsKey("hospital") && _user.IsAuthenticated)
            //{
            //    var tenantId = _user.GetTenantId();
            //    var hospital = await _db.Hospitals.AsNoTracking()
            //        .Where(h => h.Id == tenantId)
            //        .Select(h => new { h.Name, h.Address, h.Phone, h.Email })
            //        .FirstOrDefaultAsync(ct);

            //    if (hospital != null)
            //        merged["hospital"] = new Dictionary<string, object?>
            //        {
            //            ["name"] = hospital.Name,
            //            ["address"] = hospital.Address,
            //            ["phone"] = hospital.Phone,
            //            ["email"] = hospital.Email,
            //        };
            //}

            //if (!merged.ContainsKey("currentUser") && _user.IsAuthenticated)
            //{
            //    var userId = _user.GetUserId();
            //    var u = await _db.Users.AsNoTracking()
            //        .Where(x => x.Id == userId)
            //        .Select(x => new { x.Email })
            //        .FirstOrDefaultAsync(ct);

            //    if (u != null)
            //        merged["currentUser"] = new Dictionary<string, object?>
            //        {
            //            ["email"] = u.Email,
            //        };
            //}

            return Task.FromResult<IReadOnlyDictionary<string, object?>>(merged);
        }
    }
}
