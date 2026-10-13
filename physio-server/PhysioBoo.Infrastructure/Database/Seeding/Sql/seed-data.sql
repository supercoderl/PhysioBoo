-- =====================================================================================
-- PhysioBoo seed data (PostgreSQL)
--
-- Replaces the C# seeding for: roles, system admin, permissions, SUPER_ADMIN grants,
-- admin menus, subscription plans and code-numbering (sequence) rules.
-- Countries / cities / districts / wards are still seeded by the C# seeder (`--seed`).
--
-- * Idempotent: safe to run again; it only adds what is missing.
-- * Needs the migrations applied first.
-- * One transaction: if anything fails nothing is written.
-- * Generated from the C# sources (Role enum, Permissions.cs, the old seeder lists).
--
-- Run:   psql -h <host> -U <user> -d <database> -v ON_ERROR_STOP=1 -f seed-data.sql
--
-- SYSTEM ADMIN LOGIN:  sysadmin@physioboo.com  /  Password123!
-- The password hash below is for that default password. CHANGE THE PASSWORD after the first login
-- (or replace the hash before running this file anywhere that is not a developer machine).
-- =====================================================================================

BEGIN;

-- 1. Roles ----------------------------------------------------------------------------
-- Skipped when a role with the same code OR name exists (IX_Roles_Name is unique).
INSERT INTO "Roles" ("Id", "Name", "Code", "Description", "IsActive", "IsSystemRole", "IsPublicForRegistration", "CreatedAt")
SELECT md5('role:' || v.code)::uuid, v.name, v.code, v.description, TRUE, v.is_system, v.is_public, LOCALTIMESTAMP
FROM (VALUES
    ('Super Administrator', 'SUPER_ADMIN', 'Full system access', TRUE, FALSE),
    ('Administrator', 'ADMIN', 'System management & configuration', FALSE, FALSE),
    ('Nurse', 'NURSE', 'Nursing and patient care operations', FALSE, FALSE),
    ('Pharmacist', 'PHAMACIST', 'Drug management & dispensing', FALSE, FALSE),
    ('Cashier', 'CASHIER', 'Billing & payment handling', FALSE, FALSE),
    ('Lab Technician', 'LAB_TECHNICIAN', 'Lab tests & results processing', FALSE, FALSE),
    ('Radiologist', 'RADIOLOGIST', 'Radiology reporting', FALSE, FALSE),
    ('Receptionist', 'RECEPTIONIST', 'Front desk & appointment handling', FALSE, FALSE),
    ('Accountant', 'ACCOUNTANT', 'Finance and invoice management', FALSE, FALSE),
    ('Inventory Manager', 'INVENTORY_MANAGER', 'Warehouse & inventory operations', FALSE, FALSE),
    ('IT Support', 'IT_SUPPORT', 'Technical system support', FALSE, FALSE),
    ('Doctor', 'DOCTOR', 'Medical diagnosis and treatment', FALSE, TRUE),
    ('Patient', 'PATIENT', 'Health service users and personal records tracking.', FALSE, TRUE)
) AS v(name, code, description, is_system, is_public)
WHERE NOT EXISTS (SELECT 1 FROM "Roles" r WHERE r."Code" = v.code OR r."Name" = v.name);

-- 2. "Platform" tenant row (the system admin has TenantId = empty guid, which the FK needs) ---
INSERT INTO "HospitalGroups" ("Id", "Name", "IsActive", "CreatedAt")
VALUES ('00000000-0000-0000-0000-000000000000', 'PhysioBoo Platform', TRUE, LOCALTIMESTAMP)
ON CONFLICT ("Id") DO NOTHING;

-- 3. System admin user + SUPER_ADMIN role link ----------------------------------------------
-- Only created while no SUPER_ADMIN user exists. "EmailNormalized" is a generated column: not inserted.
WITH new_admin AS (
    INSERT INTO "Users" ("Id", "Email", "Phone", "PasswordHash", "IsActive", "IsVerified", "FailedLoginAttempts",
                         "TwoFactorEnabled", "PreferredLanguage", "TimeZone", "TenantId", "CreatedAt")
    SELECT '15859ffa-3eb1-4bb8-88f0-e00dee314636', 'sysadmin@physioboo.com', '+0000000000', 'eimCECxhi3tDOTsqHqd/tJaVXxPHtraAz/pquCQ4q4Jd6zUXM2fRLPPyQoh13euj',
           TRUE, FALSE, 0, FALSE, 'en', 'Asia/Ho_Chi_Minh', '00000000-0000-0000-0000-000000000000', LOCALTIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE "Id" = '15859ffa-3eb1-4bb8-88f0-e00dee314636')
      AND NOT EXISTS (SELECT 1 FROM "UserRoles" ur JOIN "Roles" r ON r."Id" = ur."RoleId" WHERE r."Code" = 'SUPER_ADMIN')
    RETURNING "Id"
)
INSERT INTO "UserRoles" ("Id", "UserId", "RoleId", "AssignedAt")
SELECT md5('user-role:' || a."Id"::text)::uuid, a."Id", r."Id", LOCALTIMESTAMP
FROM new_admin a JOIN "Roles" r ON r."Code" = 'SUPER_ADMIN';

