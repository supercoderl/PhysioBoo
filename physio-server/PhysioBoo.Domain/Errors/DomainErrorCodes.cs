namespace PhysioBoo.Domain.Errors
{
    public static class DomainErrorCodes
    {
        public static class User
        {
            // User Validation
            public const string EmptyId = "USER_EMPTY_ID";
            public const string EmptyFirstName = "USER_EMPTY_FIRST_NAME";
            public const string EmptyLastName = "USER_EMPTY_LAST_NAME";
            public const string EmptyEmail = "USER_EMPTY_EMAIL";
            public const string EmptyPhone = "USER_EMPTY_PHONE";
            public const string EmailExceedsMaxLength = "USER_EMAIL_EXCEEDS_MAX_LENGTH";
            public const string FirstNameExceedsMaxLength = "USER_FIRST_NAME_EXCEEDS_MAX_LENGTH";
            public const string LastNameExceedsMaxLength = "USER_LAST_NAME_EXCEEDS_MAX_LENGTH";
            public const string InvalidEmail = "USER_INVALID_EMAIL";
            public const string InvalidRole = "USER_INVALID_ROLE";

            // User Password Validation
            public const string EmptyPassword = "USER_PASSWORD_MAY_NOT_BE_EMPTY";
            public const string ShortPassword = "USER_PASSWORD_MAY_NOT_BE_SHORTER_THAN_6_CHARACTERS";
            public const string LongPassword = "USER_PASSWORD_MAY_NOT_BE_LONGER_THAN_50_CHARACTERS";
            public const string UppercaseLetterPassword = "USER_PASSWORD_MUST_CONTAIN_A_UPPERCASE_LETTER";
            public const string LowercaseLetterPassword = "USER_PASSWORD_MUST_CONTAIN_A_LOWERCASE_LETTER";
            public const string NumberPassword = "USER_PASSWORD_MUST_CONTAIN_A_NUMBER";
            public const string SpecialCharPassword = "USER_PASSWORD_MUST_CONTAIN_A_SPECIAL_CHARACTER";

            // General
            public const string AlreadyExists = "USER_ALREADY_EXISTS";
            public const string PasswordIncorrect = "USER_PASSWORD_INCORRECT";
        }

        public static class VerificationToken
        {
            // Token Validation
            public const string EmptyToken = "VERIFICATION_TOKEN_EMPTY_TOKEN";
        }

        public static class RefreshToken
        {
            // Token Refreshing
            public const string EmptyUserId = "REFRESH_TOKEN_EMPTY_USER_ID";
            public const string EmptyToken = "REFRESH_TOKEN_EMPTY_TOKEN";
        }

        public static class Address
        {
            // Address
            public const string EmptyId = "ADDRESS_EMPTY_ID";
            public const string EmptyStreet = "ADDRESS_EMPTY_STREET";
            public const string EmptyCity = "ADDRESS_EMPTY_CITY";
            public const string EmptyStateProvince = "ADDRESS_EMPTY_STATE_PROVINCE";
            public const string EmptyCountry = "ADDRESS_EMPTY_COUNTRY";
            public const string InvalidGeographicCoordinate = "ADDRESS_INVALID_GEOGRAPHIC_COORDINATE";
        }

        public static class Appointment
        {
            // Appointment Validation
            public const string EmptyPatientId = "APPOINTMENT_EMPTY_PATIENT_ID";
            public const string EmptyDoctorId = "APPOINTMENT_EMPTY_DOCTOR_ID";
            public const string EmptyHospitalId = "APPOINTMENT_EMPTY_HOSPITAL_ID";
            public const string EmptyDepartmentId = "APPOINTMENT_EMPTY_DEPARTMENT_ID";
            public const string EmptyAppointmentTypeId = "APPOINTMENT_EMPTY_APPOINTMENT_ID";
        }

        public static class AppointmentType
        {
            // Appointment Type Validation
            public const string EmptyId = "APPOINTMENT_TYPE_EMPTY_ID";
            public const string EmptyName = "APPOINTMENT_TYPE_EMPTY_NAME";
        }

        public static class BillItem
        {
            // Bill Item Validation
            public const string EmptyBillId = "BILL_ITEM_EMPTY_BILL_ID";
        }

        public static class Bill
        {
            // Bill Validation
            public const string EmptyPatientId = "BILL_EMPTY_PATIENT_ID";
            public const string EmptyAppointmentId = "BILL_EMPTY_APPOINTMENT_ID";
            public const string EmptyHospitalId = "BILL_EMPTY_HOSPITAL_ID";
            public const string EmptyDepartmentId = "BILL_EMPTY_DEPARTMENT_ID";
        }

        public static class Department
        {
            // Department Validation
            public const string EmptyHospitalId = "DEPARTMENT_EMPTY_HOSPITAL_ID";
            public const string EmptyName = "DEPARTMENT_EMPTY_NAME";
        }

        public static class DoctorAward
        {
            // Doctor Award Validation
            public const string EmptyDoctorId = "DOCTOR_AWARD_EMPTY_DOCTOR_ID";
            public const string EmptyAwardName = "DOCTOR_AWARD_EMPTY_AWARD_NAME";
        }

        public static class DoctorCertification
        {
            // Doctor Certification Validation
            public const string EmptyDoctorId = "DOCTOR_CERTIFICATION_EMPTY_DOCTOR_ID";
            public const string EmptyCertificationName = "DOCTOR_CERTIFICATION_EMPTY_CERTIFICATION_NAME";
            public const string EmptyIssuingOrganization = "DOCTOR_CERTIFICATION_EMPTY_ISSUING_ORGANIZATION";
        }

        public static class DoctorEducation
        {
            // Doctor Certification Validation
            public const string EmptyDoctorId = "DOCTOR_EDUCATION_EMPTY_DOCTOR_ID";
            public const string EmptyDegreeType = "DOCTOR_EDUCATION_EMPTY_DEGREE_TYPE";
            public const string EmptyDegreeName = "DOCTOR_EDUCATION_EMPTY_DEGREE_NAME";
            public const string EmptyInstitutionName = "DOCTOR_EDUCATION_EMPTY_INSTITUTION_NAME";
        }

        public static class DoctorLeave
        {
            // Doctor Leave Validation
            public const string EmptyDoctorId = "DOCTOR_LEAVE_EMPTY_DOCTOR_ID";
        }

        public static class DoctorPublication
        {
            // Doctor Publication Validation
            public const string EmptyId = "DOCTOR_PUBLICATION_EMPTY_ID";
            public const string EmptyDoctorId = "DOCTOR_PUBLICATION_EMPTY_DOCTOR_ID";
            public const string EmptyTitle = "DOCTOR_PUBLICATION_EMPTY_TITLE";
            public const string EmptyKeywords = "DOCTOR_PUBLICATION_EMPTY_KEYWORDS";
        }

        public static class Doctor
        {
            // Doctor Validation
            public const string EmptyMedicalLicenseNumber = "DOCTOR_EMPTY_MEDICAL_LICENSE_NUMBER";
        }

        public static class DoctorSchedule
        {
            // Doctor Schedule Validation
            public const string EmptyId = "DOCTOR_SCHEDULE_EMPTY_ID";
            public const string EmptyDoctorId = "DOCTOR_SCHEDULE_EMPTY_DOCTOR_ID";
            public const string EmptyHospitalId = "DOCTOR_SCHEDULE_EMPTY_HOSPITAL_ID";
            public const string EmptyDepartmentId = "DOCTOR_SCHEDULE_EMPTY_DEPARTMENT_ID";
        }

        public static class DoctorSpecialty
        {
            // Doctor Specialty Validation
            public const string EmptyId = "DOCTOR_SPECIALTY_EMPTY_ID";
            public const string EmptyDoctorId = "DOCTOR_SPECIALTY_EMPTY_DOCTOR_ID";
            public const string EmptySpecialtyId = "DOCTOR_SPECIALTY_EMPTY_SPECIALTY_ID";
        }

        public static class DoctorWorkExperience
        {
            // Doctor Work Experience Validation
            public const string EmptyId = "DOCTOR_WORK_EXPERIENCE_EMPTY_ID";
            public const string EmptyDoctorId = "DOCTOR_WORK_EXPERIENCE_EMPTY_DOCTOR_ID";
            public const string EmptyPositionTitle = "DOCTOR_WORK_EXPERIENCE_EMPTY_POSITION_TITLE";
            public const string EmptyOrganizationName = "DOCTOR_WORK_EXPERIENCE_EMPTY_ORGANIZATION_NAME";
        }

        public static class HospitalGroup
        {
            // Hospital Group Validation
            public const string EmptyId = "HOSPITAL_GROUP_EMPTY_ID";
            public const string EmptyName = "HOSPITAL_GROUP_EMPTY_NAME";
        }

        public static class Hospital
        {
            // Hospital Validation
            public const string EmptyId = "HOSPITAL_EMPTY_ID";
            public const string EmptyHospitalGroupId = "HOSPITAL_EMPTY_HOSPITAL_GROUP_ID";
            public const string EmptyName = "HOSPITAL_EMPTY_NAME";
            public const string EmptyAddress = "HOSPITAL_EMPTY_ADDRESS";
            public const string EmptyCity = "HOSPITAL_EMPTY_CITY";
            public const string EmptyStateProvince = "HOSPITAL_EMPTY_STATE_PROVINCE";
            public const string EmptyCountry = "HOSPITAL_EMPTY_COUNTRY";
            public const string EmptyAccreditationBody = "HOSPITAL_EMPTY_ACCREDITATION_BODY";
            public const string EmptyInsuranceAccepted = "HOSPITAL_EMPTY_INSURANCE_ACCEPTED";
            public const string EmptyLanguagesSupported = "HOSPITAL_EMPTY_LANGUAGES_SUPPORTED";
        }

        public static class HospitalStaff
        {
            // Hospital Staff Validation
            public const string EmptyId = "HOSPITAL_STAFF_EMPTY_ID";
            public const string EmptyEmployeeId = "HOSPITAL_STAFF_EMPTY_EMPLOYEE_ID";
            public const string EmptyHospitalId = "HOSPITAL_STAFF_EMPTY_HOSPITAL_ID";
            public const string EmptyDepartmentId = "HOSPITAL_STAFF_EMPTY_DEPARTMENT_ID";
        }

        public static class ImagingModality
        {
            // Imaging Modality Validation
            public const string EmptyId = "IMAGING_MODALITY_EMPTY_ID";
            public const string EmptyName = "IMAGING_MODALITY_EMPTY_NAME";
        }

        public static class ImagingOrder
        {
            // Imaging Order Validation
            public const string EmptyId = "IMAGING_ORDER_EMPTY_ID";
            public const string EmptyPatientId = "IMAGING_ORDER_EMPTY_PATIENT_ID";
            public const string EmptyDoctorId = "IMAGING_ORDER_EMPTY_DOCTOR_ID";
            public const string EmptyAppointmentId = "IMAGING_ORDER_EMPTY_APPOINTMENT_ID";
            public const string EmptyHospitalId = "IMAGING_ORDER_EMPTY_HOSPITAL_ID";
            public const string EmptyModalityId = "IMAGING_ORDER_EMPTY_MODALITY_ID";
        }

        public static class ImagingReport
        {
            // Imaging Report Validation
            public const string EmptyId = "IMAGING_REPORT_EMPTY_ID";
            public const string EmptyImagingOrderId = "IMAGING_REPORT_EMPTY_IMAGING_ORDER_ID";
            public const string EmptyPatientId = "IMAGING_REPORT_EMPTY_PATIENT_ID";
        }

        public static class InsuranceCompany
        {
            // Insurance Company Validation
            public const string EmptyId = "INSURANCE_COMPANY_EMPTY_ID";
            public const string EmptyName = "INSURANCE_COMPANY_EMPTY_NAME";
            public const string EmptyRequiredDocuments = "INSURANCE_COMPANY_EMPTY_REQUIRED_DOCUMENTS";
        }

        public static class LabOrderItem
        {
            // Lab Order Item Validation
            public const string EmptyId = "LAB_ORDER_ITEM_EMPTY_ID";
            public const string EmptyLabOrderId = "LAB_ORDER_ITEM_EMPTY_LAB_ORDER_ID";
            public const string EmptyLabTestId = "LAB_ORDER_ITEM_EMPTY_LAB_TEST_ID";
            public const string EmptyTestName = "LAB_ORDER_ITEM_EMPTY_TEST_NAME";
        }

        public static class LabOrder
        {
            // Lab Order Validation
            public const string EmptyId = "LAB_ORDER_EMPTY_ID";
            public const string EmptyOrderNumber = "LAB_ORDER_EMPTY_ORDER_NUMBER";
            public const string EmptyPatientId = "LAB_ORDER_EMPTY_PATIENT_ID";
            public const string EmptyDoctorId = "LAB_ORDER_EMPTY_DOCTOR_ID";
            public const string EmptyAppointmentId = "LAB_ORDER_EMPTY_APPOINTMENT_ID";
            public const string EmptyHospitalId = "LAB_ORDER_EMPTY_HOSPITAL_ID";
        }

        public static class LabReport
        {
            // Lab Report Validation
            public const string EmptyId = "LAB_REPORT_EMPTY_ID";
            public const string EmptyLabOrderId = "LAB_REPORT_EMPTY_LAB_ORDER_ID";
            public const string EmptyPatientId = "LAB_REPORT_EMPTY_PATIENT_ID";
            public const string EmptyDoctorId = "LAB_REPORT_EMPTY_DOCTOR_ID";
            public const string EmptyPathologistId = "LAB_REPORT_EMPTY_PATHOLOGIST_ID";
            public const string EmptyOriginalReportId = "LAB_REPORT_EMPTY_ORIGINAL_REPORT_ID";
        }

        public static class LabTestCategory
        {
            // Lab Test Category Validation
            public const string EmptyId = "LAB_TEST_CATEGORY_EMPTY_ID";
            public const string EmptyName = "LAB_TEST_CATEGORY_EMPTY_NAME";
        }

        public static class LabTest
        {
            // Lab Test Validation
            public const string EmptyId = "LAB_TEST_EMPTY_ID";
            public const string EmptyTestName = "LAB_TEST_EMPTY_TEST_NAME";
            public const string EmptyCategoryId = "LAB_TEST_EMPTY_CATEGORY_ID";
        }

        public static class Manufacturer
        {
            // Manufacturer Validation
            public const string EmptyId = "MANUFACTURER_EMPTY_ID";
            public const string EmptyName = "MANUFACTURER_EMPTY_NAME";
        }

        public static class MedicalRecord
        {
            // Medical Record Validation
            public const string EmptyId = "MEDICAL_RECORD_EMPTY_ID";
            public const string EmptyRecordNumber = "MEDICAL_RECORD_EMPTY_RECORD_NUMBER";
            public const string EmptyPatientId = "MEDICAL_RECORD_EMPTY_PATIENT_ID";
            public const string EmptyAppointmentId = "MEDICAL_RECORD_EMPTY_APPOINTMENT_ID";
            public const string EmptyDoctorId = "MEDICAL_RECORD_EMPTY_DOCTOR_ID";
            public const string EmptyHospitalId = "MEDICAL_RECORD_EMPTY_HOSPITAL_ID";
            public const string EmptyIcd10Codes = "MEDICAL_RECORD_EMPTY_ICD10_CODES";
        }

        public static class MedicalSpecialty
        {
            // Medical Specialty Validation
            public const string EmptyId = "MEDICAL_SPECIALTY_EMPTY_ID";
            public const string EmptyName = "MEDICAL_SPECIALTY_EMPTY_NAME";
        }

        public static class MedicineCategory
        {
            // Medicine Category Validation
            public const string EmptyId = "MEDICINE_CATEGORY_EMPTY_ID";
            public const string EmptyName = "MEDICINE_CATEGORY_EMPTY_NAME";
        }

        public static class MedicineInventory
        {
            // Medicine Inventory Validation
            public const string EmptyId = "MEDICINE_INVENTORY_EMPTY_ID";
            public const string EmptyMedicineId = "MEDICINE_INVENTORY_EMPTY_MEDICINE_ID";
            public const string EmptyHospitalId = "MEDICINE_INVENTORY_EMPTY_HOSPITAL_ID";
            public const string EmptySupplierId = "MEDICINE_INVENTORY_EMPTY_SUPPLIER_ID";
        }

        public static class Medicine
        {
            // Medicine Validation
            public const string EmptyId = "MEDICINE_EMPTY_ID";
            public const string EmptyName = "MEDICINE_EMPTY_NAME";
            public const string EmptyCategoryId = "MEDICINE_EMPTY_CATEGORY_ID";
            public const string EmptyManufacturerId = "MEDICINE_EMPTY_MANUFACTURER_ID";
            public const string EmptyWarningLabels = "MEDICINE_EMPTY_WARNING_LABELS";
        }

        public static class PatientAllergy
        {
            // Patient Allergy Validation
            public const string EmptyId = "PATIENT_ALLERGY_EMPTY_ID";
            public const string EmptyPatientId = "PATIENT_ALLERGY_EMPTY_PATIENT_ID";
            public const string EmptyAllergenName = "PATIENT_ALLERGY_EMPTY_ALLERGEN_NAME";
        }

        public static class PatientMedicalHistory
        {
            // Patient Medication History Validation
            public const string EmptyId = "PATIENT_MEDICAL_HISTORY_EMPTY_ID";
            public const string EmptyPatientId = "PATIENT_MEDICAL_HISTORY_EMPTY_PATIENT_ID";
            public const string EmptyConditionName = "PATIENT_MEDICAL_HISTORY_EMPTY_CONDITION_NAME";
        }

        public static class Patient
        {
            // Patient Validation
            public const string EmptyPrimaryDoctorId = "PATIENT_EMPTY_PRIMARY_DOCTOR_ID";
        }

        public static class Payment
        {
            // Payment Validation
            public const string EmptyId = "PAYMENT_EMPTY_ID";
            public const string EmptyPaymentNumber = "PAYMENT_EMPTY_PAYMENT_NUMBER";
            public const string EmptyBillId = "PAYMENT_EMPTY_BILL_ID";
            public const string EmptyPatientId = "PAYMENT_EMPTY_PATIENT_ID";
        }

        public static class PrescriptionItem
        {
            // Prescription Item Validation
            public const string EmptyId = "PRESCRIPTION_ITEM_EMPTY_ID";
            public const string EmptyPrescriptionId = "PRESCRIPTION_ITEM_EMPTY_PRESCRIPTION_ID";
            public const string EmptyMedicineId = "PRESCRIPTION_ITEM_EMPTY_MEDICINE_ID";
            public const string EmptyMedicineName = "PRESCRIPTION_ITEM_EMPTY_MEDICINE_NAME";
            public const string EmptyDosageInstructions = "PRESCRIPTION_ITEM_EMPTY_DOSAGE_INSTRUCTIONS";
            public const string EmptyFrequency = "PRESCRIPTION_ITEM_EMPTY_FREQUENCY";
        }

        public static class Prescription
        {
            // Prescription Validation
            public const string EmptyId = "PRESCRIPTION_EMPTY_ID";
            public const string EmptyPrescriptionNumber = "PRESCRIPTION_EMPTY_NUMBER";
            public const string EmptyPatientId = "PRESCRIPTION_EMPTY_PATIENT_ID";
            public const string EmptyDoctorId = "PRESCRIPTION_EMPTY_DOCTOR_ID";
            public const string EmptyAppoinmentId = "PRESCRIPTION_EMPTY_APPOINMENT_ID";
            public const string EmptyMedicalRecordId = "PRESCRIPTION_EMPTY_MEDICAL_RECORD_ID";
            public const string EmptyHospitalId = "PRESCRIPTION_EMPTY_HOSPITAL_ID";
        }

        public static class Profile
        {
            // Profile Validation
            public const string EmptyFirstName = "PROFILE_EMPTY_FIRST_NAME";
            public const string EmptyLastName = "PROFILE_EMPTY_LAST_NAME";
            public const string EmptyMiddleName = "PROFILE_EMPTY_MIDDLE_NAME";
        }

        public static class Review
        {
            // Review Validation
            public const string EmptyId = "REVIEW_EMPTY_ID";
            public const string EmptyEntityId = "REVIEW_EMPTY_ENTITY_ID";
        }

        public static class Supplier
        {
            // Supplier Validation
            public const string EmptyId = "SUPPLIER_EMPTY_ID";
            public const string EmptySupplierName = "SUPPLIER_EMPTY_SUPPLIER_NAME";
            public const string EmptyAddress = "SUPPLIER_EMPTY_ADDRESS";
            public const string EmptyCity = "SUPPLIER_EMPTY_CITY";
            public const string EmptyStateProvince = "SUPPLIER_EMPTY_STATE_PROVINCE";
            public const string EmptyCountry = "SUPPLIER_EMPTY_COUNTRY";
        }

        public static class Role
        {
            // Role Validation
            public const string EmptyId = "ROLE_EMPTY_ID";
            public const string EmptyName = "ROLE_EMPTY_NAME";
            public const string EmptyCode = "ROLE_EMPTY_CODE";
        }

        public static class Permission
        {
            // Permission Validation
            public const string EmptyId = "PERMISSION_EMPTY_ID";
            public const string EmptyName = "PERMISSION_EMPTY_NAME";
            public const string EmptyCode = "PERMISSION_EMPTY_CODE";
        }

        public static class UserLogin
        {
            // User Login Validation
            public const string EmptyId = "USERLOGIN_EMPTY_ID";
            public const string EmptyLoginProvider = "USERLOGIN_EMPTY_LOGIN_PROVIDER";
            public const string EmptyProviderKey = "USERLOGIN_EMPTY_PROVIDER_KEY";
        }

        public static class AdminMenu
        {
            // Admin Menu Validation
            public const string EmptyId = "ADMIN_MENU_EMPTY_ID";
            public const string EmptyLabel = "ADMIN_MENU_EMPTY_LABEL";
            public const string EmptyIcon = "ADMIN_MENU_EMPTY_ICON";
            public const string EmptyRoute = "ADMIN_MENU_EMPTY_ROUTE";
            public const string InvalidOrder = "ADMIN_MENU_INVALID_ORDER";
            public const string EmptyPermissionCode = "ADMIN_MENU_EMPTY_PERMISSION_CODE";
        }
    }
}
