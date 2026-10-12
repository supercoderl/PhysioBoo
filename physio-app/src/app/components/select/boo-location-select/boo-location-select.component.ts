import { Component, forwardRef, inject, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, ValidationErrors, Validator } from '@angular/forms';
import { finalize, Observable, Subscription } from 'rxjs';
import { LocationService } from '../../../services/common/location.service';
import { ToastService } from '../../../services/common/toast.service';
import { SharedModule } from '../../../shared/shared-imports';
import { EMPTY_LOCATION_VALUE, LocationOption, LocationValue } from '../../../shared/types/location.types';
import { BooSelectComponent } from '../boo-select/boo-select.component';

type LocationLevel = 'country' | 'city' | 'district' | 'ward';

/** District and ward stay optional: many addresses (and every country except Viet Nam) have no such level to pick. */
const REQUIRED_LEVELS: LocationLevel[] = ['country', 'city'];

const LEVELS: { level: LocationLevel; key: keyof LocationValue }[] = [
  { level: 'country', key: 'countryId' },
  { level: 'city', key: 'cityId' },
  { level: 'district', key: 'districtId' },
  { level: 'ward', key: 'wardId' }
];

@Component({
  selector: 'boo-location-select',
  standalone: true,
  imports: [
    SharedModule,
    BooSelectComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooLocationSelectComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BooLocationSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <boo-select
          [label]="countryLabel"
          [required]="isRequired('country')"
          [options]="options.country"
          bindLabel="name"
          bindValue="id"
          [ngModel]="value.countryId"
          (ngModelChange)="onCountryChange($event)"
          [disabled]="isDisabled('country')"
        />
        <p *ngIf="errorText('country', countryLabel) as text" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ text }}</p>
      </div>
      <div>
        <boo-select
          [label]="cityLabel"
          [required]="isRequired('city')"
          [options]="options.city"
          bindLabel="name"
          bindValue="id"
          [ngModel]="value.cityId"
          (ngModelChange)="onCityChange($event)"
          [disabled]="isDisabled('city')"
        />
        <p *ngIf="errorText('city', cityLabel) as text" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ text }}</p>
      </div>
      <div>
        <boo-select
          [label]="districtLabel"
          [required]="isRequired('district')"
          [options]="options.district"
          bindLabel="name"
          bindValue="id"
          [ngModel]="value.districtId"
          (ngModelChange)="onDistrictChange($event)"
          [disabled]="isDisabled('district')"
        />
        <p *ngIf="errorText('district', districtLabel) as text" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ text }}</p>
      </div>
      <div>
        <boo-select
          [label]="wardLabel"
          [required]="isRequired('ward')"
          [options]="options.ward"
          bindLabel="name"
          bindValue="id"
          [ngModel]="value.wardId"
          (ngModelChange)="onWardChange($event)"
          [disabled]="isDisabled('ward')"
        />
        <p *ngIf="errorText('ward', wardLabel) as text" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ text }}</p>
      </div>
    </div>
  `,
  host: {
    'class': 'block w-full',
  },
})
export class BooLocationSelectComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  // #region Inputs, Outputs, Properties
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() countryLabel: string = 'Country';
  @Input() cityLabel: string = 'City';
  @Input() districtLabel: string = 'District';
  @Input() wardLabel: string = 'Ward';

  value: LocationValue = { ...EMPTY_LOCATION_VALUE };
  options: Record<LocationLevel, LocationOption[]> = { country: [], city: [], district: [], ward: [] };
  disabled: boolean = false;

  private readonly injector = inject(Injector);
  private readonly loading: Record<LocationLevel, boolean> = { country: false, city: false, district: false, ward: false };
  private readonly loaded: Record<LocationLevel, boolean> = { country: false, city: false, district: false, ward: false };
  private readonly requests: Partial<Record<LocationLevel, Subscription>> = {};
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    private locationSrv: LocationService,
    private toastSrv: ToastService
  ) { }

  ngOnInit(): void {
    this.load('country', this.locationSrv.getCountries());
  }

  ngOnDestroy(): void {
    Object.values(this.requests).forEach(request => request?.unsubscribe());
  }
  // #endregion

  // #region Methods
  isRequired(level: LocationLevel): boolean {
    return this.required && REQUIRED_LEVELS.includes(level);
  }

  isDisabled(level: LocationLevel): boolean {
    const parent: Record<LocationLevel, string | null | true> = {
      country: true,
      city: this.value.countryId,
      district: this.value.cityId,
      ward: this.value.districtId
    };
    return this.disabled || this.loading[level] || !parent[level];
  }

  /** Per-level message, revealed once the bound control is touched (e.g. by a failed save). */
  errorText(level: LocationLevel, label: string): string | null {
    const control = this.injector.get(NgControl, null, { self: true, optional: true })?.control;
    return control?.touched && this.missingLevels().includes(level) ? `${label} is required` : null;
  }

  /**
   * Required levels that still need a selection. A required level with no data for the chosen parent
   * (e.g. a country without cities) is not required.
   */
  private missingLevels(): LocationLevel[] {
    const missing: LocationLevel[] = [];
    for (const [index, { level, key }] of LEVELS.entries()) {
      if (!this.isRequired(level) || this.value[key]) continue;

      const parentSelected = index === 0 || !!this.value[LEVELS[index - 1].key];
      if (parentSelected && this.loaded[level] && this.options[level].length === 0) break;
      missing.push(level);
    }
    return missing;
  }

  onCountryChange(id: string | null) {
    this.update({ countryId: id, cityId: null, districtId: null, wardId: null });
    this.clear('city', 'district', 'ward');
    if (id) this.load('city', this.locationSrv.getCities(id));
  }

  onCityChange(id: string | null) {
    this.update({ cityId: id, districtId: null, wardId: null });
    this.clear('district', 'ward');
    if (id) this.load('district', this.locationSrv.getDistricts(id));
  }

  onDistrictChange(id: string | null) {
    this.update({ districtId: id, wardId: null });
    this.clear('ward');
    if (id) this.load('ward', this.locationSrv.getWards(id));
  }

  onWardChange(id: string | null) {
    this.update({ wardId: id });
  }

  private update(patch: Partial<LocationValue>) {
    this.value = { ...this.value, ...patch };
    this.onChange(this.value);
  }

  private clear(...levels: LocationLevel[]) {
    levels.forEach(level => {
      this.requests[level]?.unsubscribe();
      this.loading[level] = false;
      this.loaded[level] = false;
      this.options[level] = [];
    });
  }

  /** Loads one level; a newer request for the same level cancels the previous one so stale lists never show. */
  private load(level: LocationLevel, request: Observable<LocationOption[]>) {
    this.requests[level]?.unsubscribe();
    this.loading[level] = true;
    this.loaded[level] = false;
    this.requests[level] = request
      .pipe(finalize(() => this.loading[level] = false))
      .subscribe({
        next: items => {
          this.options[level] = items;
          this.loaded[level] = true;
          this.onValidatorChange();
        },
        error: () => {
          this.options[level] = [];
          this.toastSrv.error('Could not load locations');
        }
      });
  }

  // #region ControlValueAccessor / Validator boilerplate
  onChange: (value: LocationValue) => void = () => { };
  onTouched: () => void = () => { };
  private onValidatorChange: () => void = () => { };

  writeValue(value: Partial<LocationValue> | null): void {
    this.value = { ...EMPTY_LOCATION_VALUE, ...value };
    this.clear('city', 'district', 'ward');
    if (this.value.countryId) this.load('city', this.locationSrv.getCities(this.value.countryId));
    if (this.value.cityId) this.load('district', this.locationSrv.getDistricts(this.value.cityId));
    if (this.value.districtId) this.load('ward', this.locationSrv.getWards(this.value.districtId));
  }

  registerOnChange(fn: (value: LocationValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.missingLevels().length ? { required: true } : null;
  }
  // #endregion
  // #endregion
}
