using PhysioBoo.Application.Commands.Public.RequestAppointment;
using Xunit;

namespace PhysioBoo.Application.Test.Commands
{
    public sealed class PublicRequestServiceTest
    {
        private static readonly Guid s_clinicA = Guid.NewGuid();
        private static readonly Guid s_clinicB = Guid.NewGuid();

        private static readonly PublicRequestServiceOption s_strokeAtA = new(Guid.NewGuid(), "Stroke rehabilitation", s_clinicA);
        private static readonly PublicRequestServiceOption s_strokeAtB = new(Guid.NewGuid(), "Stroke rehabilitation", s_clinicB);
        private static readonly PublicRequestServiceOption s_gait = new(Guid.NewGuid(), "Gait training", null);

        private static readonly PublicRequestServiceOption[] s_offered = [s_strokeAtA, s_strokeAtB, s_gait];

        [Fact]
        public void No_Service_Is_Fine_Only_When_The_Doctor_Offers_None()
        {
            Assert.Equal(PublicRequestServiceError.None, PublicRequestService.Resolve([], null, null, s_clinicA).Error);
            Assert.Equal(PublicRequestServiceError.NotOffered, PublicRequestService.Resolve(s_offered, null, null, s_clinicA).Error);
        }

        [Fact]
        public void Matches_By_Id_When_Given()
        {
            var (service, error) = PublicRequestService.Resolve(s_offered, s_strokeAtB.Id, "Gait training", s_clinicB);

            Assert.Equal(PublicRequestServiceError.None, error);
            Assert.Same(s_strokeAtB, service);
        }

        [Fact]
        public void Rejects_An_Id_The_Doctor_Does_Not_Offer()
        {
            // Covers ids from another tenant: the offered list is already tenant-scoped.
            Assert.Equal(PublicRequestServiceError.NotOffered, PublicRequestService.Resolve(s_offered, Guid.NewGuid(), null, s_clinicA).Error);
        }

        [Fact]
        public void Rejects_A_Service_At_Another_Clinic()
        {
            Assert.Equal(PublicRequestServiceError.WrongFacility, PublicRequestService.Resolve(s_offered, s_strokeAtA.Id, null, s_clinicB).Error);
        }

        [Fact]
        public void A_Service_Without_A_Clinic_Fits_Any_Facility()
        {
            Assert.Equal(PublicRequestServiceError.None, PublicRequestService.Resolve(s_offered, s_gait.Id, null, s_clinicB).Error);
            Assert.Equal(PublicRequestServiceError.None, PublicRequestService.Resolve(s_offered, s_gait.Id, null, null).Error);
        }

        [Fact]
        public void A_Shared_Name_Resolves_To_The_Service_At_The_Chosen_Facility()
        {
            var (service, error) = PublicRequestService.Resolve(s_offered, null, "Stroke rehabilitation", s_clinicB);

            Assert.Equal(PublicRequestServiceError.None, error);
            Assert.Same(s_strokeAtB, service);
        }

        [Fact]
        public void Rejects_An_Unknown_Name()
        {
            Assert.Equal(PublicRequestServiceError.NotOffered, PublicRequestService.Resolve(s_offered, null, "Hydrotherapy", s_clinicA).Error);
        }
    }
}
