namespace PhysioBoo.Domain.Errors
{
    public static class DomainErrorCodes
    {
        public static class Validation
        {
            // Generic field validation, shared by all modules
            public const string ExceedsMaxLength = "VALIDATION_EXCEEDS_MAX_LENGTH";
            public const string InvalidEmail = "VALIDATION_INVALID_EMAIL";
            public const string InvalidPhone = "VALIDATION_INVALID_PHONE";
            public const string InvalidUrl = "VALIDATION_INVALID_URL";
            public const string OutOfRange = "VALIDATION_OUT_OF_RANGE";
            public const string InvalidEnum = "VALIDATION_INVALID_ENUM";
            public const string Required = "VALIDATION_REQUIRED";
            public const string EmptyFile = "VALIDATION_EMPTY_FILE";
            public const string InvalidFileType = "VALIDATION_INVALID_FILE_TYPE";
            public const string DuplicateKey = "VALIDATION_DUPLICATE_KEY";
        }

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
            public const string PasswordTooShort = "USER_PASSWORD_TOO_SHORT";
            public const string InvalidPhone = "USER_INVALID_PHONE";
            public const string PhoneExceedsMaxLength = "USER_PHONE_EXCEEDS_MAX_LENGTH";
            public const string InvalidAlternatePhone = "USER_INVALID_ALTERNATE_PHONE";
            public const string EmptyPreferredLanguage = "USER_EMPTY_PREFERRED_LANGUAGE";
            public const string PreferredLanguageExceedsMaxLength = "USER_PREFERRED_LANGUAGE_EXCEEDS_MAX_LENGTH";
            public const string EmptyTimeZone = "USER_EMPTY_TIME_ZONE";
            public const string TimeZoneExceedsMaxLength = "USER_TIME_ZONE_EXCEEDS_MAX_LENGTH";

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
            public const string EmptyId = "DEPARTMENT_EMPTY_ID";
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
            public const string EmptyId = "DOCTOR_EMPTY_ID";
            public const string EmptyMedicalLicenseNumber = "DOCTOR_EMPTY_MEDICAL_LICENSE_NUMBER";
        }

        public static class PrintTemplate
        {
            // Print Template Validation
            public const string EmptyId = "PRINT_TEMPLATE_EMPTY_ID";
            public const string EmptyName = "PRINT_TEMPLATE_EMPTY_NAME";
        }

        public static class SequenceTracker
        {
            // Sequence Tracker Validation
            public const string EmptyId = "SEQUENCE_TRACKER_EMPTY_ID";
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

        public static class HomeSetting
        {
            public const string EmptyHospitalName = "HOME_SETTING_EMPTY_HOSPITAL_NAME";
            public const string HospitalNameExceedsMaxLength = "HOME_SETTING_HOSPITAL_NAME_EXCEEDS_MAX_LENGTH";
            public const string TagLineExceedsMaxLength = "HOME_SETTING_TAG_LINE_EXCEEDS_MAX_LENGTH";
            public const string WelcomeMessageExceedsMaxLength = "HOME_SETTING_WELCOME_MESSAGE_EXCEEDS_MAX_LENGTH";
            public const string ContactPhoneExceedsMaxLength = "HOME_SETTING_CONTACT_PHONE_EXCEEDS_MAX_LENGTH";
            public const string ContactEmailExceedsMaxLength = "HOME_SETTING_CONTACT_EMAIL_EXCEEDS_MAX_LENGTH";
            public const string InvalidContactEmail = "HOME_SETTING_INVALID_CONTACT_EMAIL";
            public const string AddressExceedsMaxLength = "HOME_SETTING_ADDRESS_EXCEEDS_MAX_LENGTH";
        }

        public static class MedicalService
        {
            public const string EmptyCode = "MEDICAL_SERVICE_EMPTY_CODE";
            public const string CodeExceedsMaxLength = "MEDICAL_SERVICE_CODE_EXCEEDS_MAX_LENGTH";
            public const string CodeAlreadyExists = "MEDICAL_SERVICE_CODE_ALREADY_EXISTS";
            public const string EmptyName = "MEDICAL_SERVICE_EMPTY_NAME";
            public const string NameExceedsMaxLength = "MEDICAL_SERVICE_NAME_EXCEEDS_MAX_LENGTH";
            public const string InvalidPrice = "MEDICAL_SERVICE_INVALID_PRICE";
            public const string InvalidCurrency = "MEDICAL_SERVICE_INVALID_CURRENCY";
            public const string InvalidDuration = "MEDICAL_SERVICE_INVALID_DURATION";
            public const string EmptyIds = "MEDICAL_SERVICE_EMPTY_IDS";
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
            public const string EmptyBranches = "HOSPITAL_EMPTY_BRANCHES";
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

