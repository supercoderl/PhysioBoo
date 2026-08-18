namespace PhysioBoo.Domain.Constants
{
    public static class Permissions
    {
        public static class Reception
        {
            public const string PatientRegister = "reception:patient:register";
            public const string PatientRead = "reception:patient:read";
            public const string PatientUpdate = "reception:patient:update";
            public const string PatientDelete = "reception:patient:delete";
            public const string BookingRead = "reception:booking:read";
            public const string BookingCreate = "reception:booking:create";
            public const string BookingUpdate = "reception:booking:update";
            public const string BookingCancel = "reception:booking:cancel";
            public const string QueueRead = "reception:queue:read";
            public const string QueueCheckin = "reception:queue:checkin";
            public const string QueueManage = "reception:queue:manage";
        }

        public static class Scheduling
        {
            public const string AppointmentRead = "scheduling:appointment:read";
            public const string AppointmentCreate = "scheduling:appointment:create";
            public const string AppointmentUpdate = "scheduling:appointment:update";
            public const string AppointmentCancel = "scheduling:appointment:cancel";
            public const string AppointmentTypeRead = "scheduling:appointment-type:read";
            public const string AppointmentTypeCreate = "scheduling:appointment-type:create";
            public const string AppointmentTypeUpdate = "scheduling:appointment-type:update";
            public const string AppointmentTypeDelete = "scheduling:appointment-type:delete";
            public const string DoctorScheduleRead = "scheduling:doctor-schedule:read";
            public const string DoctorScheduleCreate = "scheduling:doctor-schedule:create";
            public const string DoctorLeaveRead = "scheduling:doctor-leave:read";
            public const string DoctorLeaveCreate = "scheduling:doctor-leave:create";
            public const string EncounterComplete = "scheduling:encounter:complete";
        }

        public static class Clinical
        {
            public const string MedicalRecordRead = "clinical:medical-record:read";
            public const string MedicalRecordCreate = "clinical:medical-record:create";
            public const string MedicalRecordViewAllergies = "clinical:medical-record:view-allergies";
            public const string MedicalRecordViewDiagnoses = "clinical:medical-record:view-diagnoses";
            public const string MedicalRecordViewPrescriptions = "clinical:medical-record:view-prescriptions";
            public const string MedicalRecordViewLab = "clinical:medical-record:view-lab";
            public const string MedicalRecordViewImaging = "clinical:medical-record:view-imaging";
            public const string MedicalRecordViewNotes = "clinical:medical-record:view-notes";
            public const string MedicalRecordViewBilling = "clinical:medical-record:view-billing";
            public const string AllergyRead = "clinical:allergy:read";
            public const string AllergyCreate = "clinical:allergy:create";
            public const string MedicalHistoryRead = "clinical:medical-history:read";
            public const string MedicalHistoryCreate = "clinical:medical-history:create";
            public const string DoctorDeskRead = "clinical:doctor-desk:read";
        }

        public static class Pharmacy
        {
            public const string MedicineRead = "pharmacy:medicine:read";
            public const string MedicineCreate = "pharmacy:medicine:create";
            public const string MedicineUpdate = "pharmacy:medicine:update";
            public const string MedicineDelete = "pharmacy:medicine:delete";
            public const string MedicineCategoryRead = "pharmacy:medicine-category:read";
            public const string MedicineCategoryCreate = "pharmacy:medicine-category:create";
            public const string MedicineCategoryUpdate = "pharmacy:medicine-category:update";
            public const string MedicineCategoryDelete = "pharmacy:medicine-category:delete";
            public const string MedicineInventoryRead = "pharmacy:medicine-inventory:read";
            public const string MedicineInventoryCreate = "pharmacy:medicine-inventory:create";
            public const string ManufacturerRead = "pharmacy:manufacturer:read";
            public const string ManufacturerCreate = "pharmacy:manufacturer:create";
            public const string ManufacturerUpdate = "pharmacy:manufacturer:update";
            public const string ManufacturerDelete = "pharmacy:manufacturer:delete";
            public const string SupplierRead = "pharmacy:supplier:read";
            public const string SupplierCreate = "pharmacy:supplier:create";
            public const string SupplierUpdate = "pharmacy:supplier:update";
            public const string SupplierDelete = "pharmacy:supplier:delete";
            public const string PrescriptionRead = "pharmacy:prescription:read";
            public const string PrescriptionCreate = "pharmacy:prescription:create";
            public const string PrescriptionItemRead = "pharmacy:prescription-item:read";
            public const string PrescriptionItemCreate = "pharmacy:prescription-item:create";
        }

        public static class Lab
        {
            public const string LabTestRead = "lab:lab-test:read";
            public const string LabTestCreate = "lab:lab-test:create";
            public const string LabTestUpdate = "lab:lab-test:update";
            public const string LabTestDelete = "lab:lab-test:delete";
            public const string LabTestCategoryRead = "lab:lab-test-category:read";
            public const string LabTestCategoryCreate = "lab:lab-test-category:create";
            public const string LabTestCategoryUpdate = "lab:lab-test-category:update";
            public const string LabTestCategoryDelete = "lab:lab-test-category:delete";
            public const string LabTestCategoryLookup = "lab:lab-test-category:lookup";
            public const string LabOrderRead = "lab:lab-order:read";
            public const string LabOrderCreate = "lab:lab-order:create";
            public const string LabOrderItemRead = "lab:lab-order-item:read";
            public const string LabOrderItemCreate = "lab:lab-order-item:create";
            public const string LabReportRead = "lab:lab-report:read";
            public const string LabReportCreate = "lab:lab-report:create";
        }

        public static class Imaging
        {
            public const string ImagingOrderRead = "imaging:imaging-order:read";
            public const string ImagingOrderCreate = "imaging:imaging-order:create";
            public const string ImagingReportRead = "imaging:imaging-report:read";
            public const string ImagingReportCreate = "imaging:imaging-report:create";
            public const string ImagingModalityRead = "imaging:imaging-modality:read";
            public const string ImagingModalityCreate = "imaging:imaging-modality:create";
            public const string ImagingModalityUpdate = "imaging:imaging-modality:update";
            public const string ImagingModalityDelete = "imaging:imaging-modality:delete";
        }

        public static class Billing
        {
            public const string BillRead = "billing:bill:read";
            public const string BillCreate = "billing:bill:create";
            public const string BillItemRead = "billing:bill-item:read";
            public const string BillItemCreate = "billing:bill-item:create";
            public const string PaymentRead = "billing:payment:read";
            public const string PaymentCreate = "billing:payment:create";
        }

        public static class Hr
        {
            public const string DoctorRead = "hr:doctor:read";
            public const string DoctorRegister = "hr:doctor:register";
            public const string DoctorUpdate = "hr:doctor:update";
            public const string DoctorDelete = "hr:doctor:delete";
            public const string DoctorEducationRead = "hr:doctor-education:read";
            public const string DoctorEducationCreate = "hr:doctor-education:create";
            public const string DoctorPublicationRead = "hr:doctor-publication:read";
            public const string DoctorPublicationCreate = "hr:doctor-publication:create";
            public const string DoctorSpecialtyRead = "hr:doctor-specialty:read";
            public const string DoctorSpecialtyCreate = "hr:doctor-specialty:create";
            public const string DoctorWorkExperienceRead = "hr:doctor-work-experience:read";
            public const string DoctorWorkExperienceCreate = "hr:doctor-work-experience:create";
            public const string DoctorAwardRead = "hr:doctor-award:read";
            public const string DoctorAwardCreate = "hr:doctor-award:create";
            public const string DoctorCertificationRead = "hr:doctor-certification:read";
            public const string DoctorCertificationCreate = "hr:doctor-certification:create";
            public const string HospitalStaffRead = "hr:hospital-staff:read";
            public const string HospitalStaffCreate = "hr:hospital-staff:create";
        }

        public static class Admin
        {
            public const string HospitalRead = "admin:hospital:read";
            public const string HospitalCreate = "admin:hospital:create";
            public const string HospitalUpdate = "admin:hospital:update";
            public const string HospitalDelete = "admin:hospital:delete";
            public const string HospitalGroupRead = "admin:hospital-group:read";
            public const string HospitalGroupCreate = "admin:hospital-group:create";
            public const string HospitalGroupUpdate = "admin:hospital-group:update";
            public const string HospitalGroupDelete = "admin:hospital-group:delete";
            public const string DepartmentRead = "admin:department:read";
            public const string DepartmentCreate = "admin:department:create";
            public const string DepartmentUpdate = "admin:department:update";
            public const string DepartmentDelete = "admin:department:delete";
            public const string MedicalSpecialtyRead = "admin:medical-specialty:read";
            public const string MedicalSpecialtyCreate = "admin:medical-specialty:create";
            public const string MedicalSpecialtyUpdate = "admin:medical-specialty:update";
            public const string MedicalSpecialtyDelete = "admin:medical-specialty:delete";
            public const string InsuranceCompanyRead = "admin:insurance-company:read";
            public const string InsuranceCompanyCreate = "admin:insurance-company:create";
            public const string InsuranceCompanyUpdate = "admin:insurance-company:update";
            public const string InsuranceCompanyDelete = "admin:insurance-company:delete";
            public const string AddressRead = "admin:address:read";
            public const string AddressCreate = "admin:address:create";
            public const string AddressUpdate = "admin:address:update";
            public const string AddressDelete = "admin:address:delete";
            public const string AdminMenuRead = "admin:admin-menu:read";
            public const string AdminMenuCreate = "admin:admin-menu:create";
            public const string AdminMenuUpdate = "admin:admin-menu:update";
            public const string AdminMenuDelete = "admin:admin-menu:delete";
            public const string PrintTemplateManage = "admin:print-template:manage";
            public const string PrintTemplateRender = "admin:print-template:render";
            public const string SequenceTrackerRead = "admin:sequence-tracker:read";
            public const string SequenceTrackerCreate = "admin:sequence-tracker:create";
            public const string SequenceTrackerUpdate = "admin:sequence-tracker:update";
            public const string SequenceTrackerDelete = "admin:sequence-tracker:delete";
        }

        public static class Iam
        {
            public const string UserRead = "iam:user:read";
            public const string UserUpdate = "iam:user:update";
            public const string UserDelete = "iam:user:delete";
            public const string UserAssignRole = "iam:user:assign-role";
            public const string RoleRead = "iam:role:read";
            public const string RoleCreate = "iam:role:create";
            public const string RoleUpdate = "iam:role:update";
            public const string RoleDelete = "iam:role:delete";
            public const string RoleAssignPermission = "iam:role:assign-permission";
            public const string RoleRevokePermission = "iam:role:revoke-permission";
            public const string PermissionRead = "iam:permission:read";
            public const string PermissionCreate = "iam:permission:create";
            public const string PermissionUpdate = "iam:permission:update";
            public const string PermissionDelete = "iam:permission:delete";
        }

        public static class System
        {
            public const string ConfigRead = "system:config:read";
            public const string ConfigManage = "system:config:manage";
            public const string ResourceRead = "system:resource:read";
            public const string ResourceImport = "system:resource:import";
            public const string SecurityBlockIp = "system:security:block-ip";
            public const string SecurityUnblockIp = "system:security:unblock-ip";
            public const string DevAccess = "system:dev:access";
        }

        public static class Portal
        {
            public const string ReviewRead = "portal:review:read";
            public const string ReviewCreate = "portal:review:create";
            public const string ProfileRead = "portal:profile:read";
            public const string ProfileCreate = "portal:profile:create";
        }
    }
}
