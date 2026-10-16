using PhysioBoo.Application.Queries.Public.Services;
using PhysioBoo.Application.ViewModels.Public;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using Xunit;

namespace PhysioBoo.Application.Test.Queries
{
    public sealed class PublicServiceScopeTest
    {
        private static readonly Guid s_site = Guid.NewGuid();
        private static readonly Guid s_other = Guid.NewGuid();
        private static readonly Guid s_publicClinic = Guid.NewGuid();
        private static readonly Guid s_hiddenClinic = Guid.NewGuid();

        private static MedicalService Create(string name, Guid tenantId, ServiceStatus status = ServiceStatus.Active, Guid? hospitalId = null, bool deleted = false)
        {
            MedicalService s = new(Guid.NewGuid(), name.ToUpperInvariant(), name, null, null, status, ServiceAvailability.Available,
                100, "VND", true, 30, true, false, null, hospitalId, null, null);
            s.SetTenantId(tenantId);
            if (deleted) s.Delete();
            return s;
        }

        private static Hospital Clinic(Guid id)
        {
            Hospital h = new(id, "clinic", null, HospitalType.Clinic, 0, 0, "a", "c", "s", null, "vn",
                null, null, null, null, null, null, null, null, null, null, null, "acc", null, [], [], null, null, null, null, null, null, null);
            h.SetTenantId(s_site);
            return h;
        }

        [Fact]
        public void Lists_Only_Published_Services_Of_The_Site_Tenant_At_Public_Clinics()
        {
            MedicalService archived = Create("archived", s_site);
            archived.Archive();
            MedicalService[] all =
            [
                Create("no-clinic", s_site),
                Create("public-clinic", s_site, hospitalId: s_publicClinic),
                Create("hidden-clinic", s_site, hospitalId: s_hiddenClinic),
                Create("draft", s_site, ServiceStatus.Draft),
                Create("deleted", s_site, deleted: true),
                Create("other-tenant", s_other),
                archived
            ];
            IQueryable<Hospital> publicClinics = new[] { Clinic(s_publicClinic) }.AsQueryable();

            string[] names = PublicServiceScope.Services(all.AsQueryable(), publicClinics, s_site).Select(s => s.Name).ToArray();

            Assert.Equal(["no-clinic", "public-clinic"], names);
        }
    
        [Theory]
        [InlineData(typeof(PublicServiceViewModel))]
        [InlineData(typeof(PublicServiceDetailViewModel))]
        public void Public_Contracts_Publish_No_Internal_Fields(Type contract)
        {
            string[] forbidden = ["Price", "Currency", "Vat", "Duration", "Availability", "Referral", "Code", "Tags", "Department", "Category", "Status"];

            string[] leaked = contract.GetProperties()
                .Select(p => p.Name)
                .Where(n => forbidden.Any(f => n.Contains(f, StringComparison.OrdinalIgnoreCase)))
                .ToArray();

            Assert.Empty(leaked);
        }
    }
}
