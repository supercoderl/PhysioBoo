import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject, debounceTime, switchMap } from "rxjs";
import { BooCheckboxComponent } from "../../../../../components/checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { PrescriptionService } from "../../../../../services/admin/prescription.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ClinicalWarning, MedicineCatalogItem, RxMedicationItem } from "../../../../../shared/types/prescription-rx.types";
import { severityIcon } from "../prescription-rx.util";

@Component({
    selector: 'rx-medication-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooInputComponent, BooTextareaComponent, BooCheckboxComponent, BooIconComponent],
    template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty" [width]="640" (close)="onClose()">
      <div class="flex flex-col h-full bg-surface relative">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-surface z-10">
          <div>
            <h2 class="text-xl font-bold text-primary leading-none mb-1">{{ editingItem ? 'Edit Medication' : 'Add Medication' }}</h2>
            <p class="text-sm text-secondary m-0">Search the catalog or enter a custom medication</p>
          </div>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <boo-icon name="x" [size]="20"></boo-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto" custom-scrollbar [formGroup]="form">
          <!-- Drug search -->
          <div class="p-6 space-y-3 border-b border-gray-100">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Drug Search</h3>
            <div class="relative">
              <boo-input placeholder="Search by name, generic, or brand..." [ngModel]="searchTerm" [ngModelOptions]="{standalone:true}"
                (ngModelChange)="onSearchInput($event)"></boo-input>
              <div *ngIf="results.length" class="absolute left-0 top-full mt-1 w-full bg-surface border border-gray-200 rounded-lg shadow-xl z-30 max-h-60 overflow-y-auto">
                <button *ngFor="let r of results" type="button" (click)="selectCatalogItem(r)"
                  class="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between gap-2">
                  <span>
                    <span class="font-medium text-primary">{{ r.name }}</span>
                    <span class="text-secondary text-xs ml-1">{{ r.strength }} · {{ r.dosageForm }}</span>
                  </span>
                  <span class="text-[10px] uppercase px-1.5 py-0.5 rounded" [ngClass]="r.stockStatus === 'OutOfStock' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'">
                    {{ r.stockStatus === 'OutOfStock' ? 'Out of stock' : 'In stock' }}
                  </span>
                </button>
              </div>
            </div>
            <button *ngIf="searchTerm && !results.length" type="button" (click)="useCustomMedication()" class="text-xs text-primary hover:underline">
              Not found — add "{{ searchTerm }}" as a custom medication
            </button>

            <!-- Inline CDS feedback -->
            <div *ngFor="let w of liveWarnings" class="rounded-lg px-3 py-2 text-sm flex items-start gap-2"
              [ngClass]="w.severity === 'Critical' || w.severity === 'High' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'">
              <boo-icon [name]="severityIcon(w.severity)" [size]="16" class="mt-0.5 shrink-0"></boo-icon>
              <div class="flex-1">
                <div><strong>{{ w.severity }}:</strong> {{ w.message }}</div>
                <div *ngIf="w.recommendation" class="text-xs opacity-80 mt-0.5">{{ w.recommendation }}</div>
                <label *ngIf="w.severity === 'Critical' || w.severity === 'High'" class="flex items-center gap-1.5 mt-1.5 text-xs font-medium cursor-pointer">
                  <input type="checkbox" [checked]="w.acknowledged" (change)="acknowledge(w, $event)"> Acknowledge and continue
                </label>
              </div>
            </div>
          </div>

          <!-- Drug identity -->
          <div class="p-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Drug Identity</h3>
            <div class="grid grid-cols-2 gap-4">
              <boo-input label="Generic Name" formControlName="genericName"></boo-input>
              <boo-input label="Brand Name" formControlName="brandName"></boo-input>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <boo-input label="Strength" formControlName="strength"></boo-input>
              <boo-input label="Dosage Form" formControlName="dosageForm"></boo-input>
              <boo-input label="Route" formControlName="route"></boo-input>
            </div>
          </div>

          <!-- Dosing -->
          <div class="p-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Dosing</h3>
            <div class="grid grid-cols-2 gap-4">
              <boo-input label="Dose" formControlName="dose" required placeholder="e.g. 1 tablet"></boo-input>
              <boo-input label="Frequency" formControlName="frequency" required placeholder="e.g. BID"></boo-input>
            </div>
            <div class="flex gap-2 flex-wrap">
              <button *ngFor="let p of frequencyPresets" type="button" (click)="form.patchValue({frequency: p})"
                class="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-secondary hover:bg-gray-200">{{ p }}</button>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <label class="border rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer text-xs" [ngClass]="form.get('morning')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'">
                <boo-checkbox formControlName="morning"></boo-checkbox> Morning
              </label>
              <label class="border rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer text-xs" [ngClass]="form.get('noon')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'">
                <boo-checkbox formControlName="noon"></boo-checkbox> Noon
              </label>
              <label class="border rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer text-xs" [ngClass]="form.get('afternoon')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'">
                <boo-checkbox formControlName="afternoon"></boo-checkbox> Afternoon
              </label>
              <label class="border rounded-lg p-2 flex flex-col items-center gap-1 cursor-pointer text-xs" [ngClass]="form.get('evening')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'">
                <boo-checkbox formControlName="evening"></boo-checkbox> Evening
              </label>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <label class="border rounded-lg p-2.5 flex items-center justify-between cursor-pointer text-sm" [ngClass]="form.get('beforeMeal')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'">
                Before Meal <boo-checkbox formControlName="beforeMeal"></boo-checkbox>
              </label>
              <label class="border rounded-lg p-2.5 flex items-center justify-between cursor-pointer text-sm" [ngClass]="form.get('afterMeal')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'">
                After Meal <boo-checkbox formControlName="afterMeal"></boo-checkbox>
              </label>
              <label class="border rounded-lg p-2.5 flex items-center justify-between cursor-pointer text-sm" [ngClass]="form.get('prn')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'">
                PRN <boo-checkbox formControlName="prn"></boo-checkbox>
              </label>
            </div>
          </div>

          <!-- Duration & supply -->
          <div class="p-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Duration & Supply</h3>
            <div class="grid grid-cols-3 gap-4">
              <boo-input label="Duration (days)" type="number" formControlName="durationDays" required></boo-input>
              <boo-input label="Quantity" type="number" formControlName="quantity" required></boo-input>
              <boo-input label="Unit" formControlName="unit" placeholder="tablet"></boo-input>
            </div>
            <boo-input label="Refill Count" type="number" formControlName="refillCount"></boo-input>
          </div>

          <!-- Notes -->
          <div class="p-6 space-y-4 border-b border-gray-100">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Notes</h3>
            <boo-textarea label="Doctor Instructions" formControlName="instructions" [rows]="2"></boo-textarea>
            <boo-textarea label="Pharmacy Notes" formControlName="pharmacyNotes" [rows]="2"></boo-textarea>
          </div>

          <!-- Live preview -->
          <div class="p-6">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Preview</h3>
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/60">
              <div class="font-semibold text-primary">{{ form.value.genericName || '(unnamed medication)' }} <span class="text-secondary font-normal">{{ form.value.strength }}</span></div>
              <div class="text-sm text-secondary mt-1">{{ form.value.dose }} · {{ form.value.frequency }} · {{ form.value.durationDays }}d · Qty {{ form.value.quantity }} {{ form.value.unit }}</div>
              <div *ngIf="form.value.instructions" class="text-xs text-secondary mt-1 italic">{{ form.value.instructions }}</div>
            </div>
          </div>
        </div>

        <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
          <button type="button" (click)="onClose()" class="px-4 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="button" (click)="onSave(true)" [disabled]="!canSave()" class="px-4 py-2 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary/5 disabled:opacity-50">
            Save & Add Another
          </button>
          <button type="button" (click)="onSave(false)" [disabled]="!canSave()" class="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
            Save
          </button>
        </div>
      </div>
    </drawer>
  `,
})
export class PrescriptionMedicationDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() editingItem: RxMedicationItem | null = null;
    @Input() patientId = '';

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ item: RxMedicationItem; continueAdding: boolean }>();

    readonly severityIcon = severityIcon;
    readonly frequencyPresets = ['QD', 'BID', 'TID', 'QID', 'QHS', 'PRN'];

    form: FormGroup;
    searchTerm = '';
    results: MedicineCatalogItem[] = [];
    liveWarnings: ClinicalWarning[] = [];
    selectedCatalogItem: MedicineCatalogItem | null = null;
    isCustom = false;

    private currentId = '';
    private search$ = new Subject<string>();

    constructor(private fb: FormBuilder, private rxSrv: PrescriptionService) {
        this.form = this.initForm();
        this.search$.pipe(
            debounceTime(250),
            switchMap(q => this.rxSrv.searchMedicines(q)),
        ).subscribe(res => { this.results = res.data ?? []; });

        this.form.valueChanges.pipe(debounceTime(400)).subscribe(() => this.runCdsCheck());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;
        if (changes['editingItem'] || changes['isOpen']) {
            if (this.editingItem) {
                this.currentId = this.editingItem.id;
                this.isCustom = this.editingItem.isCustomMedication;
                this.searchTerm = this.editingItem.name;
                this.liveWarnings = [...this.editingItem.warnings];
                this.form.patchValue({
                    genericName: this.editingItem.genericName,
                    brandName: this.editingItem.brandName,
                    strength: this.editingItem.strength,
                    dosageForm: this.editingItem.dosageForm,
                    route: this.editingItem.route,
                    dose: this.editingItem.dose,
                    frequency: this.editingItem.frequency,
                    morning: !!this.editingItem.timing.morning,
                    noon: !!this.editingItem.timing.noon,
                    afternoon: !!this.editingItem.timing.afternoon,
                    evening: !!this.editingItem.timing.evening,
                    beforeMeal: this.editingItem.beforeMeal,
                    afterMeal: this.editingItem.afterMeal,
                    prn: this.editingItem.prn,
                    durationDays: this.editingItem.durationDays,
                    quantity: this.editingItem.quantity,
                    unit: this.editingItem.unit,
                    refillCount: this.editingItem.refillCount,
                    instructions: this.editingItem.instructions,
                    pharmacyNotes: this.editingItem.pharmacyNotes,
                }, { emitEvent: false });
            } else {
                this.resetForm();
            }
        }
    }

    private initForm(): FormGroup {
        return this.fb.group({
            genericName: [''], brandName: [''], strength: [''], dosageForm: [''], route: ['Oral'],
            dose: [''], frequency: [''],
            morning: [false], noon: [false], afternoon: [false], evening: [false],
            beforeMeal: [false], afterMeal: [false], prn: [false],
            durationDays: [7], quantity: [0], unit: ['tablet'], refillCount: [0],
            instructions: [''], pharmacyNotes: [''],
        });
    }

    private resetForm() {
        this.currentId = '';
        this.searchTerm = '';
        this.results = [];
        this.liveWarnings = [];
        this.selectedCatalogItem = null;
        this.isCustom = false;
        this.form.reset({
            genericName: '', brandName: '', strength: '', dosageForm: '', route: 'Oral',
            dose: '', frequency: '',
            morning: false, noon: false, afternoon: false, evening: false,
            beforeMeal: false, afterMeal: false, prn: false,
            durationDays: 7, quantity: 0, unit: 'tablet', refillCount: 0,
            instructions: '', pharmacyNotes: '',
        }, { emitEvent: false });
    }

    onSearchInput(value: string) {
        this.searchTerm = value;
        this.selectedCatalogItem = null;
        this.isCustom = false;
        if (value && value.length >= 2) this.search$.next(value);
        else this.results = [];
    }

    selectCatalogItem(item: MedicineCatalogItem) {
        this.selectedCatalogItem = item;
        this.isCustom = false;
        this.searchTerm = item.name;
        this.results = [];
        this.form.patchValue({
            genericName: item.genericName,
            brandName: item.brandName,
            strength: item.strength,
            dosageForm: item.dosageForm,
            route: item.route,
        });
        this.runCdsCheck();
    }

    useCustomMedication() {
        this.isCustom = true;
        this.selectedCatalogItem = null;
        this.results = [];
        this.form.patchValue({ genericName: this.searchTerm });
    }

    private runCdsCheck() {
        if (!this.patientId) return;
        const candidate = this.buildItem(false);
        if (!candidate.name) { this.liveWarnings = []; return; }
        this.rxSrv.checkClinicalWarnings(this.patientId, [candidate]).subscribe(res => {
            const map = res.data ?? {};
            this.liveWarnings = map[candidate.id] ?? [];
        });
    }

    acknowledge(warning: ClinicalWarning, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        this.liveWarnings = this.liveWarnings.map(w => w.id === warning.id ? { ...w, acknowledged: checked } : w);
    }

    canSave(): boolean {
        const v = this.form.value;
        if (!this.searchTerm || !v.dose || !v.frequency || !v.durationDays || !v.quantity) return false;
        return !this.liveWarnings.some(w => (w.severity === 'Critical' || w.severity === 'High') && !w.acknowledged);
    }

    private buildItem(reuseId: boolean): RxMedicationItem {
        const v = this.form.value;
        const catalog = this.selectedCatalogItem;
        return {
            id: reuseId && this.currentId ? this.currentId : (this.currentId || `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
            medicineId: catalog?.id ?? this.editingItem?.medicineId ?? null,
            name: this.searchTerm,
            genericName: v.genericName || null,
            brandName: v.brandName || null,
            strength: v.strength || null,
            dosageForm: v.dosageForm || null,
            route: v.route || null,
            dose: v.dose,
            frequency: v.frequency,
            timing: { morning: v.morning, noon: v.noon, afternoon: v.afternoon, evening: v.evening },
            beforeMeal: v.beforeMeal,
            afterMeal: v.afterMeal,
            prn: v.prn,
            durationDays: Number(v.durationDays) || 0,
            quantity: Number(v.quantity) || 0,
            unit: v.unit || 'unit',
            refillCount: Number(v.refillCount) || 0,
            instructions: v.instructions || null,
            pharmacyNotes: v.pharmacyNotes || null,
            insuranceCovered: catalog?.insuranceCovered ?? this.editingItem?.insuranceCovered ?? false,
            stockStatus: catalog?.stockStatus ?? this.editingItem?.stockStatus ?? 'InStock',
            isControlledSubstance: catalog?.isControlledSubstance ?? this.editingItem?.isControlledSubstance ?? false,
            isAntibiotic: catalog?.isAntibiotic ?? this.editingItem?.isAntibiotic ?? false,
            isHighAlert: catalog?.isHighAlert ?? this.editingItem?.isHighAlert ?? false,
            isOtc: catalog?.isOtc ?? this.editingItem?.isOtc ?? false,
            isPrescriptionOnly: catalog?.isPrescriptionOnly ?? this.editingItem?.isPrescriptionOnly ?? true,
            isCustomMedication: this.isCustom || (!catalog && !this.editingItem?.medicineId),
            status: this.editingItem?.status ?? 'Active',
            unitPrice: catalog?.unitPrice ?? this.editingItem?.unitPrice ?? 0,
            warnings: this.liveWarnings,
        };
    }

    onSave(continueAdding: boolean) {
        if (!this.canSave()) return;
        const item = this.buildItem(true);
        this.save.emit({ item, continueAdding });
        if (continueAdding) this.resetForm();
    }

    onClose() {
        this.close.emit();
    }
}
