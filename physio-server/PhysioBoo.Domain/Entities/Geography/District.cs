using NpgsqlTypes;

namespace PhysioBoo.Domain.Entities.Geography
{
    public class District : AuditEntity
    {
        #region Core District Table
        public Guid CityId { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual City? City { get; private set; }
        public virtual ICollection<GeoWard> Wards { get; private set; } = new List<GeoWard>();
        #endregion

        #region Constructor
        public District(Guid id, Guid cityId, string name, string code) : base(id)
        {
            CityId = cityId;
            Name = name;
            Code = code;
            IsActive = true;
        }
        #endregion

        #region Setter Methods
        public void SetCityId(Guid cityId) { CityId = cityId; }
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        #endregion
    }
}
