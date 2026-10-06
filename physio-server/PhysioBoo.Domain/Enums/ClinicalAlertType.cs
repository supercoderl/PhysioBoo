namespace PhysioBoo.Domain.Enums
{
    // Superset of the nursing set (FallRisk, Isolation, Emergency, Allergy, AbnormalVitals)
    // and the treatment-sheet set (Allergy, DrugInteraction, AbnormalLab, CriticalVitals,
    // InfectionControl, Isolation, PendingCriticalOrder).
    public enum ClinicalAlertType
    {
        FallRisk,
        Isolation,
        Emergency,
        Allergy,
        AbnormalVitals,
        DrugInteraction,
        AbnormalLab,
        CriticalVitals,
        InfectionControl,
        PendingCriticalOrder
    }
}