        public static class Article
        {
            // Article Validation
            public const string EmptyId = "ARTICLE_EMPTY_ID";
            public const string EmptyTitle = "ARTICLE_EMPTY_TITLE";
            public const string TitleExceedsMaxLength = "ARTICLE_TITLE_EXCEEDS_MAX_LENGTH";
            public const string EmptySlug = "ARTICLE_EMPTY_SLUG";
            public const string EmptyAuthor = "ARTICLE_EMPTY_AUTHOR";
            public const string EmptyExcerpt = "ARTICLE_EMPTY_EXCERPT";
            public const string ExcerptExceedsMaxLength = "ARTICLE_EXCERPT_EXCEEDS_MAX_LENGTH";
            public const string EmptyContent = "ARTICLE_EMPTY_CONTENT";
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
            public const string EmptyId = "PATIENT_EMPTY_ID";
        }

        public static class Payment
        {
            // Payment Validation
            public const string EmptyId = "PAYMENT_EMPTY_ID";
            public const string EmptyPaymentNumber = "PAYMENT_EMPTY_PAYMENT_NUMBER";
            public const string EmptyBillId = "PAYMENT_EMPTY_BILL_ID";
            public const string EmptyPatientId = "PAYMENT_EMPTY_PATIENT_ID";
        }

        public static class Transaction
        {
            // Transaction Validation
            public const string EmptyInvoiceNo = "TRANSACTION_EMPTY_INVOICE_NO";
            public const string EmptyGatewayProvider = "TRANSACTION_EMPTY_GATEWAY_PROVIDER";
            public const string EmptyGoodsName = "TRANSACTION_EMPTY_GOODS_NAME";
            public const string InvalidAmount = "TRANSACTION_INVALID_AMOUNT";

            // Transaction Business Rules
            public const string GatewayNotFound = "TRANSACTION_GATEWAY_NOT_FOUND";
            public const string DuplicateInvoice = "TRANSACTION_DUPLICATE_INVOICE";
            public const string NotFound = "TRANSACTION_NOT_FOUND";
            public const string MissingReference = "TRANSACTION_MISSING_REFERENCE";
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
            public const string EmptyCurrency = "SUPPLIER_EMPTY_CURRENCY";
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

        public static class TenantInvite
        {
            // Tenant Invite Validation
            public const string AlreadyUsed = "TENANT_INVITE_ALREADY_USED";
            public const string Expired = "TENANT_INVITE_EXPIRED";
            public const string EmailMismatch = "TENANT_INVITE_EMAIL_MISMATCH";
        }

        public static class Lead
        {
            // Lead Validation
            public const string EmptyName = "LEAD_EMPTY_NAME";
            public const string NameExceedsMaxLength = "LEAD_NAME_EXCEEDS_MAX_LENGTH";
            public const string EmptyPhone = "LEAD_EMPTY_PHONE";
            public const string PhoneExceedsMaxLength = "LEAD_PHONE_EXCEEDS_MAX_LENGTH";
            public const string EmptyEmail = "LEAD_EMPTY_EMAIL";
            public const string InvalidEmail = "LEAD_INVALID_EMAIL";
            public const string EmailExceedsMaxLength = "LEAD_EMAIL_EXCEEDS_MAX_LENGTH";
            public const string EmptyService = "LEAD_EMPTY_SERVICE";
            public const string EmptySource = "LEAD_EMPTY_SOURCE";
            public const string InvalidStatus = "LEAD_INVALID_STATUS";
            public const string InvalidPriority = "LEAD_INVALID_PRIORITY";
            public const string NotesExceedsMaxLength = "LEAD_NOTES_EXCEEDS_MAX_LENGTH";
            public const string EmptyId = "LEAD_EMPTY_ID";
        }

