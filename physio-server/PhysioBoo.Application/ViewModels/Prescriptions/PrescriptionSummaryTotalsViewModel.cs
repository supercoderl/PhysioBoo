namespace PhysioBoo.Application.ViewModels.Prescriptions
{
    public sealed class PrescriptionSummaryTotalsViewModel
    {
        public decimal TotalCost { get; set; }
        public decimal InsuranceCoverageAmount { get; set; }
        public decimal InsuranceCoveragePercent { get; set; }
        public decimal PatientPayment { get; set; }
        public string Currency { get; set; } = "VND";
    }
}
