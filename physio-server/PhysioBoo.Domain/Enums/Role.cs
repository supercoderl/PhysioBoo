using PhysioBoo.SharedKernel.Attributes;

namespace PhysioBoo.Domain.Enums
{
    public enum Role
    {
        [RoleMetadata("Super Administrator", "Full system access", true)]
        SUPER_ADMIN,

        [RoleMetadata("Administrator", "System management & configuration")]
        ADMIN,

        [RoleMetadata("Nurse", "Nursing and patient care operations")]
        NURSE,

        [RoleMetadata("Pharmacist", "Drug management & dispensing")]
        PHAMACIST,

        [RoleMetadata("Cashier", "Billing & payment handling")]
        CASHIER,

        [RoleMetadata("Lab Technician", "Lab tests & results processing")]
        LAB_TECHNICIAN,

        [RoleMetadata("Radiologist", "Radiology reporting")]
        RADIOLOGIST,

        [RoleMetadata("Receptionist", "Front desk & appointment handling")]
        RECEPTIONIST,

        [RoleMetadata("Accountant", "Finance and invoice management")]
        ACCOUNTANT,

        [RoleMetadata("Inventory Manager", "Warehouse & inventory operations")]
        INVENTORY_MANAGER,

        [RoleMetadata("IT Support", "Technical system support")]
        IT_SUPPORT,

        [RoleMetadata("Doctor", "Medical diagnosis and treatment", isPublicForRegistration: true)]
        DOCTOR,

        [RoleMetadata("Patient", "Health service users and personal records tracking.", isPublicForRegistration: true)]
        PATIENT
    }
}
