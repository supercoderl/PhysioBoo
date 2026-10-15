using System.Text.Json;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Domain.Entities.MedicalStaff;
using Xunit;

namespace PhysioBoo.Application.Test.Mapping
{
    public sealed class DoctorViewModelTest
    {
        [Fact]
        public void Should_Expose_Doctor_Key_As_Id_For_The_Admin_UI()
        {
            Guid id = Guid.NewGuid();
            Doctor doctor = new Doctor(id, "DOC-1", "LIC-1", new DateOnly(2030, 1, 1), null, null, null, null, null, null, null, null, null);

            DoctorViewModel vm = DoctorViewModel.FromDoctor(doctor);
            using JsonDocument json = JsonDocument.Parse(JsonSerializer.Serialize(vm, new JsonSerializerOptions(JsonSerializerDefaults.Web)));

            Assert.Equal(id, vm.Id);
            Assert.Equal(id, json.RootElement.GetProperty("id").GetGuid());
        }
    }
}
