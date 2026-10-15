using System.Text.Json;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using Xunit;

namespace PhysioBoo.Application.Test.Mapping
{
    public sealed class PatientAllergyViewModelTest
    {
        [Fact]
        public void Should_Serialize_The_Field_Names_The_Medical_Record_Page_Reads()
        {
            PatientAllergy allergy = new(Guid.NewGuid(), Guid.NewGuid(), "Penicillin", default, "Rash", default,
                new DateOnly(2020, 1, 2), new DateOnly(2021, 3, 4), "Antihistamine", "Avoid beta-lactams");

            using JsonDocument json = JsonDocument.Parse(JsonSerializer.Serialize(
                PatientAllergyViewModel.FromPatientAllergy(allergy), new JsonSerializerOptions(JsonSerializerDefaults.Web)));

            JsonElement root = json.RootElement;
            Assert.Equal("Penicillin", root.GetProperty("allergenName").GetString());
            Assert.Equal("Avoid beta-lactams", root.GetProperty("notes").GetString());
            Assert.True(root.TryGetProperty("firstOccurrenceDate", out _));
            Assert.Equal("2021-03-04", root.GetProperty("lastOccurrenceDate").GetString());
        }
    }
}