-- 4. Permissions (274) ----------------------------------------------------------------
INSERT INTO "Permissions" ("Id", "Name", "Code")
SELECT md5('permission:' || v.code)::uuid, v.name, v.code
FROM (VALUES
    ('Reception: PatientRegister', 'reception:patient:register'),
    ('Reception: PatientRead', 'reception:patient:read'),
    ('Reception: PatientUpdate', 'reception:patient:update'),
    ('Reception: PatientDelete', 'reception:patient:delete'),
    ('Reception: BookingRead', 'reception:booking:read'),
    ('Reception: BookingCreate', 'reception:booking:create'),
    ('Reception: BookingUpdate', 'reception:booking:update'),
    ('Reception: BookingCancel', 'reception:booking:cancel'),
    ('Reception: QueueRead', 'reception:queue:read'),
    ('Reception: QueueCheckin', 'reception:queue:checkin'),
    ('Reception: QueueManage', 'reception:queue:manage'),
    ('Scheduling: AppointmentRead', 'scheduling:appointment:read'),
    ('Scheduling: AppointmentCreate', 'scheduling:appointment:create'),
    ('Scheduling: AppointmentUpdate', 'scheduling:appointment:update'),
    ('Scheduling: AppointmentCancel', 'scheduling:appointment:cancel'),
    ('Scheduling: AppointmentTypeRead', 'scheduling:appointment-type:read'),
    ('Scheduling: AppointmentTypeCreate', 'scheduling:appointment-type:create'),
    ('Scheduling: AppointmentTypeUpdate', 'scheduling:appointment-type:update'),
    ('Scheduling: AppointmentTypeDelete', 'scheduling:appointment-type:delete'),
    ('Scheduling: DoctorScheduleRead', 'scheduling:doctor-schedule:read'),
    ('Scheduling: DoctorScheduleCreate', 'scheduling:doctor-schedule:create'),
    ('Scheduling: DoctorLeaveRead', 'scheduling:doctor-leave:read'),
    ('Scheduling: DoctorLeaveCreate', 'scheduling:doctor-leave:create'),
    ('Scheduling: EncounterComplete', 'scheduling:encounter:complete'),
    ('Clinical: MedicalRecordRead', 'clinical:medical-record:read'),
    ('Clinical: MedicalRecordCreate', 'clinical:medical-record:create'),
    ('Clinical: MedicalRecordViewAllergies', 'clinical:medical-record:view-allergies'),
    ('Clinical: MedicalRecordViewDiagnoses', 'clinical:medical-record:view-diagnoses'),
    ('Clinical: MedicalRecordViewPrescriptions', 'clinical:medical-record:view-prescriptions'),
    ('Clinical: MedicalRecordViewLab', 'clinical:medical-record:view-lab'),
    ('Clinical: MedicalRecordViewImaging', 'clinical:medical-record:view-imaging'),
    ('Clinical: MedicalRecordViewNotes', 'clinical:medical-record:view-notes'),
    ('Clinical: MedicalRecordViewBilling', 'clinical:medical-record:view-billing'),
    ('Clinical: AllergyRead', 'clinical:allergy:read'),
    ('Clinical: AllergyCreate', 'clinical:allergy:create'),
    ('Clinical: MedicalHistoryRead', 'clinical:medical-history:read'),
    ('Clinical: MedicalHistoryCreate', 'clinical:medical-history:create'),
    ('Clinical: DoctorDeskRead', 'clinical:doctor-desk:read'),
    ('Pharmacy: MedicineRead', 'pharmacy:medicine:read'),
    ('Pharmacy: MedicineCreate', 'pharmacy:medicine:create'),
    ('Pharmacy: MedicineUpdate', 'pharmacy:medicine:update'),
    ('Pharmacy: MedicineDelete', 'pharmacy:medicine:delete'),
    ('Pharmacy: MedicineCategoryRead', 'pharmacy:medicine-category:read'),
    ('Pharmacy: MedicineCategoryCreate', 'pharmacy:medicine-category:create'),
    ('Pharmacy: MedicineCategoryUpdate', 'pharmacy:medicine-category:update'),
    ('Pharmacy: MedicineCategoryDelete', 'pharmacy:medicine-category:delete'),
    ('Pharmacy: MedicineInventoryRead', 'pharmacy:medicine-inventory:read'),
    ('Pharmacy: MedicineInventoryCreate', 'pharmacy:medicine-inventory:create'),
    ('Pharmacy: ManufacturerRead', 'pharmacy:manufacturer:read'),
    ('Pharmacy: ManufacturerCreate', 'pharmacy:manufacturer:create'),
    ('Pharmacy: ManufacturerUpdate', 'pharmacy:manufacturer:update'),
    ('Pharmacy: ManufacturerDelete', 'pharmacy:manufacturer:delete'),
    ('Pharmacy: SupplierRead', 'pharmacy:supplier:read'),
    ('Pharmacy: SupplierCreate', 'pharmacy:supplier:create'),
    ('Pharmacy: SupplierUpdate', 'pharmacy:supplier:update'),
    ('Pharmacy: SupplierDelete', 'pharmacy:supplier:delete'),
    ('Pharmacy: PrescriptionRead', 'pharmacy:prescription:read'),
    ('Pharmacy: PrescriptionCreate', 'pharmacy:prescription:create'),
    ('Pharmacy: PrescriptionItemRead', 'pharmacy:prescription-item:read'),
    ('Pharmacy: PrescriptionItemCreate', 'pharmacy:prescription-item:create'),
    ('Pharmacy: PrescriptionUpdate', 'pharmacy:prescription:update'),
    ('Pharmacy: PrescriptionIssue', 'pharmacy:prescription:issue'),
    ('Pharmacy: PrescriptionCancel', 'pharmacy:prescription:cancel'),
    ('Pharmacy: MedicineInventoryUpdate', 'pharmacy:medicine-inventory:update'),
    ('Pharmacy: MedicineInventoryDelete', 'pharmacy:medicine-inventory:delete'),
    ('Pharmacy: WarehouseZoneRead', 'pharmacy:warehouse-zone:read'),
    ('Pharmacy: WarehouseZoneCreate', 'pharmacy:warehouse-zone:create'),
    ('Pharmacy: WarehouseZoneUpdate', 'pharmacy:warehouse-zone:update'),
    ('Pharmacy: WarehouseZoneDelete', 'pharmacy:warehouse-zone:delete'),
    ('Pharmacy: InventoryAlertRead', 'pharmacy:inventory-alert:read'),
    ('Pharmacy: InventoryAlertAcknowledge', 'pharmacy:inventory-alert:acknowledge'),
    ('Pharmacy: RetailCartRead', 'pharmacy:retail-cart:read'),
    ('Pharmacy: RetailCartCreate', 'pharmacy:retail-cart:create'),
    ('Pharmacy: RetailCartUpdate', 'pharmacy:retail-cart:update'),
    ('Pharmacy: RetailTransactionRead', 'pharmacy:retail-transaction:read'),
    ('Pharmacy: RetailTransactionCreate', 'pharmacy:retail-transaction:create'),
    ('Pharmacy: RetailTransactionRefund', 'pharmacy:retail-transaction:refund'),
    ('Pharmacy: DispensingRead', 'pharmacy:dispensing:read'),
    ('Pharmacy: DispensingProcess', 'pharmacy:dispensing:process'),
    ('Pharmacy: StockTakeExport', 'pharmacy:stock-take:export'),
    ('Pharmacy: StockTakeRead', 'pharmacy:stock-take:read'),
    ('Pharmacy: StockTakeCreate', 'pharmacy:stock-take:create'),
    ('Pharmacy: StockTakeUpdate', 'pharmacy:stock-take:update'),
    ('Pharmacy: StockTakeDelete', 'pharmacy:stock-take:delete'),
    ('Pharmacy: StockTakeApprove', 'pharmacy:stock-take:approve'),
    ('Pharmacy: StockTakeReject', 'pharmacy:stock-take:reject'),
    ('Lab: LabTestRead', 'lab:lab-test:read'),
    ('Lab: LabTestCreate', 'lab:lab-test:create'),
    ('Lab: LabTestUpdate', 'lab:lab-test:update'),
    ('Lab: LabTestDelete', 'lab:lab-test:delete'),
    ('Lab: LabTestCategoryRead', 'lab:lab-test-category:read'),
    ('Lab: LabTestCategoryCreate', 'lab:lab-test-category:create'),
    ('Lab: LabTestCategoryUpdate', 'lab:lab-test-category:update'),
    ('Lab: LabTestCategoryDelete', 'lab:lab-test-category:delete'),
    ('Lab: LabTestCategoryLookup', 'lab:lab-test-category:lookup'),
    ('Lab: LabOrderRead', 'lab:lab-order:read'),
    ('Lab: LabOrderCreate', 'lab:lab-order:create'),
    ('Lab: LabOrderItemRead', 'lab:lab-order-item:read'),
    ('Lab: LabOrderItemCreate', 'lab:lab-order-item:create'),
    ('Lab: LabReportRead', 'lab:lab-report:read'),
    ('Lab: LabReportCreate', 'lab:lab-report:create'),
    ('Lab: SampleManage', 'lab:sample:manage'),
    ('Lab: ResultEnter', 'lab:result:enter'),
    ('Lab: ResultVerify', 'lab:result:verify'),
    ('Lab: AlertAcknowledge', 'lab:alert:acknowledge'),
    ('Imaging: ImagingOrderRead', 'imaging:imaging-order:read'),
    ('Imaging: ImagingOrderCreate', 'imaging:imaging-order:create'),
    ('Imaging: ImagingReportRead', 'imaging:imaging-report:read'),
    ('Imaging: ImagingReportCreate', 'imaging:imaging-report:create'),
    ('Imaging: ImagingModalityRead', 'imaging:imaging-modality:read'),
    ('Imaging: ImagingModalityCreate', 'imaging:imaging-modality:create'),
    ('Imaging: ImagingModalityUpdate', 'imaging:imaging-modality:update'),
    ('Imaging: ImagingModalityDelete', 'imaging:imaging-modality:delete'),
    ('Imaging: ScheduleManage', 'imaging:schedule:manage'),
    ('Imaging: QueueManage', 'imaging:queue:manage'),
    ('Imaging: ReportWrite', 'imaging:report:write'),
    ('Imaging: ReportVerify', 'imaging:report:verify'),
    ('Imaging: AlertAcknowledge', 'imaging:alert:acknowledge'),
    ('Billing: BillRead', 'billing:bill:read'),
    ('Billing: BillCreate', 'billing:bill:create'),
    ('Billing: BillItemRead', 'billing:bill-item:read'),
    ('Billing: BillItemCreate', 'billing:bill-item:create'),
    ('Billing: PaymentRead', 'billing:payment:read'),
    ('Billing: PaymentCreate', 'billing:payment:create'),
    ('Billing: BillUpdate', 'billing:bill:update'),
    ('Billing: BillVoid', 'billing:bill:void'),
    ('Billing: BillDiscountApply', 'billing:bill:discount-apply'),
    ('Billing: BillInsuranceApply', 'billing:bill:insurance-apply'),
    ('Billing: PaymentRefund', 'billing:payment:refund'),
    ('Hr: DoctorRead', 'hr:doctor:read'),
    ('Hr: DoctorRegister', 'hr:doctor:register'),
    ('Hr: DoctorUpdate', 'hr:doctor:update'),
    ('Hr: DoctorDelete', 'hr:doctor:delete'),
    ('Hr: DoctorEducationRead', 'hr:doctor-education:read'),
    ('Hr: DoctorEducationCreate', 'hr:doctor-education:create'),
    ('Hr: DoctorPublicationRead', 'hr:doctor-publication:read'),
    ('Hr: DoctorPublicationCreate', 'hr:doctor-publication:create'),
    ('Hr: DoctorSpecialtyRead', 'hr:doctor-specialty:read'),
    ('Hr: DoctorSpecialtyCreate', 'hr:doctor-specialty:create'),
    ('Hr: DoctorWorkExperienceRead', 'hr:doctor-work-experience:read'),
    ('Hr: DoctorWorkExperienceCreate', 'hr:doctor-work-experience:create'),
    ('Hr: DoctorAwardRead', 'hr:doctor-award:read'),
    ('Hr: DoctorAwardCreate', 'hr:doctor-award:create'),
    ('Hr: DoctorCertificationRead', 'hr:doctor-certification:read'),
    ('Hr: DoctorCertificationCreate', 'hr:doctor-certification:create'),
    ('Hr: HospitalStaffRead', 'hr:hospital-staff:read'),
    ('Hr: HospitalStaffCreate', 'hr:hospital-staff:create'),
    ('Admin: InviteCreate', 'admin:invite:create'),
    ('Admin: InviteRead', 'admin:invite:read'),
    ('Admin: InviteRevoke', 'admin:invite:revoke'),
    ('Admin: HospitalRead', 'admin:hospital:read'),
    ('Admin: HospitalCreate', 'admin:hospital:create'),
    ('Admin: HospitalUpdate', 'admin:hospital:update'),
    ('Admin: HospitalDelete', 'admin:hospital:delete'),
    ('Admin: HospitalGroupRead', 'admin:hospital-group:read'),
    ('Admin: HospitalGroupCreate', 'admin:hospital-group:create'),
    ('Admin: HospitalGroupUpdate', 'admin:hospital-group:update'),
    ('Admin: HospitalGroupDelete', 'admin:hospital-group:delete'),
    ('Admin: DepartmentRead', 'admin:department:read'),
    ('Admin: DepartmentCreate', 'admin:department:create'),
    ('Admin: DepartmentUpdate', 'admin:department:update'),
    ('Admin: DepartmentDelete', 'admin:department:delete'),
    ('Admin: MedicalSpecialtyRead', 'admin:medical-specialty:read'),
    ('Admin: MedicalSpecialtyCreate', 'admin:medical-specialty:create'),
    ('Admin: MedicalSpecialtyUpdate', 'admin:medical-specialty:update'),
    ('Admin: MedicalSpecialtyDelete', 'admin:medical-specialty:delete'),
    ('Admin: InsuranceCompanyRead', 'admin:insurance-company:read'),
    ('Admin: InsuranceCompanyCreate', 'admin:insurance-company:create'),
    ('Admin: InsuranceCompanyUpdate', 'admin:insurance-company:update'),
    ('Admin: InsuranceCompanyDelete', 'admin:insurance-company:delete'),
    ('Admin: AddressRead', 'admin:address:read'),
    ('Admin: AddressCreate', 'admin:address:create'),
    ('Admin: AddressUpdate', 'admin:address:update'),
    ('Admin: AddressDelete', 'admin:address:delete'),
    ('Admin: AdminMenuRead', 'admin:admin-menu:read'),
    ('Admin: AdminMenuCreate', 'admin:admin-menu:create'),
    ('Admin: AdminMenuUpdate', 'admin:admin-menu:update'),
    ('Admin: AdminMenuDelete', 'admin:admin-menu:delete'),
    ('Admin: PrintTemplateManage', 'admin:print-template:manage'),
    ('Admin: PrintTemplateRender', 'admin:print-template:render'),
    ('Admin: SequenceTrackerRead', 'admin:sequence-tracker:read'),
    ('Admin: SequenceTrackerCreate', 'admin:sequence-tracker:create'),
    ('Admin: SequenceTrackerUpdate', 'admin:sequence-tracker:update'),
    ('Admin: SequenceTrackerDelete', 'admin:sequence-tracker:delete'),
    ('Iam: UserRead', 'iam:user:read'),
    ('Iam: UserUpdate', 'iam:user:update'),
    ('Iam: UserDelete', 'iam:user:delete'),
    ('Iam: UserAssignRole', 'iam:user:assign-role'),
    ('Iam: RoleRead', 'iam:role:read'),
    ('Iam: RoleCreate', 'iam:role:create'),
    ('Iam: RoleUpdate', 'iam:role:update'),
    ('Iam: RoleDelete', 'iam:role:delete'),
    ('Iam: RoleAssignPermission', 'iam:role:assign-permission'),
    ('Iam: RoleRevokePermission', 'iam:role:revoke-permission'),
    ('Iam: PermissionRead', 'iam:permission:read'),
    ('Iam: PermissionCreate', 'iam:permission:create'),
    ('Iam: PermissionUpdate', 'iam:permission:update'),
    ('Iam: PermissionDelete', 'iam:permission:delete'),
    ('System: ConfigRead', 'system:config:read'),
    ('System: ConfigManage', 'system:config:manage'),
    ('System: ResourceRead', 'system:resource:read'),
    ('System: ResourceImport', 'system:resource:import'),
    ('System: SecurityBlockIp', 'system:security:block-ip'),
    ('System: SecurityUnblockIp', 'system:security:unblock-ip'),
    ('System: DevAccess', 'system:dev:access'),
    ('System: AuditLogRead', 'system:audit-log:read'),
    ('Dashboard: OverviewRead', 'dashboard:overview:read'),
    ('Dashboard: AlertDismiss', 'dashboard:alert:dismiss'),
    ('Cms: ArticleRead', 'cms:article:read'),
    ('Cms: ArticleCreate', 'cms:article:create'),
    ('Cms: ArticleUpdate', 'cms:article:update'),
    ('Cms: ArticleDelete', 'cms:article:delete'),
    ('Cms: HomeSettingsRead', 'cms:home-settings:read'),
    ('Cms: HomeSettingsUpdate', 'cms:home-settings:update'),
    ('Cms: ServiceRead', 'cms:service:read'),
    ('Cms: ServiceCreate', 'cms:service:create'),
    ('Cms: ServiceUpdate', 'cms:service:update'),
    ('Cms: ServiceDelete', 'cms:service:delete'),
    ('Portal: ReviewRead', 'portal:review:read'),
    ('Portal: ReviewCreate', 'portal:review:create'),
    ('Portal: ProfileRead', 'portal:profile:read'),
    ('Portal: ProfileCreate', 'portal:profile:create'),
    ('Inpatient: BedRead', 'inpatient:bed:read'),
    ('Inpatient: BedAssign', 'inpatient:bed:assign'),
    ('Inpatient: BedManage', 'inpatient:bed:manage'),
    ('Inpatient: AdmissionRead', 'inpatient:admission:read'),
    ('Inpatient: AdmissionCreate', 'inpatient:admission:create'),
    ('Inpatient: AdmissionUpdate', 'inpatient:admission:update'),
    ('Inpatient: AdmissionDischarge', 'inpatient:admission:discharge'),
    ('Inpatient: NursingRead', 'inpatient:nursing:read'),
    ('Inpatient: NursingWrite', 'inpatient:nursing:write'),
    ('Inpatient: NursingManage', 'inpatient:nursing:manage'),
    ('Inpatient: TreatmentSheetRead', 'inpatient:treatment-sheet:read'),
    ('Inpatient: TreatmentSheetWrite', 'inpatient:treatment-sheet:write'),
    ('Academy: CourseManage', 'academy:course:manage'),
    ('Surgery: SurgeryRead', 'surgery:case:read'),
    ('Surgery: SurgerySchedule', 'surgery:case:schedule'),
    ('Surgery: SurgeryUpdate', 'surgery:case:update'),
    ('Surgery: RoomManage', 'surgery:room:manage'),
    ('Crm: LeadRead', 'crm:lead:read'),
    ('Crm: LeadCreate', 'crm:lead:create'),
    ('Crm: LeadUpdate', 'crm:lead:update'),
    ('Crm: LeadDelete', 'crm:lead:delete'),
    ('Crm: CampaignRead', 'crm:campaign:read'),
    ('Crm: CampaignCreate', 'crm:campaign:create'),
    ('Crm: CampaignUpdate', 'crm:campaign:update'),
    ('Crm: CampaignDelete', 'crm:campaign:delete'),
    ('Crm: ComplaintRead', 'crm:complaint:read'),
    ('Crm: ComplaintCreate', 'crm:complaint:create'),
    ('Crm: ComplaintUpdate', 'crm:complaint:update'),
    ('Crm: ComplaintDelete', 'crm:complaint:delete'),
    ('Crm: MemberRead', 'crm:member:read'),
    ('Crm: MemberCreate', 'crm:member:create'),
    ('Crm: MemberUpdate', 'crm:member:update'),
    ('Crm: MemberDelete', 'crm:member:delete'),
    ('Crm: PointAdd', 'crm:point:add'),
    ('Crm: PointRedeem', 'crm:point:redeem'),
    ('Crm: RewardRead', 'crm:reward:read'),
    ('Crm: RewardCreate', 'crm:reward:create'),
    ('Crm: RewardUpdate', 'crm:reward:update'),
    ('Crm: RewardDelete', 'crm:reward:delete'),
    ('Subscription: PlanRead', 'subscription:plan:read'),
    ('Subscription: PlanManage', 'subscription:plan:manage'),
    ('Subscription: SubscriptionRead', 'subscription:subscription:read'),
    ('Subscription: SubscriptionManage', 'subscription:subscription:manage'),
    ('Subscription: InvoiceManage', 'subscription:invoice:manage'),
    ('Subscription: OwnRead', 'subscription:own:read'),
    ('Subscription: OwnManage', 'subscription:own:manage'),
    ('Finance: RevenueReportRead', 'finance:revenue-report:read'),
    ('Finance: RevenueReportExport', 'finance:revenue-report:export'),
    ('Finance: InsuranceClaimRead', 'finance:insurance-claim:read'),
    ('Finance: InsuranceClaimCreate', 'finance:insurance-claim:create'),
    ('Finance: InsuranceClaimUpdate', 'finance:insurance-claim:update'),
    ('Finance: InsuranceClaimProcess', 'finance:insurance-claim:process')
) AS v(name, code)
WHERE NOT EXISTS (SELECT 1 FROM "Permissions" p WHERE p."Code" = v.code);

