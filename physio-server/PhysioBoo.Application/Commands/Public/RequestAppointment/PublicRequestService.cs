namespace PhysioBoo.Application.Commands.Public.RequestAppointment
{
    /// <summary>A service the doctor delivers on the public site, as the request handler needs it.</summary>
    public sealed record PublicRequestServiceOption(Guid Id, string Name, Guid? HospitalId);

    public enum PublicRequestServiceError
    {
        None,
        /// <summary>No service chosen although the doctor has some, or the one given isn't theirs.</summary>
        NotOffered,
        /// <summary>The service is tied to a clinic other than the chosen facility.</summary>
        WrongFacility
    }

    /// <summary>
    /// Picks the service a public appointment request is for. The id is preferred; the name is kept for older clients
    /// and, when several of the doctor's services share it, resolves to the one at the chosen facility.
    /// </summary>
    public static class PublicRequestService
    {
        public static (PublicRequestServiceOption? Service, PublicRequestServiceError Error) Resolve(
            IReadOnlyList<PublicRequestServiceOption> offered, Guid? serviceId, string? serviceName, Guid? facilityId)
        {
            if (serviceId is null && serviceName is null)
            {
                return (null, offered.Count > 0 ? PublicRequestServiceError.NotOffered : PublicRequestServiceError.None);
            }

            PublicRequestServiceOption? service;
            if (serviceId is Guid id)
            {
                service = offered.FirstOrDefault(s => s.Id == id);
            }
            else
            {
                List<PublicRequestServiceOption> named = offered.Where(s => s.Name == serviceName).ToList();
                service = named.FirstOrDefault(s => s.HospitalId == facilityId)
                    ?? named.FirstOrDefault(s => s.HospitalId == null)
                    ?? named.FirstOrDefault();
            }

            if (service is null) return (null, PublicRequestServiceError.NotOffered);

            // A service listed at one clinic can't be requested at another.
            if (service.HospitalId is Guid hospitalId && facilityId is Guid chosen && hospitalId != chosen)
            {
                return (service, PublicRequestServiceError.WrongFacility);
            }

            return (service, PublicRequestServiceError.None);
        }
    }
}
