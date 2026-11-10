import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BooFieldErrorComponent } from '../forms/field-error.component';
import { BooSpinnerComponent } from '../spinner/spinner.component';
import { BooAlertComponent } from './alert.component';

@Component({
  standalone: true,
  imports: [BooAlertComponent, BooFieldErrorComponent, BooSpinnerComponent],
  template: `
    <boo-alert id="a1" tone="error">Could not save</boo-alert>
    <boo-alert id="a2" tone="warning" role="note" heading="Allergy">Check before dispensing</boo-alert>
    <boo-field-error id="f1" size="sm" announce>Required</boo-field-error>
    <boo-field-error id="f2">Hint</boo-field-error>
    <boo-spinner id="s1" [inline]="true" tone="primary" [size]="24" label="Loading orders" />
    <boo-spinner id="s2" [inline]="true" tone="primary" [size]="24" />
  `,
})
class HostComponent { }

describe('feedback components', () => {
  function render() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const q = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement;
    return { q };
  }

  it('alert announces according to its role and shows the heading', () => {
    const { q } = render();
    expect(q('#a1').getAttribute('role')).toBe('alert');
    expect(q('#a1').textContent).toContain('Could not save');
    expect(q('#a2').getAttribute('role')).toBe('note');
    expect(q('#a2').querySelector('p')?.textContent).toBe('Allergy');
  });

  it('field error is announced only on request', () => {
    const { q } = render();
    expect(q('#f1').getAttribute('role')).toBe('alert');
    expect(q('#f2').getAttribute('role')).toBeNull();
    expect(q('#f1').classList).toContain('text-xs');
    expect(q('#f2').classList).toContain('text-[13px]');
  });

  it('spinner is a status message only when it has a label, and decorative otherwise', () => {
    const { q } = render();
    expect(q('#s1 [role="status"]')).not.toBeNull();
    expect(q('#s1 .sr-only').textContent).toBe('Loading orders');
    expect(q('#s2 [role="status"]')).toBeNull();
    expect(q('#s2 [aria-hidden="true"]')).not.toBeNull();
  });
});