        public static class Campaign
        {
            // Campaign Validation
            public const string EmptyName = "CAMPAIGN_EMPTY_NAME";
            public const string NameExceedsMaxLength = "CAMPAIGN_NAME_EXCEEDS_MAX_LENGTH";
            public const string InvalidType = "CAMPAIGN_INVALID_TYPE";
            public const string InvalidStatus = "CAMPAIGN_INVALID_STATUS";
            public const string GoalExceedsMaxLength = "CAMPAIGN_GOAL_EXCEEDS_MAX_LENGTH";
            public const string InvalidDateRange = "CAMPAIGN_INVALID_DATE_RANGE";
            public const string NegativeBudget = "CAMPAIGN_NEGATIVE_BUDGET";
            public const string DescriptionExceedsMaxLength = "CAMPAIGN_DESCRIPTION_EXCEEDS_MAX_LENGTH";
            public const string EmptyId = "CAMPAIGN_EMPTY_ID";
        }

        public static class Ward
        {
            // Ward Validation
            public const string EmptyId = "WARD_EMPTY_ID";
            public const string EmptyName = "WARD_EMPTY_NAME";
            public const string NameExceedsMaxLength = "WARD_NAME_EXCEEDS_MAX_LENGTH";
            public const string CodeExceedsMaxLength = "WARD_CODE_EXCEEDS_MAX_LENGTH";
            public const string DuplicateCode = "WARD_DUPLICATE_CODE";
            public const string InvalidFloor = "WARD_INVALID_FLOOR";
            public const string HasBeds = "WARD_HAS_BEDS";
        }

        public static class Bed
        {
            // Bed Validation
            public const string EmptyId = "BED_EMPTY_ID";
            public const string EmptyWardId = "BED_EMPTY_WARD_ID";
            public const string EmptyNumber = "BED_EMPTY_NUMBER";
            public const string NumberExceedsMaxLength = "BED_NUMBER_EXCEEDS_MAX_LENGTH";
            public const string RoomNumberExceedsMaxLength = "BED_ROOM_NUMBER_EXCEEDS_MAX_LENGTH";
            public const string NotesExceedsMaxLength = "BED_NOTES_EXCEEDS_MAX_LENGTH";
            public const string InvalidFloor = "BED_INVALID_FLOOR";
            public const string InvalidType = "BED_INVALID_TYPE";
            public const string InvalidStatus = "BED_INVALID_STATUS";
            public const string DuplicateNumber = "BED_DUPLICATE_NUMBER";
            public const string EmptyPatientId = "BED_EMPTY_PATIENT_ID";

            // Bed Business Rules
            public const string NotAvailable = "BED_NOT_AVAILABLE";
            public const string NotOccupied = "BED_NOT_OCCUPIED";
            public const string Occupied = "BED_OCCUPIED";
            public const string PatientAlreadyAssigned = "BED_PATIENT_ALREADY_ASSIGNED";
        }

        public static class Admission
        {
            // Admission Validation
            public const string EmptyId = "ADMISSION_EMPTY_ID";
            public const string EmptyPatientId = "ADMISSION_EMPTY_PATIENT_ID";
            public const string EmptyDepartmentId = "ADMISSION_EMPTY_DEPARTMENT_ID";
            public const string EmptyDoctorId = "ADMISSION_EMPTY_DOCTOR_ID";
            public const string InvalidType = "ADMISSION_INVALID_TYPE";
            public const string InvalidStatus = "ADMISSION_INVALID_STATUS";
            public const string EmptyChiefComplaint = "ADMISSION_EMPTY_CHIEF_COMPLAINT";
            public const string ChiefComplaintExceedsMaxLength = "ADMISSION_CHIEF_COMPLAINT_EXCEEDS_MAX_LENGTH";
            public const string EmptyProvisionalDiagnosis = "ADMISSION_EMPTY_PROVISIONAL_DIAGNOSIS";
            public const string ProvisionalDiagnosisExceedsMaxLength = "ADMISSION_PROVISIONAL_DIAGNOSIS_EXCEEDS_MAX_LENGTH";
            public const string TextExceedsMaxLength = "ADMISSION_TEXT_EXCEEDS_MAX_LENGTH";
            public const string ReferredByExceedsMaxLength = "ADMISSION_REFERRED_BY_EXCEEDS_MAX_LENGTH";
            public const string InsuranceDetailsRequired = "ADMISSION_INSURANCE_DETAILS_REQUIRED";

