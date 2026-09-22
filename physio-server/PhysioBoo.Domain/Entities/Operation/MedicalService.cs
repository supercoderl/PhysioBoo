using NpgsqlTypes;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Domain.Entities.Operation
{
    public class MedicalService : TenantEntity
    {
        #region Core Medical Service Table (19)
        public Guid? HospitalId { get; private set; }
        public string Code { get; private set; }
        public string Name { get; private set; }
        public string? ShortName { get; private set; }
        public string? Description { get; private set; }
        public string? CoverImage { get; private set; }
        public Guid? CategoryId { get; private set; }

        [Column("Tags", TypeName = "jsonb")]
        public string? Tags { get; private set; }
        public ServiceStatus Status { get; private set; }
        public ServiceAvailability Availability { get; private set; }
        public decimal BasePrice { get; private set; }
        public string Currency { get; private set; }
        public bool VatIncluded { get; private set; }
        public int DurationMinutes { get; private set; }
        public bool RequiresAppointment { get; private set; }
        public bool RequiresReferral { get; private set; }
        public Guid? PrimaryDoctorId { get; private set; }
        public DateTime? ArchivedAt { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual Doctor? PrimaryDoctor { get; private set; }
        public virtual ICollection<MedicalServiceDepartment> Departments { get; private set; } = new List<MedicalServiceDepartment>();
        public virtual ICollection<MedicalServiceDoctor> Doctors { get; private set; } = new List<MedicalServiceDoctor>();
        #endregion

        #region Constructor (17)
        public MedicalService(
            Guid id,
            string code,
            string name,
            string? shortName,
            string? description,
            ServiceStatus status,
            ServiceAvailability availability,
            decimal basePrice,
            string currency,
            bool vatIncluded,
            int durationMinutes,
            bool requiresAppointment,
            bool requiresReferral,
            Guid? primaryDoctorId,
            Guid? hospitalId,
            Guid? categoryId,
            string? tags
        ) : base(id)
        {
            Code = code;
            Name = name;
            ShortName = shortName;
            Description = description;
            Status = status;
            Availability = availability;
            BasePrice = basePrice;
            Currency = currency;
            VatIncluded = vatIncluded;
            DurationMinutes = durationMinutes;
            RequiresAppointment = requiresAppointment;
            RequiresReferral = requiresReferral;
            PrimaryDoctorId = primaryDoctorId;
            HospitalId = hospitalId;
            CategoryId = categoryId;
            Tags = tags;
        }
        #endregion

        #region Setter Methods (19)
        public void SetHospitalId(Guid? hospitalId) { HospitalId = hospitalId; }
        public void SetCode(string code) { Code = code; }
        public void SetName(string name) { Name = name; }
        public void SetShortName(string? shortName) { ShortName = shortName; }
        public void SetDescription(string? description) { Description = description; }
        public void SetStatus(ServiceStatus status) { Status = status; }
        public void SetAvailability(ServiceAvailability availability) { Availability = availability; }
        public void SetBasePrice(decimal basePrice) { BasePrice = basePrice; }
        public void SetCurrency(string currency) { Currency = currency; }
        public void SetVatIncluded(bool vatIncluded) { VatIncluded = vatIncluded; }
        public void SetDurationMinutes(int durationMinutes) { DurationMinutes = durationMinutes; }
        public void SetRequiresAppointment(bool requiresAppointment) { RequiresAppointment = requiresAppointment; }
        public void SetRequiresReferral(bool requiresReferral) { RequiresReferral = requiresReferral; }
        public void SetPrimaryDoctorId(Guid? primaryDoctorId) { PrimaryDoctorId = primaryDoctorId; }
        public void SetCoverImage(string? coverImage) { CoverImage = coverImage; }
        public void SetCategoryId(Guid? categoryId) { CategoryId = categoryId; }
        public void SetTags(string? tags) { Tags = tags; }
        public void Archive() { Status = ServiceStatus.Archived; ArchivedAt = DateTime.UtcNow; }
        public void Restore() { Status = ServiceStatus.Draft; ArchivedAt = null; }
        public void Publish() { Status = ServiceStatus.Active; ArchivedAt = null; }
        public void ReplaceDepartments(IEnumerable<Guid> ids)
        {
            Departments.Clear();
            foreach (Guid id in ids)
            {
                Departments.Add(new MedicalServiceDepartment { MedicalServiceId = Id, DepartmentId = id });
            }
        }
        public void ReplaceDoctors(IEnumerable<Guid> ids)
        {
            Doctors.Clear();
            foreach (Guid id in ids)
            {
                Doctors.Add(new MedicalServiceDoctor { MedicalServiceId = Id, DoctorId = id });
            }
        }
        #endregion
    }

    public class MedicalServiceDepartment
    {
        public Guid MedicalServiceId { get; set; }
        public Guid DepartmentId { get; set; }
        public virtual MedicalService MedicalService { get; set; } = null!;
        public virtual Department Department { get; set; } = null!;
    }

    public class MedicalServiceDoctor
    {
        public Guid MedicalServiceId { get; set; }
        public Guid DoctorId { get; set; }
        public virtual MedicalService MedicalService { get; set; } = null!;
        public virtual Doctor Doctor { get; set; } = null!;
    }
}
