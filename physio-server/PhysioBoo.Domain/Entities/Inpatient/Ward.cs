namespace PhysioBoo.Domain.Entities.Inpatient
{
    public class Ward : TenantEntity
    {
        #region Core Ward Table (4)
        public string? Code { get; private set; }
        public string Name { get; private set; }
        public int Floor { get; private set; }
        public Guid? DepartmentId { get; private set; }

        public virtual Department? Department { get; private set; }
        public virtual ICollection<Bed> Beds { get; private set; } = new List<Bed>();
        #endregion

        #region Constructor (4)
        public Ward(
            Guid id,
            string? code,
            string name,
            int floor,
            Guid? departmentId
        ) : base(id)
        {
            Code = code;
            Name = name;
            Floor = floor;
            DepartmentId = departmentId;
        }
        #endregion

        #region Setter Methods (4)
        public void SetCode(string? code) { Code = code; }
        public void SetName(string name) { Name = name; }
        public void SetFloor(int floor) { Floor = floor; }
        public void SetDepartmentId(Guid? departmentId) { DepartmentId = departmentId; }
        #endregion
    }
}
