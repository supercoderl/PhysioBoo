using PhysioBoo.Application.Queries.Public.Hospitals;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using Xunit;

namespace PhysioBoo.Application.Test.Queries
{
    public sealed class PublicHospitalScopeTest
    {
        private static readonly Guid s_site = Guid.NewGuid();
        private static readonly Guid s_other = Guid.NewGuid();

        private static Hospital Create(string name, Guid tenantId, bool active = true, bool deleted = false)
        {
            Hospital h = new(Guid.NewGuid(), name, null, HospitalType.Clinic, 0, 0, "a", "c", "s", null, "vn",
                null, null, null, null, null, null, null, null, null, null, null, "acc", null, [], [], null, null, null, null, null, null, null);
            h.SetTenantId(tenantId);
            h.SetIsActive(active);
            if (deleted) h.Delete();
            return h;
        }

        [Fact]
        public void Lists_Only_Active_Undeleted_Clinics_Of_The_Site_Tenant()
        {
            Hospital[] all =
            [
                Create("listed", s_site),
                Create("inactive", s_site, active: false),
                Create("deleted", s_site, deleted: true),
                Create("other-tenant", s_other)
            ];

            string[] names = PublicHospitalScope.Hospitals(all.AsQueryable(), s_site).Select(h => h.Name).ToArray();

            Assert.Equal(["listed"], names);
        }

        [Theory]
        [InlineData("[\"https://cdn/a.jpg\",\"https://cdn/b.jpg\"]", "https://cdn/a.jpg")]
        [InlineData("[\" \",\"https://cdn/b.jpg\"]", "https://cdn/b.jpg")]
        [InlineData("[]", null)]
        [InlineData("not json", null)]
        [InlineData(null, null)]
        public void First_Image_Reads_The_Json_List(string? json, string? expected) =>
            Assert.Equal(expected, PublicHospitalScope.FirstImage(json));

        [Theory]
        [InlineData("https://clinic.example/", "https://clinic.example/")]
        [InlineData(" http://clinic.example/about ", "http://clinic.example/about")]
        [InlineData("javascript:alert(1)", null)]
        [InlineData("clinic.example", null)]
        [InlineData("", null)]
        [InlineData(null, null)]
        public void Web_Url_Publishes_Only_Absolute_Http_Links(string? value, string? expected) =>
            Assert.Equal(expected, PublicHospitalScope.WebUrl(value));

        [Fact]
        public void Languages_Are_Trimmed_Deduplicated_And_Capped() =>
            Assert.Equal(["Vietnamese", "English"], PublicHospitalScope.Languages([" Vietnamese", "", "English", "Vietnamese", "Korean"], 2));
    }
}