-- 5. SUPER_ADMIN gets every permission (re-run after adding permissions to grant the new ones) ---
INSERT INTO "RolePermissions" ("Id", "RoleId", "PermissionId", "CreatedAt")
SELECT md5('role-permission:' || r."Id"::text || ':' || p."Id"::text)::uuid, r."Id", p."Id", LOCALTIMESTAMP
FROM "Roles" r CROSS JOIN "Permissions" p
WHERE r."Code" = 'SUPER_ADMIN'
  AND NOT EXISTS (SELECT 1 FROM "RolePermissions" rp WHERE rp."RoleId" = r."Id" AND rp."PermissionId" = p."Id");

-- 6. Admin menus (10 sections, 36 pages) ------------------------------------------------
-- Only seeded while the table is empty, so menus you edit later are never overwritten.
DO $$
DECLARE admin_id uuid := (SELECT "Id" FROM "Users" WHERE "Id" = '15859ffa-3eb1-4bb8-88f0-e00dee314636');
BEGIN
    IF EXISTS (SELECT 1 FROM "AdminMenus") THEN RETURN; END IF;

    INSERT INTO "AdminMenus" ("Id", "Label", "Icon", "Route", "ParentId", "IsActive", "Order", "PermissionCode", "CreatedAt", "CreatedBy")
    SELECT md5('admin-menu:' || v.route)::uuid, v.label, v.icon, v.route, NULL, TRUE, v.ord, v.perm, LOCALTIMESTAMP, admin_id
    FROM (VALUES
        ('Reception', 'clipboard-list', '/admin/reception', '', 0),
        ('Clinic', 'stethoscope', '/admin/clinic', '', 1),
        ('Inpatient', 'bed', '/admin/inpatient', '', 2),
        ('Paraclinical', 'flask-conical', '/admin/paraclinical', '', 3),
        ('Pharmacy', 'pill', '/admin/pharmacy', '', 4),
        ('Finance', 'wallet', '/admin/finance', '', 5),
        ('CRM', 'users', '/admin/crm', '', 6),
        ('CMS', 'newspaper', '/admin/cms', '', 7),
        ('Academy', 'graduation-cap', '/admin/academy/list', '', 8),
        ('System', 'settings', '/admin/system', '', 9)
    ) AS v(label, icon, route, perm, ord);

    INSERT INTO "AdminMenus" ("Id", "Label", "Icon", "Route", "ParentId", "IsActive", "Order", "PermissionCode", "CreatedAt", "CreatedBy")
    SELECT md5('admin-menu:' || v.parent_route || '|' || v.route)::uuid, v.label, v.icon, v.route,
           md5('admin-menu:' || v.parent_route)::uuid, TRUE, v.ord, v.perm, LOCALTIMESTAMP, admin_id
    FROM (VALUES
        ('/admin/reception', 'Booking', 'calendar-check', '/admin/reception/booking/list', 'reception:booking:read', 0),
        ('/admin/reception', 'Queue', 'list-ordered', '/admin/reception/queue', 'reception:queue:read', 1),
        ('/admin/reception', 'Registration', 'user-plus', '/admin/reception/registration', 'reception:patient:register', 2),
        ('/admin/clinic', 'Doctor Desk', 'monitor', '/admin/clinic/doctor-desk', 'clinical:medical-record:read', 0),
        ('/admin/clinic', 'Prescription', 'file-text', '/admin/clinic/prescription', 'pharmacy:prescription:read', 1),
        ('/admin/clinic', 'Medical Record', 'folder-heart', '/admin/clinic/medical-record', 'clinical:medical-record:read', 2),
        ('/admin/inpatient', 'Bed Map', 'layout-grid', '/admin/inpatient/bed-map', '', 0),
        ('/admin/inpatient', 'Admission', 'door-open', '/admin/inpatient/admission', '', 1),
        ('/admin/inpatient', 'Nursing Dashboard', 'heart-pulse', '/admin/inpatient/nursing/dashboard', '', 2),
        ('/admin/inpatient', 'Nursing Handover', 'repeat', '/admin/inpatient/nursing/handover', '', 3),
        ('/admin/inpatient', 'Treatment Sheet', 'clipboard-pen', '/admin/inpatient/treatment-sheet', '', 4),
        ('/admin/paraclinical', 'Laboratory', 'test-tube', '/admin/paraclinical/laboratory', 'lab:lab-order:read', 0),
        ('/admin/paraclinical', 'Radiology', 'scan', '/admin/paraclinical/radiology', 'imaging:imaging-order:read', 1),
        ('/admin/paraclinical', 'Surgery', 'scissors', '/admin/paraclinical/surgery', '', 2),
        ('/admin/pharmacy', 'Retail', 'shopping-cart', '/admin/pharmacy/retail', 'pharmacy:medicine-inventory:read', 0),
        ('/admin/pharmacy', 'Prescription Dispense', 'package-check', '/admin/pharmacy/prescription-dispense', 'pharmacy:prescription:read', 1),
        ('/admin/pharmacy', 'Inventory Management', 'boxes', '/admin/pharmacy/inventory-management', 'pharmacy:medicine-inventory:read', 2),
        ('/admin/pharmacy', 'Stock Take', 'clipboard-check', '/admin/pharmacy/stock-take', 'pharmacy:medicine-inventory:read', 3),
        ('/admin/finance', 'Cashier', 'banknote', '/admin/finance/cashier', 'billing:bill:read', 0),
        ('/admin/finance', 'Insurance', 'shield-check', '/admin/finance/insurance', 'admin:insurance-company:read', 1),
        ('/admin/finance', 'Reports', 'bar-chart-3', '/admin/finance/reports', 'billing:bill:read', 2),
        ('/admin/crm', 'Patient', 'user', '/admin/crm/patient', '', 0),
        ('/admin/crm', 'Marketing Campaign', 'megaphone', '/admin/crm/marketing-campaign', '', 1),
        ('/admin/crm', 'Lead Management', 'target', '/admin/crm/lead-management', '', 2),
        ('/admin/crm', 'Support Complaint', 'message-circle-warning', '/admin/crm/support-complaint', '', 3),
        ('/admin/crm', 'Member Point', 'star', '/admin/crm/member-point', '', 4),
        ('/admin/cms', 'Article News', 'file-text', '/admin/cms/article-news', '', 0),
        ('/admin/cms', 'Service', 'concierge-bell', '/admin/cms/service', '', 1),
        ('/admin/cms', 'Home Configuration', 'layout-dashboard', '/admin/cms/home-configuration', '', 2),
        ('/admin/cms', 'Doctor', 'user-round', '/admin/cms/doctor/list', '', 3),
        ('/admin/system', 'File Manager', 'folder', '/admin/system/file-manager', '', 0),
        ('/admin/system', 'Note', 'sticky-note', '/admin/system/note/all', '', 1),
        ('/admin/system', 'Scrumboard', 'kanban', '/admin/system/scrumboard/list', '', 2),
        ('/admin/system', 'User Permission', 'shield', '/admin/system/user-permission', 'iam:user:read', 3),
        ('/admin/system', 'Print Templates', 'printer', '/admin/system/print-templates', 'admin:print-template:manage', 4),
        ('/admin/system', 'Settings', 'settings-2', '/admin/system/settings', '', 5)
    ) AS v(parent_route, label, icon, route, perm, ord);
