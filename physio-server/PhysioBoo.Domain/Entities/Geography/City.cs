using NpgsqlTypes;

namespace PhysioBoo.Domain.Entities.Geography
{
    /// <summary>
    /// First administrative level of a country (province / state). Labelled "City" in the UI.
    /// </summary>
    public class City : AuditEntity
    {
        #region Core City Table
        public Guid CountryId { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual Country? Country { get; private set; }
        public virtual ICollection<District> Districts { get; private set; } = new List<District>();
        #endregion

        #region Constructor
        public City(Guid id, Guid countryId, string name, string code) : base(id)
        {
            CountryId = countryId;
            Name = name;
            Code = code;
            IsActive = true;
        }
        #endregion

        #region Setter Methods
        public void SetCountryId(Guid countryId) { CountryId = countryId; }
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        #endregion
    }
}
