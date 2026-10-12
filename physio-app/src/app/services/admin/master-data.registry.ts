import { inject, Injectable } from "@angular/core";
import { CommonCategoryAppointmentTypeDrawerComponent } from "../../components/layout/admin/system/common-category/appointment-type/appointment-type-drawer.component";
import { CommonCategoryImagingModalityDrawerComponent } from "../../components/layout/admin/system/common-category/imaging-modality/imaging-modality-drawer.component";
import { CommonCategoryInsuranceCompanyDrawerComponent } from "../../components/layout/admin/system/common-category/insurance-company/insurance-company-drawer.component";
import { CommonCategoryLabTestCategoryDrawerComponent } from "../../components/layout/admin/system/common-category/lab-test-category/lab-test-category-drawer.component";
import { CommonCategoryLabTestDrawerComponent } from "../../components/layout/admin/system/common-category/lab-test/lab-test-drawer.component";
import { CommonCategoryManufacturerDrawerComponent } from "../../components/layout/admin/system/common-category/manufacturer/manufacturer-drawer.component";
import { CommonCategoryMedicalSpecialtyDrawerComponent } from "../../components/layout/admin/system/common-category/medical-specialty/medical-specialty-drawer.component";
import { CommonCategorySupplierDrawerComponent } from "../../components/layout/admin/system/common-category/supplier/supplier-drawer.component";
import { SettingSequenceTrackerDrawerComponent } from "../../components/layout/admin/setting/sequence-tracker/sequence-tracker-drawer.component";
import { Permissions } from "../../shared/constants/permission.constant";
import { InsuranceType } from "../../shared/enums/insurance-type";
import { FilterConfig } from "../../shared/types/filter.types";
import { MasterDataConfig } from "../../shared/types/master-data.types";
import { SortOption } from "../../shared/types/sort";
import { AppointmentTypeService } from "./appointment-type.service";
import { ImagingModalityService } from "./imaging-modality.service";
import { InsuranceCompanyService } from "./insurance-company.service";
import { LabTestCategoryService } from "./lab-test-category.service";
import { LabTestService } from "./lab-test.service";
import { ManufacturerService } from "./manufacturer.service";
import { MedicalSpecialtyService } from "./medical-specialty.service";
import { SequenceTrackerService } from "./sequence-tracker.service";
import { SupplierService } from "./supplier.service";

const booleanFilter = (key: string, label: string): FilterConfig => ({
    key,
    label,
    type: 'boolean',
    value: null,
    trueLabel: 'Yes',
    falseLabel: 'No'
});

const minutes = (key: string) => (row: any): string | null =>
    row[key] === null || row[key] === undefined ? null : `${row[key]} min`;

/** Mirrors the server: `{prefix}{date}-{zero-padded next number}{suffix}` (see Sys_SequenceTrackerRepository). */
const nextSequenceNumber = (row: any): string | null => {
    if (!row.prefix && !row.suffix && !row.sequenceLength) return null;
    const now = new Date();
    const two = (n: number) => String(n).padStart(2, '0');
    const tokens: Record<string, string> = {
        yyyy: String(now.getFullYear()),
        yy: String(now.getFullYear()).slice(-2),
        MM: two(now.getMonth() + 1),
        dd: two(now.getDate()),
    };
    const datePart = row.useDateFormating
        ? `${String(row.useDateFormating).replace(/yyyy|yy|MM|dd/g, token => tokens[token])}-`
        : '';
    const number = String((row.currentSequence ?? 0) + 1).padStart(row.sequenceLength ?? 0, '0');
    return `${row.prefix ?? ''}${datePart}${number}${row.suffix ?? ''}`;
};

const RECENT_SORT: SortOption[] = [
    { label: 'Recent', value: '-createdAt' },
    { label: 'Oldest', value: '+createdAt' },
];

/**
 * The platform-wide catalogs the owner manages from Super Admin → Master Data.
 * Every catalog reuses its existing service and drawer; only the list columns live here.
 */