END $$;

-- 7. Default subscription plans (editable from Super Admin -> Billing). Only while none exist. ---
INSERT INTO "SubscriptionPlans" ("Id", "Code", "Name", "Description", "MonthlyPrice", "Currency", "MaxUsers", "MaxBranches", "SortOrder", "IsActive", "CreatedAt", "CreatedBy")
SELECT md5('subscription-plan:' || v.code)::uuid, v.code, v.name, v.description, v.price, v.currency, v.max_users, v.max_branches, v.sort_order, TRUE, LOCALTIMESTAMP,
       (SELECT "Id" FROM "Users" WHERE "Id" = '15859ffa-3eb1-4bb8-88f0-e00dee314636')
FROM (VALUES
    ('BASIC', 'Basic', 'Starter plan for a single clinic.', 9::numeric(12,2), 'USD', 5::int, 1::int, 1),
    ('TEAM', 'Team', 'Collaborate with up to 10 people.', 29::numeric(12,2), 'USD', 10::int, 3::int, 2),
    ('ENTERPRISE', 'Enterprise', 'For hospital groups with many branches.', 99::numeric(12,2), 'USD', null::int, null::int, 3)
) AS v(code, name, description, price, currency, max_users, max_branches, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM "SubscriptionPlans");

-- 8. Code-numbering rules (22). Create handlers throw when their rule is missing; existing rows are left alone. ---
INSERT INTO "Sys_SequenceTrackers" ("Id", "EntityType", "Prefix", "SequenceLength", "CurrentSequence", "CreatedAt", "CreatedBy")
SELECT md5('sequence-tracker:' || v.entity_type)::uuid, v.entity_type, v.prefix, 6, 0, LOCALTIMESTAMP,
       (SELECT "Id" FROM "Users" WHERE "Id" = '15859ffa-3eb1-4bb8-88f0-e00dee314636')
FROM (VALUES
    ('Patient', 'PAT-'),
    ('Appointment', 'APT-'),
    ('AppointmentType', 'AT-'),
    ('Doctor', 'DOC-'),
    ('Hospital', 'HOS-'),
    ('InsuranceCompany', 'INS-'),
    ('LabTest', 'LT-'),
    ('LabTestCategory', 'LTC-'),
    ('Manufacturer', 'MFR-'),
    ('MedicineCategory', 'MC-'),
    ('Supplier', 'SUP-'),
    ('Bill', 'INV-'),
    ('Payment', 'PAY-'),
    ('Admission', 'ADM-'),
    ('SurgeryCase', 'SUR-'),
    ('Campaign', 'CMP-'),
    ('Complaint', 'CPL-'),
    ('MemberPoint', 'MEM-'),
    ('PointTransaction', 'TXN-'),
    ('Reward', 'RWD-'),
    ('LabOrder', 'LAB-'),
    ('ImagingOrder', 'RAD-')
) AS v(entity_type, prefix)
WHERE NOT EXISTS (SELECT 1 FROM "Sys_SequenceTrackers" s WHERE s."EntityType" = v.entity_type);

COMMIT;
