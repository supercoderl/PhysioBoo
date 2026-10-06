namespace PhysioBoo.Domain.Entities.Inpatient
{
    public class TreatmentOrder : TenantEntity
    {
        #region Core TreatmentOrder Table (10)
        public Guid PatientId { get; private set; }
        public TreatmentOrderType OrderType { get; private set; }
        public string OrderName { get; private set; }
        public TreatmentOrderPriority Priority { get; private set; }
        public string? Frequency { get; private set; }
        public DateTime StartTime { get; private set; }
        public DateTime? EndTime { get; private set; }
        public string OrderingDoctorName { get; private set; }
        public TreatmentOrderStatus Status { get; private set; }
        #endregion

        #region Constructor (10)
        public TreatmentOrder(
            Guid id,
            Guid patientId,
            TreatmentOrderType orderType,
            string orderName,
            TreatmentOrderPriority priority,
            string? frequency,
            DateTime startTime,
            DateTime? endTime,
            string orderingDoctorName,
            TreatmentOrderStatus status
        ) : base(id)
        {
            PatientId = patientId;
            OrderType = orderType;
            OrderName = orderName;
            Priority = priority;
            Frequency = frequency;
            StartTime = startTime;
            EndTime = endTime;
            OrderingDoctorName = orderingDoctorName;
            Status = status;
        }
        #endregion

        #region Setter Methods (10)
        public void SetOrderType(TreatmentOrderType orderType) { OrderType = orderType; }
        public void SetOrderName(string orderName) { OrderName = orderName; }
        public void SetPriority(TreatmentOrderPriority priority) { Priority = priority; }
        public void SetFrequency(string? frequency) { Frequency = frequency; }
        public void SetStartTime(DateTime startTime) { StartTime = startTime; }
        public void SetEndTime(DateTime? endTime) { EndTime = endTime; }
        public void SetOrderingDoctorName(string orderingDoctorName) { OrderingDoctorName = orderingDoctorName; }
        public void SetStatus(TreatmentOrderStatus status) { Status = status; }
        #endregion
    }
}
