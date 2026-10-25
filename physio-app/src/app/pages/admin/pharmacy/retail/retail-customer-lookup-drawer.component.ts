import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BooButtonComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooInputComponent, BooSearchFieldComponent } from '@physioboo/ui';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from "rxjs";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCustomer } from "../../../../shared/types/retail-pos.types";

@Component({
  selector: 'retail-customer-lookup-drawer',
  standalone: true,
  imports: [SharedModule, DrawerComponent, BooButtonComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooInputComponent, BooSearchFieldComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="requestClose()">
      <div class="p-5" role="dialog" aria-modal="true" aria-labelledby="retail-customer-title" [attr.aria-hidden]="!isOpen">
        <div class="flex items-center justify-between mb-4">
          <h2 id="retail-customer-title" class="text-base font-semibold text-regular m-0">Find customer</h2>
          <button type="button" (click)="requestClose()" class="w-8 h-8 rounded-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-100" aria-label="Close customer lookup">
            <physio-icon name="x" [size]="18"></physio-icon>
          </button>
        </div>

        <boo-search-field label="Search patients" placeholder="Name, phone or MRN" [busy]="searching()" [ngModel]="query" (ngModelChange)="onQueryChange($event)" (clear)="onQueryChange('')"></boo-search-field>

        <div class="mt-4" aria-live="polite">
          <boo-inline-error *ngIf="searchFailed()" what="patients" [compact]="true" (retry)="retrySearch()"></boo-inline-error>

          <p *ngIf="!searchFailed() && !query.trim()" class="text-sm text-secondary m-0">Type at least part of a patient's name, phone number or MRN to search.</p>

          <boo-empty-state *ngIf="!searchFailed() && query.trim() && !searching() && !results().length" icon="user-search" title="No patients found" description="Try a different name, phone or MRN, or use a walk-in customer below."></boo-empty-state>

          <ul class="list-none m-0 p-0" *ngIf="results().length">
            <li *ngFor="let p of results()" class="flex items-center justify-between gap-3 py-2.5 border-b border-borderGray/60 last:border-0">
              <div class="min-w-0">
                <p class="text-sm font-medium text-regular m-0 break-words">{{ p.fullName }}</p>
                <p class="text-xs text-secondary m-0">{{ p.mrn }}<span *ngIf="p.phone"> · {{ p.phone }}</span></p>
                <p *ngIf="p.insuranceProvider" class="text-xs text-primaryDeep m-0">{{ p.insuranceProvider }}</p>
              </div>
              <button boo-button variant="outline" size="sm" (click)="useCustomer.emit(p)" [disabled]="submitting" class="shrink-0">Use</button>
            </li>
          </ul>
        </div>

        <form class="mt-6 pt-4 border-t border-borderGray/60 space-y-3" (ngSubmit)="submitWalkIn()" novalidate>
          <p class="text-xs font-semibold text-secondary uppercase m-0">Walk-in customer</p>
          <boo-input name="walkInName" label="Name" [required]="true" [(ngModel)]="walkInName" [maxlength]="120" [disabled]="submitting"></boo-input>
          <boo-input name="walkInPhone" type="tel" label="Phone (optional)" [(ngModel)]="walkInPhone" [maxlength]="30" [disabled]="submitting"></boo-input>
          <p *ngIf="walkInTouched && !walkInName.trim()" class="text-xs text-danger m-0" role="alert">Enter the customer's name.</p>
          <button boo-button type="submit" variant="primary" size="sm" [block]="true" [loading]="submitting" [disabled]="submitting">Use walk-in customer</button>
        </form>
      </div>
    </drawer>
  `,
})
export class RetailCustomerLookupDrawerComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  /** Attaching the customer to the cart is in flight; the drawer stays open if it fails so nothing is retyped. */
  @Input() submitting = false;
  @Output() close = new EventEmitter<void>();
  @Output() useCustomer = new EventEmitter<RetailCustomer>();

  private readonly srv = inject(RetailPosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly query$ = new Subject<string>();

  query = '';
  walkInName = '';
  walkInPhone = '';
  walkInTouched = false;
  results = signal<RetailCustomer[]>([]);
  searching = signal(false);
  searchFailed = signal(false);

  ngOnInit(): void {
    this.query$.pipe(
      map(q => q.trim()),
      debounceTime(350),
      distinctUntilChanged(),
      tap(q => { this.searchFailed.set(false); this.searching.set(!!q); if (!q) this.results.set([]); }),
      switchMap(q => q
        ? this.srv.searchPatients(q).pipe(catchError(() => { this.searching.set(false); this.searchFailed.set(true); return EMPTY; }))
        : of(null)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      this.searching.set(false);
      if (res?.success) this.results.set(res.data ?? []);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.query = '';
      this.walkInName = '';
      this.walkInPhone = '';
      this.walkInTouched = false;
      this.results.set([]);
      this.searchFailed.set(false);
    }
  }

  onQueryChange(value: string): void {
    this.query = value ?? '';
    this.query$.next(this.query);
  }

  retrySearch(): void {
    const q = this.query.trim();
    if (!q) return;
    this.searchFailed.set(false);
    this.searching.set(true);
    this.srv.searchPatients(q).subscribe({
      next: res => { this.searching.set(false); if (res.success) this.results.set(res.data ?? []); },
      error: () => { this.searching.set(false); this.searchFailed.set(true); },
    });
  }

  submitWalkIn(): void {
    this.walkInTouched = true;
    const fullName = this.walkInName.trim();
    if (!fullName || this.submitting) return;
    this.useCustomer.emit({ type: 'WalkIn', fullName, phone: this.walkInPhone.trim() });
  }

  requestClose(): void {
    if (!this.submitting) this.close.emit();
  }
}