            // Admission Business Rules
            public const string AlreadyAdmitted = "ADMISSION_ALREADY_ADMITTED";
            public const string NotAdmitted = "ADMISSION_NOT_ADMITTED";
        }

        public static class Nursing
        {
            // Nursing Validation
            public const string EmptyPatientId = "NURSING_EMPTY_PATIENT_ID";
            public const string EmptyId = "NURSING_EMPTY_ID";
            public const string InvalidShift = "NURSING_INVALID_SHIFT";
            public const string InvalidAcuity = "NURSING_INVALID_ACUITY";
            public const string InvalidStatus = "NURSING_INVALID_STATUS";
            public const string InvalidVitalValue = "NURSING_INVALID_VITAL_VALUE";
            public const string InvalidDirection = "NURSING_INVALID_DIRECTION";
            public const string InvalidCategory = "NURSING_INVALID_CATEGORY";
            public const string InvalidVolume = "NURSING_INVALID_VOLUME";
            public const string EmptyLabel = "NURSING_EMPTY_LABEL";
            public const string EmptyContent = "NURSING_EMPTY_CONTENT";
            public const string EmptyMedicationName = "NURSING_EMPTY_MEDICATION_NAME";
            public const string TextExceedsMaxLength = "NURSING_TEXT_EXCEEDS_MAX_LENGTH";

            // Nursing Business Rules
            public const string NoActiveAdmission = "NURSING_NO_ACTIVE_ADMISSION";
            public const string AlreadyAssigned = "NURSING_ALREADY_ASSIGNED";
            public const string TaskNotPending = "NURSING_TASK_NOT_PENDING";
            public const string AlertAlreadyAcknowledged = "NURSING_ALERT_ALREADY_ACKNOWLEDGED";
            public const string DoseAlreadyRecorded = "NURSING_DOSE_ALREADY_RECORDED";
        }

        public static class Treatment
        {
            // Treatment Sheet Validation
            public const string EmptyId = "TREATMENT_EMPTY_ID";
            public const string InvalidOrderType = "TREATMENT_INVALID_ORDER_TYPE";
            public const string InvalidPriority = "TREATMENT_INVALID_PRIORITY";
            public const string InvalidStatus = "TREATMENT_INVALID_STATUS";
            public const string InvalidNoteType = "TREATMENT_INVALID_NOTE_TYPE";
            public const string EmptyOrderName = "TREATMENT_EMPTY_ORDER_NAME";
            public const string EmptyProcedureName = "TREATMENT_EMPTY_PROCEDURE_NAME";
            public const string EmptyDepartment = "TREATMENT_EMPTY_DEPARTMENT";
            public const string EmptyContent = "TREATMENT_EMPTY_CONTENT";
            public const string TextExceedsMaxLength = "TREATMENT_TEXT_EXCEEDS_MAX_LENGTH";
            public const string InvalidDateRange = "TREATMENT_INVALID_DATE_RANGE";
            public const string InvalidRange = "TREATMENT_INVALID_RANGE";
        }

        public static class Complaint
        {
            // Complaint Validation
            public const string EmptyId = "COMPLAINT_EMPTY_ID";
            public const string EmptyPatientName = "COMPLAINT_EMPTY_PATIENT_NAME";
            public const string PatientNameExceedsMaxLength = "COMPLAINT_PATIENT_NAME_EXCEEDS_MAX_LENGTH";
            public const string InvalidPatientId = "COMPLAINT_INVALID_PATIENT_ID";
            public const string EmptyEmail = "COMPLAINT_EMPTY_EMAIL";
            public const string InvalidEmail = "COMPLAINT_INVALID_EMAIL";
            public const string EmailExceedsMaxLength = "COMPLAINT_EMAIL_EXCEEDS_MAX_LENGTH";
            public const string EmptyPhone = "COMPLAINT_EMPTY_PHONE";
            public const string PhoneExceedsMaxLength = "COMPLAINT_PHONE_EXCEEDS_MAX_LENGTH";
            public const string InvalidCategory = "COMPLAINT_INVALID_CATEGORY";
            public const string InvalidPriority = "COMPLAINT_INVALID_PRIORITY";
            public const string InvalidStatus = "COMPLAINT_INVALID_STATUS";
            public const string EmptySubject = "COMPLAINT_EMPTY_SUBJECT";
            public const string SubjectExceedsMaxLength = "COMPLAINT_SUBJECT_EXCEEDS_MAX_LENGTH";
            public const string EmptyDescription = "COMPLAINT_EMPTY_DESCRIPTION";
            public const string DescriptionExceedsMaxLength = "COMPLAINT_DESCRIPTION_EXCEEDS_MAX_LENGTH";
            public const string AssignedToExceedsMaxLength = "COMPLAINT_ASSIGNED_TO_EXCEEDS_MAX_LENGTH";
        }

