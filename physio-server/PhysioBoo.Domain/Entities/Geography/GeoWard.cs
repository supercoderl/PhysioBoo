using NpgsqlTypes;

namespace PhysioBoo.Domain.Entities.Geography
{
    /// <summary>
    /// Geographic ward / commune. Named GeoWard so it does not clash with Inpatient.Ward (a hospital ward).
    /// </summary>
    public class GeoWard : AuditEntity
    {
        #region Core GeoWard Table
        public Guid DistrictId { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual District? District { get; private set; }
        #endregion

        #region Constructor
        public GeoWard(Guid id, Guid districtId, string name, string code) : base(id)
        {
            DistrictId = districtId;
            Name = name;
            Code = code;
            IsActive = true;
        }
        #endregion

        #region Setter Methods
        public void SetDistrictId(Guid districtId) { DistrictId = districtId; }
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        #endregion
    }
}
