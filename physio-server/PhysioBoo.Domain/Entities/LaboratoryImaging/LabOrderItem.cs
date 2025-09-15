using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class LabOrderItem : Entity
    {
        #region Core Lab Order Item Table (19)
        public Guid LabOrderId { get; private set; }
        public Guid LabTestId { get; private set; }
        public string TestName { get; private set; }
        public bool IsUrgent { get; private set; }
        public bool SampleCollected { get; private set; }
        public DateTime? SampleCollectionTime { get; private set; }
        public Guid? SampleCollectorId { get; private set; }
        public decimal TestCost { get; private set; }
        public ItemStatus Status { get; private set; }
        public string? ResultValue { get; private set; }
        public string? ResultUnit { get; private set; }
        public string? ReferenceRange { get; private set; }
        public string? AbnormalFlag { get; private set; }
        public bool CritialFlag { get; private set; }
        public Guid? TechnicianId { get; private set; }
        public Guid? VerifiedBy { get; private set; }
        public DateTime? VerifiedAt { get; private set; }
        public string? Notes { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("LabOrderId")]
        [InverseProperty("LabOrderItems")]
        public virtual LabOrder? LabOrder { get; private set; }

        [ForeignKey("LabTestId")]
        [InverseProperty("LabOrderItems")]
        public virtual LabTest? LabTest { get; private set; }

        [ForeignKey("SampleCollectorId")]
        [InverseProperty("CollectedLabSamples")]
        public virtual User? SampleCollector { get; private set; }

        [ForeignKey("TechnicianId")]
        [InverseProperty("ProcessedLabTests")]
        public virtual User? Technician { get; private set; }

        [ForeignKey("VerifiedBy")]
        [InverseProperty("VerifiedLabTests")]
        public virtual User? Verifier { get; private set; }
        #endregion

        #region Constructor (19)
        public LabOrderItem(
            Guid id,
            Guid labOrderId,
            Guid labTestId,
            string testName,
            bool isUrgent,
            DateTime? sampleCollectionTime,
            Guid? sampleCollectorId,
            decimal testCost,
            string? resultValue,
            string? resultUnit,
            string? referenceRange,
            string? abnormalFlag,
            Guid? technicianId,
            Guid? verifiedBy,
            DateTime? verifiedAt,
            string? notes
        ) : base(id)
        {
            LabOrderId = labOrderId;
            LabTestId = labTestId;
            TestName = testName;
            IsUrgent = isUrgent;
            SampleCollected = sampleCollectionTime.HasValue;
            SampleCollectionTime = sampleCollectionTime;
            SampleCollectorId = sampleCollectorId;
            TestCost = testCost;
            Status = resultValue == null ? ItemStatus.Pending : ItemStatus.Completed;
            ResultValue = resultValue;
            ResultUnit = resultUnit;
            ReferenceRange = referenceRange;
            AbnormalFlag = abnormalFlag;
            CritialFlag = false;
            TechnicianId = technicianId;
            VerifiedBy = verifiedBy;
            VerifiedAt = verifiedAt;
            Notes = notes;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (19)
        public void SetLabOrderId(Guid labOrderId) { LabOrderId = labOrderId; }
        public void SetLabTestId(Guid labTestId) { LabTestId = labTestId; }
        public void SetTestName(string testName) { TestName = testName; }
        public void SetIsUrgent(bool isUrgent) { IsUrgent = isUrgent; }
        public void SetSampleCollected(bool sampleCollected) { SampleCollected = sampleCollected; }
        public void SetSampleCollectionTime(DateTime? sampleCollectionTime) { SampleCollectionTime = sampleCollectionTime; }
        public void SetSampleCollectorId(Guid? sampleCollectorId) { SampleCollectorId = sampleCollectorId; }
        public void SetTestCost(decimal testCost) { TestCost = testCost; }
        public void SetStatus(ItemStatus status) { Status = status; }
        public void SetResultValue(string? resultValue) { ResultValue = resultValue; }
        public void SetResultUnit(string? resultUnit) { ResultUnit = resultUnit; }
        public void SetReferenceRange(string? referenceRange) { ReferenceRange = referenceRange; }
        public void SetAbnormalFlag(string? abnormalFlag) { AbnormalFlag = abnormalFlag; }
        public void SetCritialFlag(bool critialFlag) { CritialFlag = critialFlag; }
        public void SetTechnicianId(Guid? technicianId) { TechnicianId = technicianId; }
        public void SetVerifiedBy(Guid? verifiedBy) { VerifiedBy = verifiedBy; }
        public void SetVerifiedAt(DateTime? verifiedAt) { VerifiedAt = verifiedAt; }
        public void SetNotes(string? notes) { Notes = notes; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