        public static class Member
        {
            // Member Validation
            public const string EmptyId = "MEMBER_EMPTY_ID";
            public const string EmptyPatientId = "MEMBER_EMPTY_PATIENT_ID";
            public const string InvalidTier = "MEMBER_INVALID_TIER";
            public const string InvalidStatus = "MEMBER_INVALID_STATUS";
            public const string AlreadyEnrolled = "MEMBER_ALREADY_ENROLLED";
            public const string NotActive = "MEMBER_NOT_ACTIVE";
        }

        public static class PointTransaction
        {
            // Point Transaction Validation
            public const string InvalidPoints = "POINT_TRANSACTION_INVALID_POINTS";
            public const string EmptyDescription = "POINT_TRANSACTION_EMPTY_DESCRIPTION";
            public const string DescriptionExceedsMaxLength = "POINT_TRANSACTION_DESCRIPTION_EXCEEDS_MAX_LENGTH";
            public const string InsufficientPoints = "POINT_TRANSACTION_INSUFFICIENT_POINTS";
        }

        public static class Reward
        {
            // Reward Validation
            public const string EmptyId = "REWARD_EMPTY_ID";
            public const string EmptyTitle = "REWARD_EMPTY_TITLE";
            public const string TitleExceedsMaxLength = "REWARD_TITLE_EXCEEDS_MAX_LENGTH";
            public const string DescriptionExceedsMaxLength = "REWARD_DESCRIPTION_EXCEEDS_MAX_LENGTH";
            public const string InvalidPointsRequired = "REWARD_INVALID_POINTS_REQUIRED";
            public const string InvalidCategory = "REWARD_INVALID_CATEGORY";
            public const string NotAvailable = "REWARD_NOT_AVAILABLE";
        }

        public static class Subscription
        {
            // Subscription / Plan / Invoice Validation
            public const string EmptyCode = "SUBSCRIPTION_PLAN_EMPTY_CODE";
            public const string EmptyName = "SUBSCRIPTION_PLAN_EMPTY_NAME";
            public const string InvalidPrice = "SUBSCRIPTION_PLAN_INVALID_PRICE";
            public const string InvalidCurrency = "SUBSCRIPTION_PLAN_INVALID_CURRENCY";
            public const string InvalidLimit = "SUBSCRIPTION_PLAN_INVALID_LIMIT";
            public const string DuplicateCode = "SUBSCRIPTION_PLAN_DUPLICATE_CODE";
            public const string PlanInactive = "SUBSCRIPTION_PLAN_INACTIVE";
            public const string EmptyTenant = "SUBSCRIPTION_EMPTY_TENANT";
            public const string InvalidAction = "SUBSCRIPTION_INVALID_ACTION";
            public const string InvalidState = "SUBSCRIPTION_INVALID_STATE";
            public const string DuplicateInvoice = "SUBSCRIPTION_DUPLICATE_INVOICE";
        }

        public static class PrescriptionTemplate
        {
            // Prescription Template / Favorite Validation
            public const string EmptyDoctor = "PRESCRIPTION_TEMPLATE_EMPTY_DOCTOR";
            public const string EmptyName = "PRESCRIPTION_TEMPLATE_EMPTY_NAME";
            public const string NameExceedsMaxLength = "PRESCRIPTION_TEMPLATE_NAME_EXCEEDS_MAX_LENGTH";
            public const string EmptyItems = "PRESCRIPTION_TEMPLATE_EMPTY_ITEMS";
            public const string EmptyMedicine = "PRESCRIPTION_TEMPLATE_EMPTY_MEDICINE";
            public const string InvalidQuantity = "PRESCRIPTION_TEMPLATE_INVALID_QUANTITY";
            public const string InvalidDuration = "PRESCRIPTION_TEMPLATE_INVALID_DURATION";
            public const string EmptyDose = "PRESCRIPTION_TEMPLATE_EMPTY_DOSE";
            public const string EmptyFrequency = "PRESCRIPTION_TEMPLATE_EMPTY_FREQUENCY";
        }

