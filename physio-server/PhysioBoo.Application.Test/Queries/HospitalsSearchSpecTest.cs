using PhysioBoo.Application.Queries.Hospitals.GetAll;
using PhysioBoo.Application.SortProviders;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Common;
using Xunit;

namespace PhysioBoo.Application.Test.Queries
{
    public sealed class HospitalsSearchSpecTest
    {
        private static readonly Guid s_groupA = Guid.NewGuid();
        private static readonly Guid s_groupB = Guid.NewGuid();

        private static readonly Hospital[] s_hospitals =
        [
            Create("a-general", s_groupA, HospitalType.General, 10, true),
            Create("a-clinic", s_groupA, HospitalType.Clinic, 0, true),
            Create("b-general", s_groupB, HospitalType.General, 5, false)
        ];

        private static Hospital Create(string name, Guid tenantId, HospitalType type, int emergencyCapacity, bool active)
        {
            Hospital h = new(Guid.NewGuid(), name, null, type, emergencyCapacity, 0, "a", "c", "s", null, "vn",
                null, null, null, null, null, null, null, null, null, null, null, "acc", null, [], [], null, null, null, null, null, null, null);
            h.SetTenantId(tenantId);
            h.SetIsActive(active);
            return h;
        }

        private static string[] Search(Guid? group = null, int? type = null, bool? isActive = null, bool? emergency = null)
        {
            PagedRequest<HospitalFilter> request = new() { Filter = new HospitalFilter("", "", group, type, isActive, emergency) };
            HospitalsSearchSpec spec = new(new GetAllHospitalsQuery(request), new HospitalViewModelSortProvider());
            return spec.Evaluate(s_hospitals).Select(h => h.Name).OrderBy(x => x).ToArray();
        }

        [Fact] public void No_Filters_Returns_All() => Assert.Equal(3, Search().Length);
        [Fact] public void Filters_By_Hospital_Group() => Assert.Equal(["a-clinic", "a-general"], Search(group: s_groupA));
        [Fact] public void Filters_By_Type() => Assert.Equal(["a-clinic"], Search(type: (int)HospitalType.Clinic));
        [Fact] public void Filters_By_Active_Flag() => Assert.Equal(["b-general"], Search(isActive: false));
        [Fact] public void Filters_By_Emergency_Services() => Assert.Equal(["a-general", "b-general"], Search(emergency: true));
    }
}
