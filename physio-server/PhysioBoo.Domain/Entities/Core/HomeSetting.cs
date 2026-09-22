namespace PhysioBoo.Domain.Entities.Core
{
    public class HomeSetting : TenantEntity
    {
        #region Core Home Setting Table (7)
        public string HospitalName { get; private set; }
        public string? TagLine { get; private set; }
        public string? WelcomeMessage { get; private set; }
        public string? ContactPhone { get; private set; }
        public string? ContactEmail { get; private set; }
        public string? Address { get; private set; }
        public bool ShowEmergencyBanner { get; private set; }
        #endregion

        #region Constructor (7)
        public HomeSetting(
            Guid id,
            Guid tenantId,
            string hospitalName,
            string? tagLine,
            string? welcomeMessage,
            string? contactPhone,
            string? contactEmail,
            string? address,
            bool showEmergencyBanner
        )
            : base(id, tenantId)
        {
            HospitalName = hospitalName;
            TagLine = tagLine;
            WelcomeMessage = welcomeMessage;
            ContactPhone = contactPhone;
            ContactEmail = contactEmail;
            Address = address;
            ShowEmergencyBanner = showEmergencyBanner;
        }
        #endregion

        #region Setter Methods (7)
        public void SetHospitalName(string hospitalName) { HospitalName = hospitalName; }
        public void SetTagLine(string? tagLine) { TagLine = tagLine; }
        public void SetWelcomeMessage(string? welcomeMessage) { WelcomeMessage = welcomeMessage; }
        public void SetContactPhone(string? contactPhone) { ContactPhone = contactPhone; }
        public void SetContactEmail(string? contactEmail) { ContactEmail = contactEmail; }
        public void SetAddress(string? address) { Address = address; }
        public void SetShowEmergencyBanner(bool showEmergencyBanner) { ShowEmergencyBanner = showEmergencyBanner; }
        #endregion
    }
}