@Injectable({ providedIn: 'root' })
export class MasterDataRegistry {
    private readonly medicalSpecialtySrv = inject(MedicalSpecialtyService);
    private readonly appointmentTypeSrv = inject(AppointmentTypeService);
    private readonly imagingModalitySrv = inject(ImagingModalityService);
    private readonly insuranceCompanySrv = inject(InsuranceCompanyService);
    private readonly manufacturerSrv = inject(ManufacturerService);
    private readonly supplierSrv = inject(SupplierService);
    private readonly labTestCategorySrv = inject(LabTestCategoryService);
    private readonly labTestSrv = inject(LabTestService);
    private readonly sequenceTrackerSrv = inject(SequenceTrackerService);

    private readonly configs: MasterDataConfig[] = [
        {
            slug: 'lab-test',
            group: 'master-data',
            title: 'Lab tests',
            singular: 'lab test',
            description: 'Tests a laboratory can order and their price.',
            icon: 'flask-conical',
            permission: Permissions.Lab.LabTestRead,
            nameKey: 'testName',
            columns: [
                { key: 'testCode', label: 'Code' },
                { key: 'description', label: 'Description' },
                { key: 'cost', label: 'Cost', kind: 'number', align: 'right' },
            ],
            filters: [],
            search: req => this.labTestSrv.search(req),
            remove: id => this.labTestSrv.delete(id),
            drawer: CommonCategoryLabTestDrawerComponent
        },
        {
            slug: 'lab-test-category',
            group: 'master-data',
            title: 'Lab test categories',
            singular: 'lab test category',
            description: 'Groups that organise lab tests.',
            icon: 'test-tube',
            permission: Permissions.Lab.LabTestCategoryRead,
            nameKey: 'name',
            columns: [
                { key: 'code', label: 'Code' },
                { key: 'description', label: 'Description' },
                { key: 'department', label: 'Department' },
            ],
            filters: [],
            search: req => this.labTestCategorySrv.search(req),
            remove: id => this.labTestCategorySrv.delete(id),
            drawer: CommonCategoryLabTestCategoryDrawerComponent
        },
        {
            slug: 'imaging-modality',
            group: 'master-data',
            title: 'Imaging modalities',
            singular: 'imaging modality',
            description: 'X-ray, MRI, CT and other imaging types.',
            icon: 'scan-line',
            permission: Permissions.Imaging.ImagingModalityRead,
            nameKey: 'name',
            columns: [
                { key: 'code', label: 'Code' },
                { key: 'category', label: 'Category' },
                { key: 'requiresContrast', label: 'Contrast', kind: 'boolean', align: 'center' },
                { key: 'averageDurationMinutes', label: 'Avg duration', align: 'right', format: minutes('averageDurationMinutes') },
            ],
            filters: [
                booleanFilter('requiresContrast', 'Requires contrast'),
                booleanFilter('preparationRequired', 'Preparation required'),
                booleanFilter('isActive', 'Active'),
            ],
            search: req => this.imagingModalitySrv.search(req),
            remove: id => this.imagingModalitySrv.delete(id),
            drawer: CommonCategoryImagingModalityDrawerComponent
        },
        {
            slug: 'medical-specialty',
            group: 'master-data',
            title: 'Medical specialties',
            singular: 'medical specialty',
            description: 'Clinical specialties doctors can belong to.',
            icon: 'stethoscope',
            permission: Permissions.Admin.MedicalSpecialtyRead,
            nameKey: 'name',
            columns: [
                { key: 'code', label: 'Code' },
                { key: 'category', label: 'Category' },
                {
                    key: 'attributes',
                    label: 'Type',
                    kind: 'badge',
                    align: 'center',
                    format: row => row.isSurgical ? 'Surgery' : row.isDiagnostic ? 'Diagnostic' : null
                },
                { key: 'averageConsultationDuration', label: 'Avg duration', align: 'right', format: minutes('averageConsultationDuration') },
            ],
            filters: [booleanFilter('isSurgical', 'Surgical')],
            search: req => this.medicalSpecialtySrv.search(req),
            remove: id => this.medicalSpecialtySrv.delete(id),
            drawer: CommonCategoryMedicalSpecialtyDrawerComponent
        },
        {
            slug: 'appointment-type',
            group: 'master-data',
            title: 'Appointment types',
            singular: 'appointment type',
            description: 'Visit types, default duration and fee.',
            icon: 'calendar-clock',
            permission: Permissions.Scheduling.AppointmentTypeRead,
            nameKey: 'name',
            columns: [
                { key: 'code', label: 'Code' },
                { key: 'defaultDuration', label: 'Duration', align: 'right', format: minutes('defaultDuration') },
                { key: 'isEmergency', label: 'Emergency', kind: 'boolean', align: 'center' },
                { key: 'consultationFee', label: 'Consultation fee', kind: 'number', align: 'right' },
            ],
            filters: [
                booleanFilter('isEmergency', 'Emergency'),
                booleanFilter('requiresPreparation', 'Requires preparation'),
                booleanFilter('isFollowUp', 'Follow-up'),
                booleanFilter('isActive', 'Active'),
            ],
            search: req => this.appointmentTypeSrv.search(req),
            remove: id => this.appointmentTypeSrv.delete(id),
            drawer: CommonCategoryAppointmentTypeDrawerComponent
        },
        {
            slug: 'insurance-company',
            group: 'master-data',
            title: 'Insurance companies',
            singular: 'insurance company',
            description: 'Insurers patients can claim against.',
            icon: 'shield-check',
            permission: Permissions.Admin.InsuranceCompanyRead,
            nameKey: 'name',
            columns: [
                { key: 'code', label: 'Code' },
                {
                    key: 'type',
                    label: 'Type',
                    kind: 'badge',
                    format: row => typeof row.type === 'number' ? InsuranceType[row.type] ?? null : row.type ?? null
                },
                { key: 'phone', label: 'Phone' },
            ],
            filters: [],
            search: req => this.insuranceCompanySrv.search(req),
            remove: id => this.insuranceCompanySrv.delete(id),
            drawer: CommonCategoryInsuranceCompanyDrawerComponent
        },
        {
            slug: 'manufacturer',
            group: 'master-data',
            title: 'Manufacturers',
            singular: 'manufacturer',
            description: 'Medicine and equipment manufacturers.',
            icon: 'factory',
            permission: Permissions.Pharmacy.ManufacturerRead,
            nameKey: 'name',
            columns: [
                { key: 'companyCode', label: 'Company code' },
                { key: 'city', label: 'City' },
                { key: 'phone', label: 'Phone' },
            ],
            filters: [],
            search: req => this.manufacturerSrv.search(req),
            remove: id => this.manufacturerSrv.delete(id),
            drawer: CommonCategoryManufacturerDrawerComponent
        },
        {
            slug: 'sequence-rules',
            group: 'platform',
            title: 'Sequence rules',
            singular: 'sequence rule',
            description: 'How generated codes (invoices, records, prescriptions…) are numbered.',
            icon: 'hash',
            permission: Permissions.Admin.SequenceTrackerRead,
            nameKey: 'entityType',
            columns: [
                { key: 'prefix', label: 'Prefix' },
                { key: 'useDateFormating', label: 'Date format' },
                { key: 'sequenceLength', label: 'Digits', kind: 'number', align: 'right' },
                { key: 'currentSequence', label: 'Last number', kind: 'number', align: 'right' },
                { key: 'suffix', label: 'Suffix' },
                { key: 'nextNumber', label: 'Next code', kind: 'badge', format: nextSequenceNumber },
            ],
            filters: [],
            sortOptions: RECENT_SORT,
            search: req => this.sequenceTrackerSrv.search(req),
            remove: id => this.sequenceTrackerSrv.delete(id),
            drawer: SettingSequenceTrackerDrawerComponent
        },
        {
            slug: 'supplier',
            group: 'master-data',
            title: 'Suppliers',
            singular: 'supplier',
            description: 'Vendors hospitals buy stock from.',
            icon: 'truck',
            permission: Permissions.Pharmacy.SupplierRead,
            nameKey: 'supplierName',
            columns: [
                { key: 'supplierCode', label: 'Code' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Address' },
            ],
            filters: [],
            search: req => this.supplierSrv.search(req),
            remove: id => this.supplierSrv.delete(id),
            drawer: CommonCategorySupplierDrawerComponent
        },
    ];

    /** Catalogs shown on the Master Data hub. */
    catalogs(): MasterDataConfig[] {
        return this.configs.filter(c => c.group === 'master-data');
    }

    get(slug: string | null | undefined): MasterDataConfig | null {
        return this.configs.find(c => c.slug === slug) ?? null;
    }
}