        public static class InventoryBatch
        {
            // Inventory Batch Validation
            public const string EmptyId = "INVENTORY_BATCH_EMPTY_ID";
            public const string InvalidQuantity = "INVENTORY_BATCH_INVALID_QUANTITY";
            public const string EmptyReason = "INVENTORY_BATCH_EMPTY_REASON";
            public const string InvalidZone = "INVENTORY_BATCH_INVALID_ZONE";
            public const string InvalidState = "INVENTORY_BATCH_INVALID_STATE";
            public const string InsufficientStock = "INVENTORY_BATCH_INSUFFICIENT_STOCK";
        }

        public static class Dispensing
        {
            // Dispensing Validation
            public const string EmptyId = "DISPENSING_EMPTY_ID";
            public const string NotDispensable = "DISPENSING_PRESCRIPTION_NOT_DISPENSABLE";
            public const string SessionClosed = "DISPENSING_SESSION_CLOSED";
            public const string InvalidQuantity = "DISPENSING_INVALID_QUANTITY";
            public const string InvalidStatus = "DISPENSING_INVALID_STATUS";
            public const string BatchUnavailable = "DISPENSING_BATCH_UNAVAILABLE";
            public const string InsufficientStock = "DISPENSING_INSUFFICIENT_STOCK";
            public const string SubstitutionNotAllowed = "DISPENSING_SUBSTITUTION_NOT_ALLOWED";
            public const string InvalidAlternative = "DISPENSING_INVALID_ALTERNATIVE";
            public const string UnacknowledgedCritical = "DISPENSING_UNACKNOWLEDGED_CRITICAL_ALERT";
            public const string LinesNotPicked = "DISPENSING_LINES_NOT_PICKED";
            public const string EmptyReason = "DISPENSING_EMPTY_REASON";
            public const string EmptyBarcode = "DISPENSING_EMPTY_BARCODE";
        }

        public static class InsuranceClaim
        {
            // Insurance Claim Validation
            public const string EmptyId = "INSURANCE_CLAIM_EMPTY_ID";
            public const string EmptyPatientName = "INSURANCE_CLAIM_EMPTY_PATIENT_NAME";
            public const string PatientNameExceedsMaxLength = "INSURANCE_CLAIM_PATIENT_NAME_EXCEEDS_MAX_LENGTH";
            public const string EmptyProvider = "INSURANCE_CLAIM_EMPTY_PROVIDER";
            public const string EmptyPolicyNumber = "INSURANCE_CLAIM_EMPTY_POLICY_NUMBER";
            public const string PolicyNumberExceedsMaxLength = "INSURANCE_CLAIM_POLICY_NUMBER_EXCEEDS_MAX_LENGTH";
            public const string EmptyDiagnosis = "INSURANCE_CLAIM_EMPTY_DIAGNOSIS";
            public const string DiagnosisExceedsMaxLength = "INSURANCE_CLAIM_DIAGNOSIS_EXCEEDS_MAX_LENGTH";
            public const string InvalidAmount = "INSURANCE_CLAIM_INVALID_AMOUNT";
            public const string InvalidPriority = "INSURANCE_CLAIM_INVALID_PRIORITY";
            public const string InvalidAction = "INSURANCE_CLAIM_INVALID_ACTION";
            public const string EmptyReason = "INSURANCE_CLAIM_EMPTY_REASON";
            public const string EmptySettlementMethod = "INSURANCE_CLAIM_EMPTY_SETTLEMENT_METHOD";
            public const string EmptyMessage = "INSURANCE_CLAIM_EMPTY_MESSAGE";
            public const string MessageExceedsMaxLength = "INSURANCE_CLAIM_MESSAGE_EXCEEDS_MAX_LENGTH";
            public const string EmptyFile = "INSURANCE_CLAIM_EMPTY_FILE";
            public const string FileTooLarge = "INSURANCE_CLAIM_FILE_TOO_LARGE";
            public const string InvalidStatusTransition = "INSURANCE_CLAIM_INVALID_STATUS_TRANSITION";
            public const string MissingDocuments = "INSURANCE_CLAIM_MISSING_DOCUMENTS";
            public const string UploadFailed = "INSURANCE_CLAIM_UPLOAD_FAILED";
        }

    }
}
