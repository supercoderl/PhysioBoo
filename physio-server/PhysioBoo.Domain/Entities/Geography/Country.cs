using NpgsqlTypes;

namespace PhysioBoo.Domain.Entities.Geography
{
    /// <summary>
    /// Platform-wide reference data (not tenant-scoped): the top level of the
    /// Country → City → District → Ward hierarchy used by every address picker.
    /// </summary>
    public class Country : AuditEntity
    {
        #region Core Country Table
        public string Name { get; private set; }

        /// <summary>ISO 3166-1 alpha-2 code, upper case.</summary>
        public string Code { get; private set; }

        public bool IsActive { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual ICollection<City> Cities { get; private set; } = new List<City>();
        #endregion

        #region Constructor
        public Country(Guid id, string name, string code) : base(id)
        {
            Name = name;
            Code = code;
            IsActive = true;
        }
        #endregion

        #region Setter Methods
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        #endregion
    }
}
